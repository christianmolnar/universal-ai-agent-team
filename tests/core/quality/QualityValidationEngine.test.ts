/**
 * Test Suite for Quality Validation Engine
 * 
 * Tests the quality validation system with automatic rollback capabilities
 * and comprehensive validation reporting.
 */

import { QualityValidationEngine } from '../../../src/core/quality/QualityValidationEngine';
import { ScoringCriteria } from '../../../src/core/scoring/ScoringEngine';

describe('QualityValidationEngine', () => {
  let validationEngine: QualityValidationEngine;

  beforeEach(() => {
    validationEngine = new QualityValidationEngine();
  });

  describe('Analysis Validation', () => {
    test('should validate high-quality analysis as valid', async () => {
      const highQualityCriteria: ScoringCriteria = {
        dataAccuracy: 95,
        logicalConsistency: 92,
        actionability: 88,
        analysisCompleteness: 90,
        presentation: 87
      };

      const result = await validationEngine.validateAnalysis(
        'test-analysis-1',
        { content: 'High quality analysis content' },
        highQualityCriteria
      );

      expect(result.isValid).toBe(true);
      expect(result.scoring.meetsThreshold).toBe(true);
      expect(result.scoring.score).toBeGreaterThan(85);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations[0]).toContain('Excellent work!');
    });

    test('should validate low-quality analysis as invalid', async () => {
      const lowQualityCriteria: ScoringCriteria = {
        dataAccuracy: 65,
        logicalConsistency: 70,
        actionability: 60,
        analysisCompleteness: 75,
        presentation: 80
      };

      const result = await validationEngine.validateAnalysis(
        'test-analysis-2',
        { content: 'Low quality analysis content' },
        lowQualityCriteria
      );

      expect(result.isValid).toBe(false);
      expect(result.scoring.meetsThreshold).toBe(false);
      expect(result.scoring.score).toBeLessThan(85);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test('should identify critical and warning issues correctly', async () => {
      const mixedQualityCriteria: ScoringCriteria = {
        dataAccuracy: 65, // Critical (< 70)
        logicalConsistency: 75, // Warning (< 85)
        actionability: 90, // Good
        analysisCompleteness: 88, // Good
        presentation: 92 // Good
      };

      const result = await validationEngine.validateAnalysis(
        'test-analysis-3',
        { content: 'Mixed quality analysis' },
        mixedQualityCriteria
      );

      const criticalIssues = result.issues.filter(i => i.severity === 'critical');
      const warningIssues = result.issues.filter(i => i.severity === 'warning');

      expect(criticalIssues.length).toBeGreaterThan(0);
      expect(warningIssues.length).toBeGreaterThan(0);
      expect(criticalIssues[0].category).toBe('dataAccuracy');
      expect(warningIssues[0].category).toBe('logicalConsistency');
    });
  });

  describe('State Management and Rollback', () => {
    test('should save and retrieve validation history', async () => {
      const criteria1: ScoringCriteria = {
        dataAccuracy: 90,
        logicalConsistency: 88,
        actionability: 92,
        analysisCompleteness: 85,
        presentation: 87
      };

      const criteria2: ScoringCriteria = {
        dataAccuracy: 95,
        logicalConsistency: 93,
        actionability: 94,
        analysisCompleteness: 91,
        presentation: 89
      };

      await validationEngine.validateAnalysis('analysis-1', { version: 1 }, criteria1);
      await validationEngine.validateAnalysis('analysis-1', { version: 2 }, criteria2);

      const history = validationEngine.getValidationHistory('analysis-1');
      expect(history).toHaveLength(2);
      expect(history[0].content.version).toBe(1);
      expect(history[1].content.version).toBe(2);
    });

    test('should rollback to last valid state', async () => {
      const validCriteria: ScoringCriteria = {
        dataAccuracy: 90,
        logicalConsistency: 88,
        actionability: 92,
        analysisCompleteness: 87,
        presentation: 85
      };

      const invalidCriteria: ScoringCriteria = {
        dataAccuracy: 60,
        logicalConsistency: 65,
        actionability: 70,
        analysisCompleteness: 75,
        presentation: 80
      };

      // Create valid state
      await validationEngine.validateAnalysis('rollback-test', { version: 'valid' }, validCriteria);
      
      // Create invalid state
      await validationEngine.validateAnalysis('rollback-test', { version: 'invalid' }, invalidCriteria);

      const lastValid = validationEngine.rollbackToLastValid('rollback-test');
      
      expect(lastValid).not.toBeNull();
      expect(lastValid!.content.version).toBe('valid');
      expect(lastValid!.lastValidation!.isValid).toBe(true);
    });

    test('should return null when no valid state exists for rollback', () => {
      const result = validationEngine.rollbackToLastValid('nonexistent-analysis');
      expect(result).toBeNull();
    });

    test('should maintain history limit', async () => {
      const criteria: ScoringCriteria = {
        dataAccuracy: 85,
        logicalConsistency: 85,
        actionability: 85,
        analysisCompleteness: 85,
        presentation: 85
      };

      // Create more than the history limit (10) entries
      for (let i = 0; i < 15; i++) {
        await validationEngine.validateAnalysis(
          'history-limit-test',
          { iteration: i },
          criteria
        );
      }

      const history = validationEngine.getValidationHistory('history-limit-test');
      expect(history.length).toBeLessThanOrEqual(10);
    });

    test('should clear history correctly', async () => {
      const criteria: ScoringCriteria = {
        dataAccuracy: 85,
        logicalConsistency: 85,
        actionability: 85,
        analysisCompleteness: 85,
        presentation: 85
      };

      await validationEngine.validateAnalysis('clear-test', { content: 'test' }, criteria);
      
      let history = validationEngine.getValidationHistory('clear-test');
      expect(history.length).toBeGreaterThan(0);

      validationEngine.clearHistory('clear-test');
      
      history = validationEngine.getValidationHistory('clear-test');
      expect(history).toHaveLength(0);
    });
  });

  describe('Issue Detection and Recommendations', () => {
    test('should provide specific recommendations for each criterion', async () => {
      const problematicCriteria: ScoringCriteria = {
        dataAccuracy: 60, // Critical
        logicalConsistency: 65, // Critical
        actionability: 75, // Warning
        analysisCompleteness: 78, // Warning
        presentation: 82 // Warning
      };

      const result = await validationEngine.validateAnalysis(
        'recommendation-test',
        { content: 'Problematic analysis' },
        problematicCriteria
      );

      expect(result.issues.length).toBe(6); // 5 criteria + overall score
      
      const dataAccuracyIssue = result.issues.find(i => i.category === 'dataAccuracy');
      expect(dataAccuracyIssue).toBeDefined();
      expect(dataAccuracyIssue!.severity).toBe('critical');
      expect(dataAccuracyIssue!.suggestedFix).toContain('Verify all facts');

      const logicalConsistencyIssue = result.issues.find(i => i.category === 'logicalConsistency');
      expect(logicalConsistencyIssue!.suggestedFix).toContain('Restructure analysis');
    });

    test('should format recommendations properly', async () => {
      const mixedCriteria: ScoringCriteria = {
        dataAccuracy: 65, // Critical
        logicalConsistency: 78, // Warning
        actionability: 90, // Good
        analysisCompleteness: 88, // Good
        presentation: 85 // Good
      };

      const result = await validationEngine.validateAnalysis(
        'format-test',
        { content: 'Mixed quality content' },
        mixedCriteria
      );

      expect(result.recommendations.some(r => r.includes('🚨 Critical improvements needed'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('⚠️ Recommended improvements'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('Target: Achieve 85+'))).toBe(true);
    });
  });

  describe('Configuration', () => {
    test('should return correct quality threshold', () => {
      expect(validationEngine.getQualityThreshold()).toBe(85);
    });
  });

  describe('Integration', () => {
    test('should maintain consistency between validation and scoring', async () => {
      const criteria: ScoringCriteria = {
        dataAccuracy: 90,
        logicalConsistency: 92,
        actionability: 90,
        analysisCompleteness: 90,
        presentation: 89
      };

      const result = await validationEngine.validateAnalysis(
        'integration-test',
        { content: 'Test content' },
        criteria
      );

      // Validation result should match direct scoring calculation
      expect(result.scoring.score).toBeGreaterThan(85);
      expect(result.scoring.stars).toBe(5);
      expect(result.isValid).toBe(result.scoring.meetsThreshold);
    });

    test('should handle edge case at exact threshold', async () => {
      const exactThresholdCriteria: ScoringCriteria = {
        dataAccuracy: 85,
        logicalConsistency: 85,
        actionability: 85,
        analysisCompleteness: 85,
        presentation: 85
      };

      const result = await validationEngine.validateAnalysis(
        'threshold-test',
        { content: 'Threshold content' },
        exactThresholdCriteria
      );

      expect(result.scoring.score).toBe(85);
      expect(result.isValid).toBe(true);
      expect(result.scoring.meetsThreshold).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });
});
