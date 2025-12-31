// Test Zillow scraping for debugging
const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://www.zillow.com/homedetails/28430-316th-Way-SE-Ravensdale-WA-98051/247760644_zpid/';
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,  // Set to false to see what's happening
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  console.log('Navigating to URL...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait a bit for JS to render
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // Check for JSON-LD structured data
  console.log('\n=== Checking for JSON-LD structured data ===');
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      console.log(`\nScript ${i}:`);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`Script ${i}: Invalid JSON`);
    }
  });
  
  // Check various selectors
  console.log('\n=== Testing Selectors ===');
  console.log('Address:', $('h1').first().text().trim());
  console.log('[data-testid="bed-value"]:', $('[data-testid="bed-value"]').text());
  console.log('[data-testid="bath-value"]:', $('[data-testid="bath-value"]').text());
  console.log('[data-testid="sqft-value"]:', $('[data-testid="sqft-value"]').text());
  
  // Look for numbers in spans
  console.log('\n=== Looking for bed/bath/sqft in any span ===');
  $('span').each((i, el) => {
    const text = $(el).text().trim();
    if (text.match(/\d+\s*(bed|bath|sqft)/i) || text.match(/(bedrooms?|bathrooms?):\s*\d+/i) || text.match(/livable\s+area/i)) {
      console.log(`Found: "${text}"`);
    }
  });
  
  await browser.close();
}

testScrape().catch(console.error);
