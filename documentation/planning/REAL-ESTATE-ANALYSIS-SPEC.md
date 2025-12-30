# Real Estate Analysis Feature - Product Specification

**Version:** 1.0  
**Date:** December 29, 2024  
**Status:** Planning  

---

## Executive Summary

Complete redesign of the Real Estate Analysis feature to focus on multi-property batch analysis with intelligent scoring, dual-model validation, and trip planning capabilities. The system analyzes properties (primary residence and/or rentals), generates comprehensive reports, and creates geographically-optimized itineraries for property viewing trips.

---

## Core Philosophy

**Analysis Success ≠ Finding Investment Properties**

A successful analysis is one that provides accurate information to make informed decisions. Determining that a property does NOT meet investment criteria is equally valuable as finding one that does - it prevents costly mistakes.

---

## User Flow Overview

```
Landing Page (Stats Dashboard)
    ↓
Property Type Selection (Primary/Rental/Both)
    ↓
URL Entry Interface (Batch Input)
    ↓
Analysis Progress Modal (Live Updates)
    ↓
Results Table (Scored & Sorted)
    ↓
Selection & Export
    ↓
Trip Itinerary Generator
```

---

## 1. Landing Page Redesign

### 1.1 Purpose
Simplified dashboard showing only the most critical statistics about analyzed properties.

### 1.2 Layout
```
┌─────────────────────────────────────────────────┐
│  Real Estate Analysis Dashboard                 │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │ Properties   │  │ Total Value  │  │ Avg    ││
│  │ Analyzed     │  │ Analyzed     │  │ Score  ││
│  │    142       │  │  $45.2M      │  │  78/100││
│  └──────────────┘  └──────────────┘  └────────┘│
│                                                  │
│  [Start New Analysis] Button                    │
└─────────────────────────────────────────────────┘
```

### 1.3 Key Stats (Top Cards Only)
- **Properties Analyzed**: Total count of all properties ever analyzed
- **Total Value Analyzed**: Sum of all property values analyzed
- **Average Score**: Mean score across all analyzed properties
- *(Optional)* Properties Meeting Criteria / Properties Not Meeting Criteria

### 1.4 Primary Action
Large, prominent "Start New Analysis" button leading to Property Type Selection

---

## 2. Property Type Selection

### 2.1 Interface
```
┌─────────────────────────────────────────────────┐
│  What type of properties do you want to analyze?│
│                                                  │
│  ○ Rentals (Most Common)                        │
│  ○ Primary Residence                            │
│  ○ Both                                         │
│                                                  │
│  [Continue] Button                              │
└─────────────────────────────────────────────────┘
```

### 2.2 Options
- **Rentals** (Default selection) - Most common use case
- **Primary Residence** - For personal home searches
- **Both** - Analyze both property types simultaneously

### 2.3 Behavior
- Default selection: "Rentals"
- Single selection (radio buttons)
- Continue button leads to URL Entry Interface with appropriate sections

---

## 3. URL Entry Interface

### 3.1 Dynamic Layout Based on Selection

#### 3.1.1 Rentals Only
```
┌─────────────────────────────────────────────────┐
│  Rental Properties to Analyze                   │
├─────────────────────────────────────────────────┤
│  [URL Input 1] [X]                              │
│  [URL Input 2] [X]                              │
│  [URL Input 3] [X]                              │
│  [URL Input 4] [X]                              │
│                                        [+]      │
│                                                  │
│  [Analyze Properties] Button                    │
└─────────────────────────────────────────────────┘
```

#### 3.1.2 Primary Residence Only
```
┌─────────────────────────────────────────────────┐
│  Primary Residence Options to Analyze           │
├─────────────────────────────────────────────────┤
│  [URL Input 1] [X]                              │
│  [URL Input 2] [X]                              │
│  [URL Input 3] [X]                              │
│  [URL Input 4] [X]                              │
│                                        [+]      │
│                                                  │
│  [Analyze Properties] Button                    │
└─────────────────────────────────────────────────┘
```

