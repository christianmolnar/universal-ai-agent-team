# Example Configurations and Usage Patterns
*Real-world examples for different use cases and scenarios*

## Real Estate Investment Analysis Examples

### **Basic Rental Property Analysis**

```typescript
import { UniversalAgentTeam } from '../src/core/UniversalAgentTeam';

async function basicRentalAnalysis() {
  const agentTeam = new UniversalAgentTeam();
  
  // Load and configure real estate module
  await agentTeam.loadDomain('real-estate-analysis');
  await agentTeam.configureDomain('real-estate-analysis', {
    investmentStrategy: 'buy-and-hold',
    targetROI: 10,
    riskTolerance: 6,
    analysisDepth: 'standard',
    includeTripPlanning: false
  });
  
  const result = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: `
      I'm looking for rental properties in Tampa, Florida with a budget 
      of $200,000-$350,000 per property. I want positive cash flow properties 
      suitable for buy-and-hold investment. Please analyze the top 5 
      opportunities with detailed financial analysis.
    `,
    deliverableRequirements: [
      { type: 'executive-summary', format: 'pdf' },
      { type: 'property-analysis-report', format: 'markdown' }
    ]
  });
  
  return result;
}
```

### **Comprehensive Portfolio Analysis with Trip Planning**

```typescript
async function comprehensivePortfolioAnalysis() {
  const agentTeam = new UniversalAgentTeam();
  
  // Advanced configuration for comprehensive analysis
  await agentTeam.configure({
    quality: { threshold: 90 }, // Higher quality for large investment
    feedback: { frequency: 'frequent' }, // More user interaction
    aiModels: { 
      primary: 'claude-3-opus', // Best model for important analysis
      qualityValidation: ['claude-3-opus', 'gpt-4']
    }
  });
  
  await agentTeam.loadDomain('real-estate-analysis');
  await agentTeam.configureDomain('real-estate-analysis', {
    investmentStrategy: 'buy-and-hold',
    targetROI: 15,
    riskTolerance: 4,
    analysisDepth: 'comprehensive',
    includeTripPlanning: true,
    portfolioOptimization: true,
    
    // Geographic targeting
    targetRegions: ['Arizona', 'Nevada', 'Texas'],
    avoidRegions: ['California', 'New York'],
    
    // Financial constraints
    maxBudgetPerProperty: 600000,
    minCashFlow: 300,
    maxVacancyRate: 4,
    
    // Portfolio optimization
    maxPropertiesPerMarket: 3,
    diversificationRequirement: true,
    riskSpreadStrategy: 'moderate'
  });
  
  const result = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: `
      I have $2.4M to invest in a diversified rental property portfolio. 
      I want 4-6 properties across different markets in the Southwest US. 
      Focus on cash-flowing properties with appreciation potential. 
      Include comprehensive market analysis, trip planning for property 
      inspections, and portfolio optimization recommendations.
    `,
    deliverableRequirements: [
      { type: 'executive-summary', format: 'pdf' },
      { type: 'detailed-portfolio-analysis', format: 'markdown' },
      { type: 'trip-planning-guide', format: 'pdf' },
      { type: 'financial-model-spreadsheet', format: 'excel' }
    ],
    qualityThreshold: 90
  });
  
  return result;
}
```

### **BRRRR Strategy Analysis**

```typescript
async function brrrrStrategyAnalysis() {
  const agentTeam = new UniversalAgentTeam();
  
  await agentTeam.loadDomain('real-estate-analysis');
  await agentTeam.configureDomain('real-estate-analysis', {
    investmentStrategy: 'BRRRR', // Buy, Rehab, Rent, Refinance, Repeat
    targetROI: 25, // Higher ROI expectation for BRRRR
    riskTolerance: 8, // Higher risk tolerance
    analysisDepth: 'comprehensive',
    
    // BRRRR-specific settings
    maxRehabCostPercentage: 30,
    minAfterRepairValue: 150000,
    refinanceThreshold: 75, // 75% LTV for refinance
    
    // Focus on distressed properties
    propertyConditions: ['needs-work', 'distressed', 'fixer-upper'],
    includeRehabEstimation: true,
    includeContractorNetworking: true
  });
  
  const result = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: `
      I want to implement a BRRRR strategy in Memphis, Tennessee with 
      $100,000 initial capital. Find properties that need work but have 
      good bones, analyze rehab costs, rental potential, and refinance 
      opportunities. I need properties where I can force appreciation 
      through improvements.
    `,
    deliverableRequirements: [
      { type: 'brrrr-analysis-report', format: 'pdf' },
      { type: 'rehab-cost-breakdown', format: 'markdown' },
      { type: 'contractor-networking-guide', format: 'pdf' }
    ]
  });
  
  return result;
}
```

