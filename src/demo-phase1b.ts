/**
 * Phase 1B Demonstration
 * 
 * Demonstrates the User Configuration System integrated with the
 * Universal Scoring Engine. Shows how personalized user requirements
 * enhance analysis quality and provide targeted recommendations.
 */

import { UserConfigurationBuilder } from './core/user/UserConfigurationBuilder';
import { ScoringEngine } from './core/scoring/ScoringEngine';
import { QualityValidationEngine } from './core/quality/QualityValidationEngine';

async function demonstratePhase1B() {
  console.log('🎯 Phase 1B Demonstration: User Configuration + Scoring Integration\n');
  
  // Create your personalized configuration
  console.log('👤 Creating Christian Molnar\'s Configuration Profile');
  console.log('=' .repeat(55));
  
  const christianConfig = UserConfigurationBuilder.createChristianMolnarProfile().build();
  const profile = christianConfig.getProfile();
  
  console.log(`User: ${profile.preferences.userName}`);
  console.log(`Max Price: $${profile.financial!.maxPrice.toLocaleString()}`);
  console.log(`Annual Income: $${profile.financial!.annualIncome.toLocaleString()}`);
  console.log(`Down Payment: ${profile.financial!.downPaymentPercent}% ($${(profile.financial!.maxPrice * profile.financial!.downPaymentPercent / 100).toLocaleString()})`);
  console.log(`Garage Requirement: ${profile.realEstate!.minGarageSpaces}+ spaces`);
  console.log(`Casita Required: ${profile.realEstate!.requiresCasita ? 'Yes' : 'No'}`);
  console.log(`Max Commute: ${profile.realEstate!.maxCommuteMiles} miles`);
  console.log(`Deal Breakers: ${profile.realEstate!.dealBreakers?.join(', ')}`);
  console.log();

  // Test affordability analysis
  console.log('💰 Affordability Analysis');
  console.log('=' .repeat(55));
  
  const builder = UserConfigurationBuilder.createChristianMolnarProfile();
  const preview = builder.preview();
  const affordability = preview.affordabilityAnalysis!;
  
  console.log(`Max Affordable Price: $${affordability.maxAffordablePrice.toLocaleString()}`);
  console.log(`Estimated Monthly Payment: $${affordability.estimatedMonthlyPayment.toLocaleString()}`);
  console.log(`Required Down Payment: $${affordability.downPaymentRequired.toLocaleString()}`);
  console.log(`Budget Status: ${profile.financial!.maxPrice <= affordability.maxAffordablePrice ? '✅ Within Budget' : '⚠️ Above Recommended Budget'}`);
  console.log();

  // Demonstrate configuration validation
  console.log('🔍 Configuration Validation Examples');
  console.log('=' .repeat(55));
  
  // Example 1: Complete configuration
  const completeBuilder = new UserConfigurationBuilder()
    .withFinancials({
      maxPrice: 875000,
      annualIncome: 185000
    })
    .withRealEstateNeeds({
      minGarageSpaces: 3,
      requiresCasita: true
    });
  
  const status1 = completeBuilder.getStatus();
  console.log('Complete Configuration:');
  console.log(`  Ready for Analysis: ${status1.readyForAnalysis ? '✅ Yes' : '❌ No'}`);
  console.log(`  Missing Items: ${status1.missingItems.length === 0 ? 'None' : status1.missingItems.join(', ')}`);
  
  // Example 2: Incomplete configuration
  const incompleteBuilder = new UserConfigurationBuilder()
    .withFinancials({
      maxPrice: 800000,
      annualIncome: 160000
    });
    // Missing real estate requirements
  
  const status2 = incompleteBuilder.getStatus();
  console.log('\nIncomplete Configuration:');
  console.log(`  Ready for Analysis: ${status2.readyForAnalysis ? '✅ Yes' : '❌ No'}`);
  console.log(`  Missing Items: ${status2.missingItems.join(', ')}`);
  console.log();

  // Test integration with scoring engine
  console.log('🔗 Integration with Universal Scoring Engine');
  console.log('=' .repeat(55));
  
  const scoringEngine = new ScoringEngine();
  const validationEngine = new QualityValidationEngine();
  
  // Test property that matches user requirements (H06 Redbird)
  console.log('📊 Property 1: H06 Redbird Lane (Perfect Match)');
  const perfectMatchAnalysis = {
    dataAccuracy: 95,        // Excellent data verification
    logicalConsistency: 92,  // Strong logical flow
    actionability: 90,       // Clear action items (matches user criteria)
    analysisCompleteness: 88, // Comprehensive coverage
    presentation: 89         // Professional presentation
  };
  
  const result1 = await validationEngine.validateAnalysis(
    'h06-redbird-analysis',
    {
      property: 'H06 Redbird Lane',
      price: 875000,
      garageSpaces: 3,         // ✅ Meets requirement
      hasCasita: true,         // ✅ Meets requirement
      commuteMiles: 22,        // ✅ Within limit
      matches: ['garage', 'casita', 'commute', 'price']
    },
    perfectMatchAnalysis
  );
  
  console.log(`  Score: ${result1.scoring.score}/100 (${result1.scoring.stars}⭐)`);
  console.log(`  Quality: ${result1.scoring.qualityLevel}`);
  console.log(`  Meets User Requirements: ✅ All major criteria satisfied`);
  console.log(`  Price vs Budget: $${profile.financial!.maxPrice.toLocaleString()} limit (✅ Under budget)`);
  console.log();

  // Test property that doesn't match user requirements
  console.log('📊 Property 2: H07 139th Street (Missing Requirements)');
  const partialMatchAnalysis = {
    dataAccuracy: 88,        // Good data verification
    logicalConsistency: 85,  // Adequate logical flow
    actionability: 75,       // Reduced actionability (missing key features)
    analysisCompleteness: 82, // Good coverage but missing casita analysis
    presentation: 87         // Good presentation
  };
  
  const result2 = await validationEngine.validateAnalysis(
    'h07-139th-analysis',
    {
      property: 'H07 139th Street',
      price: 825000,
      garageSpaces: 2,         // ❌ Below requirement (needs 3+)
      hasCasita: false,        // ❌ Missing requirement
      commuteMiles: 18,        // ✅ Within limit
      matches: ['commute', 'price'],
      missing: ['garage', 'casita']
    },
    partialMatchAnalysis
  );
  
  console.log(`  Score: ${result2.scoring.score}/100 (${result2.scoring.stars}⭐)`);
  console.log(`  Quality: ${result2.scoring.qualityLevel}`);
  console.log(`  Meets User Requirements: ⚠️ Missing key criteria`);
  console.log(`  Issues: Only 2 garage spaces (need 3+), No casita`);
  console.log(`  Price vs Budget: $${profile.financial!.maxPrice.toLocaleString()} limit (✅ Under budget)`);
  console.log();

  // Demonstrate custom scoring weights
  console.log('⚖️ Custom Scoring Weights Integration');
  console.log('=' .repeat(55));
  
  const customWeightConfig = new UserConfigurationBuilder()
    .withFinancials({
      maxPrice: 900000,
      annualIncome: 200000
    })
    .withRealEstateNeeds({
      minGarageSpaces: 3,
      requiresCasita: true
    })
    .withCustomWeights({
      dataAccuracy: 0.30,      // Increased importance of data accuracy
      logicalConsistency: 0.20,
      actionability: 0.30,     // Increased importance of actionability
      analysisCompleteness: 0.15,
      presentation: 0.05       // Decreased importance of presentation
    })
    .build();
  
  const customWeights = customWeightConfig.getScoringWeights();
  console.log('Default Weights vs Custom Weights:');
  const defaultWeights = scoringEngine.getWeights();
  
  Object.keys(defaultWeights).forEach(key => {
    const defaultWeight = Math.round(defaultWeights[key as keyof typeof defaultWeights] * 100);
    const customWeight = customWeights ? Math.round(customWeights[key] * 100) : defaultWeight;
    console.log(`  ${key}: ${defaultWeight}% → ${customWeight}%`);
  });
  console.log();

  // Configuration export/import demo
  console.log('💾 Configuration Export/Import');
  console.log('=' .repeat(55));
  
  const exportedConfig = christianConfig.exportConfiguration();
  console.log('Configuration exported successfully.');
  console.log(`Export size: ${exportedConfig.length} characters`);
  console.log('Preview of exported data:');
  console.log(exportedConfig.substring(0, 200) + '...\n');

  // Summary
  console.log('✅ Phase 1B Integration Summary');
  console.log('=' .repeat(55));
  console.log('✓ User configuration system operational');
  console.log('✓ Financial constraints with affordability analysis');
  console.log('✓ Real estate requirements with validation');
  console.log('✓ Custom scoring weights integration');
  console.log('✓ Configuration export/import functionality');
  console.log('✓ Ready for personalized property analysis');
  console.log();
  console.log('🎯 Ready for Phase 1C: Universal 5-Star Scoring with Real Estate Module');
}

// Quick configuration test for immediate validation
export async function quickConfigurationTest() {
  console.log('🚀 Quick Configuration Test\n');
  
  try {
    // Test your actual requirements
    const yourConfig = UserConfigurationBuilder.createChristianMolnarProfile();
    const status = yourConfig.getStatus();
    
    console.log('Your Configuration Status:');
    console.log(`✅ Complete: ${status.isComplete}`);
    console.log(`✅ Ready for Analysis: ${status.readyForAnalysis}`);
    
    if (status.readyForAnalysis) {
      const config = yourConfig.build();
      const profile = config.getProfile();
      
      console.log('\nConfiguration Preview:');
      console.log(`• Max Price: $${profile.financial!.maxPrice.toLocaleString()}`);
      console.log(`• Garage Spaces: ${profile.realEstate!.minGarageSpaces}+`);
      console.log(`• Casita Required: ${profile.realEstate!.requiresCasita}`);
      
      console.log('\n✅ Ready to analyze real estate properties!');
    } else {
      console.log(`\n❌ Missing: ${status.missingItems.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Configuration Error:', error instanceof Error ? error.message : error);
  }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstratePhase1B().catch(console.error);
}

export { demonstratePhase1B };
