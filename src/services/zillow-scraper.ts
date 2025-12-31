/**
 * Zillow Scraper Service - Firecrawl Implementation
 * Uses Firecrawl API to scrape Zillow property data
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import { ZillowPropertyData } from '@/lib/zillow-parser';

export class ZillowScraperService {
  private firecrawl: FirecrawlApp;

  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is required');
    }
    this.firecrawl = new FirecrawlApp({ apiKey });
  }

  /**
   * Scrape property data from a Zillow URL using Firecrawl
   */
  async scrapeProperty(url: string): Promise<ZillowPropertyData | null> {
    try {
      console.log(`[ZillowScraperService] Scraping via Firecrawl: ${url}`);
      
      // Scrape using Firecrawl API
      const scrapeResult = await this.firecrawl.scrape(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      });
      
      if (!scrapeResult.markdown && !scrapeResult.html) {
        console.error('[ZillowScraperService] Empty scrape result from Firecrawl');
        return null;
      }
      
      // Parse the scraped content into ZillowPropertyData
      const propertyData = this.parseFirecrawlResult(scrapeResult, url);
      
      if (!propertyData) {
        console.error('[ZillowScraperService] Failed to parse property data');
        return null;
      }
      
      console.log(`[ZillowScraperService] Successfully scraped: ${propertyData.address}`);
      return propertyData;
    } catch (error) {
      console.error('[ZillowScraperService] Error scraping property:', error);
      throw error;
    }
  }

  /**
   * Parse Firecrawl scrape result into ZillowPropertyData
   */
  private parseFirecrawlResult(scrapeResult: any, url: string): ZillowPropertyData | null {
    try {
      const markdown = scrapeResult.markdown || '';
      const html = scrapeResult.html || '';
      
      // Extract ZPID from URL
      const zpidMatch = url.match(/(\d+)_zpid/);
      const zpid = zpidMatch ? zpidMatch[1] : undefined;
      
      // Parse property data from markdown and HTML
      // This is a simplified parser - in production, use more robust extraction
      const data: ZillowPropertyData = {
        zpid: zpid || '',
        zillowUrl: url,
        address: this.extractAddress(markdown, html),
        city: this.extractCity(markdown, html),
        state: this.extractState(markdown, html),
        zipCode: this.extractZipCode(markdown, html),
        price: this.extractPrice(markdown, html),
        bedrooms: this.extractBedrooms(markdown, html),
        bathrooms: this.extractBathrooms(markdown, html),
        sqft: this.extractSqft(markdown, html),
        lotSize: this.extractLotSize(markdown, html),
        yearBuilt: this.extractYearBuilt(markdown, html),
        propertyType: this.extractPropertyType(markdown, html),
        description: this.extractDescription(markdown, html),
        features: this.extractFeatures(markdown, html),
        photos: this.extractPhotos(html),
        zestimate: this.extractZestimate(markdown, html) || 0,
        lastSoldPrice: this.extractLastSoldPrice(markdown, html),
        lastSoldDate: this.extractLastSoldDate(markdown, html),
        priceHistory: [], // TODO: Extract price history if available
      };
      
      return data;
    } catch (error) {
      console.error('[ZillowScraperService] Error parsing Firecrawl result:', error);
      return null;
    }
  }

  // Helper extraction methods
  private extractAddress(markdown: string, html: string): string {
    // Look for address patterns in markdown
    const addressPattern = /(?:^|\n)([^,\n]+,\s*[^,\n]+,\s*[A-Z]{2}\s+\d{5})/;
    const match = markdown.match(addressPattern);
    return match ? match[1].trim() : '';
  }

  private extractCity(markdown: string, html: string): string {
    const addressPattern = /,\s*([^,]+),\s*[A-Z]{2}\s+\d{5}/;
    const match = markdown.match(addressPattern);
    return match ? match[1].trim() : '';
  }

  private extractState(markdown: string, html: string): string {
    const statePattern = /,\s*([A-Z]{2})\s+\d{5}/;
    const match = markdown.match(statePattern);
    return match ? match[1] : '';
  }

  private extractZipCode(markdown: string, html: string): string {
    const zipPattern = /\b(\d{5}(?:-\d{4})?)\b/;
    const match = markdown.match(zipPattern);
    return match ? match[1] : '';
  }

  private extractPrice(markdown: string, html: string): number {
    const pricePattern = /\$([0-9,]+)/;
    const match = markdown.match(pricePattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  private extractBedrooms(markdown: string, html: string): number {
    const bedsPattern = /(\d+)\s*(?:bd|bed|bedroom)/i;
    const match = markdown.match(bedsPattern);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractBathrooms(markdown: string, html: string): number {
    const bathsPattern = /(\d+(?:\.\d+)?)\s*(?:ba|bath|bathroom)/i;
    const match = markdown.match(bathsPattern);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractSqft(markdown: string, html: string): number {
    const sqftPattern = /([0-9,]+)\s*(?:sqft|sq\s*ft)/i;
    const match = markdown.match(sqftPattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  private extractLotSize(markdown: string, html: string): number {
    const lotPattern = /([0-9,]+)\s*(?:sqft|sq\s*ft)\s+lot/i;
    const match = markdown.match(lotPattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  private extractYearBuilt(markdown: string, html: string): number {
    const yearPattern = /built\s+(?:in\s+)?(\d{4})/i;
    const match = markdown.match(yearPattern);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractPropertyType(markdown: string, html: string): string {
    const typePattern = /(single family|condo|townhouse|multi-family|apartment)/i;
    const match = markdown.match(typePattern);
    return match ? match[1] : 'Unknown';
  }

  private extractDescription(markdown: string, html: string): string {
    // Look for description section in markdown
    const descPattern = /(?:description|about|overview)[:\s]+((?:.|\n){0,500})/i;
    const match = markdown.match(descPattern);
    return match ? match[1].trim() : '';
  }

  private extractFeatures(markdown: string, html: string): string[] {
    const features: string[] = [];
    
    // Common feature keywords
    const featureKeywords = [
      'pool', 'spa', 'garage', 'fireplace', 'hardwood', 'granite',
      'stainless steel', 'updated', 'remodeled', 'mountain view',
      'casita', 'guest house', 'rv parking'
    ];
    
    const lowerMarkdown = markdown.toLowerCase();
    featureKeywords.forEach(keyword => {
      if (lowerMarkdown.includes(keyword)) {
        features.push(keyword);
      }
    });
    
    return features;
  }

  private extractPhotos(html: string): string[] {
    const photos: string[] = [];
    const imgPattern = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    
    while ((match = imgPattern.exec(html)) !== null) {
      const src = match[1];
      if (src.includes('zillow') && !src.includes('icon') && !src.includes('logo')) {
        photos.push(src);
      }
    }
    
    return photos.slice(0, 10); // Limit to first 10 photos
  }

  private extractZestimate(markdown: string, html: string): number | undefined {
    const zestimatePattern = /zestimate[:\s]+\$([0-9,]+)/i;
    const match = markdown.match(zestimatePattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return undefined;
  }

  private extractLastSoldPrice(markdown: string, html: string): number | undefined {
    const soldPattern = /sold[:\s]+\$([0-9,]+)/i;
    const match = markdown.match(soldPattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return undefined;
  }

  private extractLastSoldDate(markdown: string, html: string): string | undefined {
    const datePattern = /sold\s+(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i;
    const match = markdown.match(datePattern);
    return match ? match[1] : undefined;
  }

  /**
   * Validate if a URL is a valid Zillow property URL
   */
  isValidZillowUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?zillow\.com\/homedetails\//,
      /^https?:\/\/(www\.)?zillow\.com\/homes\//,
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract ZPID from a Zillow URL
   */
  extractZpid(url: string): string | null {
    const match = url.match(/(\d+)_zpid/);
    return match ? match[1] : null;
  }
}

export default ZillowScraperService;
