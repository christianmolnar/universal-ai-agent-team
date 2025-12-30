/**
 * Zillow Search Scraper Service
 * Extracts property URLs from Zillow search results pages
 */

import FirecrawlApp from '@mendable/firecrawl-js';

export interface ZillowSearchResult {
  propertyUrls: string[];
  totalFound: number;
  searchParams: {
    priceMin?: number;
    priceMax?: number;
    bedsMin?: number;
    bathsMin?: number;
    sqftMin?: number;
    yearBuiltMin?: number;
  };
}

export class ZillowSearchScraper {
  private firecrawl: FirecrawlApp;

  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is required');
    }
    this.firecrawl = new FirecrawlApp({ apiKey });
  }

  /**
   * Extract property URLs from a Zillow search results page
   */
  async scrapeSearchResults(searchUrl: string): Promise<ZillowSearchResult> {
    console.log(`\n========== ZILLOW SEARCH SCRAPE ==========`);
    console.log('Search URL:', searchUrl);
    console.log('==========================================\n');

    try {
      // Parse search parameters from URL
      const searchParams = this.parseSearchParams(searchUrl);

      // Scrape the search results page using same format as property scraper
      const scrapeResult = await this.firecrawl.scrape(searchUrl, {
        formats: ['markdown', 'html'],
        onlyMainContent: false, // Don't limit to main content for search pages
      });

      console.log('Scrape result keys:', Object.keys(scrapeResult));
      
      // Get markdown and HTML from response
      const markdown = scrapeResult.markdown || '';
      const html = scrapeResult.html || '';

      if (!markdown && !html) {
        console.error('Empty scrape result:', scrapeResult);
        throw new Error('Failed to scrape search results page - empty response');
      }

      console.log('First 2000 chars of search results:', markdown.substring(0, 2000));

      // Extract property URLs from the content
      const propertyUrls = this.extractPropertyUrls(markdown, html);

      console.log(`\nFound ${propertyUrls.length} properties in search results`);
      console.log('Property URLs:', propertyUrls);

      return {
        propertyUrls,
        totalFound: propertyUrls.length,
        searchParams,
      };
    } catch (error) {
      console.error('Zillow search scrape error:', error);
      throw new Error(`Failed to scrape search results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse search parameters from Zillow search URL
   */
  private parseSearchParams(url: string): ZillowSearchResult['searchParams'] {
    try {
      const urlObj = new URL(url);
      const searchQueryState = urlObj.searchParams.get('searchQueryState');
      
      if (!searchQueryState) {
        return {};
      }

      const queryState = JSON.parse(decodeURIComponent(searchQueryState));
      const filterState = queryState.filterState || {};

      return {
        priceMin: filterState.price?.min,
        priceMax: filterState.price?.max,
        bedsMin: filterState.beds?.min,
        bathsMin: filterState.baths?.min,
        sqftMin: filterState.sqft?.min,
        yearBuiltMin: filterState.built?.min,
      };
    } catch (error) {
      console.error('Error parsing search params:', error);
      return {};
    }
  }

  /**
   * Extract property URLs from scraped content
   */
  private extractPropertyUrls(markdown: string, html: string): string[] {
    const urls = new Set<string>();

    // Pattern 1: Look for /homedetails/ URLs in markdown
    const markdownPattern = /https?:\/\/(?:www\.)?zillow\.com\/homedetails\/[^)\s\]]+/g;
    const markdownMatches = markdown.match(markdownPattern) || [];
    markdownMatches.forEach(url => {
      const cleanUrl = this.cleanPropertyUrl(url);
      if (cleanUrl) urls.add(cleanUrl);
    });

    // Pattern 2: Look for zpid in URLs (Zillow Property ID)
    const zpidPattern = /https?:\/\/(?:www\.)?zillow\.com\/[^"'\s]*zpid[^"'\s]*/g;
    const zpidMatches = (markdown + ' ' + html).match(zpidPattern) || [];
    zpidMatches.forEach(url => {
      const cleanUrl = this.cleanPropertyUrl(url);
      if (cleanUrl) urls.add(cleanUrl);
    });

    // Pattern 3: Look for property cards with data-zpid attribute in HTML
    const dataZpidPattern = /data-zpid="(\d+)"/g;
    let match;
    while ((match = dataZpidPattern.exec(html)) !== null) {
      const zpid = match[1];
      // Try to find the corresponding URL in the HTML
      const urlPattern = new RegExp(`https?:\\/\\/(?:www\\.)?zillow\\.com\\/homedetails\\/[^"'\\s]*${zpid}[^"'\\s]*`, 'g');
      const urlMatch = html.match(urlPattern);
      if (urlMatch) {
        const cleanUrl = this.cleanPropertyUrl(urlMatch[0]);
        if (cleanUrl) urls.add(cleanUrl);
      }
    }

    console.log(`\nFound ${Array.from(urls).length} properties in search results`);
    console.log('Property URLs:', Array.from(urls));

    // Filter out invalid URLs (homepage, search pages, etc.)
    const validUrls = Array.from(urls).filter(url => {
      // Must have homedetails in the path
      if (!url.includes('/homedetails/')) return false;
      // Must have zpid
      if (!url.includes('_zpid') && !url.includes('zpid=')) return false;
      // Must not be a search page
      if (url.includes('/homes/for_sale/') && !url.includes('/homedetails/')) return false;
      return true;
    });

    console.log(`Filtered to ${validUrls.length} valid property URLs`);

    return validUrls;
  }

  /**
   * Clean and normalize property URL
   */
  private cleanPropertyUrl(url: string): string | null {
    try {
      // Remove any trailing punctuation or special characters
      url = url.replace(/[,;.!?)]+$/, '');
      
      // Parse URL to clean query parameters we don't need
      const urlObj = new URL(url);
      
      // Only keep essential parameters (zpid)
      const zpid = urlObj.searchParams.get('zpid');
      if (!zpid && !url.includes('_zpid')) {
        return null; // Not a valid property URL
      }

      // Reconstruct clean URL
      return urlObj.origin + urlObj.pathname + (zpid ? `?zpid=${zpid}` : '');
    } catch (error) {
      console.error('Error cleaning URL:', url, error);
      return null;
    }
  }

  /**
   * Paginate through multiple pages of search results
   */
  async scrapeAllSearchPages(
    searchUrl: string,
    maxPages: number = 3
  ): Promise<ZillowSearchResult> {
    console.log(`\nScraping up to ${maxPages} pages of search results...`);
    
    const allUrls = new Set<string>();
    let searchParams = {};

    for (let page = 1; page <= maxPages; page++) {
      console.log(`\nScraping page ${page}/${maxPages}...`);
      
      // Add pagination to URL
      const pageUrl = this.addPaginationToUrl(searchUrl, page);
      
      try {
        const result = await this.scrapeSearchResults(pageUrl);
        result.propertyUrls.forEach(url => allUrls.add(url));
        searchParams = result.searchParams;

        // If we got fewer properties, we might be at the end
        if (result.propertyUrls.length === 0) {
          console.log('No more properties found, stopping pagination.');
          break;
        }

        // Add delay between pages to avoid rate limiting
        if (page < maxPages) {
          console.log('Waiting 2 seconds before next page...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error scraping page ${page}:`, error);
        // Continue with next page even if one fails
      }
    }

    return {
      propertyUrls: Array.from(allUrls),
      totalFound: allUrls.size,
      searchParams,
    };
  }

  /**
   * Add pagination parameter to search URL
   */
  private addPaginationToUrl(url: string, page: number): string {
    try {
      const urlObj = new URL(url);
      const searchQueryState = urlObj.searchParams.get('searchQueryState');
      
      if (!searchQueryState) {
        return url;
      }

      const queryState = JSON.parse(decodeURIComponent(searchQueryState));
      
      // Update pagination
      queryState.pagination = queryState.pagination || {};
      queryState.pagination.currentPage = page;

      // Encode back
      urlObj.searchParams.set('searchQueryState', JSON.stringify(queryState));
      
      return urlObj.toString();
    } catch (error) {
      console.error('Error adding pagination:', error);
      return url;
    }
  }
}
