/**
 * Batch Analysis Orchestrator
 * Manages the complete batch property analysis workflow
 */

import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { RealEstateModuleV2 } from '@/src/domains/real-estate-module-v2';
import { ZillowScraperService } from '@/src/services/zillow-scraper';
import {
  AnalysisBatch,
  PropertyAnalysis,
  BatchAnalysisRequest,
  BatchAnalysisResponse,
  ProgressUpdate,
  ProgressEventType,
  PropertyData,
} from '@/src/types/batch-analysis';
import { DomainAnalysisResult } from '@/src/types/domain';

export type ProgressCallback = (update: ProgressUpdate) => void;

export class BatchAnalysisOrchestrator {
  private db: Pool;
  private realEstateModule: RealEstateModuleV2;
  private scraperService: ZillowScraperService;

  constructor(dbPool: Pool) {
    this.db = dbPool;
    this.realEstateModule = new RealEstateModuleV2();
    this.scraperService = new ZillowScraperService();
  }

  /**
   * Start a new batch analysis
   */
  async startBatchAnalysis(
    request: BatchAnalysisRequest,
    onProgress?: ProgressCallback
  ): Promise<BatchAnalysisResponse> {
    const batchId = uuidv4();

    try {
      // Create batch record
      const batch = await this.createBatch(batchId, request);

      // Send initial progress
      onProgress?.({
        batchId,
        eventType: 'batch_started',
        timestamp: new Date(),
        progress: {
          completed: 0,
          total: request.properties.length,
          percentage: 0,
        },
      });

      // Process properties (run in background)
      this.processProperties(batch, request, onProgress).catch((error) => {
        console.error('Batch analysis failed:', error);
        this.updateBatchStatus(batchId, 'failed').catch(console.error);
      });

      return {
        batchId,
        status: 'running',
        message: 'Batch analysis started successfully',
        totalProperties: request.properties.length,
      };
    } catch (error) {
      console.error('Failed to start batch analysis:', error);
      throw error;
    }
  }

  /**
   * Create batch record in database
   */
  private async createBatch(batchId: string, request: BatchAnalysisRequest): Promise<AnalysisBatch> {
    const query = `
      INSERT INTO analysis_batches (id, user_id, property_types, total_properties, completed, status)
      VALUES ($1, $2, $3, $4, 0, 'pending')
      RETURNING *
    `;

    const result = await this.db.query(query, [
      batchId,
      request.userId,
      request.propertyType,
      request.properties.length,
    ]);

    return result.rows[0];
  }

