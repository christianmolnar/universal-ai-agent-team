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
    // Extract key information using regex patterns
    const priceMatch = markdown.match(/\$([0-9,]+)/);
    const bedroomsMatch = markdown.match(/(\d+)\s*bd/i);
    const bathroomsMatch = markdown.match(/(\d+(?:\.\d+)?)\s*ba/i);
    const sqftMatch = markdown.match(/([0-9,]+)\s*sqft/i);
    const addressMatch = markdown.match(/^(.+?)(?:\n|,)/);

    // Extract address components from structured data or URL
    const address = addressMatch ? addressMatch[1].trim() : 'Unknown Address';
    const cityStateMatch = markdown.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})/);

    // Extract additional details
    const yearBuiltMatch = markdown.match(/Built in (\d{4})/i) || markdown.match(/Year built:\s*(\d{4})/i);
    const lotSizeMatch = markdown.match(/([0-9,]+)\s*sqft\s*lot/i);
    const propertyTypeMatch = markdown.match(/Property type:\s*([^\n]+)/i);
    const zestimateMatch = markdown.match(/Zestimate.*?\$([0-9,]+)/i);
    const rentZestimateMatch = markdown.match(/Rent Zestimate.*?\$([0-9,]+)/i);

    const propertyData: PropertyData = {
      zpid,
      address,
      city: cityStateMatch ? cityStateMatch[1].trim() : 'Unknown',
      state: cityStateMatch ? cityStateMatch[2] : 'Unknown',
      zipCode: cityStateMatch ? cityStateMatch[3] : 'Unknown',
      price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0,
      bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0,
      bathrooms: bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 0,
      livingArea: sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, '')) : 0,
      yearBuilt: yearBuiltMatch ? parseInt(yearBuiltMatch[1]) : undefined,
      lotAreaValue: lotSizeMatch ? parseInt(lotSizeMatch[1].replace(/,/g, '')) : undefined,
      lotAreaUnit: lotSizeMatch ? 'sqft' : undefined,
      propertyType: propertyTypeMatch ? propertyTypeMatch[1].trim() : undefined,
      description: this.extractDescription(markdown),
      features: this.extractFeatures(markdown),
      zestimate: zestimateMatch ? parseInt(zestimateMatch[1].replace(/,/g, '')) : undefined,
      rentZestimate: rentZestimateMatch ? parseInt(rentZestimateMatch[1].replace(/,/g, '')) : undefined,
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