## Business Analysis Examples

### **SaaS Market Opportunity Analysis**

```typescript
// First, create a business analysis domain module
class BusinessAnalysisModule implements DomainModule {
  name = "business-analysis";
  version = "1.0.0";
  capabilities = [
    "market-sizing",
    "competitive-analysis", 
    "financial-modeling",
    "go-to-market-strategy",
    "risk-assessment"
  ];
  
  async executeAnalysis(data: DataInventory): Promise<AnalysisResult> {
    return {
      marketSize: await this.calculateMarketSize(data),
      competitiveLandscape: await this.analyzeCompetitors(data),
      financialProjections: await this.modelFinancials(data),
      goToMarketStrategy: await this.developStrategy(data),
      riskAssessment: await this.assessRisks(data)
    };
  }
  
  // ... implement other required methods
}

async function saasMarketAnalysis() {
  const agentTeam = new UniversalAgentTeam();
  
  // Register the business analysis module
  const businessModule = new BusinessAnalysisModule();
  await agentTeam.registerDomainModule(businessModule);
  
  await agentTeam.configureDomain('business-analysis', {
    analysisScope: 'comprehensive',
    marketFocus: 'B2B-SaaS',
    competitiveDepth: 'detailed',
    financialTimeframe: '5-years',
    riskTolerance: 'moderate'
  });
  
  const result = await agentTeam.executeAnalysis({
    domain: 'business-analysis',
    userRequest: `
      Analyze the market opportunity for a B2B project management SaaS 
      targeting small to medium businesses (10-100 employees). The product 
      focuses on simple, intuitive project tracking with time management 
      features. Pricing model is subscription-based ($10-50/user/month). 
      Analyze market size, competition, go-to-market strategy, and 5-year 
      financial projections.
    `,
    deliverableRequirements: [
      { type: 'market-analysis-report', format: 'pdf' },
      { type: 'competitive-landscape', format: 'markdown' },
      { type: 'financial-model', format: 'excel' },
      { type: 'go-to-market-strategy', format: 'pdf' }
    ]
  });
  
  return result;
}
```

### **Product Launch Strategy**

```typescript
async function productLaunchStrategy() {
  const agentTeam = new UniversalAgentTeam();
  await agentTeam.loadDomain('business-analysis');
  
  await agentTeam.configureDomain('business-analysis', {
    analysisScope: 'launch-focused',
    timeframe: '18-months',
    marketingChannelFocus: ['digital', 'content', 'partnerships'],
    budgetConstraints: {
      marketing: 500000,
      development: 200000,
      operations: 100000
    }
  });
  
  const result = await agentTeam.executeAnalysis({
    domain: 'business-analysis',
    userRequest: `
      We're launching a mobile app for personal finance management 
      targeting millennials aged 25-40. The app uses AI to provide 
      personalized budgeting advice and investment recommendations. 
      We have $800K budget for the first 18 months. Develop a 
      comprehensive launch strategy including market positioning, 
      marketing channels, partnership opportunities, and success metrics.
    `,
    deliverableRequirements: [
      { type: 'launch-strategy-plan', format: 'pdf' },
      { type: 'marketing-channel-analysis', format: 'markdown' },
      { type: 'partnership-strategy', format: 'pdf' },
      { type: 'success-metrics-framework', format: 'markdown' }
    ]
  });
  
  return result;
}
```

## Custom Template Examples

