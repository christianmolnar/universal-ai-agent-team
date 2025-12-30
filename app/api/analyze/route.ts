/**
 * Analysis API Route
 * Handles real analysis requests through the Universal Methodology Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { UniversalMethodologyEngine } from '../../../src/engine/universal-methodology-engine';
import { RealEstateDomainModule } from '../../../src/domains/real-estate-module';
import { DomainAnalysisRequest } from '../../../src/types/domain';

// Initialize the Universal Methodology Engine
const engine = new UniversalMethodologyEngine({
  qualityThreshold: 85,
  maxIterations: 3,
  enableUserFeedback: true,
  autoApproveScore: 90,
  domains: ['real-estate']
});

// Register the Real Estate module
engine.registerModule(new RealEstateDomainModule());

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    console.log('Received analysis request:', requestData);

    // Create analysis request
    const analysisRequest: DomainAnalysisRequest = {
      id: `analysis-${Date.now()}`,
      domainType: requestData.domainType || 'real-estate',
      inputData: requestData.inputData,
      userPreferences: requestData.userPreferences,
      qualityThreshold: requestData.qualityThreshold || 85
    };

    // Execute analysis
    const result = await engine.executeAnalysis(analysisRequest);

    console.log(`Analysis completed: ${result.id} - Score: ${result.qualityScore}/100`);

    return NextResponse.json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return available modules and engine status
    const modules = engine.getAvailableModules();
    const stats = engine.getEngineStats();

    return NextResponse.json({
      success: true,
      engine: {
        modules,
        stats,
        status: 'operational'
      }
    });

  } catch (error) {
    console.error('Engine status error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
