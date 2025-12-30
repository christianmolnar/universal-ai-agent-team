/**
 * API Route: Scrape Zillow Search Results
 * POST /api/zillow/search
 * 
 * Extracts property URLs from a Zillow search results page
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZillowSearchScraper } from '@/src/services/zillow-search-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchUrl, maxPages = 1 } = body;

    if (!searchUrl) {
      return NextResponse.json(
        { error: 'Search URL is required' },
        { status: 400 }
      );
    }

    // Validate it's a Zillow URL
    if (!searchUrl.includes('zillow.com')) {
      return NextResponse.json(
        { error: 'Invalid Zillow search URL' },
        { status: 400 }
      );
    }

    const scraper = new ZillowSearchScraper();
    
    // Scrape single or multiple pages
    const result = maxPages > 1
      ? await scraper.scrapeAllSearchPages(searchUrl, maxPages)
      : await scraper.scrapeSearchResults(searchUrl);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Zillow search API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
