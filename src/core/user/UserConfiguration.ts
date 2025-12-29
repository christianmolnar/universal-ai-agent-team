/**
 * User Configuration System
 * 
 * Captures user-specific requirements and preferences to personalize
 * analysis scoring across all domain modules. Based on extracted
 * requirements from proven real estate methodology.
 * 
 * @example
 * ```typescript
 * const userConfig = new UserConfiguration();
 * userConfig.setFinancialConstraints({
 *   maxPrice: 900000,
 *   downPaymentPercent: 20,
 *   annualIncome: 200000
 * });
 * userConfig.setRealEstateRequirements({
 *   minGarageSpaces: 3,
 *   requiresCasita: true,
 *   maxCommuteMiles: 30
 * });
 * ```
 */

export interface FinancialConstraints {
  /** Maximum purchase price */
  maxPrice: number;
  /** Down payment percentage (0-100) */
  downPaymentPercent: number;
  /** Annual household income */
  annualIncome: number;
  /** Maximum monthly payment tolerance */
  maxMonthlyPayment?: number;
  /** Preferred loan term in years */
  loanTermYears?: number;
}

export interface RealEstateRequirements {
  /** Minimum garage spaces required */
  minGarageSpaces: number;
  /** Whether casita/guest house is required */
  requiresCasita: boolean;
  /** Maximum commute distance in miles */
  maxCommuteMiles?: number;
  /** Minimum lot size in square feet */
  minLotSizeSqFt?: number;
  /** Minimum house size in square feet */
  minHouseSizeSqFt?: number;
  /** Required school rating (1-10 scale) */
  minSchoolRating?: number;
  /** Preferred neighborhoods */
  preferredNeighborhoods?: string[];
  /** Deal breakers */
  dealBreakers?: string[];
}

export interface UserPreferences {
  /** User's name for personalization */
  userName?: string;
  /** Preferred analysis style */
  analysisStyle: 'detailed' | 'concise' | 'executive';
  /** Quality threshold override (default 85) */
  qualityThreshold?: number;
  /** Notification preferences */
  notifications: {
    lowQualityAlert: boolean;
    newOpportunityAlert: boolean;
    priceChangeAlert: boolean;
  };
  /** Custom scoring weights */
  customWeights?: {
    dataAccuracy?: number;
    logicalConsistency?: number;
    actionability?: number;
    analysisCompleteness?: number;
    presentation?: number;
  };
}

export interface DomainConfiguration {
  /** Domain-specific settings */
  realEstate?: RealEstateRequirements;
  /** Future domains can be added here */
  business?: any;
  research?: any;
}

/**
 * Comprehensive user configuration system for personalizing
 * analysis across all domain modules
 */
export class UserConfiguration {
  private financialConstraints?: FinancialConstraints;
  private domainConfig: DomainConfiguration = {};
  private userPreferences: UserPreferences = {
    analysisStyle: 'detailed',
    notifications: {
      lowQualityAlert: true,
      newOpportunityAlert: true,
      priceChangeAlert: false
    }
  };

  /**
   * Set financial constraints for analysis
   */
  setFinancialConstraints(constraints: FinancialConstraints): void {
    this.validateFinancialConstraints(constraints);
    this.financialConstraints = { ...constraints };
    
    // Auto-calculate monthly payment if not provided
    if (!constraints.maxMonthlyPayment) {
      this.financialConstraints.maxMonthlyPayment = this.calculateMaxMonthlyPayment(constraints);
    }
  }

  /**
   * Set real estate specific requirements
   */
  setRealEstateRequirements(requirements: RealEstateRequirements): void {
    this.validateRealEstateRequirements(requirements);
    this.domainConfig.realEstate = { ...requirements };
  }

  /**
   * Set user preferences
   */
  setUserPreferences(preferences: Partial<UserPreferences>): void {
    this.userPreferences = { 
      ...this.userPreferences, 
      ...preferences,
      notifications: {
        ...this.userPreferences.notifications,
        ...preferences.notifications
      }
    };

    // Validate custom weights if provided
    if (preferences.customWeights) {
      this.validateCustomWeights(preferences.customWeights);
    }
  }

  /**
   * Get financial constraints
   */
  getFinancialConstraints(): FinancialConstraints | undefined {
    return this.financialConstraints ? { ...this.financialConstraints } : undefined;
  }

