import { NextRequest, NextResponse } from 'next/server';
import { scrapeZillowProperty } from '@/lib/zillow-scraper';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Zillow URL is required' },
        { status: 400 }
      );
    }

    console.log('Scraping Zillow URL:', url);

    // Scrape the property data from Zillow
    const propertyData = await scrapeZillowProperty(url);

    if (!propertyData) {
      return NextResponse.json(
        { success: false, error: 'Failed to extract property data' },
        { status: 500 }
      );
    }

    console.log('Successfully scraped property:', propertyData.address);

    // Calculate basic metrics
    const metrics = {
      currentValue: propertyData.price,
      purchasePrice: propertyData.lastSoldPrice || propertyData.price,
      pricePerSqft: Math.round(propertyData.price / propertyData.sqft),
      lotSizeAcres: (propertyData.lotSize / 43560).toFixed(2)
    };

    return NextResponse.json({
      success: true,
      data: propertyData,
      metrics
    });

  } catch (error) {
    console.error('Error scraping Zillow property:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape property data'
      },
      { status: 500 }
    );
  }
}
