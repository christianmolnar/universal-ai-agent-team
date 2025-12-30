/**
 * Batch Analysis API Route
 * POST /api/analysis/batch - Start a new batch property analysis
 * GET /api/analysis/batch/[id] - Get batch status and results
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { BatchAnalysisOrchestrator } from '@/src/services/batch-analysis-orchestrator';
import { BatchAnalysisRequest } from '@/src/types/batch-analysis';

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function POST(request: NextRequest) {
  try {
    const body: BatchAnalysisRequest = await request.json();

    // Validate request
    if (!body.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!body.properties || body.properties.length === 0) {
      return NextResponse.json(
        { error: 'At least one property URL is required' },
        { status: 400 }
      );
    }

    if (!['primary', 'rental', 'both'].includes(body.propertyType)) {
      return NextResponse.json(
        { error: 'Invalid property type' },
        { status: 400 }
      );
    }

    // Start batch analysis
    const orchestrator = new BatchAnalysisOrchestrator(pool);
    const response = await orchestrator.startBatchAnalysis(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId parameter is required' },
        { status: 400 }
      );
    }

    const orchestrator = new BatchAnalysisOrchestrator(pool);
    
    // Get batch status
    const batch = await orchestrator.getBatchStatus(batchId);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Get batch results
    const results = await orchestrator.getBatchResults(batchId);

    return NextResponse.json({
      batch,
      results,
    });
  } catch (error) {
    console.error('Get batch results error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
