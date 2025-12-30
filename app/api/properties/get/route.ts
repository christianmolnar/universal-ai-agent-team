import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'christian_molnar';

    console.log('Fetching properties for user:', userId);

    // Get all properties for the user
    const properties = await DatabaseManager.getUserProperties(userId);

    console.log('Retrieved properties:', properties.length);

    return NextResponse.json({
      success: true,
      properties
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch properties'
      },
      { status: 500 }
    );
  }
}
