# Real Estate Analysis V2 - Search Import & Enhancements Specification

**Created**: December 30, 2024  
**Status**: Specification Complete - Ready for Implementation  
**Session**: Conversation-based feature development and bug fixes

---

## Table of Contents
1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
3. [Bug Fixes Applied](#bug-fixes-applied)
4. [Technical Implementation Details](#technical-implementation-details)
5. [User Interface Components](#user-interface-components)
6. [API Integrations](#api-integrations)
7. [State Management](#state-management)
8. [Testing & Validation](#testing--validation)

---

## Overview

This specification documents the complete "Import from Search" feature and related enhancements built for Real Estate Analysis V2. The system allows users to import multiple properties from Zillow search results, preview them with selection controls, and analyze them with real-time progress tracking and user control features.

### Core User Journey
1. User clicks "Import from Search" button
2. Pastes Zillow search URL (e.g., Arizona properties with filters)
3. System scrapes search results across multiple pages (up to 3 pages)
4. Preview modal shows all found properties with selection controls
5. User can select/deselect properties for analysis
6. Click "Analyze" to start batch analysis
7. Progress modal shows real-time updates with property addresses
8. User can stop after current property or cancel entire analysis
9. View results for completed properties

### Success Metrics
- ✅ Successfully import 30+ properties from search in under 60 seconds
- ✅ Display accurate property addresses during progress (not "Property 1, Property 2")
- ✅ Allow user to select subset of properties for analysis
- ✅ Provide stop/cancel controls during long-running analyses
- ✅ Show visual feedback during import (spinner, progress indicators)

---

## Features Implemented

### 1. Import from Search
**Priority**: High  
**User Story**: As a user analyzing multiple properties, I want to import entire search results instead of copying URLs one by one.

#### Functionality
- Button toggles between "Manual Entry" and "Import from Search" modes
- Input field accepts Zillow search URLs with query parameters
- Validates URL format (must include `zillow.com`)
- Scrapes up to 3 pages of search results automatically
- Extracts property URLs from markdown and HTML content
- Filters out invalid URLs (homepage, navigation links, etc.)
- Shows loading spinner during import with "Importing Properties..." text
- Displays count of imported properties upon success

#### Visual Design
```
┌─────────────────────────────────────────────────────┐
│  Step 2: Add Zillow Property URLs                   │
│                                                      │
│  Property URLs                      [🔍 Import from │
│                                         Search]      │
│  ┌───────────────────────────────────────────────┐ │
│  │ Paste your Zillow search URL...               │ │
│  │ https://www.zillow.com/homes/for_sale/...     │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │  🔄 Importing Properties...                    │ │  <- Spinner shows
│  └───────────────────────────────────────────────┘ │     during import
│                                                      │
│  ✅ Imported 36 properties successfully!            │
└─────────────────────────────────────────────────────┘
```

#### Example Search URL
```
https://www.zillow.com/homes/for_sale/?searchQueryState=%7B...%7D
Filters: $250k-$525k, 3+ beds, 1.5+ baths, 2,250+ sqft, pool, garage, AC, built 2005+
Location: Arizona (Phoenix metro area)
```

### 2. Preview Modal with Property Selection
**Priority**: High  
**User Story**: As a user who imported 36 properties, I want to select only the 5-10 most interesting ones for analysis.

#### Functionality
- Modal appears automatically after successful import
- Shows list of all imported properties with addresses extracted from URLs
- Each property card is clickable with checkbox
- "Select All" button - selects all properties at once
- "Deselect All" button - clears all selections
- Selection counter shows "X of Y selected"
- "Analyze" button is disabled if no properties selected
- Button text updates to show count: "Analyze 5 Properties"
- Cancel button closes modal and clears import

#### Visual Design
```
┌──────────────────────────────────────────────────────────────┐
│  Preview Imported Properties                            [X]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  36 properties found                                         │
│  [Select All]  [Deselect All]          5 of 36 selected     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ☑ 17867 W Eugene Ter, Surprise, AZ 85388           │ <- Selected │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ☐ 10684 N 161st Ave, Surprise, AZ 85379            │ <- Unselected │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ☑ 7027 W Springfield Way, Florence, AZ 85132       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ... (33 more properties)                                    │
│                                                               │
│  [Cancel]                        [Analyze 5 Properties]      │
└──────────────────────────────────────────────────────────────┘
```

#### Interaction Details
- Clicking anywhere on a property card toggles selection
- Selected cards have accent border and background tint
- Checkbox state syncs with card selection
- Analyze button disabled state: gray, cursor not-allowed
- Modal has solid dark background (no transparency issues)
- Scrollable list for many properties
- Auto-selects all properties on initial import

### 3. Real-Time Progress with Property Addresses
**Priority**: High  
**User Story**: As a user watching analysis progress, I want to see actual property addresses, not generic "Property 1, Property 2" labels.

#### The Problem (Before Fix)
```
Properties (2/6 completed)

Property 1                               Complete
Property 2                               Complete  
Property 3                               Analyzing...
Property 4                               Pending
Property 5                               Pending
Property 6                               Pending
```

#### The Solution (After Fix)
```
Properties (2/6 completed)

17867 W Eugene Ter, Surprise AZ 85388    Complete
10684 N 161st Ave, Surprise AZ 85379     Complete  
7027 W Springfield Way, Florence AZ      Scraping data...
18606 W Sunnyslope Ln, Waddell AZ        Pending
30522 N Rebecca Ln, San Tan Valley AZ    Pending
566 W Love Rd, San Tan Valley AZ         Pending
```

#### Technical Implementation
- WebSocket sends address data with each progress update
- Frontend stores addresses in `Map<number, string>` keyed by property index
- Progress modal retrieves address from map or extracts from URL as fallback
- Address extraction happens during scraping phase
- Format: "Street Address, City ST Zipcode" (omit state name after city)

### 4. Stop/Cancel Controls
**Priority**: Medium  
**User Story**: As a user running a 36-property analysis, I want to stop after reviewing partial results without waiting for all properties.

#### Functionality

##### Stop After Current
- Button: "Stop After Current" (orange)
- Behavior: Completes current property, then stops gracefully
- Shows: "Stopping..." state with disabled buttons
- Info banner: "Finishing current property analysis... Results will be available for completed properties."
- Closes WebSocket after current property completes
- Automatically fetches partial results
- Returns to results view

##### Cancel Analysis  
- Button: "Cancel Analysis" (red)
- Behavior: Immediately stops all processing
- Shows: "Cancelling..." state
- Closes WebSocket connection immediately
- Fetches whatever results are available
- Returns to results view

#### Visual Design
```
┌───────────────────────────────────────────────────┐
│  Analyzing Properties                             │
│  Overall Progress                          27%    │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│  GPT-4 reviewing analysis quality...              │
│                                                    │
│  Properties (2/6 completed)                       │
│  [Property list here...]                          │
│                                                    │
│  Process                                          │
│  ✅ Data Scraping                                 │
│  ✅ Primary Analysis (Claude)                     │
│  🔄 Quality Review (GPT-4)                        │
│  4  Final Validation                              │
│  5  Report Generation                             │
│                                                    │
│  ┌─────────────────────┐ ┌──────────────────────┐│
│  │  Cancel Analysis    │ │ Stop After Current   ││
│  └─────────────────────┘ └──────────────────────┘│
│                                                    │
│  ⚠️ Finishing current property analysis...        │
│     Results will be available for completed       │
│     properties.                                   │
└───────────────────────────────────────────────────┘
```

---

## Bug Fixes Applied

### Bug Fix 1: Progress Bar Showing 140%
**Issue**: Progress calculation exceeded 100% due to incremental percentage math
**Symptom**: Progress bar overflowed, showing 140% complete
**Root Cause**: Each property adding percentage without accounting for current progress within property
**Fix**: 
- Cap percentage at 100% with `Math.min(percentage, 100)`
- Calculate step progress within current property (scraping=10%, analysis=40%, review=65%, validation=85%)
- Don't count current property as completed until it actually completes

### Bug Fix 2: Process Circles Resetting/Wrong State
**Issue**: Process step circles showed wrong states or reset during analysis
**Symptom**: All circles would show pending, then jump to completed, skipping active states
**Root Cause**: Step calculation based on percentage thresholds instead of actual property statuses
**Fix**:
- Use `getCurrentProcessStep()` function that checks actual property statuses
- Look for properties with status 'scraping', 'analyzing', 'reviewing', 'validating'
- Progressive state: pending → active → complete based on actual work

### Bug Fix 3: Zestimate Extracting $/sqft Values
**Issue**: Zestimate field showing "$206" instead of full price like "$450,000"
**Symptom**: Analysis failing because property value was incorrectly low
**Root Cause**: Regex matching price-per-sqft pattern like "$206/sqft" near Zestimate text
**Fix**:
- Check for unavailable pattern first: `$-- Zestimate®`
- Exclude patterns with `/sqft` or `/` after dollar amount
- Look for multi-digit values: `$([0-9][0-9,]+)` not `$([0-9]+)`
- Stricter proximity requirement: price must be within 10 chars of "Zestimate"

### Bug Fix 4: Bathroom Count Extracting Lot Size
**Issue**: Bathrooms showing "939" instead of "2.5"
**Symptom**: Lot size (6,929 sqft) being parsed as bathroom count
**Root Cause**: Regex matching any number before "ba" without word boundaries
**Fix**:
- Add word boundary: `(\d+(?:\.\d+)?)\s*bath(?:room)?s?\b`
- Validate range: must be between 0.5 and 20
- Prioritize matches near "beds" keyword
- Reject values that match lot size patterns

### Bug Fix 5: Days on Market Not Extracting
**Issue**: Days on market field always empty despite data being available
**Symptom**: Missing seller motivation indicators
**Root Cause**: Markdown bold pattern without space: `**334 days**on Zillow`
**Fix**: Multiple patterns to catch variations:
```javascript
/\*\*(\d+)\s*days?\*\*\s*on\s*Zillow/i  // Bold with space
/\*\*(\d+)\s*days?\*\*on\s*Zillow/i     // Bold without space
/Time on Zillow[:\s]*(\d+)\s*day/i      // "Time on Zillow: 334 days"
/(\d+)\s*days?\s*on\s*(?:Zillow|market)/i // Generic pattern
```

### Bug Fix 6: Address Showing "Skip main navigation"
**Issue**: Address field showing navigation link text instead of property address
**Symptom**: "Skip main navigation" appearing as property address in results
**Root Cause**: First text match grabbing site navigation elements
**Fix**:
- Extract from markdown heading: `/^#+\s*([0-9]+[^,\n]+),\s*[A-Z]/m`
- Look for pattern: "# 17867 W Eugene Ter, Surprise, AZ"
- Clean up: Remove markdown links `[text](url)`, remove navigation keywords
- Validate: Must contain digits, must be 5+ chars long
- Fallback: Extract from URL if all else fails

### Bug Fix 7: Modal Z-Index Issues
**Issue**: Modal appearing behind other content, hard to read
**Symptom**: Dark content showing through semi-transparent modal background
**Root Cause**: Insufficient z-index, transparency causing overlap
**Fix**:
- Set modal z-index to `z-[100]` (very high)
- Use solid colors: `bg-[#1a1a1a]` instead of semi-transparent
- Proper layering: backdrop → panel → content
- Border styling for clear boundaries

### Bug Fix 8: Same Address for All Properties in Progress
**Issue**: All properties in progress modal showing same address
**Symptom**: "17867 W Eugene Ter" repeated 36 times
**Root Cause**: Variable shadowing - address variable reused in loop
**Fix**:
- Store addresses in Map: `Map<number, string>` with property index as key
- WebSocket handler stores address when received: `propertyAddresses.set(index, address)`
- Progress modal retrieves: `propertyAddresses.get(index)` or uses fallback
- Clear map on new analysis: `setPropertyAddresses(new Map())`

### Bug Fix 9: Analysis Not Auto-Starting from Preview
**Issue**: Clicking "Analyze" in preview modal doesn't start analysis
**Symptom**: Modal closes, URLs populated, but user must click Analyze again
**Root Cause**: State update not triggering analysis function
**Fix**:
- Use `setTimeout()` to allow state to update: `setTimeout(() => handleStartAnalysis(), 100)`
- Call after setting URLs: `setUrls(selectedUrls)`
- Close modal after starting: `setShowPreviewModal(false)`
- Clear selection state: `setSelectedProperties(new Set())`

---

## Technical Implementation Details

### File Structure
```
app/real-estate-v2/
├── page.tsx                 # Main analysis page (MODIFIED)
│
components/
├── AnalysisProgressModal.tsx  # Progress modal (MODIFIED - added stop/cancel)
├── PropertyResultsTable.tsx   # Results display (EXISTING)
├── URLInputGrid.tsx           # URL input fields (EXISTING)
│
src/services/
├── zillow-scraper.ts          # Property scraper (MODIFIED - fixed extraction)
├── zillow-search-scraper.ts   # Search results scraper (NEW)
├── batch-analysis-orchestrator.ts  # Analysis coordinator (MODIFIED - progress calc)
├── websocket-progress-manager.ts   # WebSocket manager (MODIFIED - address broadcast)
│
app/api/
├── zillow/search/route.ts     # Search import API (NEW)
└── analysis/batch/route.ts    # Batch analysis API (EXISTING)
```

### Dependencies
```json
{
  "@mendable/firecrawl-js": "^4.10.0",  // Web scraping
  "ws": "^8.18.3",                       // WebSocket
  "@headlessui/react": "^2.2.9",        // Modal components
  "@heroicons/react": "^2.2.0"          // Icons
}
```

---

## State Management

### Page Component State (`page.tsx`)
```typescript
// Core analysis state
const [propertyType, setPropertyType] = useState<PropertyTypeOption>('rentals');
const [urls, setUrls] = useState<string[]>([]);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
const [progressData, setProgressData] = useState<ProgressUpdate | null>(null);
const [results, setResults] = useState<PropertyAnalysis[]>([]);
const [error, setError] = useState<string | null>(null);

// Search import state
const [showSearchImport, setShowSearchImport] = useState(false);
const [searchUrl, setSearchUrl] = useState('');
const [isImporting, setIsImporting] = useState(false);

// Preview modal state
const [showPreviewModal, setShowPreviewModal] = useState(false);
const [previewProperties, setPreviewProperties] = useState<string[]>([]);
const [selectedProperties, setSelectedProperties] = useState<Set<number>>(new Set());

// Progress tracking state
const [propertyAddresses, setPropertyAddresses] = useState<Map<number, string>>(new Map());
const [shouldStopAfterCurrent, setShouldStopAfterCurrent] = useState(false);

// WebSocket reference
const wsRef = useRef<WebSocket | null>(null);
```

### State Flow Diagram
```
[Import Button Clicked]
    ↓
[isImporting = true] → Show spinner
    ↓
[API Call: /api/zillow/search]
    ↓
[Response with URLs]
    ↓
[setPreviewProperties(urls)]
[setSelectedProperties(new Set(all indices))] → All selected by default
[setShowPreviewModal(true)]
[setIsImporting = false]
    ↓
[User selects/deselects properties]
    ↓
[Clicks "Analyze X Properties"]
    ↓
[Filter URLs by selectedProperties]
[setUrls(filteredUrls)]
[setShowPreviewModal(false)]
[setTimeout(handleStartAnalysis, 100)] → Auto-start
    ↓
[Analysis runs with WebSocket updates]
    ↓
[WebSocket broadcasts property addresses]
[propertyAddresses.set(index, address)]
    ↓
[Progress modal shows real addresses]
    ↓
[User clicks "Stop After Current" or "Cancel"]
    ↓
[shouldStopAfterCurrent = true]
[Close WebSocket]
[Fetch partial results]
```

---

## API Integrations

### 1. Zillow Search Import API
**Endpoint**: `POST /api/zillow/search`

#### Request
```typescript
{
  searchUrl: string;  // Zillow search URL with filters
  maxPages?: number;  // Default: 3
}
```

#### Response
```typescript
{
  success: boolean;
  propertyUrls: string[];  // Array of property URLs
  totalFound: number;      // Count of unique properties
  searchParams: {          // Parsed from URL
    priceMin?: number;
    priceMax?: number;
    bedsMin?: number;
    bathsMin?: number;
    sqftMin?: number;
    yearBuiltMin?: number;
  }
}
```

#### Implementation
```typescript
// app/api/zillow/search/route.ts
export async function POST(request: NextRequest) {
  const { searchUrl, maxPages = 1 } = await request.json();
  
  // Validate URL
  if (!searchUrl.includes('zillow.com')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  
  // Initialize scraper
  const scraper = new ZillowSearchScraper();
  
  // Scrape single or multiple pages
  const result = maxPages > 1
    ? await scraper.scrapeAllSearchPages(searchUrl, maxPages)
    : await scraper.scrapeSearchResults(searchUrl);
  
  return NextResponse.json({ success: true, ...result });
}
```

### 2. Zillow Search Scraper Service
**File**: `src/services/zillow-search-scraper.ts`

#### Key Methods
```typescript
class ZillowSearchScraper {
  private firecrawl: FirecrawlApp;
  
  // Scrape single search page
  async scrapeSearchResults(searchUrl: string): Promise<ZillowSearchResult> {
    const scrapeResult = await this.firecrawl.scrape(searchUrl, {
      formats: ['markdown', 'html'],
      onlyMainContent: false
    });
    
    const propertyUrls = this.extractPropertyUrls(
      scrapeResult.markdown,
      scrapeResult.html
    );
    
    return { propertyUrls, totalFound: propertyUrls.length };
  }
  
  // Scrape multiple pages with pagination
  async scrapeAllSearchPages(searchUrl: string, maxPages: number = 3) {
    const allUrls = new Set<string>();
    
    for (let page = 1; page <= maxPages; page++) {
      const pageUrl = this.addPaginationToUrl(searchUrl, page);
      const result = await this.scrapeSearchResults(pageUrl);
      result.propertyUrls.forEach(url => allUrls.add(url));
      
      if (page < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      }
    }
    
    return { propertyUrls: Array.from(allUrls), totalFound: allUrls.size };
  }
  
  // Extract URLs from content
  private extractPropertyUrls(markdown: string, html: string): string[] {
    const urls = new Set<string>();
    
    // Pattern 1: /homedetails/ URLs in markdown
    const markdownPattern = /https?:\/\/(?:www\.)?zillow\.com\/homedetails\/[^)\s\]]+/g;
    
    // Pattern 2: zpid in URLs
    const zpidPattern = /https?:\/\/(?:www\.)?zillow\.com\/[^"'\s]*zpid[^"'\s]*/g;
    
    // Pattern 3: data-zpid in HTML
    const dataZpidPattern = /data-zpid="(\d+)"/g;
    
    // ... extract and filter URLs
    
    return Array.from(urls).filter(this.isValidPropertyUrl);
  }
  
  // Validate property URL
  private isValidPropertyUrl(url: string): boolean {
    return url.includes('/homedetails/') 
        && (url.includes('_zpid') || url.includes('zpid='))
        && !url.includes('/homes/for_sale/');
  }
}
```

### 3. WebSocket Progress Updates
**Protocol**: `ws://localhost:3000/ws/progress?batchId={id}`

#### Message Format
```typescript
interface ProgressUpdate {
  type: 'progress';
  batchId: string;
  eventType: 'batch_started' | 'scraping_started' | 'scraping_completed' 
           | 'analysis_started' | 'analysis_completed' | 'quality_review_started'
           | 'quality_review_completed' | 'final_validation_started'
           | 'final_validation_completed' | 'batch_completed';
  message: string;
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  propertyIndex?: number;
  propertyAddress?: string;  // NEW: Actual address from scraping
  timestamp: Date;
}
```

#### Example Messages
```typescript
// Property scraping started
{
  type: 'progress',
  eventType: 'scraping_started',
  propertyIndex: 2,
  propertyAddress: '17867 W Eugene Ter, Surprise AZ 85388',
  progress: { total: 6, completed: 2, percentage: 33 }
}

// Property analysis completed
{
  type: 'progress',
  eventType: 'analysis_completed',
  propertyIndex: 2,
  progress: { total: 6, completed: 3, percentage: 50 }
}
```

---

## User Interface Components

### Import Button with Spinner
```tsx
<button
  onClick={handleImportFromSearch}
  disabled={isImporting}
  className="w-full px-6 py-3 rounded-lg bg-[var(--accent-primary)] 
             hover:bg-[var(--accent-secondary)] text-white font-semibold 
             transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
             flex items-center justify-center gap-2"
>
  {isImporting ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" 
           fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" 
                stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <span>Importing Properties...</span>
    </>
  ) : '🔍 Import Properties'}
</button>
```

### Preview Modal Structure
```tsx
{showPreviewModal && (
  <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-75">
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-2xl border-2 border-gray-700 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Preview Imported Properties</h2>
          <button onClick={closeModal}>✕</button>
        </div>
        
        {/* Selection Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button onClick={selectAll}>Select All</button>
            <button onClick={deselectAll}>Deselect All</button>
          </div>
          <span>{selectedProperties.size} of {previewProperties.length} selected</span>
        </div>
        
        {/* Property List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {previewProperties.map((url, index) => (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedProperties.has(index)
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedProperties.has(index)}
                readOnly
                className="mr-3"
              />
              <span>{extractAddressFromUrl(url)}</span>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button onClick={closeModal}>Cancel</button>
          <button
            onClick={handleAnalyze}
            disabled={selectedProperties.size === 0}
            className={selectedProperties.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Analyze {selectedProperties.size} Properties
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

### Progress Modal with Stop/Cancel
```tsx
<AnalysisProgressModal
  isOpen={isAnalyzing}
  onClose={handleClose}
  batchId={currentBatchId}
  totalProperties={progressData.progress.total}
  currentStep={getStepDescription(progressData.eventType)}
  propertyStatuses={getPropertyStatuses()}
  overallProgress={progressData.progress.percentage}
  canClose={progressData.progress.percentage === 100}
  onStopAfterCurrent={handleStopAfterCurrent}  // NEW
  onCancel={handleCancelAnalysis}              // NEW
  isStopping={shouldStopAfterCurrent}         // NEW
/>
```

---

## Testing & Validation

### Test Cases

#### Test 1: Import from Search - Happy Path
```
Given: User has Arizona search URL with 36 properties
When: User clicks "Import from Search"
And: Pastes URL
And: Clicks "Import Properties"
Then: System should scrape 3 pages
And: Find 34-36 unique properties
And: Show preview modal with all properties
And: All properties should be selected by default
And: Should complete in under 60 seconds
```

#### Test 2: Property Selection
```
Given: Preview modal showing 36 properties
When: User clicks "Deselect All"
Then: All checkboxes should be unchecked
And: Analyze button should be disabled
And: Counter should show "0 of 36 selected"

When: User clicks 5 property cards
Then: Those 5 should be selected
And: Counter should show "5 of 36 selected"
And: Analyze button should show "Analyze 5 Properties"
```

#### Test 3: Progress with Addresses
```
Given: Analysis running for 6 properties
When: First property is scraped
Then: Progress modal should show actual address
And: Not show "Property 1"
Example: "17867 W Eugene Ter, Surprise AZ 85388"

When: Each property completes
Then: Address should remain visible
And: Status should update to "Complete"
```

#### Test 4: Stop After Current
```
Given: Analysis running with 3/6 properties completed
When: User clicks "Stop After Current"
Then: Button should change to "Stopping..."
And: Both buttons should be disabled
And: Orange info banner should appear
And: Current property should complete
And: No new properties should start
And: Results view should show 4 completed properties
```

#### Test 5: Cancel Analysis
```
Given: Analysis running with 2/6 properties completed
When: User clicks "Cancel Analysis"
Then: Analysis should stop immediately
And: WebSocket should close
And: Results should fetch for 2 completed properties
And: User should see results view
```

### Edge Cases

#### Edge Case 1: Invalid Search URL
```
Input: "https://redfin.com/search"
Expected: Error message "Please enter a valid Zillow search URL"
```

#### Edge Case 2: Empty Search Results
```
Input: Search URL with no matching properties
Expected: Error message "No properties found in search results"
```

#### Edge Case 3: Missing Property Data
```
Scenario: Property page has no Zestimate
Expected: 
- Analysis continues (not treated as error)
- AI should research comparable market values
- Display "Not available" for Zestimate field
- Info banner: "Zestimate not available. Analysis based on market comparables."
```

#### Edge Case 4: Network Timeout
```
Scenario: Firecrawl API takes >60 seconds
Expected:
- Show error message
- Allow user to retry
- Import state resets
```

#### Edge Case 5: WebSocket Disconnect During Analysis
```
Scenario: Network interruption during analysis
Expected:
- Progress stops updating
- After 10 seconds, show reconnection message
- Allow user to manually fetch current progress
- Provide "Refresh Status" button
```

### Performance Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Search import (3 pages) | < 60 seconds | Including all network calls |
| Preview modal render | < 500ms | For up to 100 properties |
| Property card click response | < 50ms | Instant visual feedback |
| WebSocket message latency | < 100ms | Real-time updates |
| Address extraction accuracy | > 95% | From scraped content |
| Data extraction accuracy | > 90% | Price, beds, baths, sqft |
| Progress calculation accuracy | 100% | Never exceed 100% |

---

## Implementation Checklist

### Phase 1: Core Search Import ✅
- [x] Create `ZillowSearchScraper` service
- [x] Implement URL extraction patterns
- [x] Add pagination support (3 pages)
- [x] Create `/api/zillow/search` endpoint
- [x] Add "Import from Search" button toggle
- [x] Add search URL input field
- [x] Implement `handleImportFromSearch` function
- [x] Add loading spinner during import
- [x] Show success message with count

### Phase 2: Preview Modal ✅
- [x] Create preview modal component
- [x] Show list of imported properties
- [x] Extract addresses from URLs for display
- [x] Add selection state management (`Set<number>`)
- [x] Implement Select All button
- [x] Implement Deselect All button
- [x] Add selection counter display
- [x] Make property cards clickable with checkboxes
- [x] Add visual feedback for selected state
- [x] Update Analyze button with count
- [x] Disable button when no selection
- [x] Auto-select all on initial import

### Phase 3: Progress Enhancements ✅
- [x] Add `propertyAddresses` Map to page state
- [x] Modify WebSocket to broadcast addresses
- [x] Store addresses on each progress update
- [x] Update `getPropertyStatuses()` to use Map
- [x] Add fallback address extraction from URL
- [x] Fix progress percentage calculation
- [x] Fix process step state logic
- [x] Cap progress at 100%

### Phase 4: Stop/Cancel Controls ✅
- [x] Add `shouldStopAfterCurrent` state
- [x] Create `handleStopAfterCurrent` function
- [x] Create `handleCancelAnalysis` function
- [x] Add props to AnalysisProgressModal
- [x] Add Stop After Current button (orange)
- [x] Add Cancel Analysis button (red)
- [x] Implement button disabled states
- [x] Add stopping info banner
- [x] Handle WebSocket cleanup
- [x] Fetch partial results on stop/cancel

### Phase 5: Bug Fixes ✅
- [x] Fix Zestimate regex (exclude $/sqft)
- [x] Fix bathroom extraction (word boundaries)
- [x] Fix days on market patterns
- [x] Fix address extraction (from headings)
- [x] Fix address cleanup (remove navigation)
- [x] Fix modal z-index and styling
- [x] Fix duplicate address issue (use Map)
- [x] Fix auto-start from preview modal

### Phase 6: Testing & Validation ⏳
- [ ] Test search import with various filters
- [ ] Test with small (5 properties) and large (50+) searches
- [ ] Verify address extraction accuracy
- [ ] Test selection UI with many properties
- [ ] Test stop after current functionality
- [ ] Test cancel functionality
- [ ] Verify partial results display
- [ ] Test error handling for invalid URLs
- [ ] Test network failure scenarios
- [ ] Performance testing for 100+ properties

---

## Future Enhancements

### Priority 1: Short-term Improvements
- [ ] Add property count validation before import
- [ ] Show thumbnail images in preview modal
- [ ] Add price/beds/baths in property cards
- [ ] Save recent searches for quick re-import
- [ ] Add export selected URLs feature
- [ ] Improve error messages with recovery actions
- [ ] Add search URL validation UI hints

### Priority 2: Medium-term Features
- [ ] Support pagination beyond 3 pages (user configurable)
- [ ] Add search result caching (avoid re-scraping)
- [ ] Implement property comparison view
- [ ] Add favorite/bookmark properties
- [ ] Support multiple search imports in one session
- [ ] Add batch naming/organization
- [ ] Generate search summary report

### Priority 3: Advanced Features
- [ ] Support other real estate sites (Redfin, Realtor.com)
- [ ] Implement smart filtering (auto-exclude based on criteria)
- [ ] Add map view for imported properties
- [ ] ML-based property recommendation
- [ ] Automated search alerts
- [ ] Integration with property management systems
- [ ] Mobile-responsive design improvements

---

## Success Criteria

This feature set will be considered successful when:

1. ✅ **Import Speed**: Users can import 30+ properties in under 60 seconds
2. ✅ **Accuracy**: 95%+ accuracy in address and data extraction
3. ✅ **Usability**: Users can complete import-to-analysis in under 2 minutes
4. ✅ **Control**: Users can stop/cancel analysis without losing completed work
5. ✅ **Visibility**: Users see real property addresses, not generic labels
6. ✅ **Selection**: Users can efficiently select subset of properties
7. ✅ **Reliability**: System handles errors gracefully with clear messages
8. ✅ **Performance**: UI remains responsive during import and analysis

---

## Appendix A: Example User Flows

### Flow 1: First-time User
1. Arrives at Real Estate Analysis V2 page
2. Sees "Import from Search" button, clicks it
3. Gets tooltip: "Paste a Zillow search URL to import multiple properties at once"
4. Copies URL from Zillow search: `https://www.zillow.com/homes/for_sale/?searchQueryState=...`
5. Pastes into input field
6. Clicks "🔍 Import Properties"
7. Sees spinner: "Importing Properties..." (waits 45 seconds)
8. Preview modal appears with 36 properties
9. Sees all properties selected by default
10. Reviews list, deselects 26 properties
11. Sees "Analyze 10 Properties" button enabled
12. Clicks Analyze
13. Progress modal appears immediately
14. Sees real addresses: "17867 W Eugene Ter, Surprise AZ..." not "Property 1"
15. Watches progress: 0% → 10% → 27% → 50%...
16. After 5 properties, decides that's enough
17. Clicks "Stop After Current"
18. Sees "Stopping..." and orange banner
19. Current property completes
20. Results view shows 6 completed analyses
21. Reviews results, makes decisions
22. Returns to try another search

### Flow 2: Power User
1. Opens page, immediately clicks "Import from Search"
2. Pastes pre-copied search URL from previous research
3. Clicks Import, waits
4. Preview modal appears, sees 42 properties
5. Clicks "Deselect All"
6. Quickly scans list, selecting 8 specific properties based on location
7. Counter shows "8 of 42 selected"
8. Clicks "Analyze 8 Properties"
9. Analysis starts, watches progress
10. All 8 complete successfully
11. Reviews results table
12. Exports to CSV
13. Starts new search import for different area

---

## Appendix B: Technical Debt & Known Limitations

### Current Limitations
1. **Pagination Limit**: Fixed at 3 pages (future: user-configurable)
2. **Single Search**: Can't merge multiple searches (future: batch import)
3. **No Caching**: Re-scrapes same URLs if imported twice
4. **Limited Validation**: Doesn't check if properties are still available
5. **Single Site**: Only supports Zillow (future: multi-site)

### Technical Debt
1. **Error Handling**: Some edge cases not fully handled
2. **Loading States**: Could be more granular (per-page progress)
3. **URL Parsing**: Fragile regex patterns could use library
4. **State Management**: Growing complex, consider context/reducer
5. **Component Size**: `page.tsx` is large, needs refactoring

### Performance Considerations
1. **Large Imports**: 100+ properties may cause UI lag
2. **Memory Usage**: Storing all addresses in Map could be optimized
3. **WebSocket Scalability**: Not tested with multiple concurrent users
4. **Regex Performance**: Complex patterns on large content

---

## Appendix C: API Environment Variables

### Required Environment Variables
```bash
# Firecrawl API (for web scraping)
FIRECRAWL_API_KEY=fc-17374977a1204276a65daacf37952db3

# Claude (for primary analysis)
ANTHROPIC_API_KEY=sk-ant-api03-...

# GPT-4 (for quality review)
OPENAI_API_KEY=sk-proj-...

# Railway PostgreSQL (for data storage)
DATABASE_URL=postgresql://postgres:...@containers-us-west-165.railway.app:6657/railway
```

### API Rate Limits
- **Firecrawl**: 100 requests/minute (sufficient for 3-page imports)
- **Claude**: 50 requests/minute (batch analysis bottleneck)
- **GPT-4**: 500 requests/minute (quality review parallelizable)
- **PostgreSQL**: No practical limit for this use case

---

**End of Specification**

*This document serves as the complete technical specification for rebuilding the Real Estate Analysis V2 Search Import feature and all related enhancements. Use this as the single source of truth for implementation.*
