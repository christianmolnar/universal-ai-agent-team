/**
 * Universal Methodology Engine
 * Core orchestrator for all domain analysis with quality validation
 */

import { DomainAnalysisRequest, DomainAnalysisResult, DomainModule, UniversalMethodologyConfig, UserFeedback } from '../types/domain';

export class UniversalMethodologyEngine {
  private modules: Map<string, DomainModule> = new Map();
  private config: UniversalMethodologyConfig;

  constructor(config: UniversalMethodologyConfig) {
    this.config = config;
  }

  /**
   * Register a domain module with the engine
   */
  registerModule(module: DomainModule): void {
    this.modules.set(module.id, module);
    console.log(`Registered domain module: ${module.name} v${module.version}`);
  }

  /**
   * Execute comprehensive analysis with quality validation
   */
  async executeAnalysis(request: DomainAnalysisRequest): Promise<DomainAnalysisResult> {
    const module = this.modules.get(request.domainType);
    if (!module) {
      throw new Error(`Domain module not found: ${request.domainType}`);
    }

    if (!module.isActive) {
      throw new Error(`Domain module is inactive: ${request.domainType}`);
    }

    console.log(`Starting analysis for ${request.domainType} - ID: ${request.id}`);

    // Step 1: Initial Analysis
    let result = await module.analyze(request);
    
    // Step 2: Quality Validation
    const qualityPassed = await this.validateQuality(result, module);
    if (!qualityPassed) {
      console.log(`Quality validation failed for ${request.id}. Score: ${result.qualityScore}/${this.config.qualityThreshold}`);
      
      // Attempt refinement if quality is below threshold
      result = await this.refineAnalysis(result, module, request);
    }

    // Step 3: Final Quality Check
    if (result.qualityScore < this.config.qualityThreshold) {
      result.recommendation = 'REJECT';
      result.analysis.summary = `Analysis quality (${result.qualityScore}/100) below threshold (${this.config.qualityThreshold}). Manual review required.`;
    }

    console.log(`Analysis completed - ${request.id}: Quality ${result.qualityScore}/100, Recommendation: ${result.recommendation}`);
    
    return result;
  }

  /**
   * Validate analysis quality against universal standards
   */
  private async validateQuality(result: DomainAnalysisResult, module: DomainModule): Promise<boolean> {
    // Universal quality checks
    const universalScore = this.calculateUniversalQualityScore(result);
    
    // Domain-specific validation
    const domainValidation = await module.validateQuality(result);
    
    // Combined validation
    const finalScore = (universalScore + (domainValidation ? 20 : 0));
    result.qualityScore = Math.min(finalScore, 100);
    
    return result.qualityScore >= this.config.qualityThreshold;
  }

  /**
   * Calculate universal quality metrics
   */
  private calculateUniversalQualityScore(result: DomainAnalysisResult): number {
    let score = 0;

    // Completeness (30 points)
    if (result.analysis.summary && result.analysis.summary.length > 100) score += 10;
    if (result.analysis.keyFindings && result.analysis.keyFindings.length >= 3) score += 10;
    if (result.analysis.riskFactors && result.analysis.riskFactors.length >= 2) score += 10;

    // Depth of Analysis (25 points)
    if (result.analysis.opportunities && result.analysis.opportunities.length >= 2) score += 10;
    if (result.confidence >= 0.8) score += 15;

    // Data Quality (25 points)
    if (result.analysis.financialMetrics && Object.keys(result.analysis.financialMetrics).length >= 3) score += 15;
    if (result.analysis.keyFindings.some(finding => finding.includes('$') || finding.includes('%'))) score += 10;

    return score;
  }

  /**
   * Attempt to refine analysis for better quality
   */
  private async refineAnalysis(result: DomainAnalysisResult, module: DomainModule, originalRequest: DomainAnalysisRequest): Promise<DomainAnalysisResult> {
    console.log(`Attempting analysis refinement for ${result.id}`);
    
    // Create refinement feedback
    const refinementFeedback: UserFeedback = {
      id: `refinement-${Date.now()}`,
      type: 'refinement',
      content: `Analysis quality (${result.qualityScore}/100) below threshold. Please provide more detailed analysis with specific metrics and comprehensive risk assessment.`,
      timestamp: new Date(),
      appliedToAnalysis: false
    };

    // Apply refinement
    const refinedResult = await module.incorporateFeedback(result, refinementFeedback);
    
    // Re-validate
    await this.validateQuality(refinedResult, module);
    
    return refinedResult;
  }

  /**
   * Process user feedback on analysis
   */
  async processFeedback(analysisId: string, feedback: UserFeedback): Promise<DomainAnalysisResult> {
    // In a real implementation, this would retrieve the analysis and module
    // For now, we'll return a placeholder
    throw new Error('Feedback processing not yet implemented');
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(result: DomainAnalysisResult): Promise<string> {
    const module = this.modules.get(result.domainType);
    if (!module) {
      throw new Error(`Domain module not found: ${result.domainType}`);
    }

    return await module.generateReport(result);
  }

  /**
   * Get available domain modules
   */
  getAvailableModules(): Array<{ id: string; name: string; description: string; isActive: boolean }> {
    return Array.from(this.modules.values()).map(module => ({
      id: module.id,
      name: module.name,
      description: module.description,
      isActive: module.isActive
    }));
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
    return {
      totalModules: this.modules.size,
      activeModules: Array.from(this.modules.values()).filter(m => m.isActive).length,
      qualityThreshold: this.config.qualityThreshold,
      autoApproveScore: this.config.autoApproveScore
    };
  }
}
