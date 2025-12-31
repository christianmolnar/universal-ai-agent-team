'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ZillowParser, convertZillowToProperty, type ZillowPropertyData } from '@/lib/zillow-parser';

// Property confirmation modal component
interface PropertyConfirmationModalProps {
  property: ZillowPropertyData & { metrics?: any };
  onConfirm: (propertyType: 'primary' | 'rental', financialData?: FinancialData) => void;
  onCancel: () => void;
}

interface FinancialData {
  purchasePrice?: number;
  purchaseDate?: string;
  mortgageBalance?: number;
  monthlyPayment?: number;
  monthlyRent?: number;
}

function PropertyConfirmationModal({ property, onConfirm, onCancel }: PropertyConfirmationModalProps) {
  const [selectedType, setSelectedType] = useState<'primary' | 'rental'>('rental');
  const [showFinancialFields, setShowFinancialFields] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData>({
    purchasePrice: undefined,
    purchaseDate: undefined,
    mortgageBalance: undefined,
    monthlyPayment: undefined,
    monthlyRent: undefined
  });
  
  // Convert lot size from sqft to acres if needed
  const lotSizeAcres = property.lotSize > 1000 
    ? (property.lotSize / 43560).toFixed(2) 
    : property.lotSize;

  const handleConfirm = () => {
    onConfirm(selectedType, showFinancialFields ? financialData : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Confirm Property Details</h2>
          <p className="text-sm text-gray-600 mt-1">Review the property information before adding to your portfolio</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Property Image - Single main photo */}
          {property.photos && property.photos.length > 0 && (
            <div className="w-full">
              <img 
                src={property.photos[0]} 
                alt="Property"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Address */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900">
              {property.address}
            </h3>
            <p className="text-gray-700">
              {property.city}, {property.state} {property.zipCode}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">Price</p>
              <p className="text-lg font-semibold text-gray-900">
                ${property.price?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">Beds / Baths</p>
              <p className="text-lg font-semibold text-gray-900">
                {property.bedrooms} / {property.bathrooms}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">Square Feet</p>
              <p className="text-lg font-semibold text-gray-900">
                {property.sqft?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">Lot Size</p>
              <p className="text-lg font-semibold text-gray-900">
                {lotSizeAcres} acres
              </p>
            </div>
          </div>

          {/* Property Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Property Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedType('primary')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === 'primary'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Primary Residence</div>
                  <div className="text-sm text-gray-600">Replace your current primary home</div>
                </div>
              </button>
              <button
                onClick={() => setSelectedType('rental')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === 'rental'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Rental Property</div>
                  <div className="text-sm text-gray-600">Add to your rental portfolio</div>
                </div>
              </button>
            </div>
          </div>

          {/* Additional Details */}
          {property.features && property.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Property Features</h4>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional Financial Information */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowFinancialFields(!showFinancialFields)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <span>{showFinancialFields ? '▼' : '▶'}</span>
              <span>Add Financial Details (Optional)</span>
            </button>
            
            {showFinancialFields && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={financialData.purchasePrice || ''}
                    onChange={(e) => setFinancialData({...financialData, purchasePrice: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder="e.g., 650000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={financialData.purchaseDate || ''}
                    onChange={(e) => setFinancialData({...financialData, purchaseDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Mortgage Balance
                  </label>
                  <input
                    type="number"
                    value={financialData.mortgageBalance || ''}
                    onChange={(e) => setFinancialData({...financialData, mortgageBalance: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder="e.g., 450000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Mortgage Payment
                  </label>
                  <input
                    type="number"
                    value={financialData.monthlyPayment || ''}
                    onChange={(e) => setFinancialData({...financialData, monthlyPayment: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder="e.g., 3200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                {selectedType === 'rental' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent Income
                    </label>
                    <input
                      type="number"
                      value={financialData.monthlyRent || ''}
                      onChange={(e) => setFinancialData({...financialData, monthlyRent: e.target.value ? Number(e.target.value) : undefined})}
                      placeholder="e.g., 2400"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Investment Metrics (if available) */}
          {property.metrics && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Investment Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Price/SqFt:</span>
                  <span className="ml-2 font-semibold">${property.metrics.pricePerSqft}</span>
                </div>
                <div>
                  <span className="text-gray-600">Property Type:</span>
                  <span className="ml-2 font-semibold">{property.propertyType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Year Built:</span>
                  <span className="ml-2 font-semibold">{property.yearBuilt}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm & Save to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty portfolio data - will be populated from database
const portfolioData = {
  primaryResidence: null as any,
  rentalProperties: [] as any[]
};

export default function PortfolioPage() {
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propertyType, setPropertyType] = useState<'primary' | 'rental'>('primary');
  const [zillowUrl, setZillowUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParsError] = useState<string | null>(null);
  const [scrapedProperty, setScrapedProperty] = useState<(ZillowPropertyData & { metrics?: any }) | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [realProperties, setRealProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  // Fetch properties from database on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const response = await fetch('/api/properties/get?userId=christian_molnar');
      const result = await response.json();
      
      if (result.success) {
        setRealProperties(result.properties);
        console.log('Loaded properties from database:', result.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // Calculate portfolio stats from real properties
  const totalPortfolioValue = realProperties.reduce((sum, prop) => sum + (prop.property_data.price || 0), 0);
  const totalEquity = realProperties.reduce((sum, prop) => {
    const mortgageBalance = prop.user_mortgage_data?.mortgage_balance || 0;
    return sum + ((prop.property_data.price || 0) - mortgageBalance);
  }, 0);
  const monthlyRentalIncome = realProperties.reduce((sum, prop) => sum + (prop.user_mortgage_data?.monthly_rent || 0), 0);
  const monthlyRentalExpenses = realProperties.reduce((sum, prop) => sum + (prop.user_mortgage_data?.monthly_payment || 0), 0);

  const handleAddFromZillow = async () => {
    if (!zillowUrl.trim()) return;
    
    setIsLoading(true);
    setParsError(null);
    
    try {
      console.log('Scraping property from Zillow URL:', zillowUrl);

      // Call the Zillow scraper (not the properties API yet - we want to review first)
      const response = await fetch('/api/scrape-zillow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: zillowUrl.trim()
        }),
      });

      const result = await response.json();

      console.log('Scraper Response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to scrape property');
      }

      // Show the confirmation modal with the scraped property data
      setScrapedProperty({
        ...result.data,
        metrics: result.metrics
      });
      setShowConfirmModal(true);
      
    } catch (error) {
      console.error('Error scraping property from Zillow:', error);
      setParsError(error instanceof Error ? error.message : 'Failed to scrape property. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProperty = async (propertyType: 'primary' | 'rental', financialData?: FinancialData) => {
    if (!scrapedProperty) return;

    try {
      console.log('Saving property to database as:', propertyType);
      console.log('Financial data:', financialData);

      // Prepare mortgage data for database
      const mortgageData = financialData ? {
        purchase_price: financialData.purchasePrice,
        purchase_date: financialData.purchaseDate,
        mortgage_balance: financialData.mortgageBalance,
        monthly_payment: financialData.monthlyPayment,
        monthly_rent: financialData.monthlyRent
      } : undefined;

      // Save the property to the database
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property: scrapedProperty,
          propertyType,
          mortgageData,
          userId: 'christian_molnar' // TODO: Get from user authentication
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save property');
      }

      // Success! Close modal and reset form
      setShowConfirmModal(false);
      setScrapedProperty(null);
      setZillowUrl('');
      setShowAddProperty(false);

      // Show success message
      alert(`✅ Property successfully added to your portfolio as ${propertyType === 'primary' ? 'Primary Residence' : 'Rental Property'}!\n\n${scrapedProperty.address}\n${scrapedProperty.city}, ${scrapedProperty.state} ${scrapedProperty.zipCode}\n\nNote: If this property already existed, it was updated with the latest data.`);

      // Refresh the portfolio data from database
      await fetchProperties();
      
    } catch (error) {
      console.error('Error saving property:', error);
      alert(error instanceof Error ? error.message : 'Failed to save property');
    }
  };

  const handleCancelProperty = () => {
    setShowConfirmModal(false);
    setScrapedProperty(null);
  };

  return (
    <DashboardLayout>
      {/* Portfolio Summary */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <h3>Total Portfolio Value</h3>
            <p className="stat-value">${totalPortfolioValue.toLocaleString()}</p>
            <span className="stat-label">{realProperties.length} {realProperties.length === 1 ? 'Property' : 'Properties'}</span>
          </div>
          <div className="stat-card">
            <h3>Total Equity</h3>
            <p className="stat-value">${totalEquity.toLocaleString()}</p>
            <span className="stat-label">Net Worth from Real Estate</span>
          </div>
          <div className="stat-card">
            <h3>Monthly Rental Income</h3>
            <p className="stat-value">${monthlyRentalIncome.toLocaleString()}</p>
            <span className="stat-label">Gross Rental Income</span>
          </div>
          <div className="stat-card">
            <h3>Net Monthly Cash Flow</h3>
            <p className="stat-value text-status-active">${(monthlyRentalIncome - monthlyRentalExpenses).toLocaleString()}</p>
            <span className="stat-label">After Mortgage Payments</span>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section>
        {/* Add Property Section - Moved to top */}
        {showAddProperty && (
          <div className="config-section mb-6">
            <h3 className="config-section-title">
              Add Property from Zillow URL
            </h3>
            {parseError && (
              <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 text-lg">⚠️</div>
                  <div>
                    <p className="text-orange-400 font-medium text-sm mb-1">Error</p>
                    <p className="text-orange-300 text-xs">
                      {parseError}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <div className="form-group flex-1">
                <input
                  type="url"
                  value={zillowUrl}
                  onChange={(e) => {
                    setZillowUrl(e.target.value);
                    setParsError(null);
                  }}
                  placeholder="https://www.zillow.com/homedetails/..."
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              <button 
                onClick={handleAddFromZillow}
                disabled={!zillowUrl.trim() || isLoading}
                className="btn-primary min-w-[120px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Parsing...</span>
                  </>
                ) : 'Parse Property'}
              </button>
              <button 
                onClick={() => setShowAddProperty(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          
          {/* Real Properties from Database */}
          {isLoadingProperties ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">Loading your properties...</p>
            </div>
          ) : realProperties.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text-primary">Your Properties</h3>
                {!showAddProperty && (
                  <button 
                    onClick={() => setShowAddProperty(true)}
                    className="btn-primary"
                  >
                    + New Property
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {realProperties.map((propertyRecord) => {
                  const property = propertyRecord.property_data;
                  return (
                    <div key={propertyRecord.id} className="domain-card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="domain-title-small">{property.address}</h4>
                          <p className="text-sm text-text-secondary">
                            {property.city}, {property.state} {property.zipCode}
                          </p>
                        </div>
                        <div className="domain-badge active">From Database</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h5 className="font-semibold text-text-primary mb-2">Property Details</h5>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-text-secondary">Type:</span> {property.propertyType}</p>
                            <p><span className="text-text-secondary">Size:</span> {property.bedrooms}br/{property.bathrooms}ba</p>
                            <p><span className="text-text-secondary">Square Feet:</span> {property.sqft?.toLocaleString()} sqft</p>
                            <p><span className="text-text-secondary">Lot Size:</span> {(property.lotSize / 43560).toFixed(2)} acres</p>
                            <p><span className="text-text-secondary">Year Built:</span> {property.yearBuilt}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-text-primary mb-2">Financial Details</h5>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-text-secondary">Current Value:</span> <span className="text-accent-primary font-semibold">${property.price?.toLocaleString()}</span></p>
                            <p><span className="text-text-secondary">Zestimate:</span> ${property.zestimate?.toLocaleString()}</p>
                            {propertyRecord.user_mortgage_data && (
                              <>
                                {propertyRecord.user_mortgage_data.purchase_price && (
                                  <p><span className="text-text-secondary">Purchase Price:</span> ${propertyRecord.user_mortgage_data.purchase_price.toLocaleString()}</p>
                                )}
                                {propertyRecord.user_mortgage_data.mortgage_balance && (
                                  <p><span className="text-text-secondary">Mortgage Balance:</span> ${propertyRecord.user_mortgage_data.mortgage_balance.toLocaleString()}</p>
                                )}
                                {propertyRecord.user_mortgage_data.monthly_payment && (
                                  <p><span className="text-text-secondary">Monthly Payment:</span> ${propertyRecord.user_mortgage_data.monthly_payment.toLocaleString()}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-text-primary mb-2">Details</h5>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-text-secondary">Added:</span> {new Date(propertyRecord.created_at).toLocaleDateString()}</p>
                            <p><span className="text-text-secondary">Updated:</span> {new Date(propertyRecord.updated_at).toLocaleDateString()}</p>
                          </div>
                          {property.features && property.features.length > 0 && (
                            <div className="mt-3">
                              <p className="text-text-secondary text-xs mb-1">Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {property.features.slice(0, 5).map((feature: string, idx: number) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-gray-700 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Sample/Hardcoded Properties - Show only if no real properties */}
          {!isLoadingProperties && realProperties.length === 0 && (
            <>
          
          {/* Primary Residence */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-primary">Primary Residence</h3>
              {!showAddProperty && (
                <button 
                  onClick={() => setShowAddProperty(true)}
                  className="btn-primary"
                >
                  + New Property
                </button>
              )}
            </div>
            
            {/* Empty State - No Primary Residence */}
            {!portfolioData.primaryResidence && realProperties.filter(p => p.property_type === 'primary').length === 0 && (
              <div className="domain-card text-center py-12">
                <div className="text-5xl mb-4">🏠</div>
                <h4 className="domain-title-small mb-2">No Primary Residence</h4>
                <p className="text-text-secondary mb-6">
                  Add your primary residence to track its value and equity
                </p>
                <button 
                  onClick={() => {
                    setPropertyType('primary');
                    setShowAddProperty(true);
                  }}
                  className="btn-primary"
                >
                  Add Primary Residence
                </button>
              </div>
            )}

            {/* Show Real Properties from Database */}
            {realProperties.filter(p => p.property_type === 'primary').map((property: any) => (
              <div key={property.id} className="domain-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="domain-title-small">{property.property_data.address}</h4>
                    <p className="text-sm text-text-secondary">
                      {property.property_data.city}, {property.property_data.state} {property.property_data.zipCode}
                    </p>
                  </div>
                  <div className="domain-badge active">Primary</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold text-text-primary mb-2">Property Details</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-text-secondary">Type:</span> {property.property_data.propertyType || 'Single Family'}</p>
                      <p><span className="text-text-secondary">Size:</span> {property.property_data.bedrooms}br/{property.property_data.bathrooms}ba</p>
                      <p><span className="text-text-secondary">Square Feet:</span> {(property.property_data.livingArea || property.property_data.sqft || 0).toLocaleString()} sqft</p>
                      <p><span className="text-text-secondary">Year Built:</span> {property.property_data.yearBuilt}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-text-primary mb-2">Financial Details</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-text-secondary">Current Value:</span> <span className="text-accent-primary font-semibold">${(property.property_data.price || 0).toLocaleString()}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-text-primary mb-2">Actions</h5>
                    <div className="mt-4 space-y-2">
                      <button className="btn-secondary w-full">
                        Re-analyze Property
                      </button>
                      <button className="btn-outline w-full">
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rental Properties */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-primary">Investment Properties</h3>
              <button 
                onClick={() => {
                  setPropertyType('rental');
                  setShowAddProperty(true);
                }}
                className="btn-primary"
              >
                + Add Rental
              </button>
            </div>
            <div className="space-y-6">
              {/* Empty State - No Rental Properties */}
              {realProperties.filter(p => p.property_type === 'rental').length === 0 && (
                <div className="domain-card text-center py-12">
                  <div className="text-5xl mb-4">🏘️</div>
                  <h4 className="domain-title-small mb-2">No Investment Properties</h4>
                  <p className="text-text-secondary mb-6">
                    Add rental properties to track income and ROI
                  </p>
                  <button 
                    onClick={() => {
                      setPropertyType('rental');
                      setShowAddProperty(true);
                    }}
                    className="btn-primary"
                  >
                    Add Your First Rental
                  </button>
                </div>
              )}
              
              {/* Show Real Rental Properties from Database */}
              {realProperties.filter(p => p.property_type === 'rental').map((property: any, index: number) => (
                <div key={property.id} className="domain-card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="domain-title-small">Rental Property #{index + 1}</h4>
                      <p className="text-sm text-text-secondary">
                        {property.property_data.address} - {property.property_data.city}, {property.property_data.state} {property.property_data.zipCode}
                      </p>
                    </div>
                    <div className="domain-badge development">Rental</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-semibold text-text-primary mb-2">Property Details</h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-text-secondary">Type:</span> {property.property_data.propertyType || 'Single Family'}</p>
                        <p><span className="text-text-secondary">Size:</span> {property.property_data.bedrooms}br/{property.property_data.bathrooms}ba</p>
                        <p><span className="text-text-secondary">Square Feet:</span> {(property.property_data.livingArea || property.property_data.sqft || 0).toLocaleString()} sqft</p>
                        <p><span className="text-text-secondary">Year Built:</span> {property.property_data.yearBuilt}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-text-primary mb-2">Financial Details</h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-text-secondary">Current Value:</span> <span className="text-accent-primary font-semibold">${(property.property_data.price || 0).toLocaleString()}</span></p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-text-primary mb-2">Actions</h5>
                      <div className="mt-4 space-y-2">
                        <button className="btn-secondary w-full">
                          Re-analyze Property
                        </button>
                        <button className="btn-outline w-full">
                          Edit Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
          )}
        </div>
      </section>

      {/* Property Confirmation Modal */}
      {showConfirmModal && scrapedProperty && (
        <PropertyConfirmationModal
          property={scrapedProperty}
          onConfirm={handleConfirmProperty}
          onCancel={handleCancelProperty}
        />
      )}
    </DashboardLayout>
  );
}
