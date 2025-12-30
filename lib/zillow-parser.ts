// Zillow URL parsing and property data extraction utilities

export interface ZillowPropertyData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  zestimate: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: string;
  lastSoldDate?: string;
  lastSoldPrice?: number;
  priceHistory: Array<{
    date: string;
    price: number;
    event: 'Sold' | 'Listed' | 'Price Change';
  }>;
  photos: string[];
  features: string[];
  description: string;
  zillowUrl: string;
  zpid?: string; // Zillow Property ID
}

export class ZillowParser {
  private static ZILLOW_URL_PATTERN = /zillow\.com\/(homedetails|myzillow)\/[^\/]*\/(\d+)[_\/]/;

  /**
   * Extract ZPID from Zillow URL (supports both public and private URLs)
   */
  static extractZPID(url: string): string | null {
    const match = url.match(this.ZILLOW_URL_PATTERN);
    return match ? match[2] : null;
  }

  /**
   * Validate if URL is a valid Zillow property URL (supports both public and private URLs)
   */
  static isValidZillowURL(url: string): boolean {
    return this.ZILLOW_URL_PATTERN.test(url);
  }

  /**
   * Parse Zillow URL and extract property data
   * This implementation fetches and parses real Zillow pages
   */
  static async parseZillowURL(url: string): Promise<ZillowPropertyData | null> {
    if (!this.isValidZillowURL(url)) {
      throw new Error('Invalid Zillow URL format. Supported formats:\n• https://www.zillow.com/homedetails/address/zpid_zpid/\n• https://www.zillow.com/myzillow/yourhome/zpid');
    }

    const zpid = this.extractZPID(url);
    if (!zpid) {
      throw new Error('Could not extract property ID from URL');
    }

    try {
      // Import scraping function dynamically to avoid issues
      const { scrapeZillowProperty } = await import('./zillow-scraper');
      
      // For private URLs, convert to public format for scraping
      let scrapingUrl = url;
      if (url.includes('/myzillow/')) {
        // This would need the actual address to construct the public URL
        // For now, we'll try to scrape the private URL directly
        scrapingUrl = url;
      }

      // Directly call scraping function instead of HTTP request
      const propertyData = await scrapeZillowProperty(scrapingUrl, zpid);
      
      if (!propertyData) {
        throw new Error('Failed to extract property data from the page');
      }

      return propertyData;
    } catch (error) {
      console.error('Error parsing Zillow URL:', error);
      throw error;
    }
  }

  /**
   * Calculate investment metrics from Zillow data
   */
  static calculateInvestmentMetrics(propertyData: ZillowPropertyData) {
    const currentValue = propertyData.zestimate || propertyData.price;
    const purchasePrice = propertyData.lastSoldPrice || propertyData.price;
    
    const appreciation = currentValue - purchasePrice;
    const appreciationPercent = ((appreciation / purchasePrice) * 100);
    
    const yearsOwned = propertyData.lastSoldDate 
      ? Math.round((new Date().getTime() - new Date(propertyData.lastSoldDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;
    
    const annualAppreciationRate = yearsOwned > 0 ? appreciationPercent / yearsOwned : 0;

    return {
      currentValue,
      purchasePrice,
      appreciation,
      appreciationPercent,
      yearsOwned,
      annualAppreciationRate,
      pricePerSqft: currentValue / propertyData.sqft
    };
  }
}

// Helper function to convert Zillow data to our property format
export function convertZillowToProperty(zillowData: ZillowPropertyData, propertyType: 'primary' | 'rental' = 'rental') {
  const metrics = ZillowParser.calculateInvestmentMetrics(zillowData);
  
  return {
    id: `${propertyType}-${Date.now()}`,
    address: zillowData.address,
    city: zillowData.city,
    state: zillowData.state,
    zipCode: zillowData.zipCode,
    type: zillowData.propertyType,
    status: propertyType === 'primary' ? 'Owner Occupied' : 'Rental Income',
    currentValue: metrics.currentValue,
    purchasePrice: metrics.purchasePrice,
    purchaseDate: zillowData.lastSoldDate || new Date().toISOString().split('T')[0],
    bedrooms: zillowData.bedrooms,
    bathrooms: zillowData.bathrooms,
    sqft: zillowData.sqft,
    lotSize: zillowData.lotSize,
    yearBuilt: zillowData.yearBuilt,
    hasPool: zillowData.features.some(f => f.toLowerCase().includes('pool')),
    hasCasita: zillowData.features.some(f => f.toLowerCase().includes('casita') || f.toLowerCase().includes('guest house')),
    features: zillowData.features,
    zillowUrl: zillowData.zillowUrl,
    zpid: zillowData.zpid,
    lastAnalysis: new Date().toISOString().split('T')[0],
    // These will need to be filled in manually by user
    mortgageBalance: 0,
    monthlyPayment: 0,
    monthlyRent: propertyType === 'rental' ? 0 : undefined,
    monthlyMortgage: propertyType === 'rental' ? 0 : undefined,
    tenantType: propertyType === 'rental' ? 'To Be Determined' : undefined,
    managementType: propertyType === 'rental' ? 'Self-managed' : undefined,
  };
}
