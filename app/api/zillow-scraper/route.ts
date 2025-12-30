import { NextRequest, NextResponse } from 'next/server';
import { scrapeZillowProperty } from '@/lib/zillow-scraper';

export async function POST(request: NextRequest) {
  try {
    const { url, zpid } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Zillow URL is required' },
        { status: 400 }
      );
    }

    console.log('Scraping Zillow URL:', url);

    // Use shared scraping utility
    const propertyData = await scrapeZillowProperty(url, zpid);

    if (!propertyData) {
      throw new Error('Could not extract property data from the page');
    }

    return NextResponse.json({
      success: true,
      property: propertyData,
      message: 'Property data extracted successfully'
    });

  } catch (error) {
    console.error('Error scraping Zillow:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to scrape Zillow URL',
        details: 'Please check the URL and try again'
      },
      { status: 500 }
    );
  }
}
