/**
 * Universal AI Agent Team - Domain Types
 * Core type definitions for the domain module system
 */

export interface DomainAnalysisRequest {
  id: string;
  domainType: 'real-estate' | 'business' | 'research';
  inputData: Record<string, any>;
  userPreferences?: Record<string, any>;
  qualityThreshold?: number;
}

export interface DomainAnalysisResult {
  id: string;
  domainType: string;
  qualityScore: number;
  recommendation: 'PROCEED' | 'CAUTION' | 'REJECT';
  analysis: {
    summary: string;
    keyFindings: string[];
    riskFactors: string[];
    opportunities: string[];
    financialMetrics?: Record<string, number>;
  };
  confidence: number;
  userFeedback?: UserFeedback[];
  generatedAt: Date;
}

export interface UserFeedback {
  id: string;
  type: 'refinement' | 'correction' | 'approval';
  content: string;
  timestamp: Date;
  appliedToAnalysis: boolean;
}

export interface DomainModule {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  
  // Core analysis method
  analyze(request: DomainAnalysisRequest): Promise<DomainAnalysisResult>;
  
  // Quality validation
  validateQuality(result: DomainAnalysisResult): Promise<boolean>;
  
  // User feedback integration
  incorporateFeedback(result: DomainAnalysisResult, feedback: UserFeedback): Promise<DomainAnalysisResult>;
  
  // Document generation
  generateReport(result: DomainAnalysisResult): Promise<string>;
}

export interface UniversalMethodologyConfig {
  qualityThreshold: number;
  maxIterations: number;
  enableUserFeedback: boolean;
  autoApproveScore: number;
  domains: string[];
}
