# API Reference
*Complete interface documentation for Universal AI Agent Team*

## Core Classes

### **UniversalAgentTeam**

Main orchestrator class for the Universal AI Agent Team platform.

```typescript
class UniversalAgentTeam {
  // Configuration
  configure(config: SystemConfig): Promise<void>;
  configureDomain(domain: string, config: DomainConfig): Promise<void>;
  configureFeedback(config: FeedbackConfig): Promise<void>;
  
  // Domain Management
  loadDomain(domainName: string): Promise<DomainModule>;
  registerDomainModule(module: DomainModule): Promise<void>;
  listAvailableModules(): Promise<ModuleInfo[]>;
  getModuleRequirements(domainName: string): Promise<ModuleRequirements>;
  
  // Analysis Execution
  executeAnalysis(request: AnalysisRequest): Promise<AnalysisResult>;
  validateQuality(content: any, options?: QualityOptions): Promise<QualityReport>;
  
  // Template and Document Management
  createTemplateWithFeedback(options: TemplateOptions): Promise<RefinedTemplate>;
  generateDeliverable(template: Template, data: any): Promise<Document>;
  
  // User Feedback Integration
  requestUserFeedback(presentation: ReviewPresentation): Promise<UserFeedbackResult>;
  applyUserFeedback(content: any, feedback: UserFeedbackResult): Promise<any>;
}
```

#### **Methods**

##### `configure(config: SystemConfig): Promise<void>`

Configure the overall system settings.

**Parameters:**
- `config: SystemConfig` - System-wide configuration options

**Example:**
```typescript
await agentTeam.configure({
  aiModels: {
    primary: 'claude-3-sonnet',
    secondary: 'gpt-4'
  },
  quality: {
    threshold: 85,
    dualModelValidation: true
  },
  feedback: {
    frequency: 'standard',
    iterationLimit: 5
  }
});
```

##### `executeAnalysis(request: AnalysisRequest): Promise<AnalysisResult>`

Execute a complete analysis using the Universal Methodology Engine.

**Parameters:**
- `request: AnalysisRequest` - Analysis request specification

**Returns:**
- `Promise<AnalysisResult>` - Complete analysis results with deliverables

**Example:**
```typescript
const result = await agentTeam.executeAnalysis({
  domain: 'real-estate-analysis',
  userRequest: 'Analyze rental properties in Phoenix, AZ with $400k budget',
  deliverableRequirements: [
    { type: 'executive-summary', format: 'pdf' },
    { type: 'detailed-analysis', format: 'markdown' }
  ],
  qualityThreshold: 85
});
```

---

## Type Definitions

### **SystemConfig**

```typescript
interface SystemConfig {
  aiModels?: AIModelConfig;
  quality?: QualityConfig;
  feedback?: FeedbackConfig;
  output?: OutputConfig;
  performance?: PerformanceConfig;
  logging?: LoggingConfig;
}

interface AIModelConfig {
  primary?: string;              // Primary AI model for analysis
  secondary?: string;            // Secondary model for validation
  qualityValidation?: string[];  // Models for quality validation
  tiebreaking?: string;         // Model for resolving disagreements
}

interface QualityConfig {
  threshold?: number;            // Minimum quality score (0-100)
  dualModelValidation?: boolean; // Enable dual-model validation
  userApprovalRequired?: boolean;// Require user approval before proceeding
  learningEnabled?: boolean;     // Enable quality learning
  blockingIssueTypes?: string[]; // Issue types that block progression
}

interface FeedbackConfig {
  frequency?: 'minimal' | 'standard' | 'frequent' | 'continuous';
  iterationLimit?: number;       // Max iterations before alternative approach
  preferenceTracking?: boolean;  // Track and adapt to user preferences
  adaptToUserStyle?: boolean;    // Adapt communication style
}
```

### **AnalysisRequest**

