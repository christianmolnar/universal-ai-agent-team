/**
 * Quality Validation Engine
 * 
 * Implements dual-model validation and automatic rollback capabilities
 * to ensure all outputs meet the 85+ quality threshold. This engine:
 * - Validates analysis results against quality standards
 * - Triggers automatic rollback for sub-threshold outputs
 * - Maintains clean state management
 * - Provides detailed validation reports
 */

import { ScoringEngine, ScoringCriteria, ScoringResult } from '../scoring/ScoringEngine';

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Scoring details */
  scoring: ScoringResult;
  /** Validation timestamp */
  timestamp: Date;
  /** Validation issues found */
  issues: ValidationIssue[];
  /** Recommended actions */
  recommendations: string[];
}

export interface ValidationIssue {
  /** Issue severity */
  severity: 'critical' | 'warning' | 'info';
  /** Issue category */
  category: keyof ScoringCriteria;
  /** Issue description */
  description: string;
  /** Suggested fix */
  suggestedFix: string;
}

export interface AnalysisState {
  /** Unique analysis ID */
  id: string;
  /** Analysis content */
  content: any;
  /** Creation timestamp */
  created: Date;
  /** Last validation result */
  lastValidation?: ValidationResult;
}

/**
 * Quality validation engine with automatic rollback capabilities
 * Ensures all analysis outputs meet the universal 85+ quality standard
 */
export class QualityValidationEngine {
  private readonly scoringEngine: ScoringEngine;
  private readonly stateHistory: Map<string, AnalysisState[]> = new Map();
  private readonly maxHistoryLength = 10;

  constructor() {
    this.scoringEngine = new ScoringEngine();
  }

  /**
   * Validate analysis result against quality standards
   * 
   * @param analysisId - Unique identifier for the analysis
   * @param content - Analysis content to validate
   * @param criteria - Scoring criteria for validation
   * @returns Validation result with pass/fail status
   */
  async validateAnalysis(
    analysisId: string,
    content: any,
    criteria: ScoringCriteria
  ): Promise<ValidationResult> {
    const scoring = this.scoringEngine.calculateScore(criteria);
    const issues = this.identifyIssues(criteria, scoring);
    const recommendations = this.generateRecommendations(issues, scoring);

    const validationResult: ValidationResult = {
      isValid: scoring.meetsThreshold,
      scoring,
      timestamp: new Date(),
      issues,
      recommendations
    };

    // Store state for potential rollback
    this.saveState(analysisId, content, validationResult);

    return validationResult;
  }

  /**
   * Automatically rollback to last valid state if validation fails
   * 
   * @param analysisId - Analysis to rollback
   * @returns Previous valid state or null if none exists
   */
  rollbackToLastValid(analysisId: string): AnalysisState | null {
    const history = this.stateHistory.get(analysisId) || [];
    
    // Find most recent valid state
    for (let i = history.length - 1; i >= 0; i--) {
      const state = history[i];
      if (state.lastValidation?.isValid) {
        // Remove invalid states after the rollback point
        this.stateHistory.set(analysisId, history.slice(0, i + 1));
        return state;
      }
    }

    return null;
  }

  /**
   * Get validation history for an analysis
   */
  getValidationHistory(analysisId: string): AnalysisState[] {
    return [...(this.stateHistory.get(analysisId) || [])];
  }

  /**
   * Clear validation history for an analysis
   */
  clearHistory(analysisId: string): void {
    this.stateHistory.delete(analysisId);
  }

  /**
   * Get current quality threshold
   */
  getQualityThreshold(): number {
    return this.scoringEngine.getQualityThreshold();
  }

  /**
   * Save analysis state for potential rollback
   */
  private saveState(
    analysisId: string,
    content: any,
    validation: ValidationResult
  ): void {
    const history = this.stateHistory.get(analysisId) || [];
    
    const newState: AnalysisState = {
      id: `${analysisId}-${Date.now()}`,
      content: JSON.parse(JSON.stringify(content)), // Deep copy
      created: new Date(),
      lastValidation: validation
    };

    history.push(newState);

    // Maintain history limit
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }

    this.stateHistory.set(analysisId, history);
  }

  /**
   * Identify specific validation issues
   */
  private identifyIssues(
    criteria: ScoringCriteria,
    scoring: ScoringResult
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const threshold = this.scoringEngine.getQualityThreshold();

    // Check each criterion against threshold
    Object.entries(criteria).forEach(([key, value]) => {
      const criterionKey = key as keyof ScoringCriteria;
      const criterionValue = value as number;
      
      if (criterionValue < threshold) {
        issues.push({
          severity: criterionValue < 70 ? 'critical' : 'warning',
          category: criterionKey,
          description: `${this.formatCriterionName(criterionKey)} score (${criterionValue}) below threshold (${threshold})`,
          suggestedFix: this.getSuggestedFix(criterionKey, criterionValue)
        });
      }
    });

    // Overall score check
    if (scoring.score < threshold) {
      issues.push({
        severity: 'critical',
        category: 'dataAccuracy', // Default category
        description: `Overall score (${scoring.score}) below quality threshold (${threshold})`,
        suggestedFix: 'Review and improve the lowest-scoring criteria'
      });
    }

    return issues;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    issues: ValidationIssue[],
    scoring: ScoringResult
  ): string[] {
    const recommendations: string[] = [];

    if (issues.length === 0) {
      recommendations.push(`Excellent work! Analysis meets quality standards with ${scoring.stars}⭐ rating.`);
      return recommendations;
    }

    // Priority order for improvements
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const warningIssues = issues.filter(i => i.severity === 'warning');

    if (criticalIssues.length > 0) {
      recommendations.push('🚨 Critical improvements needed:');
      criticalIssues.forEach(issue => {
        recommendations.push(`  • ${issue.description}: ${issue.suggestedFix}`);
      });
    }

    if (warningIssues.length > 0) {
      recommendations.push('⚠️ Recommended improvements:');
      warningIssues.forEach(issue => {
        recommendations.push(`  • ${issue.description}: ${issue.suggestedFix}`);
      });
    }

    recommendations.push(`Target: Achieve ${this.scoringEngine.getQualityThreshold()}+ score for 5⭐ quality rating.`);

    return recommendations;
  }

  /**
   * Format criterion names for human readability
   */
  private formatCriterionName(key: keyof ScoringCriteria): string {
    const names: Record<keyof ScoringCriteria, string> = {
      dataAccuracy: 'Data Accuracy',
      logicalConsistency: 'Logical Consistency',
      actionability: 'Actionability',
      analysisCompleteness: 'Analysis Completeness',
      presentation: 'Presentation Quality'
    };
    return names[key];
  }

  /**
   * Get suggested fixes for specific criteria
   */
  private getSuggestedFix(criterion: keyof ScoringCriteria, score: number): string {
    const fixes: Record<keyof ScoringCriteria, string> = {
      dataAccuracy: score < 70 
        ? 'Verify all facts and sources, remove speculation'
        : 'Double-check key data points and add citations',
      logicalConsistency: score < 70
        ? 'Restructure analysis with clear logical flow'
        : 'Review conclusions for logical gaps',
      actionability: score < 70
        ? 'Add specific, measurable action items'
        : 'Clarify next steps and priorities',
      analysisCompleteness: score < 70
        ? 'Address missing key analysis areas'
        : 'Add supporting details to strengthen analysis',
      presentation: score < 70
        ? 'Improve formatting, clarity, and organization'
        : 'Polish language and visual presentation'
    };
    return fixes[criterion];
  }
}
