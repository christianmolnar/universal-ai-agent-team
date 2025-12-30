import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

// Handle photo uploads for properties
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string;
    const file = formData.get('file') as File;

    if (!propertyId || !file) {
      return NextResponse.json(
        { error: 'Property ID and file are required' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Get the property
    const pool = DatabaseManager.getPool();
    const result = await pool.query(
      'SELECT property_data FROM user_properties WHERE id = $1',
      [propertyId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const propertyData = result.rows[0].property_data;
    
    // Replace the photo (only store 1 photo per property)
    propertyData.photos = [dataUrl];

    // Update the property
    await pool.query(
      'UPDATE user_properties SET property_data = $1, updated_at = $2 WHERE id = $3',
      [JSON.stringify(propertyData), new Date(), propertyId]
    );

    return NextResponse.json({
      success: true,
      photos: propertyData.photos
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
