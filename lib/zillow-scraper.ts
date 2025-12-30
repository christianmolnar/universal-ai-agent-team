// Zillow web scraping utilities
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-core';
import { ZillowPropertyData } from './zillow-parser';

/**
 * Extract property data from Zillow HTML using Cheerio
 */
export function extractPropertyData($: cheerio.CheerioAPI, url: string, zpid?: string): ZillowPropertyData | null {
  try {
    // Extract address components - updated selectors for modern Zillow
    const fullAddress = $('h1[data-testid="property-detail-address"]').text().trim() ||
                       $('h1').first().text().trim() ||
                       $('.summary-container h1').first().text().trim() ||
                       $('[data-testid="property-hero-address"]').text().trim() ||
                       // Fallback to URL parsing
                       url.match(/homedetails\/([^\/]+)/)?.[1]?.replace(/-/g, ' ') || '';

    console.log('Extracted address:', fullAddress);

    // Parse address components more carefully
    let addressParts = fullAddress.split(', ');
    let streetAddress = '';
    let city = '';
    let state = '';
    let zipCode = '';

    console.log('Address parts after split:', addressParts, 'Length:', addressParts.length);

    if (addressParts.length >= 3) {
      // Standard format: "Street, City, State ZIP"
      streetAddress = addressParts[0];
      city = addressParts[1];
      const stateZipPart = addressParts[2] || '';
      console.log('Parsing 3-part address, stateZipPart:', stateZipPart);
      const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (stateZipMatch) {
        state = stateZipMatch[1];
        zipCode = stateZipMatch[2];
      } else {
        // If the format doesn't match, try to extract from the last part
        const parts = stateZipPart.split(/\s+/);
        console.log('stateZipPart split into parts:', parts);
        if (parts.length >= 2) {
          state = parts[0];
          zipCode = parts[1];
        }
      }
    } else if (addressParts.length === 2) {
      // Format might be: "Street Address, City State ZIP" or "Street, CityStateZIP"
      streetAddress = addressParts[0];
      const cityStateZip = addressParts[1].trim();
      
      // Try to match "City, State ZIP" or "City State ZIP"
      const match = cityStateZip.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (match) {
        city = match[1].trim();
        state = match[2];
        zipCode = match[3];
      } else {
        // Try alternative format where there's no space: "CityState ZIP" or just state and zip
        const altMatch = cityStateZip.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
        if (altMatch) {
          // Just state and ZIP, no city found in address
          state = altMatch[1];
          zipCode = altMatch[2];
          // Try to extract city from street address if it contains one
          city = streetAddress.split(',').pop()?.trim() || '';
        } else {
          city = cityStateZip;
        }
      }
    } else {
      streetAddress = fullAddress;
    }

    console.log('Parsed address components:', { streetAddress, city, state, zipCode });

    // Extract price - multiple selectors for current Zillow structure
    const priceText = $('[data-testid="price"]').first().text() ||
                     $('[data-testid="home-value"]').text() ||
                     $('span[data-testid="price"]').text() ||
                     $('.home-summary-container .Text-c11n-8-84-3__sc-aiai24-0').first().text() ||
                     $('[class*="price"]').first().text() ||
                     $('.summary-container .estimate').first().text();
    const price = parsePrice(priceText);
    console.log('Extracted price:', price, 'from text:', priceText);

    // Extract Zestimate - updated selectors
    const zestimateText = $('[data-testid="zestimate-text"]').text() ||
                         $('[data-testid="zestimate"]').text() ||
                         $('.summary-container .zestimate').text() ||
                         $('[class*="zestimate"]').first().text() ||
                         $('span').filter((_, el) => $(el).text().toLowerCase().includes('zestimate')).text();
    const zestimate = parsePrice(zestimateText);
    console.log('Extracted zestimate:', zestimate, 'from text:', zestimateText);

    // Extract basic property details - updated selectors with more comprehensive search
    const bedroomsText = $('[data-testid="bed-value"]').text() || 
                        $('[data-testid="property-meta"] span').filter((_, el) => $(el).text().includes('bed')).text() ||
                        $('.summary-container .beds').text() ||
                        $('span').filter((_, el) => $(el).text().match(/\d+\s*bed/i) !== null).text() ||
                        $('span').filter((_, el) => $(el).text().match(/\d+\s*br/i) !== null).text() ||
                        $('[class*="bed"]').filter((_, el) => $(el).text().match(/\d+/) !== null).text() ||
                        $('div').filter((_, el) => $(el).text().match(/^\d+\s*bed/i) !== null).text();
    
    // Try to find bedrooms in meta description or structured data
    let bedrooms = parseInt(bedroomsText.match(/\d+/)?.[0] || '0') || 0;
    if (bedrooms === 0) {
      // Look in structured data or meta tags
      const metaBeds = $('meta[name*="bed"], meta[property*="bed"]').attr('content') || '';
      bedrooms = parseInt(metaBeds.match(/\d+/)?.[0] || '0') || 0;
    }
    console.log('Extracted bedrooms:', bedrooms, 'from text:', bedroomsText);

    const bathroomsText = $('[data-testid="bath-value"]').text() || 
                         $('[data-testid="property-meta"] span').filter((_, el) => $(el).text().includes('bath')).text() ||
                         $('.summary-container .baths').text() ||
                         $('span').filter((_, el) => $(el).text().match(/\d+\.?\d*\s*bath/i) !== null).text() ||
                         $('span').filter((_, el) => $(el).text().match(/\d+\.?\d*\s*ba/i) !== null).text() ||
                         $('[class*="bath"]').filter((_, el) => $(el).text().match(/\d+\.?\d*/) !== null).text() ||
                         $('div').filter((_, el) => $(el).text().match(/^\d+\.?\d*\s*bath/i) !== null).text();
    
    let bathrooms = parseFloat(bathroomsText.match(/\d+\.?\d*/)?.[0] || '0') || 0;
    if (bathrooms === 0) {
      // Look in structured data or meta tags
      const metaBaths = $('meta[name*="bath"], meta[property*="bath"]').attr('content') || '';
      bathrooms = parseFloat(metaBaths.match(/\d+\.?\d*/)?.[0] || '0') || 0;
    }
    console.log('Extracted bathrooms:', bathrooms, 'from text:', bathroomsText);

    // Extract sqft - more careful to get only living area, not lot size
    const sqftText = $('[data-testid="sqft-value"]').text() || 
                    $('[data-testid="property-meta"] span').filter((_, el) => {
                      const text = $(el).text();
                      return text.includes('sqft') && !text.toLowerCase().includes('lot') && !text.toLowerCase().includes('acre');
                    }).first().text() ||
                    $('.summary-container .sqft').text() ||
                    $('span').filter((_, el) => {
                      const text = $(el).text();
                      return text.match(/^\d+[,\s]*sqft$/i) !== null;
                    }).first().text();
    const sqft = parseInt(sqftText.replace(/[^\d]/g, '')) || 0;
    console.log('Extracted sqft:', sqft, 'from text:', sqftText);

    // Extract lot size - more specific to avoid getting living area
    const lotSizeText = $('[data-testid="lot-size-value"]').text() ||
                       $('.summary-container .lot-size').text() ||
                       $('[class*="lot"]').filter((_, el) => {
                         const text = $(el).text().toLowerCase();
                         return text.includes('lot') || text.includes('acre');
                       }).first().text() ||
                       $('span').filter((_, el) => {
                         const text = $(el).text().toLowerCase();
                         return (text.includes('acre') || (text.includes('lot') && text.includes('sqft'))) && 
                                !text.includes('livable') && !text.includes('interior');
                       }).first().text();
    const lotSize = parseLotSize(lotSizeText);
    console.log('Extracted lot size:', lotSize, 'from text:', lotSizeText);

    // Extract year built - updated selectors
    const yearBuiltText = $('[data-testid="year-built-value"]').text() ||
                         $('.summary-container .year-built').text() ||
                         $('[class*="year"]').filter((_, el) => $(el).text().includes('Built')).text() ||
                         $('span').filter((_, el) => $(el).text().match(/built.*\d{4}/i) !== null).text();
    const yearBuilt = parseInt(yearBuiltText.match(/\d{4}/)?.[0] || '0') || 0;
    console.log('Extracted year built:', yearBuilt, 'from text:', yearBuiltText);

    // Extract property type - updated selectors
    const propertyType = $('[data-testid="property-type"]').text() ||
                        $('.summary-container .property-type').text() ||
                        $('span').filter((_, el) => $(el).text().match(/(single family|condo|townhouse)/i) !== null).text() ||
                        'Single Family';
    console.log('Extracted property type:', propertyType);

    // Extract description - updated selectors
    const description = $('.property-description p').first().text() ||
                       $('[data-testid="description"]').text() ||
                       $('.description').first().text() ||
                       $('p').filter((_, el) => $(el).text().length > 100).first().text() ||
                       '';
    console.log('Extracted description length:', description.length);

    // Extract photos - updated selectors with better filtering
    const photos: string[] = [];
    $('[data-testid="media-gallery"] img, .hero-image img, .property-photos img, img[src*="zillow"]').each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src');
      if (src && 
          !src.includes('placeholder') && 
          !src.includes('logo') &&
          !src.includes('tracking') &&
          !src.includes('pixel') &&
          !src.includes('1x1') &&
          src.includes('photos.zillowstatic.com') &&
          !photos.includes(src)) {
        photos.push(src);
      }
    });
    
    // Limit to first 3 high-quality photos only
    const limitedPhotos = photos.slice(0, 3);
    console.log('Extracted photos count:', limitedPhotos.length, 'of', photos.length, 'total');

    // Extract features
    const features = extractFeatures($);
    console.log('Extracted features count:', features.length);

    // Extract price history (if available)
    const priceHistory: Array<{date: string, price: number, event: 'Sold' | 'Listed' | 'Price Change'}> = [];
    
    const result = {
      address: streetAddress || fullAddress,
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      price,
      zestimate,
      bedrooms,
      bathrooms,
      sqft,
      lotSize,
      yearBuilt,
      propertyType,
      priceHistory,
      photos: limitedPhotos,
      features,
      description,
      zillowUrl: url,
      zpid: zpid || extractZPIDFromHTML($)
    };

    console.log('Final extraction result:', result);
    return result;

  } catch (error) {
    console.error('Error extracting property data:', error);
    return null;
  }
}

