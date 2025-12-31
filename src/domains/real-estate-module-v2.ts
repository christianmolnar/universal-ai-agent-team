/**
 * Real Estate Module V2 - Batch Analysis Extension
 * Extends the base RealEstateDomainModule with batch analysis capabilities
 */

import { DomainModule, DomainAnalysisRequest, DomainAnalysisResult } from '../types/domain';
import { AIModelService } from '../services/ai-model-service';
import { 
  BatchAnalysisRequest, 
  BatchAnalysisResult, 
  PropertyAnalysis,
  ScoringCriteria,
  RentalScoringBreakdown,
  PrimaryScoringBreakdown
} from '../types/batch-analysis';

export class RealEstateModuleV2 implements DomainModule {
  id = 'real-estate';
  name = 'Real Estate Batch Analysis';
  description = 'Multi-property analysis with three-model validation and comprehensive scoring';
  version = '2.0.0';
  isActive = true;
  
  private aiService: AIModelService;

  constructor() {
    this.aiService = new AIModelService();
  }

  /**
   * Analyze a single property (implements DomainModule interface)
   * Now uses actual AI analysis via AIModelService
   */
  async analyze(request: DomainAnalysisRequest): Promise<DomainAnalysisResult> {
    const propertyData = request.inputData?.propertyData;
    const analysisType = request.inputData?.analysisType || 'rental';
    
    if (!propertyData) {
      throw new Error('Property data is required for analysis');
    }
    
    console.log(`RealEstateModuleV2: Analyzing ${propertyData.address} (${analysisType})`);
    
    // Use AIModelService to perform actual Claude-powered analysis
    const result = await this.aiService.analyzePrimaryWithClaude(propertyData, analysisType);
    
    // Ensure the result has the correct ID from the request
    result.id = request.id;
    result.domainType = 'real-estate';
    
    console.log(`RealEstateModuleV2: Analysis complete for ${propertyData.address} - Score: ${result.qualityScore}/100`);
    
    return result;
  }

  /**
   * Validate quality of analysis results
   */
  async validateQuality(result: DomainAnalysisResult): Promise<boolean> {
    // Universal quality checks
    if (result.qualityScore < 50) return false;
    if (!result.analysis.summary || result.analysis.summary.length < 100) return false;
    if (!result.analysis.keyFindings || result.analysis.keyFindings.length < 3) return false;
    
    return true;
  }

  /**
   * Incorporate user feedback (required by DomainModule)
   */
  async incorporateFeedback(result: DomainAnalysisResult, feedback: any): Promise<DomainAnalysisResult> {
    // User feedback integration will be implemented in Phase 5
    return result;
  }

  /**
   * Generate report (required by DomainModule)
   */
  async generateReport(result: DomainAnalysisResult): Promise<string> {
    // Report generation will be implemented in Phase 6
    return 'Report generation coming in Phase 6';
  }

  /**
   * NEW: Batch analysis method for multiple properties
   */
  async analyzeBatch(request: BatchAnalysisRequest): Promise<BatchAnalysisResult> {
    // This will be implemented with full AI integration in Phase 3-4
    // For now, return structure for TypeScript validation
    throw new Error('Batch analysis implementation coming in Phase 3');
  }

  /**
   * Get scoring criteria for property type
   */
  getScoringCriteria(propertyType: 'primary' | 'rental'): ScoringCriteria {
    if (propertyType === 'rental') {
      return {
        propertyType: 'rental',
        categories: [
          {
            name: 'Financial Performance',
            weight: 40,
            subcategories: [
              { name: 'Cash Flow Potential', maxPoints: 15, actualPoints: 0, explanation: '' },
              { name: 'ROI Projections', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Cap Rate', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Debt Coverage Ratio', maxPoints: 5, actualPoints: 0, explanation: '' },
            ]
          },
          {
            name: 'Market Position',
            weight: 25,
            subcategories: [
              { name: 'Location Desirability', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Rental Demand', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Price vs Market', maxPoints: 5, actualPoints: 0, explanation: '' },
            ]
          },
          {
            name: 'Property Condition',
            weight: 20,
            subcategories: [
              { name: 'Age & Maintenance', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Required Repairs', maxPoints: 5, actualPoints: 0, explanation: '' },
              { name: 'Long-term Viability', maxPoints: 5, actualPoints: 0, explanation: '' },
            ]
          },
          {
            name: 'Risk Factors',
            weight: 15,
            subcategories: [
              { name: 'Market Stability', maxPoints: 5, actualPoints: 0, explanation: '' },
              { name: 'Vacancy Risk', maxPoints: 5, actualPoints: 0, explanation: '' },
              { name: 'Management Complexity', maxPoints: 5, actualPoints: 0, explanation: '' },
            ]
          }
        ]
      };
    } else {
      return {
        propertyType: 'primary',
        categories: [
          {
            name: 'Lifestyle Fit',
            weight: 35,
            subcategories: [
              { name: 'Location Convenience', maxPoints: 15, actualPoints: 0, explanation: '' },
              { name: 'Amenities & Features', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'School Quality', maxPoints: 10, actualPoints: 0, explanation: '' },
            ]
          },
          {
            name: 'Financial Prudence',
            weight: 30,
            subcategories: [
              { name: 'Price vs Income', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Mortgage Affordability', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Appreciation Potential', maxPoints: 10, actualPoints: 0, explanation: '' },
            ]
          },
          {
            name: 'Property Quality',
            weight: 20,
            subcategories: [
              { name: 'Condition & Age', maxPoints: 10, actualPoints: 0, explanation: '' },
              { name: 'Layout & Functionality', maxPoints: 5, actualPoints: 0, explanation: '' },
              { name: 'Maintenance Needs', maxPoints: 5, actualPoints: 0, explanation: '' },
            ]
          },
          {
            name: 'Long-term Value',
            weight: 15,
            subcategories: [
              { name: 'Neighborhood Trajectory', maxPoints: 5, actualPoints: 0, explanation: '' },
              { name: 'Resale Potential', maxPoints: 5, actualPoints: 0, explanation: '' },
              { name: 'Market Stability', maxPoints: 5, actualPoints: 0, explanation: '' },
            ]
          }
        ]
      };
    }
  }

  /**
   * Calculate property score based on criteria
   */
  calculateScore(
    breakdown: RentalScoringBreakdown | PrimaryScoringBreakdown
  ): number {
    let totalScore = 0;
    
    // Sum up all points from all categories
    Object.values(breakdown).forEach((category: any) => {
      Object.keys(category).forEach(key => {
        if (key !== 'weight' && typeof category[key] === 'number') {
          totalScore += category[key];
        }
      });
    });

    return Math.min(Math.round(totalScore), 100);
  }

  /**
   * Determine recommendation based on score and property type
   */
  getRecommendation(score: number, propertyType: 'primary' | 'rental'): 'PROCEED' | 'CAUTION' | 'REJECT' {
    if (propertyType === 'rental') {
      if (score >= 85) return 'PROCEED';
      if (score >= 70) return 'CAUTION';
      return 'REJECT';
    } else {
      if (score >= 90) return 'PROCEED';
      if (score >= 75) return 'CAUTION';
      return 'REJECT';
    }
  }
}

// Export singleton instance
export const realEstateModuleV2 = new RealEstateModuleV2();
