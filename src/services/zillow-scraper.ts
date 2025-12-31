/**
 * Zillow Scraper Service
 * Wraps the scraping functions into a class-based service
 */

import { scrapeZillowProperty, extractPropertyData } from '@/lib/zillow-scraper';
import { ZillowPropertyData } from '@/lib/zillow-parser';

export class ZillowScraperService {
  /**
   * Scrape property data from a Zillow URL
   */
  async scrapeProperty(url: string): Promise<ZillowPropertyData | null> {
    try {
      // Extract zpid from URL if present
      const zpidMatch = url.match(/(\d+)_zpid/);
      const zpid = zpidMatch ? zpidMatch[1] : undefined;
      
      console.log(`[ZillowScraperService] Scraping property: ${url}`);
      const result = await scrapeZillowProperty(url, zpid);
      
      if (!result) {
        console.error('[ZillowScraperService] Failed to scrape property');
        return null;
      }
      
      console.log(`[ZillowScraperService] Successfully scraped: ${result.address}`);
      return result;
    } catch (error) {
      console.error('[ZillowScraperService] Error scraping property:', error);
      throw error;
    }
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
