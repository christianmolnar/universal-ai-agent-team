import { NextRequest, NextResponse } from 'next/server';
import { ZillowParser } from '@/lib/zillow-parser';
import { savePropertyFromZillow } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Raw request body:', JSON.stringify(body, null, 2));
    
    const { property, propertyType, userId = 'christian_molnar', zillowUrl, mortgageData } = body;

    // New flow: Accept pre-scraped property data
    if (property) {
      console.log('Saving pre-scraped property data:', { userId, propertyType });

      // Save to database with property type
      const savedProperty = await savePropertyFromZillow(userId, property, mortgageData);

      return NextResponse.json({
        success: true,
        message: 'Property added successfully!',
        property: {
          id: savedProperty.id,
          ...property
        }
      });
    }

    // Legacy flow: Scrape from URL (kept for backward compatibility)
    if (!zillowUrl) {
      return NextResponse.json(
        { error: 'Either property data or zillowUrl is required' },
        { status: 400 }
      );
    }

    console.log('Processing property addition:', { zillowUrl, userId });
    console.log('URL type:', typeof zillowUrl);
    console.log('URL length:', zillowUrl.length);
    console.log('First 100 chars of URL:', zillowUrl.substring(0, 100));

    // Parse Zillow data
    const zillowData = await ZillowParser.parseZillowURL(zillowUrl);
    
    if (!zillowData) {
      return NextResponse.json(
        { 
          error: 'Could not retrieve property data from Zillow URL',
          details: 'Zillow may be blocking automated access. Please try again in a few minutes, or use manual data entry.',
          suggestion: 'If this persists, Zillow has detected automated scraping. Consider using the Zillow Bridge API or manual entry.'
        },
        { status: 404 }
      );
    }

    // Calculate investment metrics
    const metrics = ZillowParser.calculateInvestmentMetrics(zillowData);

    // Save to database
    const savedProperty = await savePropertyFromZillow(userId, zillowData, mortgageData);

    return NextResponse.json({
      success: true,
      message: 'Property added successfully!',
      property: {
        id: savedProperty.id,
        address: zillowData.address,
        city: zillowData.city,
        state: zillowData.state,
        zipCode: zillowData.zipCode,
        currentValue: zillowData.zestimate || zillowData.price,
        bedrooms: zillowData.bedrooms,
        bathrooms: zillowData.bathrooms,
        sqft: zillowData.sqft,
        lotSize: zillowData.lotSize,
        yearBuilt: zillowData.yearBuilt,
        features: zillowData.features,
        propertyType: zillowData.propertyType,
        zpid: zillowData.zpid,
      },
      metrics: {
        currentValue: metrics.currentValue,
        purchasePrice: metrics.purchasePrice,
        appreciation: metrics.appreciation,
        appreciationPercent: metrics.appreciationPercent.toFixed(1),
        yearsOwned: metrics.yearsOwned,
        annualAppreciationRate: metrics.annualAppreciationRate.toFixed(1),
        pricePerSqft: metrics.pricePerSqft.toFixed(0)
      },
      nextSteps: {
        message: "Property data extracted and saved successfully!",
        manualEntryNeeded: [
          "Mortgage balance",
          "Monthly mortgage payment", 
          "Monthly rent (if rental property)",
          "Tenant information (if applicable)",
          "Property management details"
        ]
      }
    });

  } catch (error) {
    console.error('Error adding property:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to add property',
        details: 'Please check the Zillow URL and try again'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'christian_molnar';

    // TODO: Fetch properties from database
    // For now, return placeholder response
    
    return NextResponse.json({
      success: true,
      message: 'Property retrieval API',
      userId: userId,
      note: 'Database integration in progress - properties will be saved and retrieved from Railway PostgreSQL'
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
