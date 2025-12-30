/**
 * Batch Analysis Types
 * TypeScript interfaces for the batch property analysis system
 */

import { DomainAnalysisResult } from './domain';

// ============================================================================
// Database Record Types (match database schema)
// ============================================================================

export interface AnalysisBatch {
  id: string;
  user_id: string;
  property_types: 'primary' | 'rental' | 'both';
  total_properties: number;
  completed: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface PropertyAnalysis {
  id: string;
  user_id: string;
  batch_id: string;
  zpid: string;
  zillow_url: string;
  property_type: 'primary' | 'rental';
  
  // Scraped data
  property_data: PropertyData;
  
  // Three-stage analysis (Universal Methodology)
  primary_analysis: DomainAnalysisResult | null;
  quality_review: QualityReviewResult | null;
  final_validation: DomainAnalysisResult | null;
  
  // Final scores
  quality_score: number | null;
  recommendation: 'PROCEED' | 'CAUTION' | 'REJECT' | null;
  confidence: number | null;
  
  // Status
  status: 'pending' | 'scraping' | 'analyzing' | 'reviewing' | 'validating' | 'completed' | 'failed';
  error_message: string | null;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Property Data Types (from Zillow scraping)
// ============================================================================

export interface PropertyData {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  lotAreaValue?: number;
  lotAreaUnit?: string;
  yearBuilt?: number;
  propertyType?: string;
  description?: string;
  features?: string[];
  photos?: string[];
  zestimate?: number;
  rentZestimate?: number;
  taxAssessedValue?: number;
  lastSoldPrice?: number;
  lastSoldDate?: string;
  daysOnMarket?: number; // Time on Zillow/Market - indicator of seller motivation
  priceReduction?: number; // Amount of recent price cut (if any)
  rawMarkdown?: string; // Full scraped content for AI analysis
}

// ============================================================================
// Analysis Request/Response Types
// ============================================================================

export interface BatchAnalysisRequest {
  userId: string;
  propertyType: 'primary' | 'rental' | 'both';
  properties: Array<{
    url: string;
    type: 'primary' | 'rental';
  }>;
}

export interface BatchAnalysisResponse {
  batchId: string;
  status: string;
  message: string;
  totalProperties: number;
}

export interface BatchAnalysisResult {
  batchId: string;
  userId: string;
  propertyType: 'primary' | 'rental' | 'both';
  properties: PropertyAnalysis[];
  summary: {
    totalAnalyzed: number;
    averageQualityScore: number;
    recommendationBreakdown: {
      proceed: number;
      caution: number;
      reject: number;
    };
    byType: {
      primary: {
        count: number;
        avgScore: number;
      };
      rental: {
        count: number;
        avgScore: number;
      };
    };
  };
  createdAt: Date;
  completedAt: Date | null;
}

// ============================================================================
// Quality Review Types (Secondary Model)
// ============================================================================

export interface QualityReviewResult {
  model: 'gpt-4' | 'gemini-pro';
  timestamp: Date;
  overallAssessment: 'APPROVED' | 'CONCERNS' | 'REJECTED';
  confidenceScore: number; // 0.0-1.0
  issues: QualityIssue[];
  suggestions: string[];
  dataAccuracy: {
    priceVerified: boolean;
    bedroomsBathroomsVerified: boolean;
    sqftVerified: boolean;
    locationVerified: boolean;
  };
}

export interface QualityIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'data_accuracy' | 'calculation_error' | 'logic_flaw' | 'missing_analysis' | 'inconsistency';
  description: string;
  suggestedCorrection: string;
  affectedField?: string;
}

// ============================================================================
// Progress Update Types (for WebSocket)
// ============================================================================

export type ProgressEventType = 
  | 'batch_started'
  | 'scraping_started'
  | 'scraping_completed'
  | 'scraping_failed'
  | 'analysis_started'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'quality_review_started'
  | 'quality_review_completed'
  | 'quality_review_failed'
  | 'final_validation_started'
  | 'final_validation_completed'
  | 'final_validation_failed'
  | 'batch_completed'
  | 'batch_failed';

export interface ProgressUpdate {
  batchId: string;
  eventType: ProgressEventType;
  propertyId?: string;
  propertyAddress?: string;
  timestamp: Date;
  data?: {
    score?: number;
    recommendation?: string;
    error?: string;
    issues?: QualityIssue[];
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// ============================================================================
// Scoring Methodology Types
// ============================================================================

export interface ScoringCriteria {
  propertyType: 'primary' | 'rental';
  categories: ScoringCategory[];
}

export interface ScoringCategory {
  name: string;
  weight: number; // Percentage (adds up to 100)
  subcategories: Subcategory[];
}

export interface Subcategory {
  name: string;
  maxPoints: number;
  actualPoints: number;
  explanation: string;
}

// Rental Property Scoring (100 points total)
export interface RentalScoringBreakdown {
  financialPerformance: {
    weight: 40;
    cashFlowPotential: number; // /15
    roiProjections: number; // /10
    capRate: number; // /10
    debtCoverageRatio: number; // /5
  };
  marketPosition: {
    weight: 25;
    locationDesirability: number; // /10
    rentalDemand: number; // /10
    priceVsMarket: number; // /5
  };
  propertyCondition: {
    weight: 20;
    ageAndMaintenance: number; // /10
    requiredRepairs: number; // /5
    longTermViability: number; // /5
  };
  riskFactors: {
    weight: 15;
    marketStability: number; // /5
    vacancyRisk: number; // /5
    managementComplexity: number; // /5
  };
}

// Primary Residence Scoring (100 points total)
export interface PrimaryScoringBreakdown {
  lifestyleFit: {
    weight: 35;
    locationConvenience: number; // /15
    amenitiesFeatures: number; // /10
    schoolQuality: number; // /10
  };
  financialPrudence: {
    weight: 30;
    priceVsIncome: number; // /10
    mortgageAffordability: number; // /10
    appreciationPotential: number; // /10
  };
  propertyQuality: {
    weight: 20;
    conditionAge: number; // /10
    layoutFunctionality: number; // /5
    maintenanceNeeds: number; // /5
  };
  longTermValue: {
    weight: 15;
    neighborhoodTrajectory: number; // /5
    resalePotential: number; // /5
    marketStability: number; // /5
  };
}

// ============================================================================
// Report Generation Types
// ============================================================================

export interface PropertyReport {
  propertyId: string;
  analysis: PropertyAnalysis;
  sections: {
    executiveSummary: string;
    scoreBreakdown: RentalScoringBreakdown | PrimaryScoringBreakdown;
    keyFindings: string[];
    strengths: string[];
    concerns: string[];
    financialAnalysis: {
      metrics: Record<string, number>;
      projections: Record<string, number>;
    };
    recommendation: {
      overall: 'PROCEED' | 'CAUTION' | 'REJECT';
      reasoning: string;
      nextSteps: string[];
    };
  };
  generatedAt: Date;
}

export interface BatchReport {
  batchId: string;
  propertyReports: PropertyReport[];
  summary: {
    totalProperties: number;
    averageScore: number;
    topProperties: PropertyReport[];
    comparisonTable: ComparisonTableRow[];
  };
}

export interface ComparisonTableRow {
  rank: number;
  address: string;
  city: string;
  type: 'primary' | 'rental';
  score: number;
  price: number;
  recommendation: string;
}

// ============================================================================
// Itinerary Types
// ============================================================================

export interface TripItinerary {
  id: string;
  batchId: string;
  userId: string;
  tripDays: number;
  selectedProperties: string[]; // property IDs
  activities: ActivityPreferences;
  itinerary: DayItinerary[];
  createdAt: Date;
}

export interface ActivityPreferences {
  restaurants: boolean;
  hikes: boolean;
  pickleball: boolean;
  funShopping: boolean;
  premiumOutlets: boolean;
}

export interface DayItinerary {
  day: number;
  date?: string;
  area: string;
  morning: ItineraryBlock;
  lunch?: ActivityItem;
  afternoon: ItineraryBlock;
  evening?: ActivityItem;
  dinner?: ActivityItem;
}

export interface ItineraryBlock {
  type: 'properties' | 'activity';
  items: (PropertyViewing | ActivityItem)[];
}

export interface PropertyViewing {
  type: 'property';
  propertyId: string;
  address: string;
  time: string;
  duration: number; // minutes
  score: number;
  recommendation: string;
  drivingDistance?: string;
  drivingTime?: string;
}

export interface ActivityItem {
  type: 'restaurant' | 'hike' | 'pickleball' | 'shopping' | 'outlet';
  name: string;
  address: string;
  time: string;
  duration: number; // minutes
  rating?: number;
  priceLevel?: string;
  description?: string;
  distance?: string;
  driveTime?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