#### 3.1.3 Both Property Types
```
┌─────────────────────────────────────────────────┐
│  Primary Residence Options                      │
├─────────────────────────────────────────────────┤
│  [URL Input 1] [X]                              │
│  [URL Input 2] [X]                              │
│  [URL Input 3] [X]                              │
│  [URL Input 4] [X]                              │
│                                        [+]      │
├─────────────────────────────────────────────────┤
│  Rental Properties                              │
├─────────────────────────────────────────────────┤
│  [URL Input 1] [X]                              │
│  [URL Input 2] [X]                              │
│  [URL Input 3] [X]                              │
│  [URL Input 4] [X]                              │
│                                        [+]      │
│                                                  │
│  [Analyze Properties] Button                    │
└─────────────────────────────────────────────────┘
```

### 3.2 Functionality

#### 3.2.1 Initial State
- Each section starts with **4 empty URL input fields**
- Each field has a delete button [X] (except if only 1 field remains)
- Plus button [+] at bottom right of each section

#### 3.2.2 Adding URLs
- Click [+] to add additional URL input field
- No hard limit on number of URLs
- New fields appear above the [+] button

#### 3.2.3 Removing URLs
- Click [X] next to any URL field to remove it
- Minimum 1 field must remain per section
- Fields renumber automatically

#### 3.2.4 Validation
- URLs must be valid Zillow property URLs
- Show inline error if invalid URL format
- Analyze button disabled until at least 1 valid URL entered

---

## 4. Analysis Progress Modal

### 4.1 Purpose
Provide real-time feedback during the multi-step analysis process so users understand progress and know the system is working.

### 4.2 Modal Design
```
┌─────────────────────────────────────────────────┐
│  Analyzing Properties                      [X]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  [====================================    ] 85% │
│                                                  │
│  Current Step: Quality Review (Property 3/4)    │
│                                                  │
│  ✓ Property 1: 123 Main St - Complete (87/100) │
│  ✓ Property 2: 456 Oak Ave - Complete (72/100) │
│  ⟳ Property 3: 789 Pine Rd - Reviewing...      │
│  ○ Property 4: 321 Elm St - Pending             │
│                                                  │
│  Process:                                        │
│  ✓ Data Scraping                                │
│  ✓ Primary Analysis (Claude)                    │
│  ⟳ Quality Review (Secondary Model)             │
│  ○ Final Validation                             │
│  ○ Report Generation                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 4.3 Progress Indicators
- **Overall Progress Bar**: 0-100% completion
- **Current Step**: Clear description of what's happening now
- **Per-Property Status**: 
  - ✓ Complete (with score)
  - ⟳ In Progress
  - ○ Pending
  - ✗ Error (if applicable)
- **Process Checklist**: Shows the 5-step analysis flow

### 4.4 Modal Behavior
- Modal appears immediately when "Analyze Properties" clicked
- Non-dismissible during analysis (X button disabled)
- Auto-closes when analysis complete (or shows "View Results" button)
- Updates in real-time as each step completes

---

## 5. Analysis Engine

### 5.1 Three-Model Validation Process

```
┌─────────────────────────────────────────────────┐
│  Step 1: Primary Analysis (Claude)              │
│  - Comprehensive property evaluation             │
│  - Score: 0-100 based on methodology            │
│  - Detailed breakdown by category                │
└─────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────┐
│  Step 2: Quality Review (Secondary Model)       │
│  - Review primary analysis for errors            │
│  - Flag inconsistencies/mistakes                │
│  - Generate correction suggestions               │
└─────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────┐
│  Step 3: Final Validation (Claude)              │
│  - Review quality reviewer's feedback            │
│  - Correct errors OR disagree with reasoning     │
│  - Finalize score and analysis                   │
└─────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────┐
│  Step 4: Database Storage                       │
│  - Store all analysis data                       │
│  - Save primary, quality review, final versions  │
│  - Record timestamps and model versions          │
└─────────────────────────────────────────────────┘
```

### 5.2 Scoring Methodology

#### 5.2.1 Rental Properties (0-100 Scale)
- **Financial Performance** (40 points)
  - Cash flow potential
  - ROI projections
  - Cap rate
  - Debt coverage ratio
- **Market Position** (25 points)
  - Location desirability
  - Rental demand indicators
  - Price relative to market
- **Property Condition** (20 points)
  - Age and maintenance needs
  - Required repairs/updates
  - Long-term viability
- **Risk Factors** (15 points)
  - Market stability
  - Vacancy risk
  - Management complexity

#### 5.2.2 Primary Residence (0-100 Scale)
- **Lifestyle Fit** (35 points)
  - Location convenience
  - Amenities and features
  - School quality (if applicable)
- **Financial Prudence** (30 points)
  - Price vs. income ratio
  - Mortgage affordability
  - Appreciation potential
- **Property Quality** (20 points)
  - Condition and age
  - Layout and functionality
  - Future maintenance needs
- **Long-term Value** (15 points)
  - Neighborhood trajectory
  - Resale potential
  - Market stability

### 5.3 Data Storage Schema

```typescript
interface PropertyAnalysis {
  id: string;
  user_id: string;
  zpid: string;
  zillow_url: string;
  property_type: 'primary' | 'rental';
  analysis_date: Date;
  