```typescript
interface AnalysisRequest {
  domain: string;                    // Target domain module name
  userRequest: string;               // Natural language analysis request
  deliverableRequirements?: DeliverableRequirement[];
  qualityThreshold?: number;         // Override default quality threshold
  userFeedbackEnabled?: boolean;     // Enable user feedback loops
  context?: AnalysisContext;         // Additional context for analysis
  preferences?: UserPreferences;     // User preferences and constraints
}

interface DeliverableRequirement {
  type: string;                      // Deliverable type (e.g., 'executive-summary')
  format: 'markdown' | 'pdf' | 'docx' | 'html';
  template?: string;                 // Specific template name (optional)
  customization?: TemplateCustomization;
}

interface AnalysisContext {
  domain: string;
  analysisType: string;
  urgency?: 'low' | 'medium' | 'high';
  confidentiality?: 'public' | 'internal' | 'confidential';
  audience?: string;                 // Target audience description
  constraints?: AnalysisConstraints;
}
```

### **AnalysisResult**

```typescript
interface AnalysisResult {
  status: 'completed' | 'partial' | 'failed';
  overallQuality: number;            // Overall quality score (0-100)
  deliverables: Document[];          // Generated deliverables
  qualityReport: QualityReport;      // Detailed quality assessment
  feedback: UserFeedbackHistory[];   // User feedback collected
  executionTime: number;             // Total execution time (ms)
  metadata: AnalysisMetadata;        // Analysis metadata and tracking
}

interface Document {
  id: string;
  type: string;                      // Document type
  format: string;                    // Document format
  title: string;
  content: string;                   // Document content
  metadata: DocumentMetadata;
  qualityScore: number;              // Document quality score
  userApproved: boolean;
}

interface QualityReport {
  overallScore: number;              // Overall quality score (0-100)
  dimensionScores: Record<string, number>; // Individual dimension scores
  claudeAssessment: ModelValidationResult;
  openaiAssessment: ModelValidationResult;
  consensus: ConsensusValidation;
  identifiedIssues: QualityIssue[];
  improvements: QualityImprovement[];
  canProceed: boolean;
}
```

---

## Domain Module Interface

### **DomainModule**

Interface that all domain modules must implement.

```typescript
interface DomainModule {
  // Module identification
  name: string;                      // Unique module name
  version: string;                   // Module version
  description?: string;              // Module description
  
  // Module capabilities
  capabilities: string[];            // List of supported capabilities
  qualityStandards: QualityStandard[];
  supportedTemplates: TemplateInfo[];
  
  // Lifecycle methods
  validateRequest(request: AnalysisRequest): ValidationResult;
  planExecution(request: AnalysisRequest): ExecutionPlan;
  executeAnalysis(data: DataInventory): Promise<AnalysisResult>;
  generateDeliverables(analysis: AnalysisResult): Promise<Document[]>;
  
  // Configuration and examples
  getConfigurationOptions(): ConfigOption[];
  getExampleRequests(): ExampleRequest[];
  getTemplates(): Template[];
}
```

#### **Example Implementation**

```typescript
class CustomDomainModule implements DomainModule {
  name = "custom-analysis";
  version = "1.0.0";
  capabilities = ["data-analysis", "trend-identification", "recommendations"];
  
  qualityStandards = [
    {
      name: "Data Accuracy",
      threshold: 90,
      critical: true,
      description: "All data must be verified and accurate"
    }
  ];
  
  async validateRequest(request: AnalysisRequest): Promise<ValidationResult> {
    // Validate that this module can handle the request
    return {
      canHandle: true,
      confidence: 0.95,
      recommendations: []
    };
  }
  
  async executeAnalysis(data: DataInventory): Promise<AnalysisResult> {
    // Implement domain-specific analysis logic
    return {
      findings: await this.performAnalysis(data),
      recommendations: await this.generateRecommendations(data),
      qualityMetrics: await this.assessQuality(data)
    };
  }
  
  getConfigurationOptions(): ConfigOption[] {
    return [
      {
        name: "analysis_depth",
        type: "selection",
        options: ["basic", "standard", "comprehensive"],
        default: "standard"
      }
    ];
  }
}
```

---

