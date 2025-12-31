# Property Analysis Flow & Storage Strategy

## Current Issues

### 1. "Both" Property Type Flow
**Current Behavior:**
- When user selects "Both" in Step 1, all properties default to "rental" type
- No UI to let user specify which property is primary vs rental
- Line 63 & 652: `type: apiPropertyType === 'both' ? 'rental' : apiPropertyType`

**Problems:**
- User can't distinguish between primary residence and rental properties
- All properties get incorrectly classified
- No per-property type selection

### 2. Storage & Portfolio Management
**Current Behavior:**
- Properties analyzed are NOT currently stored in database with status
- No "In Analysis" status exists
- No distinction between "analyzed" vs "owned" properties
- No way to search previously analyzed properties

**Problems:**
- Analyzed properties are lost after page refresh
- Can't revisit analysis results
- Can't compare properties over time
- No portfolio vs analysis history separation

---

## Proposed Solution

### Phase 1: Fix "Both" Property Type Flow

#### A. Property Type Selection Modal (After URLs Added)
When user clicks "Analyze X Properties" with "Both" selected:

1. **Show Modal: "Assign Property Types"**
   ```
   ┌─────────────────────────────────────────────────┐
   │  Assign Property Types                          │
   ├─────────────────────────────────────────────────┤
   │                                                  │
   │  28430 316th Way SE, Ravensdale WA              │
   │  ○ Primary Residence    ○ Rental Property       │
   │                                                  │
   │  123 Main St, Phoenix AZ                        │
   │  ○ Primary Residence    ● Rental Property       │
   │                                                  │
   │  456 Oak Ave, Mesa AZ                           │
   │  ○ Primary Residence    ● Rental Property       │
   │                                                  │
   │  [Cancel]              [Start Analysis →]       │
   └─────────────────────────────────────────────────┘
   ```

2. **Validation:**
   - Can select 0 or 1 primary residence (not multiple)
   - All others default to rental
   - Show warning if multiple primaries selected

3. **After Selection:**
   - Store types with URLs
   - Proceed with batch analysis

#### B. Update Data Flow
```typescript
interface PropertyToAnalyze {
  url: string;
  type: 'primary' | 'rental';
  address?: string; // Extracted from URL or search
}
```

---

### Phase 2: Analysis Storage Architecture

#### A. Database Schema

**Table: `analyzed_properties`**
```sql
CREATE TABLE analyzed_properties (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  zillow_url TEXT NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'primary' or 'rental'
  status VARCHAR(50) NOT NULL, -- 'analyzing', 'analyzed', 'owned', 'archived'
  
  -- Property Data
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(10),
  zip_code VARCHAR(20),
  bedrooms INTEGER,
  bathrooms DECIMAL,
  sqft INTEGER,
  lot_size DECIMAL,
  year_built INTEGER,
  price DECIMAL,
  
  -- Analysis Results
  analysis_score INTEGER,
  analysis_summary TEXT,
  analysis_full_data JSONB,
  strengths TEXT[],
  concerns TEXT[],
  recommendations TEXT[],
  
  -- Metadata
  analyzed_at TIMESTAMP DEFAULT NOW(),
  added_to_portfolio_at TIMESTAMP,
  archived_at TIMESTAMP,
  
  -- Indexes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analyzed_props_user_status ON analyzed_properties(user_id, status);
CREATE INDEX idx_analyzed_props_user_type ON analyzed_properties(user_id, property_type);
CREATE INDEX idx_analyzed_props_analyzed_at ON analyzed_properties(analyzed_at DESC);
```

**Table: `user_properties` (Existing - Portfolio)**
- Keep for actual owned properties only
- Add `analyzed_property_id` FK to link back to analysis

#### B. Status Flow

```
[User Adds URLs]
      ↓
[In Analysis] ← analyzed_properties.status = 'analyzing'
      ↓
[Analysis Complete] → analyzed_properties.status = 'analyzed'
      ↓
      ├─→ [User: "Add to Portfolio"] → status = 'owned' + insert into user_properties
      ├─→ [User: "Keep for Reference"] → status = 'analyzed'
      └─→ [User: "Archive"] → status = 'archived'
```

#### C. User Actions After Analysis

**Analysis Results Page:**
```
┌─────────────────────────────────────────────────┐
│  28430 316th Way SE, Ravensdale WA              │
│  Score: 79/100 | $2,465,800 | 4bd/4ba/4,720sqft│
├─────────────────────────────────────────────────┤
│  [📊 View Full Analysis]                        │
│  [➕ Add to Portfolio]                          │
│  [📑 Keep for Reference]                        │
│  [🗑️ Archive]                                   │
└─────────────────────────────────────────────────┘
```

---

### Phase 3: Analysis History & Search

#### A. New Page: `/real-estate/analysis-history`