  // Scraped Data
  property_data: ZillowPropertyData;
  
  // Analysis Results
  primary_analysis: {
    model: 'claude-3-5-sonnet-20241022';
    timestamp: Date;
    overall_score: number; // 0-100
    category_scores: {
      [category: string]: number;
    };
    detailed_analysis: string;
    strengths: string[];
    concerns: string[];
    recommendation: 'strong_buy' | 'buy' | 'consider' | 'pass' | 'avoid';
  };
  
  // Quality Review
  quality_review: {
    model: 'gpt-4' | 'gemini-pro';
    timestamp: Date;
    issues_found: {
      severity: 'critical' | 'major' | 'minor';
      category: string;
      description: string;
      suggested_correction: string;
    }[];
    confidence_score: number;
  };
  
  // Final Validation
  final_validation: {
    model: 'claude-3-5-sonnet-20241022';
    timestamp: Date;
    corrections_applied: string[];
    disagreements: string[];
    final_score: number; // 0-100
    final_recommendation: 'strong_buy' | 'buy' | 'consider' | 'pass' | 'avoid';
  };
  
  // Report Generation
  report_generated: Date;
  report_data: PropertyReport;
}
```

---

## 6. Results Table

### 6.1 Table Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Analysis Results                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│  PRIMARY RESIDENCE CANDIDATES (Sorted by Score)                          │
├───┬──────────┬─────────────────────┬────────┬──────────┬──────────────┬──┤
│ ☐ │  Score   │  Address            │  City  │  Price   │  Recommend.  │  │
├───┼──────────┼─────────────────────┼────────┼──────────┼──────────────┼──┤
│ ☐ │  92/100  │  123 Main St        │  Kent  │  $650K   │  Strong Buy  │→ │
│ ☐ │  87/100  │  456 Oak Avenue     │  Maple │  $580K   │  Buy         │→ │
│ ☐ │  71/100  │  789 Pine Road      │  Auburn│  $520K   │  Consider    │→ │
├───┴──────────┴─────────────────────┴────────┴──────────┴──────────────┴──┤
│  RENTAL PROPERTIES (Sorted by Score)                                     │
├───┬──────────┬─────────────────────┬────────┬──────────┬──────────────┬──┤
│ ☐ │  Score   │  Address            │  City  │  Price   │  Recommend.  │  │
├───┼──────────┼─────────────────────┼────────┼──────────┼──────────────┼──┤
│ ☐ │  89/100  │  321 Elm Street     │  Kent  │  $425K   │  Strong Buy  │→ │
│ ☐ │  84/100  │  654 Maple Dr       │  Renton│  $390K   │  Buy         │→ │
│ ☐ │  68/100  │  987 Cedar Lane     │  SeaTac│  $350K   │  Consider    │→ │
│ ☐ │  45/100  │  147 Birch Way      │  Tukwila│ $310K   │  Pass        │→ │
└───┴──────────┴─────────────────────┴────────┴──────────┴──────────────┴──┘

[Generate PDF Report]  [Create Trip Itinerary]
```

