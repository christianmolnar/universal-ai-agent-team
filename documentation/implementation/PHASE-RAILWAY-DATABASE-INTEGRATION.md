# Phase: Railway Database Integration
**Created**: December 29, 2025
**Status**: In Progress

## Overview
Connect the property scraping system to Railway PostgreSQL database for persistent storage of portfolio data.

## Current Status

### ✅ Completed
- [x] Zillow scraper working with Puppeteer + Chrome
- [x] Address parsing (street, city, state, zip) functioning correctly
- [x] Data extraction for: price, beds, baths, sqft, lot size, features, photos
- [x] Lot size conversion (sqft → acres)
- [x] Loading spinner with progress indicator
- [x] Error handling with user-friendly messages
- [x] Railway database credentials available from My-AI-Agent-Team project
- [x] Created `.env` file with Railway credentials
- [x] Installed PostgreSQL client (`pg` package)
- [x] Implemented database connection pool
- [x] Created `DatabaseManager` class with connection handling
- [x] Implemented `saveProperty()` method with duplicate detection
- [x] Implemented `getUserProperties()` method
- [x] Implemented `updatePropertyMortgageData()` method
- [x] Implemented `initializeTables()` method
- [x] Created `/api/db-init` endpoint to test connection and initialize tables
- [x] **TESTED: Database connection working and tables created** ✅
- [x] Created `PropertyConfirmationModal` component with property type selection
- [x] Implemented property image display (6-photo grid)
- [x] Added property details display (address, price, beds/baths, sqft, lot size)
- [x] Implemented property type selection (Primary Residence vs Rental)
- [x] Created `/api/scrape-zillow` endpoint for scraping without saving
- [x] Updated `/api/properties` to accept pre-scraped property data
- [x] Connected modal "Confirm & Save" button to database save flow
- [x] Implemented handleConfirmProperty() to save with property type
- [x] Added success feedback after save
- [x] **UI Simplified**: Single "+ New Property" button instead of separate buttons
- [x] **Duplicate Prevention**: Database checks for existing properties by address
- [x] **Duplicate Handling**: Updates existing property instead of creating duplicates

### 🚧 In Progress - Next Steps
- [x] Test full UI flow: scrape → review modal → save → display ✅
- [x] Created `/api/properties/get` endpoint to fetch user properties
- [x] Portfolio page now fetches and displays real database data
- [x] Properties automatically refresh after adding new ones
- [ ] Implement property deletion
- [ ] Implement property editing
- [ ] Add property type badges (Primary vs Rental)

### 📋 Pending
- [ ] Test end-to-end flow with real property
- [ ] Multiple property management
- [ ] Portfolio dashboard updates after adding properties
- [ ] Data validation and duplicate prevention

---

## Implementation Steps

### Step 1: Environment Setup ✅ NEXT
1. Copy Railway credentials to `.env` file
2. Install PostgreSQL client: `npm install pg`
3. Test database connection

### Step 2: Database Schema
Create tables for:
- `user_properties` - Main property records
- `property_data` - Zillow scraped data (JSONB)
- `user_mortgage_data` - User-entered financial data

### Step 3: Database Operations
Implement in `lib/database.ts`:
- `saveProperty()` - Insert new property
- `updateProperty()` - Update existing property
- `getProperty()` - Fetch single property
- `getUserProperties()` - Fetch user's portfolio
- `deleteProperty()` - Remove property

### Step 4: UI Confirmation Flow
Build modal/dialog system:
- Show extracted property data
- Allow user to review before saving
- Confirm "Replace Primary" or "Add Rental"
- Success/error feedback

---

## Alternative/Backup Solution

### Python Scripts from `my-personal-assistant-private`
**Location**: `/Users/christian/Repos/my-personal-assistant-private/areas/business/investments/real-estate/arizona-move/scripts/`

Successfully used for Arizona move analysis (12 rental properties):

#### Active Scripts to Port:
1. **`fetch-property-images-simple.py`** - Image downloading from Zillow
2. **`fix_rental_zillow_links.py`** - Link validation and fixing
3. **`verify_links.py`** - Link integrity checking
4. **`generate_optimized_pdf_v2.py`** - PDF report generation
5. **`generate_cover_documents_pdf.py`** - Portfolio cover documents

#### When to Use:
- If rate limiting becomes persistent issue
- For bulk property analysis (>10 properties)
- When PDF generation is needed
- For offline analysis workflows

#### Integration Plan:
1. Copy scripts to `/scripts/backup-scrapers/`
2. Document usage in README
3. Keep as fallback if Puppeteer approach fails
4. Consider hybrid approach: Python for scraping, web UI for management

---

## Known Issues & Solutions

### Rate Limiting
**Issue**: Zillow blocks after 2-3 rapid scrapes
**Current Solution**: Wait 5-10 minutes between scrapes
**Future Solution**: 
- Add 30-60 second delays between requests
- Implement request queue with throttling
- Show "cooling down" message to user

### Data Accuracy
**Issue**: Some fields may be missing or incorrect
**Solution**: Allow manual override of all fields in UI

### Image Handling
**Issue**: Zillow may not allow automated image downloads
**Solution**: 
- Store image URLs only
- Allow manual image upload
- Use Python backup scripts for batch downloads

---

## Database Schema (Draft)

```sql
CREATE TABLE user_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'primary' or 'rental'
  zpid VARCHAR(50),
  zillow_url TEXT,
  
  -- Property Details
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  
  -- Zillow Data (JSON)
  zillow_data JSONB,
  
  -- User Financial Data
  purchase_price DECIMAL(12,2),
  mortgage_balance DECIMAL(12,2),
  monthly_payment DECIMAL(10,2),
  monthly_rent DECIMAL(10,2),
  
  -- Rental Specific
  tenant_type VARCHAR(100),
  management_type VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_properties_user_id (user_id),
  INDEX idx_user_properties_zpid (zpid)
);
```

---

## Next Actions

1. **Immediate**: Create `.env` and connect to Railway ⏰
2. **Today**: Implement database operations
3. **Today**: Build confirmation modal UI
4. **Tomorrow**: Test full workflow with real properties
5. **Future**: Port Python backup scripts

---

## Success Criteria

- ✅ Property data persists in Railway database
- ✅ User can replace primary residence from Zillow URL
- ✅ User can add rental properties from Zillow URL
- ✅ Portfolio page shows real data from database
- ✅ No data loss on page refresh
- ✅ Rate limiting handled gracefully

---

## Notes

- **Rate limiting is expected behavior** - Zillow actively blocks automated access
- Current Puppeteer approach works when respecting rate limits
- Python scripts available as proven backup solution
- Focus on UX around rate limiting rather than fighting it