  /**
   * Process all properties in the batch
   */
  private async processProperties(
    batch: AnalysisBatch,
    request: BatchAnalysisRequest,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const propertyStatuses = new Map<string, PropertyAnalysis['status']>();
    let completed = 0;

    // Update batch to running
    await this.updateBatchStatus(batch.id, 'running');

    for (const [index, property] of request.properties.entries()) {
      const url = property.url;
      try {
        const propertyId = uuidv4();
        propertyStatuses.set(propertyId, 'pending');

        // Step 1: Scrape property data
        propertyStatuses.set(propertyId, 'scraping');
        this.sendProgress(batch.id, propertyId, url, completed, request.properties.length, 'scraping_started', onProgress);

        const propertyData = await this.scraperService.scrapeProperty(url);

        // Step 2: Primary analysis (Claude)
        propertyStatuses.set(propertyId, 'analyzing');
        this.sendProgress(batch.id, propertyId, propertyData.address, completed, request.properties.length, 'analysis_started', onProgress);

        const primaryAnalysis = await this.performPrimaryAnalysis(propertyData, property.type);

        // Step 3: Quality review (GPT-4)
        propertyStatuses.set(propertyId, 'reviewing');
        this.sendProgress(batch.id, propertyId, propertyData.address, completed, request.properties.length, 'quality_review_started', onProgress);

        const qualityReview = await this.performQualityReview(primaryAnalysis);

        // Step 4: Final validation
        propertyStatuses.set(propertyId, 'validating');
        this.sendProgress(batch.id, propertyId, propertyData.address, completed, request.properties.length, 'final_validation_started', onProgress);

        const finalValidation = await this.performFinalValidation(primaryAnalysis, qualityReview);

        // Save property analysis
        await this.savePropertyAnalysis({
          id: propertyId,
          user_id: request.userId,
          batch_id: batch.id,
          zpid: propertyData.zpid,
          zillow_url: url,
          property_type: property.type,
          property_data: propertyData,
          primary_analysis: primaryAnalysis,
          quality_review: qualityReview,
          final_validation: finalValidation,
          quality_score: finalValidation.qualityScore,
          recommendation: finalValidation.recommendation,
          confidence: finalValidation.confidence,
          status: 'completed',
          error_message: null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        propertyStatuses.set(propertyId, 'completed');
        completed++;

        this.sendProgress(batch.id, propertyId, propertyData.address, completed, request.properties.length, 'analysis_completed', onProgress, { 
          score: finalValidation.qualityScore, 
          recommendation: finalValidation.recommendation 
        });

      } catch (error) {
        console.error(`Failed to analyze property ${url}:`, error);
        const propertyId = uuidv4();
        propertyStatuses.set(propertyId, 'failed');
        
        // Save failed property record
        await this.savePropertyAnalysis({
          id: propertyId,
          user_id: request.userId,
          batch_id: batch.id,
          zpid: 'unknown',
          zillow_url: url,
          property_type: property.type,
          property_data: {} as PropertyData,
          primary_analysis: null,
          quality_review: null,
          final_validation: null,
          quality_score: null,
          recommendation: null,
          confidence: null,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Mark batch as completed
    await this.updateBatchStatus(batch.id, 'completed');
    await this.updateBatchCompleted(batch.id, completed);

    onProgress?.({
      batchId: batch.id,
      eventType: 'batch_completed',
      timestamp: new Date(),
      progress: {
        completed,
        total: request.properties.length,
        percentage: 100,
      },
    });
  }

  /**
   * Perform primary analysis using Claude (Universal Methodology Stage 1)
   */
  private async performPrimaryAnalysis(
    propertyData: PropertyData,
    propertyTypes: 'primary' | 'rental' | 'both'
  ): Promise<DomainAnalysisResult> {
    // Use RealEstateModuleV2 for analysis
    const request = {
      id: uuidv4(),
      domainType: 'real-estate' as const,
      inputData: {
        propertyData,
        analysisType: propertyTypes,
      },
    };

    const result = await this.realEstateModule.analyze(request);
    return result;
  }

  /**
   * Perform quality review using GPT-4 (Universal Methodology Stage 2)
   */
  private async performQualityReview(primaryAnalysis: DomainAnalysisResult): Promise<any> {
    // Placeholder - will be implemented with actual GPT-4 validation in Phase 4
    return {
      quality_score: primaryAnalysis.qualityScore,
      issues: [],
      validated_at: new Date(),
    };
  }

  /**
   * Perform final validation (Universal Methodology Stage 3)
   */
  private async performFinalValidation(
    primaryAnalysis: DomainAnalysisResult,
    qualityReview: any
  ): Promise<DomainAnalysisResult> {
    // Placeholder - will be implemented with final validation logic in Phase 4
    return primaryAnalysis;
  }

  /**
   * Save property analysis to database
   */
  private async savePropertyAnalysis(analysis: PropertyAnalysis): Promise<void> {
    const query = `
      INSERT INTO property_analyses (
        id, user_id, batch_id, zpid, zillow_url, property_type,
        property_data, primary_analysis, quality_review, final_validation,
        quality_score, recommendation, confidence, status, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    await this.db.query(query, [
      analysis.id,
      analysis.user_id,
      analysis.batch_id,
      analysis.zpid,
      analysis.zillow_url,
      analysis.property_type,
      JSON.stringify(analysis.property_data),
      JSON.stringify(analysis.primary_analysis),
      JSON.stringify(analysis.quality_review),
      JSON.stringify(analysis.final_validation),
      analysis.quality_score,
      analysis.recommendation,
      analysis.confidence,
      analysis.status,
      analysis.error_message,
    ]);
  }

  /**
   * Update batch status
   */
  private async updateBatchStatus(batchId: string, status: AnalysisBatch['status']): Promise<void> {
    const query = 'UPDATE analysis_batches SET status = $1, updated_at = NOW() WHERE id = $2';
    await this.db.query(query, [status, batchId]);
  }

  /**
   * Update batch completed count
   */
  private async updateBatchCompleted(batchId: string, completed: number): Promise<void> {
    const query = 'UPDATE analysis_batches SET completed = $1, updated_at = NOW() WHERE id = $2';
    await this.db.query(query, [completed, batchId]);
  }

  /**
   * Send progress update
   */
  private sendProgress(
    batchId: string,
    propertyId: string,
    address: string,
    completed: number,
    total: number,
    eventType: ProgressEventType,
    onProgress?: ProgressCallback,
    data?: any
  ): void {
    const percentage = Math.round((completed / total) * 100);

    const update: ProgressUpdate = {
      batchId,
      eventType,
      propertyId,
      propertyAddress: address,
      timestamp: new Date(),
      data,
      progress: {
        completed,
        total,
        percentage,
      },
    };

    onProgress?.(update);
  }

  /**
   * Get batch analysis results
   */
  async getBatchResults(batchId: string): Promise<PropertyAnalysis[]> {
    const query = `
      SELECT * FROM property_analyses
      WHERE batch_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [batchId]);
    return result.rows.map(row => ({
      ...row,
      property_data: typeof row.property_data === 'string' ? JSON.parse(row.property_data) : row.property_data,
      primary_analysis: typeof row.primary_analysis === 'string' ? JSON.parse(row.primary_analysis) : row.primary_analysis,
      quality_review: typeof row.quality_review === 'string' ? JSON.parse(row.quality_review) : row.quality_review,
      final_validation: typeof row.final_validation === 'string' ? JSON.parse(row.final_validation) : row.final_validation,
    }));
  }

  /**
   * Get batch status
   */
  async getBatchStatus(batchId: string): Promise<AnalysisBatch | null> {
    const query = 'SELECT * FROM analysis_batches WHERE id = $1';
    const result = await this.db.query(query, [batchId]);
    return result.rows[0] || null;
  }
}