### 6.2 Table Features

#### 6.2.1 Sorting
- **Primary Sort**: Property Type (Primary Residence first, then Rentals)
- **Secondary Sort**: Score (highest to lowest within each category)

#### 6.2.2 Columns
- **Checkbox**: Select properties for PDF/itinerary
- **Score**: Final score (0-100) with color coding:
  - 85-100: Green (Strong Buy)
  - 70-84: Blue (Buy)
  - 55-69: Yellow (Consider)
  - 40-54: Orange (Pass)
  - 0-39: Red (Avoid)
- **Address**: Property street address
- **City**: City name
- **Price**: Listing price
- **Recommendation**: Text recommendation
- **Details Arrow** (→): Click to expand full report inline

#### 6.2.3 Expandable Details
Click arrow (→) to expand inline detailed view:
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ☑ │  92/100  │  123 Main St        │  Kent  │  $650K   │  Strong Buy  │▼ │
├───┴──────────┴─────────────────────┴────────┴──────────┴──────────────┴──┤
│  [Hero Image of Property]                                                │
│                                                                           │
│  Property Details:                                                        │
│  • 4 bed / 3 bath • 2,450 sqft • 0.25 acres • Built 2018                │
│                                                                           │
│  Score Breakdown:                                                         │
│  • Lifestyle Fit: 33/35                                                   │
│  • Financial Prudence: 28/30                                              │
│  • Property Quality: 18/20                                                │
│  • Long-term Value: 13/15                                                 │
│                                                                           │
│  Strengths:                                                               │
│  ✓ Excellent school district (9/10 rating)                               │
│  ✓ Low maintenance (new construction)                                     │
│  ✓ Strong appreciation area (+8% annually)                               │
│                                                                           │
│  Concerns:                                                                │
│  ⚠ Price at upper end of budget                                          │
│  ⚠ HOA fees ($250/month)                                                 │
│                                                                           │
│  Recommendation: Strong Buy - Excellent fit for family, solid investment  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. PDF Report Generation

### 7.1 Trigger
User selects checkboxes for desired properties and clicks "Generate PDF Report"

### 7.2 Report Structure

```
┌─────────────────────────────────────────────────┐
│  Real Estate Analysis Report                    │
│  Generated: December 29, 2024                   │
│  Properties Analyzed: 7                         │
│  Selected for Report: 4                         │
└─────────────────────────────────────────────────┘

Section 1: Executive Summary
├─ Properties Analyzed: 4 Primary, 3 Rental
├─ Average Score: 78/100
├─ Strong Buy Recommendations: 2
└─ Properties to Consider: 2

Section 2: Summary Table
┌───────────────────────────────────────────────┐
│  Score  │  Address         │  Type     │  Rec │
├─────────┼──────────────────┼───────────┼──────┤
│  92/100 │  123 Main St     │  Primary  │  Buy │
│  89/100 │  321 Elm St      │  Rental   │  Buy │
│  ...    │  ...             │  ...      │  ... │
└───────────────────────────────────────────────┘

Section 3: Property Details (One per page/section)

┌─────────────────────────────────────────────────┐
│  123 Main Street, Kent, WA 98031                │
│  Score: 92/100 - STRONG BUY                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Hero Image - Professional Photo]              │
│                                                  │
│  Property Overview                              │
│  • 4 bed / 3 bath • 2,450 sqft                 │
│  • Lot: 0.25 acres • Built: 2018               │
│  • Price: $650,000                             │
│                                                  │
│  Score Breakdown                                │
│  ████████████████████████████░░░░ 92/100       │
│  • Lifestyle Fit: 33/35 ████████████░          │
│  • Financial: 28/30 █████████░░                │
│  • Quality: 18/20 █████████                    │
│  • Long-term: 13/15 ████████░                  │
│                                                  │
│  Key Strengths                                  │
│  ✓ Excellent school district (9/10)            │
│  ✓ Low maintenance - new construction          │
│  ✓ Strong appreciation (+8%/yr)                │
│  ✓ Move-in ready condition                     │
│                                                  │
│  Considerations                                 │
│  ⚠ Price at upper budget range                 │
│  ⚠ HOA fees ($250/month)                       │
│  ⚠ Limited expansion potential                 │
│                                                  │
│  Financial Analysis                             │
│  • Est. Monthly Payment: $3,890                │
│  • Property Tax: $541/mo                       │
│  • Insurance: ~$150/mo                         │
│  • Total Monthly: $4,831                       │
│                                                  │
│  Recommendation                                 │
│  STRONG BUY - This property represents an      │
│  excellent balance of lifestyle fit and        │
│  financial prudence. The new construction...   │
└─────────────────────────────────────────────────┘

[Repeat for each selected property]

Section 4: Appendix
├─ Methodology Explanation
├─ Scoring Criteria Details
└─ Market Context & Data Sources
```