**Features:**
1. **Filter & Search:**
   - By status: Analyzed / In Portfolio / Archived
   - By property type: Primary / Rental
   - By score range: 80-100, 60-79, <60
   - By date analyzed
   - By location: City, State, ZIP

2. **Sort Options:**
   - Score (High to Low / Low to High)
   - Date Analyzed (Newest / Oldest)
   - Price (High to Low / Low to High)
   - Address (A-Z)

3. **Actions:**
   - Re-run analysis (with updated data)
   - Compare properties side-by-side
   - Export analysis to PDF
   - Add to portfolio
   - Archive

#### B. Integration Points

**Dashboard:**
- Widget: "Recently Analyzed Properties" (last 5)
- Quick stats: "X properties analyzed this month"

**Portfolio Page:**
- Show link to original analysis for each property
- "View Analysis History" button

**Real Estate V2 Page:**
- Warning if URL was previously analyzed
- "View Previous Analysis" link

---

## Implementation Priority

### Phase 1: Property Type Selection (IMMEDIATE)
**Files to Modify:**
- `app/real-estate-v2/page.tsx`
  - Add `PropertyTypeModal` component
  - Update `handleStartAnalysis` to show modal when type is 'both'
  - Store type assignments with URLs

**Estimated Time:** 2-3 hours

### Phase 2: Analysis Storage (HIGH PRIORITY)
**Files to Modify:**
- `lib/database.ts` - Add `analyzed_properties` table functions
- `app/api/analysis/batch/route.ts` - Save to `analyzed_properties` on complete
- `app/api/properties/route.ts` - Link to `analyzed_properties` when adding to portfolio

**SQL Migration:**
```sql
-- migrations/005_create_analyzed_properties.sql
CREATE TABLE analyzed_properties (...);
```

**Estimated Time:** 4-6 hours

### Phase 3: Analysis History Page (MEDIUM PRIORITY)
**New Files:**
- `app/real-estate/analysis-history/page.tsx`
- `components/AnalysisHistoryTable.tsx`
- `components/AnalysisFilters.tsx`
- `components/PropertyComparisonModal.tsx`

**API Routes:**
- `app/api/analyzed-properties/route.ts` - GET (with filters), DELETE
- `app/api/analyzed-properties/[id]/route.ts` - GET, PATCH

**Estimated Time:** 8-12 hours

---

## User Experience Flow (Complete)

### Scenario: User wants to analyze 3 rentals and 1 primary

1. **Step 1:** Select "Both" property type
2. **Step 2:** Add 4 Zillow URLs
3. **Click "Analyze 4 Properties"**
4. **Modal appears:** "Assign Property Types"
   - User marks one as Primary
   - Others default to Rental
5. **Analysis runs** → Properties saved with status='analyzing'
6. **Analysis completes** → Status updates to 'analyzed'
7. **Results page shows 4 cards:**
   - Each has: View Analysis | Add to Portfolio | Keep for Reference | Archive
8. **User actions:**
   - Primary (score 85): "Add to Portfolio" → Moves to `user_properties` + Dashboard
   - Rental 1 (score 78): "Keep for Reference" → Stays in `analyzed_properties`
   - Rental 2 (score 82): "Add to Portfolio" → Moves to `user_properties` + Portfolio
   - Rental 3 (score 65): "Archive" → Status = 'archived'

9. **Later:** User visits "/real-estate/analysis-history"
   - Sees all 4 properties
   - Can filter to show only "In Portfolio" (2 properties)
   - Can filter to show "Analyzed" (1 property)
   - Can toggle "Show Archived" to see the low-scoring one

---

## Database Queries

### Get Analysis History
```sql
SELECT * FROM analyzed_properties
WHERE user_id = $1
  AND status IN ('analyzed', 'owned')
  AND ($2 IS NULL OR property_type = $2)
  AND ($3 IS NULL OR analysis_score >= $3)
  AND ($4 IS NULL OR analysis_score <= $4)
ORDER BY analyzed_at DESC
LIMIT 50;
```

### Check If URL Previously Analyzed
```sql
SELECT id, status, analyzed_at, analysis_score
FROM analyzed_properties
WHERE user_id = $1 
  AND zillow_url = $2
ORDER BY analyzed_at DESC
LIMIT 1;
```

### Move to Portfolio
```sql
-- Update analyzed_properties
UPDATE analyzed_properties
SET status = 'owned', 
    added_to_portfolio_at = NOW(),
    updated_at = NOW()
WHERE id = $1;

-- Insert into user_properties
INSERT INTO user_properties (
  user_id, property_type, analyzed_property_id, ...
) VALUES (...);
```

---

## Next Steps

1. **Immediate:** Implement Property Type Selection Modal
2. **This Week:** Create `analyzed_properties` table and update API
3. **Next Week:** Build Analysis History page
4. **Future:** Add property comparison, PDF export, re-analysis features
