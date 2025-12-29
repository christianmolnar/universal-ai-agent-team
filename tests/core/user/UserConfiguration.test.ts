/**
 * Test Suite for User Configuration System
 * 
 * Tests user configuration management, validation, and builder patterns
 * for personalizing analysis across domain modules.
 */

import { UserConfiguration, FinancialConstraints, RealEstateRequirements } from '../../../src/core/user/UserConfiguration';
import { UserConfigurationBuilder } from '../../../src/core/user/UserConfigurationBuilder';

describe('UserConfiguration', () => {
  let userConfig: UserConfiguration;

  beforeEach(() => {
    userConfig = new UserConfiguration();
  });

  describe('Financial Constraints', () => {
    test('should set and retrieve financial constraints correctly', () => {
      const constraints: FinancialConstraints = {
        maxPrice: 900000,
        downPaymentPercent: 20,
        annualIncome: 200000,
        loanTermYears: 30
      };

      userConfig.setFinancialConstraints(constraints);
      const retrieved = userConfig.getFinancialConstraints();

      expect(retrieved).toEqual(expect.objectContaining(constraints));
      expect(retrieved?.maxMonthlyPayment).toBeGreaterThan(0); // Should auto-calculate
    });

    test('should auto-calculate monthly payment when not provided', () => {
      const constraints: FinancialConstraints = {
        maxPrice: 800000,
        downPaymentPercent: 20,
        annualIncome: 150000
      };

      userConfig.setFinancialConstraints(constraints);
      const retrieved = userConfig.getFinancialConstraints();

      // Expected: (150000/12) * 0.28 * 0.8 = ~2800
      expect(retrieved?.maxMonthlyPayment).toBeCloseTo(2800, -2);
    });

    test('should validate financial constraints', () => {
      const invalidConstraints = [
        { maxPrice: -100000, downPaymentPercent: 20, annualIncome: 100000 },
        { maxPrice: 500000, downPaymentPercent: 150, annualIncome: 100000 },
        { maxPrice: 500000, downPaymentPercent: 20, annualIncome: -50000 },
        { maxPrice: 500000, downPaymentPercent: 20, annualIncome: 100000, loanTermYears: 5 }
      ];

      invalidConstraints.forEach(constraints => {
        expect(() => userConfig.setFinancialConstraints(constraints as FinancialConstraints))
          .toThrow();
      });
    });
  });

  describe('Real Estate Requirements', () => {
    test('should set and retrieve real estate requirements correctly', () => {
      const requirements: RealEstateRequirements = {
        minGarageSpaces: 3,
        requiresCasita: true,
        maxCommuteMiles: 25,
        minLotSizeSqFt: 10000,
        minSchoolRating: 8,
        preferredNeighborhoods: ['Sammamish', 'Bellevue'],
        dealBreakers: ['No garage', 'Flood zone']
      };

      userConfig.setRealEstateRequirements(requirements);
      const retrieved = userConfig.getRealEstateRequirements();

      expect(retrieved).toEqual(requirements);
    });

    test('should validate real estate requirements', () => {
      const invalidRequirements = [
        { minGarageSpaces: -1, requiresCasita: false },
        { minGarageSpaces: 15, requiresCasita: false },
        { minGarageSpaces: 2, requiresCasita: false, maxCommuteMiles: -5 },
        { minGarageSpaces: 2, requiresCasita: false, minSchoolRating: 11 }
      ];

      invalidRequirements.forEach(requirements => {
        expect(() => userConfig.setRealEstateRequirements(requirements as RealEstateRequirements))
          .toThrow();
      });
    });
  });

  describe('User Preferences', () => {
    test('should set and merge user preferences correctly', () => {
      userConfig.setUserPreferences({
        userName: 'Christian',
        analysisStyle: 'detailed',
        qualityThreshold: 90
      });

      userConfig.setUserPreferences({
        notifications: {
          lowQualityAlert: false,
          newOpportunityAlert: true,
          priceChangeAlert: true
        }
      });

      const preferences = userConfig.getUserPreferences();

      expect(preferences.userName).toBe('Christian');
      expect(preferences.analysisStyle).toBe('detailed');
      expect(preferences.qualityThreshold).toBe(90);
      expect(preferences.notifications.lowQualityAlert).toBe(false);
      expect(preferences.notifications.newOpportunityAlert).toBe(true);
    });

    test('should validate custom scoring weights', () => {
      const invalidWeights = [
        { invalidKey: 0.5 },
        { dataAccuracy: -0.1 },
        { dataAccuracy: 1.5 },
        { logicalConsistency: 0.3, dataAccuracy: 0.8 } // Total > 1 is OK, will be normalized
      ];

      // First two should throw errors
      expect(() => userConfig.setUserPreferences({ customWeights: invalidWeights[0] }))
        .toThrow(/Invalid scoring weight key/);
      expect(() => userConfig.setUserPreferences({ customWeights: invalidWeights[1] }))
        .toThrow(/must be between 0 and 1/);
      expect(() => userConfig.setUserPreferences({ customWeights: invalidWeights[2] }))
        .toThrow(/must be between 0 and 1/);

      // Last one should work (normalization happens in getScoringWeights)
      expect(() => userConfig.setUserPreferences({ customWeights: invalidWeights[3] }))
        .not.toThrow();
    });
  });

  describe('Configuration Status', () => {
    test('should report incomplete configuration initially', () => {
      expect(userConfig.isConfigurationComplete()).toBe(false);
      
      const profile = userConfig.getProfile();
      expect(profile.isComplete).toBe(false);
      expect(profile.financial).toBeUndefined();
      expect(profile.realEstate).toBeUndefined();
    });

    test('should report complete configuration when all required fields set', () => {
      userConfig.setFinancialConstraints({
        maxPrice: 800000,
        downPaymentPercent: 20,
        annualIncome: 150000
      });

      userConfig.setRealEstateRequirements({
        minGarageSpaces: 2,
        requiresCasita: false
      });

      expect(userConfig.isConfigurationComplete()).toBe(true);
      
      const profile = userConfig.getProfile();
      expect(profile.isComplete).toBe(true);
      expect(profile.financial).toBeDefined();
      expect(profile.realEstate).toBeDefined();
    });
  });

  describe('Scoring Weight Overrides', () => {
    test('should return undefined when no custom weights set', () => {
      expect(userConfig.getScoringWeights()).toBeUndefined();
    });

    test('should normalize custom weights correctly', () => {
      userConfig.setUserPreferences({
        customWeights: {
          dataAccuracy: 0.4,
          logicalConsistency: 0.6,
          // Other weights omitted, should result in normalized values
        }
      });

      const weights = userConfig.getScoringWeights();
      expect(weights).toBeDefined();
      expect(weights!.dataAccuracy).toBeCloseTo(0.4);
      expect(weights!.logicalConsistency).toBeCloseTo(0.6);
    });

    test('should handle zero total weight', () => {
      userConfig.setUserPreferences({
        customWeights: {
          dataAccuracy: 0,
          logicalConsistency: 0
        }
      });

      expect(userConfig.getScoringWeights()).toBeUndefined();
    });
  });

  describe('Import/Export Configuration', () => {
    test('should export and import configuration correctly', () => {
      // Set up a complete configuration
      userConfig.setFinancialConstraints({
        maxPrice: 850000,
        downPaymentPercent: 25,
        annualIncome: 180000
      });

      userConfig.setRealEstateRequirements({
        minGarageSpaces: 3,
        requiresCasita: true,
        maxCommuteMiles: 20
      });

      userConfig.setUserPreferences({
        userName: 'Test User',
        analysisStyle: 'executive'
      });

      // Export and re-import
      const exported = userConfig.exportConfiguration();
      const newConfig = new UserConfiguration();
      newConfig.importConfiguration(exported);

      // Verify data integrity
      const originalProfile = userConfig.getProfile();
      const importedProfile = newConfig.getProfile();

      expect(importedProfile.financial).toEqual(originalProfile.financial);
      expect(importedProfile.realEstate).toEqual(originalProfile.realEstate);
      expect(importedProfile.preferences.userName).toBe(originalProfile.preferences.userName);
      expect(importedProfile.preferences.analysisStyle).toBe(originalProfile.preferences.analysisStyle);
    });

    test('should handle invalid import data', () => {
      expect(() => userConfig.importConfiguration('invalid json'))
        .toThrow(/Invalid configuration format/);
      
      expect(() => userConfig.importConfiguration('{"invalid": "structure"}'))
        .not.toThrow(); // Should handle gracefully
    });
  });
});