### **Interactive Template Creation**

```typescript
async function createCustomAnalysisTemplate() {
  const agentTeam = new UniversalAgentTeam();
  
  // Enable extensive user feedback for template creation
  await agentTeam.configureFeedback({
    frequency: 'continuous',
    iterationLimit: 10, // Allow many iterations for perfect template
    preferenceTracking: true
  });
  
  // Create a custom template with user feedback
  const customTemplate = await agentTeam.createTemplateWithFeedback({
    templateType: 'investment-decision-framework',
    initialData: {
      industry: 'real-estate',
      analysisType: 'investment-evaluation',
      audience: 'executive-summary',
      decisionCriteria: ['ROI', 'risk', 'timeline', 'market-conditions']
    },
    userPreferences: {
      style: 'executive',
      detailLevel: 'high',
      visualizations: true,
      actionOriented: true
    }
  });
  
  // Use the refined template for analysis
  const analysis = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: 'Evaluate this $1.2M commercial property investment opportunity',
    deliverableRequirements: [{
      type: 'investment-decision-framework',
      format: 'pdf',
      template: customTemplate.template.id
    }]
  });
  
  return { customTemplate, analysis };
}
```

### **Domain-Specific Template Library**

```typescript
async function buildTemplateLibrary() {
  const agentTeam = new UniversalAgentTeam();
  
  const templates = [];
  
  // Executive summary template
  const executiveSummaryTemplate = await agentTeam.createTemplateWithFeedback({
    templateType: 'executive-summary',
    initialData: {
      format: 'one-page',
      sections: ['overview', 'key-findings', 'recommendations', 'next-steps'],
      visualizations: ['key-metrics-dashboard', 'recommendation-matrix']
    }
  });
  templates.push(executiveSummaryTemplate);
  
  // Detailed analysis template
  const detailedAnalysisTemplate = await agentTeam.createTemplateWithFeedback({
    templateType: 'detailed-analysis',
    initialData: {
      format: 'comprehensive-report',
      sections: [
        'methodology',
        'data-analysis', 
        'findings',
        'risk-assessment',
        'scenarios',
        'recommendations',
        'implementation-plan'
      ],
      appendices: ['data-sources', 'calculations', 'assumptions']
    }
  });
  templates.push(detailedAnalysisTemplate);
  
  // Trip planning template
  const tripPlanningTemplate = await agentTeam.createTemplateWithFeedback({
    templateType: 'trip-planning-guide',
    initialData: {
      format: 'practical-guide',
      sections: [
        'itinerary',
        'property-visit-schedule',
        'logistics',
        'inspection-checklist',
        'contact-information',
        'contingency-plans'
      ]
    }
  });
  templates.push(tripPlanningTemplate);
  
  return templates;
}
```

## Quality Validation Examples

### **Custom Quality Standards**

```typescript
async function setCustomQualityStandards() {
  const agentTeam = new UniversalAgentTeam();
  
  // Define strict quality standards for high-stakes analysis
  await agentTeam.configure({
    quality: {
      threshold: 92, // Higher than default 85
      dualModelValidation: true,
      userApprovalRequired: true,
      
      // Custom dimension weights
      dimensionWeights: {
        accuracy: 0.3,      // 30% weight on accuracy
        completeness: 0.25,  // 25% weight on completeness
        consistency: 0.2,    // 20% weight on consistency
        methodology: 0.15,   // 15% weight on methodology
        presentation: 0.1    // 10% weight on presentation
      },
      
      // Critical thresholds that cannot be below certain values
      criticalThresholds: {
        accuracy: 95,        // Must have 95+ accuracy
        completeness: 90,    // Must have 90+ completeness
        dataValidation: 98   // Must have 98+ data validation
      },
      
      // Domain-specific standards
      domainStandards: {
        'real-estate-analysis': {
          financialAccuracy: 99,     // 99% for financial calculations
          propertyDataAccuracy: 96,  // 96% for property information
          marketDataRecency: 30      // Market data must be < 30 days old
        }
      }
    }
  });
  
  const result = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: 'High-stakes $5M portfolio analysis requiring maximum accuracy',
    qualityThreshold: 95 // Even higher for this specific analysis
  });
  
  return result;
}
```

