# Real Estate Module - User Configuration Requirements
*Extracted from Your Proven $2.4M Analysis Methodology*

## **YOUR CONFIRMED REQUIREMENTS**

### **🏠 PRIMARY RESIDENCE REQUIREMENTS**

#### **Physical Property Requirements**
- **Minimum garage spaces:** 3+ (absolutely required)
- **Pool requirement:** Required (must have)
- **Minimum lot size:** 0.5+ acres (your updated minimum)
- **Casita requirement:** Must-have for 85+ score (critical for your scoring)

#### **Financial Parameters**
- **Total cash available:** $696K (your case)
- **Down payment strategy:** Fixed amount approach
- **Interest rate:** Market current (7% in your analysis)
- **Maximum monthly payment:** User-defined budget limit

#### **Location Preferences (Your Arizona Case)**
- **Premium areas:** North Scottsdale, Cave Creek
- **Growth areas:** Queen Creek, Fountain Hills  
- **Acceptable areas:** Gold Canyon, Peoria
- **Commute distance weight:** 0 (you work from home)

#### **Secondary Factors**
- **HOA preference:** None preferred, low fees acceptable
- **Property age:** No specific minimum year built requirement
- **Views:** Mountain/preserve views preferred but not required
- **Horse-friendly:** Preferred but not required

### **💰 INVESTMENT PROPERTY REQUIREMENTS**

#### **Financial Requirements**
- **Down payment:** 25% (standard for investment properties)
- **Cash flow target:** User-defined (positive, break-even, or specific amount)
- **Interest rate:** Current market rate for investment properties
- **Maximum down payment:** Based on available capital

#### **Property Requirements**
- **Condition:** User preference (move-in ready vs renovation opportunity)
- **Rental type:** STR vs LTR preference
- **Location:** Market fundamentals important (job growth, schools, supply/demand)

## **QUESTIONS FOR YOU TO COMPLETE THE CONFIGURATION**

### **Missing Primary Residence Parameters**
1. **Minimum bedrooms/bathrooms:** What are your minimums?
2. **Maximum property price:** Is there a cap beyond monthly payment limits?
3. **Property age preference:** Any minimum year built requirement?
4. **Architectural style:** Any preferences or requirements?
5. **Neighborhood characteristics:** Family-friendly, equestrian, etc.?

### **Missing Investment Property Parameters**  
1. **Minimum cash flow target:** What's your default target? (+$200/month, break-even, etc.)
2. **Maximum renovation budget:** How much renovation work is acceptable?
3. **Property management:** Self-manage vs professional management preference?
4. **Tenant type:** Family rental vs corporate vs vacation rental preference?
5. **Market appreciation targets:** Minimum expected annual appreciation?

### **Universal Configuration Parameters**
1. **Risk tolerance:** Conservative, moderate, aggressive approach?
2. **Time horizon:** How long do you plan to hold investments?
3. **Portfolio diversification:** Geographic limits, property type limits?
4. **Market timing:** Buy now vs wait for better conditions strategy?

## **PROPOSED DEFAULT CONFIGURATION INTERFACE**

```typescript
interface UserConfiguration {
  // Core Requirements (Must Define)
  propertyType: 'primary-residence' | 'investment-property';
  
  // Physical Requirements
  minGarageSpaces: number;        // Default: 3 for your case
  requiresPool: boolean;          // Default: true for your case  
  minLotSizeAcres: number;        // Default: 0.5 for your case
  casitaRequirement: 'required' | 'preferred' | 'not-needed'; // Default: required
  
  // Financial Parameters
  totalCashAvailable: number;
  maxMonthlyPayment: number;
  interestRate: number;
  
  // Location Preferences (User-weighted)
  locationPreferences: {
    areaName: string;
    weight: number;  // 1-10 scale
  }[];
  
  // Secondary Factors (User-weighted)
  commuteImportance: number;      // 0-10 scale (0 for you)
  hoaPreference: 'none' | 'low' | 'acceptable' | 'no-preference';
  
  // Investment Specific (if applicable)
  cashFlowTarget?: number | 'positive' | 'break-even';
  renovationTolerance?: 'none' | 'minor' | 'major' | 'gut';
  managementPreference?: 'self' | 'professional' | 'either';
}
```

## **NEXT STEPS**

**For you to provide:**
1. Answer the missing parameters questions above
2. Confirm the proposed interface covers your needs
3. Suggest any additional requirements I missed

**For implementation:**
1. Start with simple version covering your confirmed requirements
2. Build interface that captures all necessary parameters  
3. Make system extensible for future requirement additions
4. Test against your proven examples to ensure accuracy

---

*This configuration system will ensure the scoring engine can be personalized for any user while maintaining the proven quality of your $2.4M analysis.*
