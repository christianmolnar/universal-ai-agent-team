import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await DatabaseManager.testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Failed to connect to database' },
        { status: 500 }
      );
    }

    // Initialize tables
    await DatabaseManager.initializeTables();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful and tables initialized',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Database initialization failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}