/**
 * Parse price from text (handles $1,234,567 format)
 */
function parsePrice(priceText: string): number {
  if (!priceText) return 0;
  const cleaned = priceText.replace(/[$,\s]/g, '').match(/\d+/);
  return cleaned ? parseInt(cleaned[0]) : 0;
}

/**
 * Parse lot size from text (handles various formats like "0.23 acres", "10,000 sqft")
 */
function parseLotSize(lotText: string): number {
  if (!lotText) return 0;
  
  const text = lotText.toLowerCase();
  
  if (text.includes('acre')) {
    const acres = parseFloat(text.match(/[\d.]+/)?.[0] || '0');
    return Math.round(acres * 43560); // Convert acres to sqft
  }
  
  if (text.includes('sqft') || text.includes('sq ft')) {
    const sqft = text.replace(/[^\d]/g, '');
    return parseInt(sqft) || 0;
  }
  
  // Default to treating as sqft if no unit specified
  const numbers = text.replace(/[^\d]/g, '');
  return parseInt(numbers) || 0;
}

/**
 * Extract property features from various sections
 */
function extractFeatures($: cheerio.CheerioAPI): string[] {
  const features: string[] = [];
  
  // Look for features in various sections
  $('[data-testid="property-features"] li, .features-list li, .amenities li').each((_, el) => {
    const feature = $(el).text().trim();
    if (feature && feature.length > 2) {
      features.push(feature);
    }
  });
  
  // Look for key features in text
  const featureKeywords = [
    'hardwood', 'granite', 'stainless steel', 'updated kitchen', 'fireplace',
    'pool', 'spa', 'garage', 'basement', 'deck', 'patio', 'view'
  ];
  
  const pageText = $('body').text().toLowerCase();
  featureKeywords.forEach(keyword => {
    if (pageText.includes(keyword)) {
      const capitalizedFeature = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      if (!features.includes(capitalizedFeature)) {
        features.push(capitalizedFeature);
      }
    }
  });
  
  return features.slice(0, 20); // Limit to 20 features
}