## User Feedback Integration

### **UserFeedbackIntegrator**

Interface for collecting and integrating user feedback.

```typescript
interface UserFeedbackIntegrator {
  // Feedback collection
  presentForReview(presentation: ReviewPresentation): Promise<UserFeedbackResult>;
  requestClarification(gaps: string[], context: any): Promise<ClarificationResult>;
  requestDataCorrection(data: any, errors: ValidationError[]): Promise<CorrectionResult>;
  
  // Template and customization
  createTemplateWithFeedback(templateType: string, data: any): Promise<RefinedTemplate>;
  requestAdditionalGuidance(gaps: QualityGap[], document: Document): Promise<GuidanceResult>;
  
  // Preference management
  updateUserPreferences(feedbackHistory: FeedbackHistory[]): Promise<UserPreferences>;
  adaptToUserStyle(content: any, preferences: UserPreferences): any;
}

interface ReviewPresentation {
  title: string;                     // Presentation title
  content: string;                   // Content to review
  context?: any;                     // Additional context
  options: string[];                 // Available options for user
  allowFreeText?: boolean;           // Allow free-text feedback
  showQualityMetrics?: boolean;      // Show quality scores
  showPreviousAttempts?: boolean;    // Show iteration history
}

interface UserFeedbackResult {
  action: string;                    // User's chosen action
  satisfaction: number;              // Satisfaction score (0-100)
  feedback?: string;                 // Free-text feedback
  requestedChanges?: ChangeRequest[];
  preferences?: UserPreferenceUpdate[];
}
```

---

## Quality Validation

### **DualModelQualityValidator**

Interface for quality validation using multiple AI models.

```typescript
interface DualModelQualityValidator {
  // Primary validation methods
  validateAnalysisQuality(analysis: AnalysisResult, requirements: RequirementsDocument): Promise<QualityReport>;
  validateDataAccuracy(data: DataInventory, context: ValidationContext): Promise<AccuracyReport>;
  validateDocumentQuality(document: Document, requirements: DeliverableRequirement): Promise<DocumentQualityReport>;
  
  // Comparative validation
  performDualModelComparison(content: any, context: ValidationContext): Promise<ComparisonResult>;
  resolveModelDisagreements(claudeResult: any, openaiResult: any, context: any): Promise<ConsensusResult>;
  
  // Quality improvement
  generateQualityImprovements(item: any, qualityGaps: QualityGap[]): Promise<ImprovementPlan>;
  applyQualityImprovements(item: any, improvements: QualityImprovement[]): Promise<any>;
}

interface QualityReport {
  overallScore: number;              // Overall quality score (0-100)
  dimensionScores: {
    completeness: number;
    accuracy: number;
    consistency: number;
    methodology: number;
    presentation: number;
  };
  claudeAssessment: ModelValidationResult;
  openaiAssessment: ModelValidationResult;
  consensus: ConsensusValidation;
  identifiedIssues: QualityIssue[];
  improvements: QualityImprovement[];
  canProceed: boolean;
  confidence: number;                // Confidence in assessment (0-100)
}
```

---

## Template System

### **TemplateGenerator**

Interface for creating and managing document templates.

```typescript
interface TemplateGenerator {
  // Template creation
  generateTemplate(templateType: string, context: any): Promise<Template>;
  createCustomTemplate(specification: TemplateSpec): Promise<Template>;
  
  // Template refinement
  refineTemplate(template: Template, feedback: UserFeedbackResult): Promise<Template>;
  applyTemplateStyle(template: Template, style: TemplateStyle): Promise<Template>;
  
  // Template management
  saveTemplate(template: Template): Promise<string>;
  loadTemplate(templateId: string): Promise<Template>;
  listTemplates(domain?: string): Promise<TemplateInfo[]>;
}

interface Template {
  id: string;
  name: string;
  type: string;
  domain: string;
  version: string;
  sections: TemplateSection[];
  formatting: TemplateFormatting;
  metadata: TemplateMetadata;
}

interface TemplateSection {
  id: string;
  title: string;
  content?: string;
  subsections?: TemplateSection[];
  required: boolean;
  placeholder?: string;
  formatting?: SectionFormatting;
}
```

