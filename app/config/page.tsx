'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useState } from 'react';

interface LocationPreference {
  areaName: string;
  weight: number;
}

interface UserConfiguration {
  // Core Requirements
  propertyType: 'primary-residence' | 'investment-property';
  
  // Physical Requirements
  minGarageSpaces: number;
  minBedrooms: number;
  minBathrooms: number;
  requiresPool: boolean;
  minLotSizeAcres: number;
  casitaRequirement: 'required' | 'preferred' | 'not-needed';
  minYearBuilt?: number;
  
  // Financial Parameters
  totalCashAvailable: number;
  maxMonthlyPayment: number;
  interestRate: number;
  downPaymentStrategy: 'fixed-amount' | 'percentage';
  
  // Location Preferences
  locationPreferences: LocationPreference[];
  
  // Secondary Factors
  commuteImportance: number;
  hoaPreference: 'none' | 'low' | 'acceptable' | 'no-preference';
  viewPreferences?: string[];
  specialRequirements?: string[];
  
  // Investment Specific
  cashFlowTarget?: number | 'positive' | 'break-even';
  renovationTolerance?: 'none' | 'minor' | 'major' | 'gut';
  managementPreference?: 'self' | 'professional' | 'either';
  tenantTypePreference?: 'family' | 'corporate' | 'vacation' | 'no-preference';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentTimeHorizon?: number;
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<UserConfiguration>({
    propertyType: 'primary-residence',
    minGarageSpaces: 2,
    minBedrooms: 3,
    minBathrooms: 2,
    requiresPool: false,
    minLotSizeAcres: 0.25,
    casitaRequirement: 'not-needed',
    totalCashAvailable: 200000,
    maxMonthlyPayment: 3500,
    interestRate: 0.07,
    downPaymentStrategy: 'percentage',
    locationPreferences: [
      { areaName: '', weight: 10 }
    ],
    commuteImportance: 5,
    hoaPreference: 'acceptable',
    viewPreferences: [],
    specialRequirements: []
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleConfigUpdate = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const addLocationPreference = () => {
    setConfig(prev => ({
      ...prev,
      locationPreferences: [...prev.locationPreferences, { areaName: '', weight: 5 }]
    }));
  };

  const updateLocationPreference = (index: number, field: 'areaName' | 'weight', value: string | number) => {
    setConfig(prev => ({
      ...prev,
      locationPreferences: prev.locationPreferences.map((pref, i) => 
        i === index ? { ...pref, [field]: value } : pref
      )
    }));
  };

  const removeLocationPreference = (index: number) => {
    setConfig(prev => ({
      ...prev,
      locationPreferences: prev.locationPreferences.filter((_, i) => i !== index)
    }));
  };

  const saveConfiguration = async () => {
    // TODO: Integrate with Railway backend
    console.log('Saving configuration:', config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Save Status */}
        {isSaved && (
          <div className="mb-6 p-4 bg-accent-primary/10 border border-accent-primary rounded-lg">
            <p className="text-accent-primary font-medium">✓ Configuration saved successfully!</p>
          </div>
        )}

        {/* Property Type Selection */}
        <div className="config-section">
          <h3 className="config-section-title">Property Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`config-radio-card ${config.propertyType === 'primary-residence' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="propertyType"
                value="primary-residence"
                checked={config.propertyType === 'primary-residence'}
                onChange={(e) => handleConfigUpdate('propertyType', e.target.value)}
              />
              <div>
                <h4>🏠 Primary Residence</h4>
                <p>Property for personal residence with lifestyle-focused scoring</p>
              </div>
            </label>
            <label className={`config-radio-card ${config.propertyType === 'investment-property' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="propertyType"
                value="investment-property"
                checked={config.propertyType === 'investment-property'}
                onChange={(e) => handleConfigUpdate('propertyType', e.target.value)}
              />
              <div>
                <h4>💰 Investment Property</h4>
                <p>Property for rental income with ROI-focused analysis</p>
              </div>
            </label>
          </div>
        </div>

        {/* Physical Requirements */}
        <div className="config-section">
          <h3 className="config-section-title">Physical Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-group">
              <label htmlFor="minGarageSpaces">Minimum Garage Spaces</label>
              <input
                type="number"
                id="minGarageSpaces"
                min="0"
                value={config.minGarageSpaces}
                onChange={(e) => handleConfigUpdate('minGarageSpaces', parseInt(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="minBedrooms">Minimum Bedrooms</label>
              <input
                type="number"
                id="minBedrooms"
                min="1"
                value={config.minBedrooms}
                onChange={(e) => handleConfigUpdate('minBedrooms', parseInt(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="minBathrooms">Minimum Bathrooms</label>
              <input
                type="number"
                id="minBathrooms"
                min="1"
                step="0.5"
                value={config.minBathrooms}
                onChange={(e) => handleConfigUpdate('minBathrooms', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="minLotSizeAcres">Minimum Lot Size (Acres)</label>
              <input
                type="number"
                id="minLotSizeAcres"
                min="0"
                step="0.1"
                value={config.minLotSizeAcres}
                onChange={(e) => handleConfigUpdate('minLotSizeAcres', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="casitaRequirement">Casita/Guest House</label>
              <select
                id="casitaRequirement"
                value={config.casitaRequirement}
                onChange={(e) => handleConfigUpdate('casitaRequirement', e.target.value)}
                className="form-input"
              >
                <option value="not-needed">Not Needed</option>
                <option value="preferred">Preferred</option>
                <option value="required">Required</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="minYearBuilt">Minimum Year Built (Optional)</label>
              <input
                type="number"
                id="minYearBuilt"
                min="1900"
                max={new Date().getFullYear()}
                value={config.minYearBuilt || ''}
                onChange={(e) => handleConfigUpdate('minYearBuilt', e.target.value ? parseInt(e.target.value) : undefined)}
                className="form-input"
                placeholder="No minimum"
              />
            </div>
          </div>
          
          {/* Pool Requirement */}
          <div className="mt-6">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={config.requiresPool}
                onChange={(e) => handleConfigUpdate('requiresPool', e.target.checked)}
              />
              <span>Pool Required</span>
            </label>
          </div>
        </div>

        {/* Financial Parameters */}
        <div className="config-section">
          <h3 className="config-section-title">Financial Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="totalCashAvailable">Total Cash Available</label>
              <input
                type="number"
                id="totalCashAvailable"
                min="0"
                value={config.totalCashAvailable}
                onChange={(e) => handleConfigUpdate('totalCashAvailable', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxMonthlyPayment">Maximum Monthly Payment</label>
              <input
                type="number"
                id="maxMonthlyPayment"
                min="0"
                value={config.maxMonthlyPayment}
                onChange={(e) => handleConfigUpdate('maxMonthlyPayment', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="interestRate">Interest Rate (%)</label>
              <input
                type="number"
                id="interestRate"
                min="0"
                max="20"
                step="0.1"
                value={(config.interestRate * 100).toFixed(1)}
                onChange={(e) => handleConfigUpdate('interestRate', parseFloat(e.target.value) / 100)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="downPaymentStrategy">Down Payment Strategy</label>
              <select
                id="downPaymentStrategy"
                value={config.downPaymentStrategy}
                onChange={(e) => handleConfigUpdate('downPaymentStrategy', e.target.value)}
                className="form-input"
              >
                <option value="percentage">Percentage of Price</option>
                <option value="fixed-amount">Fixed Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Preferences */}
        <div className="config-section">
          <h3 className="config-section-title">Location Preferences</h3>
          <div className="space-y-4">
            {config.locationPreferences.map((pref, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="form-group flex-1">
                  <label>Area Name</label>
                  <input
                    type="text"
                    value={pref.areaName}
                    onChange={(e) => updateLocationPreference(index, 'areaName', e.target.value)}
                    className="form-input"
                    placeholder="e.g., North Scottsdale"
                  />
                </div>
                <div className="form-group" style={{ minWidth: '120px' }}>
                  <label>Weight (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={pref.weight}
                    onChange={(e) => updateLocationPreference(index, 'weight', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>
                {config.locationPreferences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocationPreference(index)}
                    className="btn-secondary mb-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLocationPreference}
              className="btn-secondary"
            >
              Add Location Preference
            </button>
          </div>
        </div>

        {/* Secondary Factors */}
        <div className="config-section">
          <h3 className="config-section-title">Secondary Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="commuteImportance">Commute Importance (0-10)</label>
              <input
                type="range"
                id="commuteImportance"
                min="0"
                max="10"
                value={config.commuteImportance}
                onChange={(e) => handleConfigUpdate('commuteImportance', parseInt(e.target.value))}
                className="form-range"
              />
              <div className="range-value">Value: {config.commuteImportance}</div>
            </div>
            <div className="form-group">
              <label htmlFor="hoaPreference">HOA Preference</label>
              <select
                id="hoaPreference"
                value={config.hoaPreference}
                onChange={(e) => handleConfigUpdate('hoaPreference', e.target.value)}
                className="form-input"
              >
                <option value="none">No HOA</option>
                <option value="low">Low HOA ($0-$100/month)</option>
                <option value="acceptable">Acceptable ($100-$300/month)</option>
                <option value="no-preference">No Preference</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investment Specific Options */}
        {config.propertyType === 'investment-property' && (
          <div className="config-section">
            <h3 className="config-section-title">Investment Specific</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="cashFlowTarget">Cash Flow Target</label>
                <select
                  id="cashFlowTarget"
                  value={config.cashFlowTarget || 'break-even'}
                  onChange={(e) => handleConfigUpdate('cashFlowTarget', e.target.value)}
                  className="form-input"
                >
                  <option value="break-even">Break Even</option>
                  <option value="positive">Positive Cash Flow</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="renovationTolerance">Renovation Tolerance</label>
                <select
                  id="renovationTolerance"
                  value={config.renovationTolerance || 'minor'}
                  onChange={(e) => handleConfigUpdate('renovationTolerance', e.target.value)}
                  className="form-input"
                >
                  <option value="none">Move-in Ready</option>
                  <option value="minor">Minor Renovation</option>
                  <option value="major">Major Renovation</option>
                  <option value="gut">Gut Renovation</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="managementPreference">Management Preference</label>
                <select
                  id="managementPreference"
                  value={config.managementPreference || 'either'}
                  onChange={(e) => handleConfigUpdate('managementPreference', e.target.value)}
                  className="form-input"
                >
                  <option value="self">Self Manage</option>
                  <option value="professional">Professional Management</option>
                  <option value="either">Either</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="riskTolerance">Risk Tolerance</label>
                <select
                  id="riskTolerance"
                  value={config.riskTolerance || 'moderate'}
                  onChange={(e) => handleConfigUpdate('riskTolerance', e.target.value)}
                  className="form-input"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Save Configuration */}
        <div className="config-section">
          <div className="flex justify-end gap-4">
            <button
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={saveConfiguration}
              className="btn-primary"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
