import { NextRequest, NextResponse } from 'next/server';
import { ZillowParser } from '@/lib/zillow-parser';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Zillow URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!ZillowParser.isValidZillowURL(url)) {
      return NextResponse.json(
        { error: 'Invalid Zillow URL format. Please provide a valid Zillow property URL.' },
        { status: 400 }
      );
    }

    // Parse the property data
    const propertyData = await ZillowParser.parseZillowURL(url);
    
    if (!propertyData) {
      return NextResponse.json(
        { error: 'Could not retrieve property data from the provided URL' },
        { status: 404 }
      );
    }

    // Calculate investment metrics
    const metrics = ZillowParser.calculateInvestmentMetrics(propertyData);

    return NextResponse.json({
      success: true,
      property: propertyData,
      metrics: metrics,
      message: 'Property data retrieved successfully'
    });

  } catch (error) {
    console.error('Error in Zillow parsing API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to parse Zillow URL',
        details: 'Please check the URL and try again'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests to show API documentation
export async function GET() {
  return NextResponse.json({
    message: 'Zillow Property Parser API',
    endpoint: '/api/zillow-parser',
    method: 'POST',
    body: {
      url: 'https://www.zillow.com/homedetails/address_zpid'
    },
    response: {
      success: true,
      property: {
        address: 'string',
        city: 'string',
        state: 'string',
        zipCode: 'string',
        price: 'number',
        zestimate: 'number',
        bedrooms: 'number',
        bathrooms: 'number',
        sqft: 'number',
        lotSize: 'number',
        yearBuilt: 'number',
        propertyType: 'string',
        features: 'string[]',
        // ... other fields
      },
      metrics: {
        currentValue: 'number',
        purchasePrice: 'number',
        appreciation: 'number',
        appreciationPercent: 'number',
        yearsOwned: 'number',
        annualAppreciationRate: 'number',
        pricePerSqft: 'number'
      }
    },
    note: 'This is currently a mock implementation for demonstration purposes'
  });
}