### 7.3 PDF Specifications
- **Format**: Letter size (8.5" x 11")
- **Fonts**: Professional sans-serif (Inter, Open Sans)
- **Colors**: Brand colors with score-based color coding
- **Images**: One hero image per property (high quality)
- **File Naming**: `Real-Estate-Analysis-[Date]-[Count]Properties.pdf`

---

## 8. Trip Itinerary Generator

### 8.1 User Flow

```
[Create Trip Itinerary] Button Clicked
    ↓
┌─────────────────────────────────────────────────┐
│  Trip Planning - Step 1: Duration               │
├─────────────────────────────────────────────────┤
│  How many days is your property viewing trip?   │
│                                                  │
│  [  3  ] days                                   │
│                                                  │
│  [Continue]                                     │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│  Trip Planning - Step 2: Activities             │
├─────────────────────────────────────────────────┤
│  What would you like to do between viewings?    │
│                                                  │
│  ☑ Restaurants                                  │
│  ☑ Hikes                                        │
│  ☑ Pickleball                                   │
│  ☐ Fun Shopping                                 │
│  ☑ Premium Outlets                              │
│                                                  │
│  [Generate Itinerary]                           │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│  Generating Your Itinerary...                   │
│  [=============>                    ] 45%       │
│  Optimizing property viewing routes...          │
└─────────────────────────────────────────────────┘
    ↓
Itinerary Display (see 8.2)
```

### 8.2 Itinerary Display

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Your 3-Day Property Viewing Trip                                        │
│  7 Properties • Optimized for Driving Efficiency                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  DAY 1 - KENT & MAPLE VALLEY AREA                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                           │
│  🏠 MORNING VIEWINGS (9:00 AM - 12:00 PM)                                │
│  ├─ 9:00 AM  │ 123 Main St, Kent • Score: 92/100                        │
│  │           │ [View Details] [Get Directions]                           │
│  ├─ 10:15 AM │ 321 Elm Street, Kent • Score: 89/100                     │
│  │           │ [View Details] [Get Directions]                           │
│  └─ 11:30 AM │ 789 Maple Dr, Maple Valley • Score: 84/100               │
│              │ [View Details] [Get Directions]                           │
│                                                                           │
│  🍴 LUNCH (12:30 PM - 1:30 PM)                                           │
│  └─ The Berliner Pub (German, 4.5⭐, $$$)                                │
│     Downtown Kent • 0.8 mi from last property                            │
│     [View Menu] [Get Directions]                                         │
│                                                                           │
│  🎾 AFTERNOON ACTIVITY (2:00 PM - 3:30 PM)                               │
│  └─ Lake Meridian Park - Pickleball Courts                               │
│     Kent, WA • 6 courts available • Free                                 │
│     [View Details] [Get Directions]                                      │
│                                                                           │
│  🏞️ EVENING ACTIVITY (4:00 PM - 5:30 PM)                                │
│  └─ Soos Creek Trail - Easy Hike                                         │
│     2.5 miles • Scenic • Family-friendly                                 │
│     [View Details] [Get Directions]                                      │
│                                                                           │
│  🍽️ DINNER SUGGESTION                                                    │
│  └─ Mio Sushi (Japanese, 4.7⭐, $$)                                      │
│     Kent • Popular for fresh sushi                                       │
│                                                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                           │
│  DAY 2 - RENTON & TUKWILA AREA                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ...                                                                      │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