---

## Error Handling

### **Custom Exceptions**

```typescript
class QualityGateError extends Error {
  constructor(
    message: string,
    public qualityScore: number,
    public requiredScore: number,
    public issues: QualityIssue[]
  ) {
    super(message);
    this.name = 'QualityGateError';
  }
}

class ModuleNotFoundError extends Error {
  constructor(
    public moduleName: string,
    public availableModules: string[]
  ) {
    super(`Domain module '${moduleName}' not found`);
    this.name = 'ModuleNotFoundError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public validationType: string,
    public validationDetails: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class FeedbackTimeoutError extends Error {
  constructor(
    message: string,
    public timeoutDuration: number,
    public presentationId: string
  ) {
    super(message);
    this.name = 'FeedbackTimeoutError';
  }
}
```

### **Error Handling Example**

```typescript
try {
  const result = await agentTeam.executeAnalysis(request);
  console.log('Analysis completed successfully');
} catch (error) {
  if (error instanceof QualityGateError) {
    console.log(`Quality threshold not met: ${error.qualityScore}/${error.requiredScore}`);
    console.log('Issues found:', error.issues);
    
    // Option to proceed with lower quality or improve
    const userChoice = await getUserChoice(['improve', 'proceed', 'cancel']);
    
    if (userChoice === 'improve') {
      const improvements = await agentTeam.generateQualityImprovements(error.issues);
      // Apply improvements and retry...
    }
    
  } else if (error instanceof ModuleNotFoundError) {
    console.log(`Module ${error.moduleName} not available`);
    console.log('Available modules:', error.availableModules);
    
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

---

## Configuration Examples

### **Complete Configuration Example**

```typescript
const completeConfig: SystemConfig = {
  aiModels: {
    primary: 'claude-3-sonnet',
    secondary: 'gpt-4',
    qualityValidation: ['claude-3-sonnet', 'gpt-4'],
    tiebreaking: 'claude-3-opus'
  },
  
  quality: {
    threshold: 85,
    dualModelValidation: true,
    userApprovalRequired: true,
    learningEnabled: true,
    blockingIssueTypes: [
      'data_accuracy_critical',
      'calculation_error',
      'requirement_gap_major'
    ]
  },
  
  feedback: {
    frequency: 'standard',
    iterationLimit: 5,
    preferenceTracking: true,
    adaptToUserStyle: true
  },
  
  output: {
    formats: ['markdown', 'pdf'],
    defaultTemplate: 'professional',
    customizationLevel: 'full'
  },
  
  performance: {
    parallelProcessing: true,
    maxConcurrentTasks: 3,
    cacheResults: true,
    optimizeApiCalls: true
  },
  
  logging: {
    level: 'info',
    includeQualityDetails: true,
    includeFeedbackHistory: false,
    logToFile: true
  }
};

await agentTeam.configure(completeConfig);
```

### **Domain-Specific Configuration Example**

```typescript
const realEstateConfig = {
  investmentStrategy: 'buy-and-hold',
  targetROI: 12,
  riskTolerance: 5,
  analysisDepth: 'comprehensive',
  
  // Geographic preferences
  targetRegions: ['Arizona', 'Nevada', 'Texas'],
  avoidRegions: ['California', 'New York'],
  
  // Financial constraints
  maxBudgetPerProperty: 500000,
  minCashFlow: 200,
  maxVacancyRate: 5,
  
  // Analysis features
  includeTripPlanning: true,
  portfolioOptimization: true,
  marketTrendAnalysis: true,
  
  // Quality standards
  dataAccuracyThreshold: 95,
  calculationAccuracyThreshold: 98,
  marketDataThreshold: 90
};

await agentTeam.configureDomain('real-estate-analysis', realEstateConfig);
```

---

*This API reference provides complete interface documentation for integrating with and extending the Universal AI Agent Team platform.*
