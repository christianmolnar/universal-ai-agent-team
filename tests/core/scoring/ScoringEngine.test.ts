/**
 * Test Suite for Universal Scoring Engine
 * 
 * Tests the core scoring functionality that replicates the proven
 * methodology from user's successful real estate analysis.
 */

import { ScoringEngine, ScoringCriteria } from '../../../src/core/scoring/ScoringEngine';

describe('ScoringEngine', () => {
  let scoringEngine: ScoringEngine;

  beforeEach(() => {
    scoringEngine = new ScoringEngine();
  });

  describe('Score Calculation', () => {
    test('should calculate perfect score correctly', () => {
      const perfectCriteria: ScoringCriteria = {
        dataAccuracy: 100,
        logicalConsistency: 100,
        actionability: 100,
        analysisCompleteness: 100,
        presentation: 100
      };

      const result = scoringEngine.calculateScore(perfectCriteria);

      expect(result.score).toBe(100);
      expect(result.stars).toBe(5);
      expect(result.meetsThreshold).toBe(true);
      expect(result.qualityLevel).toBe('Excellent');
    });

    test('should apply weighted scoring correctly', () => {
      // Test scenario where different weights affect final score
      const criteria: ScoringCriteria = {
        dataAccuracy: 80,     // 25% weight = 20 points
        logicalConsistency: 80, // 25% weight = 20 points  
        actionability: 90,    // 20% weight = 18 points
        analysisCompleteness: 85, // 20% weight = 17 points
        presentation: 95      // 10% weight = 9.5 points
      };
      // Expected: 80*0.25 + 80*0.25 + 90*0.20 + 85*0.20 + 95*0.10 = 84.5

      const result = scoringEngine.calculateScore(criteria);

      expect(result.score).toBe(84.5);
      expect(result.stars).toBe(4);
      expect(result.meetsThreshold).toBe(false); // Below 85 threshold
      expect(result.qualityLevel).toBe('Acceptable');
    });

    test('should meet threshold at exactly 85 points', () => {
      const criteria: ScoringCriteria = {
        dataAccuracy: 85,
        logicalConsistency: 85,
        actionability: 85,
        analysisCompleteness: 85,
        presentation: 85
      };

      const result = scoringEngine.calculateScore(criteria);

      expect(result.score).toBe(85);
      expect(result.stars).toBe(4);
      expect(result.meetsThreshold).toBe(true);
      expect(result.qualityLevel).toBe('Good');
    });

    test('should handle minimum scores', () => {
      const minCriteria: ScoringCriteria = {
        dataAccuracy: 0,
        logicalConsistency: 0,
        actionability: 0,
        analysisCompleteness: 0,
        presentation: 0
      };

      const result = scoringEngine.calculateScore(minCriteria);

      expect(result.score).toBe(0);
      expect(result.stars).toBe(1);
      expect(result.meetsThreshold).toBe(false);
      expect(result.qualityLevel).toBe('Poor');
    });
  });

  describe('Star Rating Conversion', () => {
    test('should convert scores to correct star ratings', () => {
      const testCases = [
        { score: 95, expectedStars: 5 },
        { score: 90, expectedStars: 5 },
        { score: 89, expectedStars: 4 },
        { score: 80, expectedStars: 4 },
        { score: 79, expectedStars: 3 },
        { score: 70, expectedStars: 3 },
        { score: 69, expectedStars: 2 },
        { score: 60, expectedStars: 2 },
        { score: 59, expectedStars: 1 },
        { score: 0, expectedStars: 1 }
      ];

      testCases.forEach(({ score, expectedStars }) => {
        const criteria: ScoringCriteria = {
          dataAccuracy: score,
          logicalConsistency: score,
          actionability: score,
          analysisCompleteness: score,
          presentation: score
        };

        const result = scoringEngine.calculateScore(criteria);
        expect(result.stars).toBe(expectedStars);
      });
    });
  });

  describe('Quality Level Classification', () => {
    test('should classify quality levels correctly', () => {
      const testCases = [
        { score: 95, expectedLevel: 'Excellent' },
        { score: 90, expectedLevel: 'Excellent' },
        { score: 89, expectedLevel: 'Good' },
        { score: 85, expectedLevel: 'Good' },
        { score: 84, expectedLevel: 'Acceptable' },
        { score: 70, expectedLevel: 'Acceptable' },
        { score: 69, expectedLevel: 'Below Standard' },
        { score: 60, expectedLevel: 'Below Standard' },
        { score: 59, expectedLevel: 'Poor' },
        { score: 0, expectedLevel: 'Poor' }
      ];

      testCases.forEach(({ score, expectedLevel }) => {
        const criteria: ScoringCriteria = {
          dataAccuracy: score,
          logicalConsistency: score,
          actionability: score,
          analysisCompleteness: score,
          presentation: score
        };

        const result = scoringEngine.calculateScore(criteria);
        expect(result.qualityLevel).toBe(expectedLevel);
      });
    });
  });

  describe('Input Validation', () => {
    test('should reject invalid criteria values', () => {
      const invalidCriteria = [
        { dataAccuracy: -1, logicalConsistency: 80, actionability: 80, analysisCompleteness: 80, presentation: 80 },
        { dataAccuracy: 101, logicalConsistency: 80, actionability: 80, analysisCompleteness: 80, presentation: 80 },
        { dataAccuracy: 80, logicalConsistency: NaN, actionability: 80, analysisCompleteness: 80, presentation: 80 }
      ];

      invalidCriteria.forEach((criteria) => {
        expect(() => scoringEngine.calculateScore(criteria as ScoringCriteria))
          .toThrow(/must be a number between 0 and 100/);
      });
    });

    test('should accept valid boundary values', () => {
      const boundaryCriteria: ScoringCriteria = {
        dataAccuracy: 0,
        logicalConsistency: 100,
        actionability: 50,
        analysisCompleteness: 0,
        presentation: 100
      };

      expect(() => scoringEngine.calculateScore(boundaryCriteria)).not.toThrow();
      
      const result = scoringEngine.calculateScore(boundaryCriteria);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Configuration Access', () => {
    test('should return correct quality threshold', () => {
      expect(scoringEngine.getQualityThreshold()).toBe(85);
    });

    test('should return correct weights configuration', () => {
      const weights = scoringEngine.getWeights();
      
      expect(weights.dataAccuracy).toBe(0.25);
      expect(weights.logicalConsistency).toBe(0.25);
      expect(weights.actionability).toBe(0.20);
      expect(weights.analysisCompleteness).toBe(0.20);
      expect(weights.presentation).toBe(0.10);
      
      // Weights should sum to 1.0
      const totalWeight = Object.values(weights).reduce((sum: number, weight: number) => sum + weight, 0);
      expect(totalWeight).toBeCloseTo(1.0);
    });
  });

  describe('Result Structure', () => {
    test('should return complete result structure', () => {
      const criteria: ScoringCriteria = {
        dataAccuracy: 88,
        logicalConsistency: 92,
        actionability: 85,
        analysisCompleteness: 90,
        presentation: 87
      };

      const result = scoringEngine.calculateScore(criteria);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('stars');
      expect(result).toHaveProperty('meetsThreshold');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('qualityLevel');
      
      expect(result.breakdown).toHaveProperty('weights');
      expect(result.breakdown.dataAccuracy).toBe(88);
      expect(result.breakdown.weights.dataAccuracy).toBe(0.25);
    });

    test('should round score to one decimal place', () => {
      const criteria: ScoringCriteria = {
        dataAccuracy: 88.333,
        logicalConsistency: 92.667,
        actionability: 85.111,
        analysisCompleteness: 90.999,
        presentation: 87.555
      };

      const result = scoringEngine.calculateScore(criteria);

      // Score should be rounded to 1 decimal place
      expect(result.score.toString()).toMatch(/^\d+\.\d$|^\d+$/);
    });
  });
});