[Download PDF Itinerary] [Export to Google Maps] [Share]
```

### 8.3 Itinerary Generation Logic

#### 8.3.1 Geographic Clustering
1. **Group Properties by Area**: Cluster properties within ~15 miles of each other
2. **Calculate Drive Times**: Use actual driving distances (not crow-flies)
3. **Optimize Route**: Minimize backtracking and total drive time
4. **Balance Days**: Distribute properties evenly across trip days

#### 8.3.2 Daily Structure
```
Morning Block (9:00 AM - 12:00 PM)
├─ 2-3 property viewings
├─ 45 minutes per property (viewing + travel)
└─ Properties in same geographic cluster

Lunch Break (12:00 PM - 1:30 PM)
├─ Restaurant near last morning property
└─ Based on user's dining preferences

Afternoon Activity (2:00 PM - 4:00 PM)
├─ Selected from user's checked interests
├─ Geographically convenient to morning area
└─ Duration: 1.5-2 hours

Additional Viewings OR Activity (4:00 PM - 6:00 PM)
├─ If more properties in area: 1-2 viewings
└─ Otherwise: Second activity option

Dinner Suggestion (6:00 PM+)
└─ Restaurant recommendation near lodging/area
```

#### 8.3.3 Activity Integration

**Restaurants** (Lunch & Dinner)
- Near current location
- Variety of cuisines across trip
- Ratings: 4.0+ stars
- Price range: Mix of $$ and $$$

**Hikes**
- Proximity: Within 10 miles of property area
- Difficulty: Easy to Moderate
- Duration: 1-2 hours
- Scenic/Notable trails prioritized

**Pickleball**
- Public courts within 5 miles
- Show number of courts
- Note if reservation required
- Free or low-cost options

**Fun Shopping**
- Local boutiques, antique shops, unique stores
- Walkable downtown areas
- Not big-box retail

**Premium Outlets**
- Seattle Premium Outlets (Tulalip)
- Centralia Premium Outlets
- Other nearby outlet malls
- Allocate 2-3 hours

### 8.4 Itinerary Output Formats

#### 8.4.1 PDF Export
- Full itinerary with maps
- Property details embedded
- Activity descriptions
- Restaurant recommendations
- Printable format

#### 8.4.2 Google Maps Export
- Multi-stop route for each day
- Pins for properties (numbered)
- Pins for restaurants/activities
- Shareable link

#### 8.4.3 Calendar Export (.ics)
- Each viewing as calendar event
- Addresses in location field
- Notes with property score/details

---

## 9. Technical Implementation Notes

### 9.1 Key Technologies
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Railway)
- **AI Models**: 
  - Primary: Claude 3.5 Sonnet
  - Quality Review: GPT-4 or Gemini Pro
- **PDF Generation**: jsPDF or Puppeteer
- **Mapping**: Google Maps API
- **Activity Data**: Google Places API, Yelp API

### 9.2 Database Tables

#### 9.2.1 property_analyses
```sql
CREATE TABLE property_analyses (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  zpid VARCHAR(50) NOT NULL,
  zillow_url TEXT NOT NULL,
  property_type VARCHAR(20) NOT NULL, -- 'primary' | 'rental'
  analysis_date TIMESTAMP DEFAULT NOW(),
  
  -- Scraped data
  property_data JSONB NOT NULL,
  
  -- Analysis stages
  primary_analysis JSONB NOT NULL,
  quality_review JSONB NOT NULL,
  final_validation JSONB NOT NULL,
  
  -- Results
  final_score INTEGER NOT NULL,
  final_recommendation VARCHAR(20) NOT NULL,
  
  -- Report
  report_generated TIMESTAMP,
  report_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_analyses ON property_analyses(user_id, analysis_date DESC);
CREATE INDEX idx_score ON property_analyses(final_score DESC);
```

#### 9.2.2 trip_itineraries
```sql
CREATE TABLE trip_itineraries (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  trip_name VARCHAR(255),
  trip_days INTEGER NOT NULL,
  property_ids UUID[] NOT NULL, -- Array of property_analysis IDs
  
  -- Activities selected
  activities JSONB NOT NULL, -- {restaurants: true, hikes: true, ...}
  
  -- Generated itinerary
  itinerary_data JSONB NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9.3 API Endpoints

```
POST /api/real-estate/analyze
├─ Body: { urls: string[], propertyType: 'primary' | 'rental' | 'both' }
└─ Returns: Analysis batch ID, WebSocket connection for progress

GET /api/real-estate/analysis/:batchId
├─ Returns: Current status and results
└─ Used for polling if WebSocket unavailable

GET /api/real-estate/analysis/:id
└─ Returns: Full analysis data for single property

POST /api/real-estate/report/pdf
├─ Body: { propertyIds: string[] }
└─ Returns: PDF blob

POST /api/real-estate/itinerary/generate
├─ Body: { propertyIds: string[], days: number, activities: {...} }
└─ Returns: Generated itinerary

GET /api/real-estate/stats
└─ Returns: Dashboard stats (total analyzed, avg score, etc.)
```

---

## 10. Success Metrics

### 10.1 User Experience
- Time to complete analysis: < 5 minutes for 10 properties
- Itinerary generation time: < 30 seconds
- User satisfaction with recommendations: > 85%
- PDF report generation: < 10 seconds

### 10.2 Analysis Quality
- Three-model agreement rate: > 90%
- User feedback on accuracy: > 4.5/5 stars
- Properties purchased that met criteria: Tracked
- Properties avoided that didn't meet criteria: Tracked

### 10.3 Feature Usage
- % of users using itinerary generator: Track
- Average properties analyzed per session: Track
- PDF downloads per analysis: Track
- Return user rate: > 60%

---

## 11. Future Enhancements (Post-V1)

### 11.1 Phase 2 Features
- **Comparative Analysis**: Side-by-side property comparison view
- **Market Trends**: Historical price data and predictions
- **Financing Calculator**: Integrated mortgage calculator with scenarios
- **Neighborhood Deep Dive**: School ratings, crime stats, demographics

### 11.2 Phase 3 Features
- **Mobile App**: Native iOS/Android apps
- **Saved Searches**: Automatic alerts for new listings meeting criteria
- **Agent Integration**: Connect with real estate agents in target areas
- **Investment Portfolio**: Track purchased properties over time

### 11.3 Advanced AI Features
- **Predictive Modeling**: ML model for appreciation predictions
- **Image Analysis**: AI analysis of property photos for condition assessment
- **Voice Analysis**: Property viewing notes via voice recording
- **Market Sentiment**: Social media and news analysis for area trends

---

## 12. Open Questions / Decisions Needed

1. **WebSocket vs Polling**: Real-time updates during analysis - WebSocket preferred but fallback needed?
2. **PDF Library**: jsPDF vs Puppeteer vs PDFKit - performance vs features tradeoff
3. **Maps Provider**: Google Maps (paid, reliable) vs Mapbox (flexible, cheaper)?
4. **Activity Data Sources**: Google Places + Yelp, or also TripAdvisor?
5. **Caching Strategy**: Cache scraped property data for how long?
6. **Rate Limiting**: How many analyses per user per day?
7. **Image Storage**: Store property images in our DB or hotlink to Zillow?
8. **Multi-user Access**: Collaboration features for couples/partners?

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-29 | Christian | Initial specification |