### **Quality Issue Resolution Workflow**

```typescript
async function qualityIssueResolutionWorkflow() {
  const agentTeam = new UniversalAgentTeam();
  
  try {
    const result = await agentTeam.executeAnalysis({
      domain: 'real-estate-analysis',
      userRequest: 'Analyze rental properties in Austin, TX',
      qualityThreshold: 88
    });
    
    return result;
    
  } catch (error) {
    if (error instanceof QualityGateError) {
      console.log(`Quality gate failed: ${error.qualityScore}/100`);
      console.log('Issues found:', error.issues);
      
      // Generate improvement plan
      const improvementPlan = await agentTeam.generateQualityImprovements(
        error.issues
      );
      
      // Present options to user
      const userChoice = await agentTeam.requestUserFeedback({
        title: 'Quality Issues Detected',
        content: `
          Analysis quality score: ${error.qualityScore}/100
          Required minimum: ${error.requiredScore}/100
          
          Issues identified:
          ${error.issues.map(issue => `- ${issue.description}`).join('\n')}
        `,
        options: [
          'Apply Automatic Improvements',
          'Review and Fix Manually', 
          'Lower Quality Threshold',
          'Start Over with Different Approach',
          'Cancel Analysis'
        ]
      });
      
      switch (userChoice.action) {
        case 'apply_automatic':
          const improvedAnalysis = await agentTeam.applyQualityImprovements(
            improvementPlan
          );
          return improvedAnalysis;
          
        case 'review_manual':
          // Guide user through manual fixes
          const manualFixes = await agentTeam.requestUserFeedback({
            title: 'Manual Quality Review',
            content: improvementPlan.detailedRecommendations,
            allowFreeText: true
          });
          
          const manuallyImproved = await agentTeam.applyUserFeedback(
            manualFixes
          );
          return manuallyImproved;
          
        case 'lower_threshold':
          // Retry with lower threshold but inform user of risks
          const loweredResult = await agentTeam.executeAnalysis({
            domain: 'real-estate-analysis',
            userRequest: 'Analyze rental properties in Austin, TX',
            qualityThreshold: Math.max(75, error.qualityScore + 5)
          });
          return loweredResult;
          
        default:
          throw new Error('Analysis cancelled by user due to quality issues');
      }
    }
    
    throw error; // Re-throw other types of errors
  }
}
```

## Advanced Configuration Examples

### **Multi-Domain Analysis**

```typescript
async function multiDomainAnalysis() {
  const agentTeam = new UniversalAgentTeam();
  
  // Load multiple domain modules
  await agentTeam.loadDomain('real-estate-analysis');
  await agentTeam.loadDomain('business-analysis');
  
  // Configure cross-domain analysis
  await agentTeam.configure({
    crossDomainIntegration: true,
    synthesizeFindings: true,
    conflictResolution: 'user-guided'
  });
  
  // Real estate analysis for the business location
  const realEstateAnalysis = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: `
      Analyze commercial real estate opportunities in Austin, TX for 
      establishing a tech startup office. Need 5,000-10,000 sq ft, 
      3-year lease term, budget $25-40/sq ft annually.
    `
  });
  
  // Business market analysis for the same location
  const businessAnalysis = await agentTeam.executeAnalysis({
    domain: 'business-analysis',
    userRequest: `
      Analyze Austin, TX as a location for a B2B SaaS startup. 
      Consider talent availability, cost of operations, market access, 
      funding ecosystem, and competitive landscape.
    `
  });
  
  // Synthesize findings from both analyses
  const synthesizedAnalysis = await agentTeam.synthesizeMultiDomainFindings([
    realEstateAnalysis,
    businessAnalysis
  ], {
    synthesisObjective: 'location-decision-support',
    decisionCriteria: ['cost-effectiveness', 'growth-potential', 'risk-mitigation']
  });
  
  return synthesizedAnalysis;
}
```

### **Performance Optimization Configuration**

