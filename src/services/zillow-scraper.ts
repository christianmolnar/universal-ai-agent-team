/**
 * Zillow Scraping Service
 * Extracts property data from Zillow URLs using Firecrawl API
 */

import Firecrawl from '@mendable/firecrawl-js';
import { PropertyData } from '@/src/types/batch-analysis';

export class ZillowScraperService {
  private firecrawl: Firecrawl;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.FIRECRAWL_API_KEY;
    if (!key) {
      throw new Error('FIRECRAWL_API_KEY environment variable is required');
    }
    this.firecrawl = new Firecrawl({ apiKey: key });
  }

  /**
   * Extract ZPID from Zillow URL
   */
  private extractZpid(url: string): string {
    const match = url.match(/\/(\d+)_zpid/);
    if (!match) {
      throw new Error(`Invalid Zillow URL: ${url}`);
    }
    return match[1];
  }

  /**
   * Scrape property data from Zillow URL
   */
  async scrapeProperty(zillowUrl: string): Promise<PropertyData> {
    try {
      const zpid = this.extractZpid(zillowUrl);

      // Use Firecrawl to scrape the page
      const scrapeResult = await this.firecrawl.scrape(zillowUrl, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      });

      // Extract property data from the scraped content
      const propertyData = this.parsePropertyData(
        zpid, 
        zillowUrl, 
        scrapeResult.markdown || '', 
        scrapeResult.html || ''
      );

      return propertyData;
    } catch (error) {
      console.error(`Error scraping property ${zillowUrl}:`, error);
      throw error;
    }
  }

  /**
   * Parse property data from scraped content
   */
  private parsePropertyData(zpid: string, url: string, markdown: string, html: string): PropertyData {
    // Log the raw markdown for debugging
    console.log(`\n========== ZILLOW SCRAPE DEBUG (ZPID: ${zpid}) ==========`);
    console.log('First 1500 chars of markdown:', markdown.substring(0, 1500));
    console.log('======================================================\n');

    // Extract key information using more specific regex patterns
    // Look for price patterns that match home listing prices (typically $100k+)
    const priceMatches = markdown.match(/\$([0-9,]+(?:K|k)?)/g) || [];
    const prices = priceMatches
      .map(p => {
        const numStr = p.replace(/\$|,/g, '');
        if (numStr.includes('K') || numStr.includes('k')) {
          return parseFloat(numStr.replace(/K|k/g, '')) * 1000;
        }
        return parseInt(numStr);
      })
      .filter(p => p >= 50000); // Filter for reasonable home prices
    
    const price = prices.length > 0 ? Math.max(...prices) : 0; // Take the highest price found
    
    // More flexible bedroom/bathroom patterns - but avoid lot sizes!
    // Look for beds/baths in the property summary (typically near beginning)
    const bedroomsMatch = markdown.match(/(\d+)\s*bed(?:room)?s?\b/i) || 
                         markdown.match(/Bed(?:room)?s?:\s*(\d+)/i);
    
    // For bathrooms, be very specific to avoid matching lot sizes
    // Match "3baths" or "3 baths" but NOT "6,929 Square Feet"
    const bathroomsMatch = markdown.match(/(\d+(?:\.\d+)?)\s*bath(?:room)?s?\b/i) ||
                          markdown.match(/Bath(?:room)?s?:\s*(\d+(?:\.\d+)?)/i);
    
    // Validate bathroom count is reasonable (between 0.5 and 20)
    let bathrooms = bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 0;
    if (bathrooms < 0.5 || bathrooms > 20) {
      bathrooms = 0; // Invalid bathroom count, probably matched something else
    }
    
    // Square footage - look for living area specifically (not lot size)
    // Pattern: "3beds\n\n2baths\n\n2,261sqft" - the sqft right after baths is living area
    const livingAreaMatch = markdown.match(/(\d+)\s*bath[^\n]*\n+([0-9,]+)\s*sqft/i);
    let livingArea = 0;
    
    if (livingAreaMatch) {
      // Found living area in the beds/baths/sqft pattern
      livingArea = parseInt(livingAreaMatch[2].replace(/,/g, ''));
    } else {
      // Fallback: look for any reasonable sqft that's NOT a lot size
      const sqftMatches = markdown.match(/([0-9,]+)\s*sqft(?!\s+lot)/gi) || [];
      const sqftValues = sqftMatches
        .map(m => parseInt(m.replace(/[^0-9]/g, '')))
        .filter(v => v >= 500 && v <= 10000); // Living area range (exclude large lot sizes)
      livingArea = sqftValues.length > 0 ? sqftValues[0] : 0; // Take first match
    }
    
    // Extract city, state, zip first to help with address extraction
    const cityStateMatch = markdown.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})/);
    
    // Extract address - look for pattern like "# 17867 W Eugene Ter,Surprise, AZ 85388"
    // This appears in markdown as a heading after the property stats
    let addressMatch = markdown.match(/^#+\s*([0-9]+[^,\n]+),\s*[A-Z]/m); // Heading with street address
    console.log('Address regex match attempt 1:', addressMatch?.[1] || 'No match');
    
    if (!addressMatch) {
      // Try to find full address with city/state/zip
      addressMatch = markdown.match(/([0-9]+\s+[^,\n]+),\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/);
      console.log('Address regex match attempt 2:', addressMatch?.[1] || 'No match');
      if (addressMatch) {
        // Extract just the street address part
        addressMatch = [addressMatch[0], addressMatch[1]];
      }
    }
    
    // Extract address components from structured data or URL
    let address = addressMatch ? addressMatch[1].trim() : 'Unknown Address';
    
    // Clean up address - remove markdown links and navigation elements
    address = address.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove markdown links
    address = address.replace(/Skip main navigation|See all \d+ photos|For sale/gi, '').trim(); // Remove common navigation text
    
    // If address is still invalid or too short, mark as unknown
    if (!address || address.length < 5 || !address.match(/\d/)) {
      address = 'Unknown Address';
    }

    // Extract additional details
    const yearBuiltMatch = markdown.match(/Built in (\d{4})/i) || 
                          markdown.match(/Year built:\s*(\d{4})/i) ||
                          markdown.match(/(\d{4})\s*(?:built|year)/i);
    const lotSizeMatch = markdown.match(/([0-9,]+)\s*sqft\s*lot/i) ||
                        markdown.match(/Lot:\s*([0-9,]+)\s*sqft/i);
    const propertyTypeMatch = markdown.match(/Property type:\s*([^\n]+)/i) ||
                             markdown.match(/Type:\s*(Single Family|Condo|Townhouse|Multi-family)/i);
    
    // Look for Zestimate and Rent Zestimate
    // Zestimate format: "$X,XXX,XXX Zestimate®" or very close to "Zestimate®: $X,XXX,XXX"
    // Note: "$-- Zestimate®" means no Zestimate available (dashes indicate N/A)
    // We need to be very strict - price must be immediately before or within 10 chars after "Zestimate"
    // CRITICAL: Exclude price-per-sqft patterns like "$150/sqft" or "$150 /sqft"
    
    // Check if Zestimate shows as unavailable (dashes) - do this FIRST
    const zestimateUnavailable = markdown.match(/\$[\s]*[-–—]+[\s]*Zestimate/i);
    
    // Only look for Zestimate value if not explicitly unavailable
    const zestimateMatch = !zestimateUnavailable ? (
      markdown.match(/\$([0-9][0-9,]+)\s*Zestimate/i) || 
      markdown.match(/Zestimate[®]*[\s:]{0,3}\$([0-9][0-9,]+)(?:\s*[^\d\/]|$)/i)
    ) : null;
    
    const rentZestimateMatch = markdown.match(/Rent\s*Zestimate[®]*[\s:]{0,3}\$([0-9][0-9,]+)/i) ||
                              markdown.match(/Rental\s*estimate[®]*[\s:]{0,3}\$([0-9][0-9,]+)/i);
    
    // Look for Days on Market (Time on Zillow)
    // Note: Bold markdown might have no space: **334 days**on Zillow
    const daysOnMarketMatch = markdown.match(/\*\*(\d+)\s*days?\*\*\s*on\s*Zillow/i) ||
                             markdown.match(/Time on Zillow[:\s]*(\d+)\s*day/i) ||
                             markdown.match(/(\d+)\s*days?\s*on\s*(?:Zillow|market)/i) ||
                             markdown.match(/Days?\s*on\s*(?:Zillow|market)[:\s]*(\d+)/i);
    
    // Look for price history indicators (price cuts show motivation)
    const priceReductionMatch = markdown.match(/Price cut:\s*\$([0-9,KM]+)/i) ||
                               markdown.match(/Price reduced[:\s]*\$([0-9,KM]+)/i);
    
    // Parse values that might have K or M suffix
    const parseValueWithSuffix = (value: string): number => {
      const num = parseFloat(value.replace(/,/g, ''));
      if (value.toUpperCase().includes('M')) return Math.round(num * 1000000);
      if (value.toUpperCase().includes('K')) return Math.round(num * 1000);
      return Math.round(num);
    };

    console.log(`Extracted - Price: $${price}, Beds: ${bedroomsMatch?.[1]}, Baths: ${bathroomsMatch?.[1]}, Sqft: ${livingArea}`);
    console.log(`Estimates - Zestimate: ${zestimateUnavailable ? 'N/A (shown as unavailable)' : (zestimateMatch?.[1] || 'N/A')}, Rent: ${rentZestimateMatch?.[1] || 'N/A'}`);
    console.log(`Market Indicators - Days on Market: ${daysOnMarketMatch?.[1] || 'N/A'}, Price Cut: ${priceReductionMatch?.[1] || 'None'}`);

    const propertyData: PropertyData = {
      zpid,
      address,
      city: cityStateMatch ? cityStateMatch[1].trim() : 'Unknown',
      state: cityStateMatch ? cityStateMatch[2] : 'Unknown',
      zipCode: cityStateMatch ? cityStateMatch[3] : 'Unknown',
      price,
      bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0,
      bathrooms: bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 0,
      livingArea,
      yearBuilt: yearBuiltMatch ? parseInt(yearBuiltMatch[1]) : undefined,
      lotAreaValue: lotSizeMatch ? parseInt(lotSizeMatch[1].replace(/,/g, '')) : undefined,
      lotAreaUnit: lotSizeMatch ? 'sqft' : undefined,
      propertyType: propertyTypeMatch ? propertyTypeMatch[1].trim() : undefined,
      description: this.extractDescription(markdown),
      features: this.extractFeatures(markdown),
      // Don't set zestimate if it's shown as unavailable, even if we matched a number
      zestimate: (zestimateMatch && !zestimateUnavailable) ? parseValueWithSuffix(zestimateMatch[1]) : undefined,
      rentZestimate: rentZestimateMatch ? parseValueWithSuffix(rentZestimateMatch[1]) : undefined,
      daysOnMarket: daysOnMarketMatch ? parseInt(daysOnMarketMatch[1]) : undefined,
      priceReduction: priceReductionMatch ? parseValueWithSuffix(priceReductionMatch[1]) : undefined,
      rawMarkdown: markdown, // Include raw data for analysis
    };

    return propertyData;
  }

  /**
   * Extract property description from markdown
   */
  private extractDescription(markdown: string): string {
    // Look for description section
    const descMatch = markdown.match(/(?:Description|Overview)[\s\S]*?\n\n([\s\S]+?)(?:\n\n|\n#|$)/i);
    if (descMatch) {
      return descMatch[1].trim().substring(0, 1000); // Limit to 1000 chars
    }
    return '';
  }

  /**
   * Extract property features from markdown
   */
  private extractFeatures(markdown: string): string[] {
    const features: string[] = [];
    
    // Common feature patterns
    const patterns = [
      /Pool/i,
      /Garage/i,
      /Fireplace/i,
      /Central Air/i,
      /Hardwood floors/i,
      /Granite countertops/i,
      /Stainless steel appliances/i,
      /Walk-in closet/i,
      /Washer\/Dryer/i,
      /Patio/i,
      /Deck/i,
      /Balcony/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(markdown)) {
        features.push(pattern.source.replace(/\\/g, ''));
      }
    }

    return features;
  }

  /**
   * Batch scrape multiple properties
   */
  async scrapeMultipleProperties(urls: string[]): Promise<Map<string, PropertyData>> {
    const results = new Map<string, PropertyData>();
    
    for (const url of urls) {
      try {
        const data = await this.scrapeProperty(url);
        results.set(url, data);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        // Continue with other properties
      }
    }

    return results;
  }

  /**
   * Validate if URL is a valid Zillow property URL
   */
  static isValidZillowUrl(url: string): boolean {
    return /zillow\.com\/homedetails\/.*\/\d+_zpid/i.test(url);
  }
}
