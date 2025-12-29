/**
 * Universal 5-Star Scoring Engine
 * 
 * Core component that implements the proven scoring methodology extracted from
 * user's successful $2.4M real estate analysis. This engine provides:
 * - Weighted scoring algorithm with configurable criteria
 * - Quality threshold validation (85+ standard)
 * - Systematic scoring consistency across all domain modules
 * 
 * @example
 * ```typescript
 * const engine = new ScoringEngine();
 * const result = engine.calculateScore({
 *   dataAccuracy: 95,
 *   logicalConsistency: 90,
 *   actionability: 85,
 *   analysisCompleteness: 92,
 *   presentation: 88
 * });
 * // Returns: { score: 90.5, stars: 5, meetsThreshold: true }
 * ```
 */

export interface ScoringCriteria {
  /** Data accuracy and factual correctness (Weight: 25%) */
  dataAccuracy: number;
  /** Logical flow and reasoning consistency (Weight: 25%) */
  logicalConsistency: number;
  /** Practical usefulness and actionability (Weight: 20%) */
  actionability: number;
  /** Thoroughness and completeness (Weight: 20%) */
  analysisCompleteness: number;
  /** Clarity and professional presentation (Weight: 10%) */
  presentation: number;
}

export interface ScoringResult {
  /** Overall score (0-100) */
  score: number;
  /** Star rating (1-5) */
  stars: number;
  /** Whether score meets 85+ threshold */
  meetsThreshold: boolean;
  /** Breakdown by criteria */
  breakdown: ScoringCriteria & { weights: Record<keyof ScoringCriteria, number> };
  /** Quality assessment */
  qualityLevel: 'Excellent' | 'Good' | 'Acceptable' | 'Below Standard' | 'Poor';
}

/**
 * Universal scoring engine that implements proven methodology
 * for consistent quality assessment across all domain modules
 */
export class ScoringEngine {
  private readonly QUALITY_THRESHOLD = 85;
  private readonly weights: Record<keyof ScoringCriteria, number> = {
    dataAccuracy: 0.25,
    logicalConsistency: 0.25,
    actionability: 0.20,
    analysisCompleteness: 0.20,
    presentation: 0.10
  };

  /**
   * Calculate overall score using weighted criteria
   * 
   * @param criteria - Individual scoring criteria (0-100 scale)
   * @returns Complete scoring result with stars and quality assessment
   */
  calculateScore(criteria: ScoringCriteria): ScoringResult {
    this.validateCriteria(criteria);

    const score = this.calculateWeightedScore(criteria);
    const stars = this.convertToStars(score);
    const meetsThreshold = score >= this.QUALITY_THRESHOLD;
    const qualityLevel = this.getQualityLevel(score);

    return {
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      stars,
      meetsThreshold,
      breakdown: {
        ...criteria,
        weights: this.weights
      },
      qualityLevel
    };
  }

  /**
   * Validate that all criteria are within valid range (0-100)
   */
  private validateCriteria(criteria: ScoringCriteria): void {
    const entries = Object.entries(criteria);
    for (const [key, value] of entries) {
      if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
        throw new Error(`Invalid ${key}: must be a number between 0 and 100, got ${value}`);
      }
    }
  }

  /**
   * Calculate weighted average score
   */
  private calculateWeightedScore(criteria: ScoringCriteria): number {
    return (
      criteria.dataAccuracy * this.weights.dataAccuracy +
      criteria.logicalConsistency * this.weights.logicalConsistency +
      criteria.actionability * this.weights.actionability +
      criteria.analysisCompleteness * this.weights.analysisCompleteness +
      criteria.presentation * this.weights.presentation
    );
  }

  /**
   * Convert numeric score to 5-star rating
   * Based on proven thresholds from user's real estate methodology
   */
  private convertToStars(score: number): number {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 60) return 2;
    return 1;
  }

  /**
   * Get quality level description
   */
  private getQualityLevel(score: number): ScoringResult['qualityLevel'] {
    if (score >= 90) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Acceptable';
    if (score >= 60) return 'Below Standard';
    return 'Poor';
  }

  /**
   * Get the current quality threshold
   */
  getQualityThreshold(): number {
    return this.QUALITY_THRESHOLD;
  }

  /**
   * Get the scoring weights configuration
   */
  getWeights(): Record<keyof ScoringCriteria, number> {
    return { ...this.weights };
  }
}