  /**
   * Get real estate requirements
   */
  getRealEstateRequirements(): RealEstateRequirements | undefined {
    return this.domainConfig.realEstate ? { ...this.domainConfig.realEstate } : undefined;
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  /**
   * Get complete configuration profile
   */
  getProfile(): {
    financial?: FinancialConstraints;
    realEstate?: RealEstateRequirements;
    preferences: UserPreferences;
    isComplete: boolean;
  } {
    return {
      financial: this.getFinancialConstraints(),
      realEstate: this.getRealEstateRequirements(),
      preferences: this.getUserPreferences(),
      isComplete: this.isConfigurationComplete()
    };
  }

  /**
   * Check if configuration is complete enough for analysis
   */
  isConfigurationComplete(): boolean {
    return !!(
      this.financialConstraints?.maxPrice &&
      this.financialConstraints?.annualIncome &&
      this.domainConfig.realEstate?.minGarageSpaces !== undefined
    );
  }

  /**
   * Get scoring weight overrides if configured
   */
  getScoringWeights(): Record<string, number> | undefined {
    const customWeights = this.userPreferences.customWeights;
    if (!customWeights) return undefined;

    // Return normalized weights (ensure they sum to 1.0)
    const totalWeight = Object.values(customWeights).reduce((sum, weight) => sum + (weight || 0), 0);
    if (totalWeight === 0) return undefined;

    const normalized: Record<string, number> = {};
    Object.entries(customWeights).forEach(([key, weight]) => {
      if (weight !== undefined) {
        normalized[key] = weight / totalWeight;
      }
    });

    return normalized;
  }

  /**
   * Calculate maximum affordable monthly payment
   */
  private calculateMaxMonthlyPayment(constraints: FinancialConstraints): number {
    // Use 28% of gross monthly income as max housing payment (industry standard)
    const monthlyIncome = constraints.annualIncome / 12;
    const maxHousingPayment = monthlyIncome * 0.28;
    
    // Subtract estimated property taxes, insurance, and HOA (roughly 20% of total payment)
    return Math.round(maxHousingPayment * 0.8);
  }

  /**
   * Validate financial constraints
   */
  private validateFinancialConstraints(constraints: FinancialConstraints): void {
    if (constraints.maxPrice <= 0) {
      throw new Error('Max price must be positive');
    }
    if (constraints.downPaymentPercent < 0 || constraints.downPaymentPercent > 100) {
      throw new Error('Down payment percent must be between 0 and 100');
    }
    if (constraints.annualIncome <= 0) {
      throw new Error('Annual income must be positive');
    }
    if (constraints.loanTermYears && (constraints.loanTermYears < 10 || constraints.loanTermYears > 50)) {
      throw new Error('Loan term must be between 10 and 50 years');
    }
  }

  /**
   * Validate real estate requirements
   */
  private validateRealEstateRequirements(requirements: RealEstateRequirements): void {
    if (requirements.minGarageSpaces < 0 || requirements.minGarageSpaces > 10) {
      throw new Error('Minimum garage spaces must be between 0 and 10');
    }
    if (requirements.maxCommuteMiles && requirements.maxCommuteMiles < 0) {
      throw new Error('Maximum commute miles must be non-negative');
    }
    if (requirements.minLotSizeSqFt && requirements.minLotSizeSqFt < 0) {
      throw new Error('Minimum lot size must be non-negative');
    }
    if (requirements.minSchoolRating && (requirements.minSchoolRating < 1 || requirements.minSchoolRating > 10)) {
      throw new Error('Minimum school rating must be between 1 and 10');
    }
  }

  /**
   * Validate custom scoring weights
   */
  private validateCustomWeights(weights: Record<string, number>): void {
    const validKeys = ['dataAccuracy', 'logicalConsistency', 'actionability', 'analysisCompleteness', 'presentation'];
    
    Object.entries(weights).forEach(([key, weight]) => {
      if (!validKeys.includes(key)) {
        throw new Error(`Invalid scoring weight key: ${key}`);
      }
      if (weight < 0 || weight > 1) {
        throw new Error(`Scoring weight for ${key} must be between 0 and 1`);
      }
    });
  }

  /**
   * Export configuration for persistence
   */
  exportConfiguration(): string {
    return JSON.stringify({
      financial: this.financialConstraints,
      domain: this.domainConfig,
      preferences: this.userPreferences,
      exported: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import configuration from saved data
   */
  importConfiguration(configJson: string): void {
    try {
      const config = JSON.parse(configJson);
      
      if (config.financial) {
        this.setFinancialConstraints(config.financial);
      }
      if (config.domain?.realEstate) {
        this.setRealEstateRequirements(config.domain.realEstate);
      }
      if (config.preferences) {
        this.setUserPreferences(config.preferences);
      }
    } catch (error) {
      throw new Error(`Invalid configuration format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
