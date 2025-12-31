#!/usr/bin/env python3
"""
Zillow Property Scraper - Selenium Version
Uses browser automation to fetch property data from Zillow
Based on proven working approach from Dec 27, 2025
"""

import sys
import json
import time
from typing import Optional, Dict, Any

def scrape_zillow_property(zillow_url: str) -> Optional[Dict[str, Any]]:
    """
    Scrape property data from Zillow using Selenium (headless browser automation)
    
    Args:
        zillow_url: Full Zillow listing URL
    
    Returns:
        dict: Property data including address, price, bedrooms, bathrooms, sqft, etc.
        None: If scraping fails
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        # Setup headless Chrome with anti-detection measures
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")  # Use new headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
        
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            # Load the page
            driver.get(zillow_url)
            
            # Wait for page to load
            time.sleep(3)
            
            # Extract property data
            property_data = {
                'zillowUrl': zillow_url,
                'zpid': extract_zpid(zillow_url),
                'address': extract_text(driver, [
                    'h1[data-testid="property-detail-address"]',
                    'h1.summary-container',
                    'h1'
                ]),
                'price': extract_price(driver, [
                    '[data-testid="price"]',
                    '[data-testid="home-value"]',
                    'span[data-testid="price"]'
                ]),
                'bedrooms': extract_number(driver, [
                    '[data-testid="bed-value"]',
                    'span:contains("bed")',
                    'span:contains("bd")'
                ]),
                'bathrooms': extract_number(driver, [
                    '[data-testid="bath-value"]',
                    'span:contains("bath")',
                    'span:contains("ba")'
                ]),
                'sqft': extract_number(driver, [
                    '[data-testid="sqft-value"]',
                    'span:contains("sqft")'
                ]),
                'lotSize': extract_number(driver, [
                    '[data-testid="lot-size-value"]',
                    'span:contains("acre")',
                    'span:contains("Lot")'
                ]),
                'yearBuilt': extract_year(driver, [
                    '[data-testid="year-built-value"]',
                    'span:contains("Built")'
                ]),
                'propertyType': extract_text(driver, [
                    '[data-testid="property-type"]',
                    'span:contains("Family")',
                    'span:contains("Condo")'
                ]) or 'Single Family',
                'description': extract_text(driver, [
                    '.property-description p',
                    '[data-testid="description"]',
                    '.description'
                ]),
                'photos': extract_photos(driver),
                'zestimate': extract_price(driver, [
                    '[data-testid="zestimate-text"]',
                    '[data-testid="zestimate"]',
                    'span:contains("Zestimate")'
                ])
            }
            
            # Parse address components
            if property_data['address']:
                parts = property_data['address'].split(', ')
                if len(parts) >= 3:
                    property_data['city'] = parts[1] if len(parts) > 1 else ''
                    state_zip = parts[2] if len(parts) > 2 else ''
                    state_zip_parts = state_zip.split()
                    property_data['state'] = state_zip_parts[0] if state_zip_parts else ''
                    property_data['zipCode'] = state_zip_parts[1] if len(state_zip_parts) > 1 else ''
            
            return property_data
            
        finally:
            driver.quit()
        
    except ImportError as e:
        print(json.dumps({
            'error': 'Selenium not installed',
            'message': 'Please install selenium: pip3 install selenium',
            'details': str(e)
        }), file=sys.stderr)
        return None
    except Exception as e:
        print(json.dumps({
            'error': 'Scraping failed',
            'message': str(e),
            'url': zillow_url
        }), file=sys.stderr)
        return None

def extract_text(driver, selectors: list) -> str:
    """Try multiple selectors to extract text"""
    for selector in selectors:
        try:
            element = driver.find_element(By.CSS_SELECTOR, selector)
            text = element.text.strip()
            if text:
                return text
        except:
            continue
    return ''

def extract_number(driver, selectors: list) -> int:
    """Extract a number from text"""
    text = extract_text(driver, selectors)
    if text:
        import re
        match = re.search(r'\d+', text.replace(',', ''))
        if match:
            return int(match.group())
    return 0

def extract_price(driver, selectors: list) -> int:
    """Extract price from text"""
    text = extract_text(driver, selectors)
    if text:
        import re
        # Remove $ and commas, extract number
        cleaned = text.replace('$', '').replace(',', '')
        match = re.search(r'\d+', cleaned)
        if match:
            return int(match.group())
    return 0

def extract_year(driver, selectors: list) -> int:
    """Extract 4-digit year"""
    text = extract_text(driver, selectors)
    if text:
        import re
        match = re.search(r'\d{4}', text)
        if match:
            return int(match.group())
    return 0

def extract_photos(driver) -> list:
    """Extract photo URLs"""
    photos = []
    try:
        selectors = [
            'picture img',
            'img[src*="photos.zillowstatic.com"]',
            '[data-testid="media-gallery"] img'
        ]
        
        for selector in selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for elem in elements:
                    src = elem.get_attribute('src')
                    if src and 'photos.zillowstatic.com' in src and src not in photos:
                        photos.append(src)
                        if len(photos) >= 3:  # Limit to 3 photos
                            return photos
            except:
                continue
    except:
        pass
    
    return photos

def extract_zpid(url: str) -> Optional[str]:
    """Extract ZPID from URL"""
    import re
    match = re.search(r'(\d+)_zpid', url)
    return match.group(1) if match else None

def main():
    """Main entry point - expects Zillow URL as command line argument"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'Missing URL',
            'message': 'Usage: zillow-scraper-selenium.py <zillow_url>'
        }), file=sys.stderr)
        sys.exit(1)
    
    zillow_url = sys.argv[1]
    
    # Scrape the property
    property_data = scrape_zillow_property(zillow_url)
    
    if property_data:
        # Output as JSON
        print(json.dumps(property_data, indent=2))
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
