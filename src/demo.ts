/**
 * Phase 1A Demonstration
 * 
 * Demonstrates the Universal Scoring Engine and Quality Validation system
 * working together to evaluate analysis quality and enforce 85+ thresholds.
 * 
 * This validation proves our test-first approach has successfully created
 * the foundation for the Universal AI Agent Team Platform.
 */

import { ScoringEngine } from './core/scoring/ScoringEngine';
import { QualityValidationEngine } from './core/quality/QualityValidationEngine';

async function demonstratePhase1A() {
  console.log('🚀 Universal AI Agent Team Platform - Phase 1A Demonstration\n');
  
  const scoringEngine = new ScoringEngine();
  const validationEngine = new QualityValidationEngine();
  
  // Example 1: High-quality analysis (should pass)
  console.log('📊 Example 1: High-Quality Real Estate Analysis');
  console.log('=' .repeat(50));
  
  const highQualityAnalysis = {
    dataAccuracy: 95,        // Excellent data verification
    logicalConsistency: 92,  // Strong logical flow
    actionability: 88,       // Clear action items
    analysisCompleteness: 90, // Comprehensive coverage
    presentation: 87         // Professional presentation
  };
  
  const highQualityResult = await validationEngine.validateAnalysis(
    'real-estate-example-1',
    { 
      property: 'H06 Redbird Lane',
      price: '$875,000',
      analysis: 'Premium location with casita, garage, and excellent schools'
    },
    highQualityAnalysis
  );
  
  console.log(`Overall Score: ${highQualityResult.scoring.score}/100`);
  console.log(`Star Rating: ${'⭐'.repeat(highQualityResult.scoring.stars)}`);
  console.log(`Quality Level: ${highQualityResult.scoring.qualityLevel}`);
  console.log(`Meets Threshold: ${highQualityResult.isValid ? '✅ Yes' : '❌ No'}`);
  console.log(`Issues Found: ${highQualityResult.issues.length}`);
  console.log();
  
  // Example 2: Low-quality analysis (should trigger rollback)
  console.log('📊 Example 2: Low-Quality Analysis (Triggering Rollback)');
  console.log('=' .repeat(50));
  
  const lowQualityAnalysis = {
    dataAccuracy: 65,        // Poor data verification
    logicalConsistency: 70,  // Weak logical flow
    actionability: 60,       // Unclear actions
    analysisCompleteness: 75, // Missing key details
    presentation: 80         // Adequate presentation
  };
  
  const lowQualityResult = await validationEngine.validateAnalysis(
    'real-estate-example-2',
    {
      property: 'H07 139th Street',
      price: '$825,000', 
      analysis: 'Basic analysis with missing details'
    },
    lowQualityAnalysis
  );
  
  console.log(`Overall Score: ${lowQualityResult.scoring.score}/100`);
  console.log(`Star Rating: ${'⭐'.repeat(lowQualityResult.scoring.stars)}`);
  console.log(`Quality Level: ${lowQualityResult.scoring.qualityLevel}`);
  console.log(`Meets Threshold: ${lowQualityResult.isValid ? '✅ Yes' : '❌ No'}`);
  console.log(`Issues Found: ${lowQualityResult.issues.length}`);
  
  if (lowQualityResult.issues.length > 0) {
    console.log('\n🔧 Improvement Recommendations:');
    lowQualityResult.recommendations.forEach(rec => console.log(`  ${rec}`));
  }
  
  // Demonstrate rollback capability
  console.log('\n🔄 Demonstrating Automatic Rollback:');
  const rollbackState = validationEngine.rollbackToLastValid('real-estate-example-2');
  if (rollbackState) {
    console.log(`✅ Rollback successful to state: ${rollbackState.id}`);
  } else {
    console.log('ℹ️ No valid state found for rollback (as expected for first analysis)');
  }
  
  // Example 3: Exact threshold case
  console.log('\n📊 Example 3: Exact Threshold Case (85 points)');
  console.log('=' .repeat(50));
  
  const exactThresholdAnalysis = {
    dataAccuracy: 85,
    logicalConsistency: 85,
    actionability: 85,
    analysisCompleteness: 85,
    presentation: 85
  };
  
  const exactResult = await validationEngine.validateAnalysis(
    'threshold-test',
    {
      property: 'Threshold Test Property',
      analysis: 'Analysis meeting exact quality threshold'
    },
    exactThresholdAnalysis
  );
  
  console.log(`Overall Score: ${exactResult.scoring.score}/100`);
  console.log(`Star Rating: ${'⭐'.repeat(exactResult.scoring.stars)}`);
  console.log(`Meets Threshold: ${exactResult.isValid ? '✅ Yes' : '❌ No'}`);
  console.log();
  
  // System configuration summary
  console.log('⚙️ System Configuration Summary');
  console.log('=' .repeat(50));
  console.log(`Quality Threshold: ${validationEngine.getQualityThreshold()}+ points`);
  console.log('Scoring Weights:');
  const weights = scoringEngine.getWeights();
  Object.entries(weights).forEach(([criterion, weight]) => {
    console.log(`  • ${criterion}: ${Math.round(weight * 100)}%`);
  });
  
  console.log('\n✅ Phase 1A Complete: Universal scoring system with quality gates operational!');
  console.log('🎯 Ready for Phase 1B: User Configuration System');
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstratePhase1A().catch(console.error);
}

export { demonstratePhase1A };
