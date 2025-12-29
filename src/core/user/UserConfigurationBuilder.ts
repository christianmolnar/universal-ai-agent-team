/**
 * User Configuration Builder
 * 
 * Provides a fluent interface for building user configurations
 * with validation and helpful defaults based on your proven
 * real estate analysis requirements.
 */

import { UserConfiguration, FinancialConstraints, RealEstateRequirements, UserPreferences } from './UserConfiguration';

/**
 * Fluent builder for creating user configurations with validation
 * and intelligent defaults based on proven real estate methodology
 */
export class UserConfigurationBuilder {
  private config: UserConfiguration;
  
  constructor() {
    this.config = new UserConfiguration();
  }

  /**
   * Set financial parameters based on your requirements
   */
  withFinancials(params: {
    maxPrice: number;
    downPaymentPercent?: number;
    annualIncome: number;
    loanTermYears?: number;
  }): UserConfigurationBuilder {
    const constraints: FinancialConstraints = {
      maxPrice: params.maxPrice,
      downPaymentPercent: params.downPaymentPercent || 20, // Default 20%
      annualIncome: params.annualIncome,
      loanTermYears: params.loanTermYears || 30 // Default 30-year loan
    };
    
    this.config.setFinancialConstraints(constraints);
    return this;
  }

  /**
   * Set real estate requirements based on your proven criteria
   */
  withRealEstateNeeds(params: {
    minGarageSpaces: number;
    requiresCasita: boolean;
    maxCommuteMiles?: number;
    minLotSizeSqFt?: number;
    minSchoolRating?: number;
    dealBreakers?: string[];
  }): UserConfigurationBuilder {
    const requirements: RealEstateRequirements = {
      minGarageSpaces: params.minGarageSpaces,
      requiresCasita: params.requiresCasita,
      maxCommuteMiles: params.maxCommuteMiles || 30, // Default 30 miles
      minLotSizeSqFt: params.minLotSizeSqFt,
      minSchoolRating: params.minSchoolRating || 7, // Default good school rating
      dealBreakers: params.dealBreakers || []
    };

    this.config.setRealEstateRequirements(requirements);
    return this;
  }

  /**
   * Set user preferences for analysis style and notifications
   */
  withPreferences(params: {
    userName?: string;
    analysisStyle?: 'detailed' | 'concise' | 'executive';
    qualityThreshold?: number;
    notifications?: {
      lowQualityAlert?: boolean;
      newOpportunityAlert?: boolean;
      priceChangeAlert?: boolean;
    };
  }): UserConfigurationBuilder {
    const preferences: Partial<UserPreferences> = {
      userName: params.userName,
      analysisStyle: params.analysisStyle || 'detailed',
      qualityThreshold: params.qualityThreshold || 85,
      notifications: {
        lowQualityAlert: params.notifications?.lowQualityAlert ?? true,
        newOpportunityAlert: params.notifications?.newOpportunityAlert ?? true,
        priceChangeAlert: params.notifications?.priceChangeAlert ?? false
      }
    };

    this.config.setUserPreferences(preferences);
    return this;
  }

  /**
   * Set custom scoring weights if you want to emphasize certain criteria
   */
  withCustomWeights(weights: {
    dataAccuracy?: number;
    logicalConsistency?: number;
    actionability?: number;
    analysisCompleteness?: number;
    presentation?: number;
  }): UserConfigurationBuilder {
    this.config.setUserPreferences({
      customWeights: weights
    });
    return this;
  }