describe('UserConfigurationBuilder', () => {
  describe('Fluent Interface', () => {
    test('should build complete configuration using fluent interface', () => {
      const config = new UserConfigurationBuilder()
        .withFinancials({
          maxPrice: 900000,
          annualIncome: 200000
        })
        .withRealEstateNeeds({
          minGarageSpaces: 3,
          requiresCasita: true,
          maxCommuteMiles: 30
        })
        .withPreferences({
          userName: 'Christian',
          analysisStyle: 'detailed'
        })
        .build();

      const profile = config.getProfile();
      expect(profile.isComplete).toBe(true);
      expect(profile.financial?.maxPrice).toBe(900000);
      expect(profile.realEstate?.minGarageSpaces).toBe(3);
      expect(profile.preferences.userName).toBe('Christian');
    });

    test('should apply intelligent defaults', () => {
      const config = new UserConfigurationBuilder()
        .withFinancials({
          maxPrice: 800000,
          annualIncome: 150000
          // downPaymentPercent and loanTermYears should get defaults
        })
        .withRealEstateNeeds({
          minGarageSpaces: 2,
          requiresCasita: false
          // maxCommuteMiles and minSchoolRating should get defaults
        })
        .build();

      const profile = config.getProfile();
      expect(profile.financial?.downPaymentPercent).toBe(20); // Default
      expect(profile.financial?.loanTermYears).toBe(30); // Default
      expect(profile.realEstate?.maxCommuteMiles).toBe(30); // Default
      expect(profile.realEstate?.minSchoolRating).toBe(7); // Default
    });
  });

  describe('Predefined Profiles', () => {
    test('should create Christian Molnar profile correctly', () => {
      const builder = UserConfigurationBuilder.createChristianMolnarProfile();
      const preview = builder.preview();

      expect(preview.financial?.maxPrice).toBe(900000);
      expect(preview.realEstate?.minGarageSpaces).toBe(3);
      expect(preview.realEstate?.requiresCasita).toBe(true);
      expect(preview.preferences.userName).toBe('Christian');
      expect(preview.realEstate?.dealBreakers).toContain('No garage');
    });

    test('should create quick starter profile correctly', () => {
      const builder = UserConfigurationBuilder.createQuickStarter(
        750000, // maxPrice
        140000, // annualIncome
        2,      // minGarageSpaces
        false   // requiresCasita
      );

      const preview = builder.preview();
      expect(preview.financial?.maxPrice).toBe(750000);
      expect(preview.financial?.annualIncome).toBe(140000);
      expect(preview.realEstate?.minGarageSpaces).toBe(2);
      expect(preview.realEstate?.requiresCasita).toBe(false);
    });
  });

  describe('Validation and Status', () => {
    test('should report missing configuration items', () => {
      const builder = new UserConfigurationBuilder()
        .withFinancials({
          maxPrice: 800000,
          annualIncome: 150000
        });
        // Missing real estate requirements

      const status = builder.getStatus();
      expect(status.isComplete).toBe(false);
      expect(status.missingItems).toContain('Garage requirements');
      expect(status.missingItems).toContain('Casita preference');
      expect(status.readyForAnalysis).toBe(false);
    });

    test('should fail to build incomplete configuration', () => {
      const builder = new UserConfigurationBuilder()
        .withFinancials({
          maxPrice: 800000,
          annualIncome: 150000
        });

      expect(() => builder.build()).toThrow(/Incomplete configuration/);
    });

    test('should build successfully when complete', () => {
      const builder = new UserConfigurationBuilder()
        .withFinancials({
          maxPrice: 800000,
          annualIncome: 150000
        })
        .withRealEstateNeeds({
          minGarageSpaces: 2,
          requiresCasita: false
        });

      expect(() => builder.build()).not.toThrow();
      
      const status = builder.getStatus();
      expect(status.readyForAnalysis).toBe(true);
    });
  });

  describe('Affordability Analysis', () => {
    test('should calculate affordability analysis in preview', () => {
      const builder = new UserConfigurationBuilder()
        .withFinancials({
          maxPrice: 800000,
          annualIncome: 150000,
          downPaymentPercent: 20
        });

      const preview = builder.preview();
      const analysis = preview.affordabilityAnalysis;

      expect(analysis).toBeDefined();
      expect(analysis!.downPaymentRequired).toBe(160000); // 20% of 800k
      expect(analysis!.estimatedMonthlyPayment).toBeGreaterThan(3000);
      expect(analysis!.maxAffordablePrice).toBeGreaterThan(0);
    });

    test('should handle missing financial data gracefully', () => {
      const builder = new UserConfigurationBuilder();
      const preview = builder.preview();

      expect(preview.affordabilityAnalysis).toBeUndefined();
    });
  });
});
