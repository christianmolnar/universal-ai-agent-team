// Universal Quality Standards Test
// Defines what 85+ quality means across all analysis types

describe('Universal Quality Standards', () => {
  interface QualityMetrics {
    dataAccuracy: number;        // Must be 90+ for data
    analysisCompleteness: number; // Must be 85+ for completeness  
    logicalConsistency: number;   // Must be 88+ for logic
    presentationQuality: number;  // Must be 80+ for presentation
    actionability: number;        // Must be 90+ for usefulness
  }

  function calculateOverallScore(metrics: QualityMetrics): number {
    // Weighted average with emphasis on critical factors
    const weights = {
      dataAccuracy: 0.25,         // 25% - critical for decisions
      analysisCompleteness: 0.20, // 20% - must be thorough
      logicalConsistency: 0.25,   // 25% - must make sense
      presentationQuality: 0.10,  // 10% - important but not critical
      actionability: 0.20         // 20% - must enable action
    };

    return (
      metrics.dataAccuracy * weights.dataAccuracy +
      metrics.analysisCompleteness * weights.analysisCompleteness +
      metrics.logicalConsistency * weights.logicalConsistency +
      metrics.presentationQuality * weights.presentationQuality +
      metrics.actionability * weights.actionability
    );
  }

  function evaluateQuality(metrics: QualityMetrics): { shouldReject: boolean; reason?: string } {
    // Hard thresholds that cause automatic rejection
    if (metrics.dataAccuracy < 85) {
      return { shouldReject: true, reason: 'data accuracy below minimum threshold' };
    }
    
    if (metrics.logicalConsistency < 80) {
      return { shouldReject: true, reason: 'logical consistency below minimum threshold' };
    }
    
    if (metrics.actionability < 80) {
      return { shouldReject: true, reason: 'actionability below minimum threshold' };
    }

    const overallScore = calculateOverallScore(metrics);
    if (overallScore < 85) {
      return { shouldReject: true, reason: `overall quality score ${overallScore.toFixed(1)} below 85 threshold` };
    }

    return { shouldReject: false };
  }

  it('should define what 85+ quality means', () => {
    const qualityStandards: QualityMetrics = {
      dataAccuracy: 90,       // Must be 90+ for data
      analysisCompleteness: 85, // Must be 85+ for completeness  
      logicalConsistency: 88,   // Must be 88+ for logic
      presentationQuality: 80,  // Must be 80+ for presentation
      actionability: 90         // Must be 90+ for usefulness
    };
    
    const overallThreshold = 85;
    const actualScore = calculateOverallScore(qualityStandards);
    
    expect(actualScore).toBeGreaterThanOrEqual(overallThreshold);
    expect(actualScore).toBeCloseTo(87.5, 1); // Expected weighted score: 85*0.25 + 90*0.25 + 95*0.20 + 85*0.20 + 90*0.10 = 87.5
  });
  
  it('should reject analysis with critical data errors', () => {
    const analysisWithDataErrors: QualityMetrics = {
      dataAccuracy: 70,     // Below threshold
      analysisCompleteness: 95,
      logicalConsistency: 90,
      presentationQuality: 85,
      actionability: 88
    };
    
    const result = evaluateQuality(analysisWithDataErrors);
    
    expect(result.shouldReject).toBe(true);
    expect(result.reason).toContain('data accuracy');
  });

  it('should reject analysis with poor logical consistency', () => {
    const analysisWithLogicErrors: QualityMetrics = {
      dataAccuracy: 95,
      analysisCompleteness: 90,
      logicalConsistency: 70,    // Below threshold
      presentationQuality: 85,
      actionability: 90
    };
    
    const result = evaluateQuality(analysisWithLogicErrors);
    
    expect(result.shouldReject).toBe(true);
    expect(result.reason).toContain('logical consistency');
  });

  it('should reject analysis with low actionability', () => {
    const analysisWithLowActionability: QualityMetrics = {
      dataAccuracy: 95,
      analysisCompleteness: 90,
      logicalConsistency: 90,
      presentationQuality: 85,
      actionability: 70    // Below threshold
    };
    
    const result = evaluateQuality(analysisWithLowActionability);
    
    expect(result.shouldReject).toBe(true);
    expect(result.reason).toContain('actionability');
  });

  it('should accept high quality analysis across all metrics', () => {
    const highQualityAnalysis: QualityMetrics = {
      dataAccuracy: 95,
      analysisCompleteness: 92,
      logicalConsistency: 94,
      presentationQuality: 88,
      actionability: 96
    };
    
    const result = evaluateQuality(highQualityAnalysis);
    const overallScore = calculateOverallScore(highQualityAnalysis);
    
    expect(result.shouldReject).toBe(false);
    expect(overallScore).toBeGreaterThanOrEqual(85);
    expect(overallScore).toBeGreaterThan(93); // Should be high quality
  });

  it('should handle edge case at exact threshold', () => {
    const exactThresholdAnalysis: QualityMetrics = {
      dataAccuracy: 85,    // At threshold
      analysisCompleteness: 85,
      logicalConsistency: 85,  // At threshold
      presentationQuality: 85,
      actionability: 85   // At threshold
    };
    
    const result = evaluateQuality(exactThresholdAnalysis);
    const overallScore = calculateOverallScore(exactThresholdAnalysis);
    
    expect(result.shouldReject).toBe(false);
    expect(overallScore).toBeGreaterThanOrEqual(85); // Should pass at exactly 85
  });
});