/**
 * Extract ZPID from page HTML
 */
function extractZPIDFromHTML($: cheerio.CheerioAPI): string | undefined {
  // Look for ZPID in various places
  const zpidMatch = $('script').text().match(/"zpid":"?(\d+)"?/);
  if (zpidMatch) {
    return zpidMatch[1];
  }
  
  // Look in data attributes
  const zpidAttr = $('[data-zpid]').attr('data-zpid');
  if (zpidAttr) {
    return zpidAttr;
  }
  
  return undefined;
}

/**
 * Scrape Zillow property data from URL using Puppeteer headless browser
 */
export async function scrapeZillowProperty(url: string, zpid?: string): Promise<ZillowPropertyData | null> {
  let browser;
  try {
    console.log('Scraping Zillow URL with Puppeteer:', url);

    // Launch headless Chrome browser with Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();

    // Set realistic browser headers and viewport
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    // Add a small random delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Navigate to the Zillow page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load Zillow page: ${response?.status()} ${response?.statusText()}`);
    }

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the page content
    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract property data using the existing function
    const propertyData = extractPropertyData($, url, zpid);

    if (!propertyData) {
      throw new Error('Could not extract property data from the page');
    }

    console.log('Successfully scraped property data:', propertyData.address);
    return propertyData;

  } catch (error) {
    console.error('Error scraping Zillow property with Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