  /**
   * Create configuration optimized for your proven real estate criteria
   */
  static createChristianMolnarProfile(): UserConfigurationBuilder {
    return new UserConfigurationBuilder()
      .withFinancials({
        maxPrice: 900000,          // Based on your successful $875K purchase
        downPaymentPercent: 20,    // Standard 20% down
        annualIncome: 200000       // Estimated based on purchase capacity
      })
      .withRealEstateNeeds({
        minGarageSpaces: 3,        // Critical requirement from your analysis
        requiresCasita: true,      // Key differentiator in your scoring
        maxCommuteMiles: 30,       // Reasonable commute tolerance
        minLotSizeSqFt: 8000,     // Prefer larger lots
        minSchoolRating: 8,       // High-quality schools important
        dealBreakers: [
          'No garage',
          'Major structural issues',
          'Poor neighborhood',
          'Flood zone'
        ]
      })
      .withPreferences({
        userName: 'Christian',
        analysisStyle: 'detailed',  // Comprehensive analysis preferred
        qualityThreshold: 85,      // Maintain high standards
        notifications: {
          lowQualityAlert: true,    // Alert on sub-standard analysis
          newOpportunityAlert: true, // Alert on new properties
          priceChangeAlert: true    // Track price changes
        }
      });
  }

  /**
   * Create a quick starter configuration
   */
  static createQuickStarter(
    maxPrice: number,
    annualIncome: number,
    minGarageSpaces: number,
    requiresCasita: boolean = false
  ): UserConfigurationBuilder {
    return new UserConfigurationBuilder()
      .withFinancials({
        maxPrice,
        annualIncome
      })
      .withRealEstateNeeds({
        minGarageSpaces,
        requiresCasita
      });
  }

  /**
   * Validate and build the configuration
   */
  build(): UserConfiguration {
    const profile = this.config.getProfile();
    
    if (!profile.isComplete) {
      const missing = [];
      if (!profile.financial?.maxPrice) missing.push('maximum price');
      if (!profile.financial?.annualIncome) missing.push('annual income');
      if (profile.realEstate?.minGarageSpaces === undefined) missing.push('garage requirements');
      
      throw new Error(`Incomplete configuration. Missing: ${missing.join(', ')}`);
    }

    return this.config;
  }

  /**
   * Get current configuration status
   */
  getStatus(): {
    isComplete: boolean;
    missingItems: string[];
    readyForAnalysis: boolean;
  } {
    const profile = this.config.getProfile();
    const missingItems: string[] = [];

    if (!profile.financial?.maxPrice) missingItems.push('Maximum price');
    if (!profile.financial?.annualIncome) missingItems.push('Annual income');
    if (profile.realEstate?.minGarageSpaces === undefined) missingItems.push('Garage requirements');
    if (profile.realEstate?.requiresCasita === undefined) missingItems.push('Casita preference');

    return {
      isComplete: profile.isComplete,
      missingItems,
      readyForAnalysis: missingItems.length === 0
    };
  }

  /**
   * Preview the configuration that will be built
   */
  preview(): {
    financial?: FinancialConstraints;
    realEstate?: RealEstateRequirements;
    preferences: UserPreferences;
    affordabilityAnalysis?: {
      maxAffordablePrice: number;
      estimatedMonthlyPayment: number;
      downPaymentRequired: number;
    };
  } {
    const profile = this.config.getProfile();
    let affordabilityAnalysis;

    if (profile.financial) {
      const downPaymentRequired = profile.financial.maxPrice * (profile.financial.downPaymentPercent / 100);
      const loanAmount = profile.financial.maxPrice - downPaymentRequired;
      
      // Estimate monthly payment (principal + interest at ~7% rate)
      const monthlyRate = 0.07 / 12;
      const numPayments = (profile.financial.loanTermYears || 30) * 12;
      const estimatedMonthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                    (Math.pow(1 + monthlyRate, numPayments) - 1);

      // Calculate max affordable price based on income
      const monthlyIncome = profile.financial.annualIncome / 12;
      const maxHousingPayment = monthlyIncome * 0.28; // 28% debt-to-income ratio
      const maxLoanPayment = maxHousingPayment * 0.8; // Account for taxes/insurance
      const maxLoanAmount = maxLoanPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                           (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
      const maxAffordablePrice = maxLoanAmount + (maxLoanAmount * (profile.financial.downPaymentPercent / 100));

      affordabilityAnalysis = {
        maxAffordablePrice: Math.round(maxAffordablePrice),
        estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment),
        downPaymentRequired: Math.round(downPaymentRequired)
      };
    }

    return {
      financial: profile.financial,
      realEstate: profile.realEstate,
      preferences: profile.preferences,
      affordabilityAnalysis
    };
  }
}
