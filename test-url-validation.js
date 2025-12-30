// Test Zillow URL validation

const testUrls = [
  'https://www.zillow.com/homedetails/17867-W-Eugene-Ter-Surprise-AZ-85388/81969244_zpid/',
  'https://www.zillow.com/homedetails/17867-W-Eugene-Ter-Surprise-AZ-85388/81969244_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare',
  'https://zillow.com/homedetails/123-Main-St/12345_zpid',
  'http://www.zillow.com/homedetails/456-Oak-Ave/67890_zpid/',
  'https://www.zillow.com/homedetails/789-Pine-Dr-City-ST-12345/11111_zpid',
  // Invalid URLs
  'https://www.zillow.com/for-sale/',
  'https://www.redfin.com/property/123',
  'not a url at all',
];

const zillowPattern = /^https?:\/\/(www\.)?zillow\.com\/homedetails\/.+\/\d+_zpid\/?(\?.*)?$/i;

console.log('Testing Zillow URL Validation:\n');
testUrls.forEach(url => {
  const isValid = zillowPattern.test(url);
  console.log(`${isValid ? '✅' : '❌'} ${url}`);
});