```typescript
async function performanceOptimizedConfiguration() {
  const agentTeam = new UniversalAgentTeam();
  
  // Configure for maximum performance
  await agentTeam.configure({
    performance: {
      parallelProcessing: true,
      maxConcurrentTasks: 5,
      cacheResults: true,
      optimizeApiCalls: true,
      
      // Intelligent model selection based on task complexity
      adaptiveModelSelection: true,
      fastModelsForSimpleTasks: true,
      
      // Batch processing for similar tasks
      batchProcessing: true,
      batchSize: 10,
      
      // Result streaming for large analyses
      streamResults: true,
      progressUpdates: true
    },
    
    // Use faster models where appropriate
    aiModels: {
      dataCollection: 'claude-3-haiku',     // Fast for data gathering
      initialAnalysis: 'claude-3-sonnet',   // Balanced for analysis
      qualityValidation: 'claude-3-sonnet', // Good for validation
      finalReview: 'claude-3-opus',         // Best for final quality
      
      // Fallback models
      fallbackModels: {
        'claude-3-opus': 'claude-3-sonnet',
        'claude-3-sonnet': 'gpt-4',
        'gpt-4': 'claude-3-haiku'
      }
    },
    
    // Quality optimization
    quality: {
      threshold: 85,
      earlyQualityChecks: true,    // Catch issues early
      progressiveValidation: true, // Validate incrementally
      adaptiveThresholds: true     // Adjust based on complexity
    }
  });
  
  // Large-scale analysis with progress tracking
  const result = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: 'Analyze 50+ rental properties across 5 markets in Texas',
    progressCallback: (progress) => {
      console.log(`Analysis progress: ${progress.percentComplete}%`);
      console.log(`Current stage: ${progress.currentStage}`);
      console.log(`ETA: ${progress.estimatedTimeRemaining} minutes`);
    }
  });
  
  return result;
}
```

### **Enterprise Configuration**

```typescript
async function enterpriseConfiguration() {
  const agentTeam = new UniversalAgentTeam();
  
  // Enterprise-grade configuration
  await agentTeam.configure({
    // Security and compliance
    security: {
      encryptData: true,
      auditTrail: true,
      accessControl: 'role-based',
      dataRetention: '7-years',
      complianceMode: 'SOX-compliant'
    },
    
    // Multi-user support
    collaboration: {
      multiUserFeedback: true,
      roleBasedAccess: true,
      approvalWorkflows: true,
      versionControl: true,
      conflictResolution: 'hierarchical'
    },
    
    // Integration capabilities
    integration: {
      apiEndpoints: true,
      webhooks: true,
      ssoAuthentication: true,
      externalDataSources: ['salesforce', 'dynamics', 'custom-api'],
      documentManagement: 'sharepoint'
    },
    
    // Scalability
    scalability: {
      distributedProcessing: true,
      loadBalancing: true,
      autoScaling: true,
      resourceMonitoring: true
    },
    
    // Advanced analytics
    analytics: {
      usageTracking: true,
      performanceMetrics: true,
      qualityTrends: true,
      userSatisfactionAnalytics: true,
      predictionModeling: true
    }
  });
  
  // Role-based access example
  const executiveUser = await agentTeam.createUser({
    role: 'executive',
    permissions: ['view-all', 'approve-high-value', 'configure-quality'],
    qualityThreshold: 90
  });
  
  const analystUser = await agentTeam.createUser({
    role: 'analyst', 
    permissions: ['execute-analysis', 'view-assigned', 'request-approval'],
    qualityThreshold: 85
  });
  
  // Execute analysis with approval workflow
  const result = await agentTeam.executeAnalysis({
    domain: 'real-estate-analysis',
    userRequest: '$10M portfolio acquisition analysis',
    requestedBy: analystUser,
    approvalRequired: true,
    approver: executiveUser,
    complianceChecks: ['risk-assessment', 'regulatory-compliance']
  });
  
  return result;
}
```

---

*These examples demonstrate the flexibility and power of the Universal AI Agent Team platform across different domains, quality requirements, and organizational needs.*
