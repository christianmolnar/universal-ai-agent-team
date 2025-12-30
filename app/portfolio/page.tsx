'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ZillowParser, convertZillowToProperty, type ZillowPropertyData } from '@/lib/zillow-parser';

// Property confirmation modal component
interface PropertyConfirmationModalProps {
  property: ZillowPropertyData & { metrics?: any };
  onConfirm: (propertyType: 'primary' | 'rental', financialData?: FinancialData, editedPropertyData?: Partial<ZillowPropertyData>) => void;
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
  
  // Editable property details
  const [editedProperty, setEditedProperty] = useState({
    sqft: property.sqft && property.sqft > 0 ? property.sqft : undefined,
    lotSize: property.lotSize && property.lotSize > 0 ? property.lotSize : undefined,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0
  });
  
  // Convert lot size from sqft to acres if needed
  const lotSizeAcres = editedProperty.lotSize && editedProperty.lotSize > 1000 
    ? (editedProperty.lotSize / 43560).toFixed(2) 
    : (editedProperty.lotSize || 0);

  const handleConfirm = () => {
    onConfirm(
      selectedType, 
      showFinancialFields ? financialData : undefined,
      editedProperty
    );
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

          {/* Key Details Grid - Now editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review & Edit Property Details (if incorrect)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-600 block mb-1">Price</label>
                <p className="text-lg font-semibold text-gray-900">
                  ${property.price?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-600 block mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={editedProperty.bedrooms}
                  onChange={(e) => setEditedProperty({...editedProperty, bedrooms: Number(e.target.value)})}
                  className="w-full text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-600 block mb-1">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  value={editedProperty.bathrooms}
                  onChange={(e) => setEditedProperty({...editedProperty, bathrooms: Number(e.target.value)})}
                  className="w-full text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-600 block mb-1">Year Built</label>
                <p className="text-lg font-semibold text-gray-900">
                  {property.yearBuilt || 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-600 block mb-1">Square Feet</label>
                <input
                  type="number"
                  value={editedProperty.sqft || ''}
                  onChange={(e) => setEditedProperty({...editedProperty, sqft: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="e.g. 1530"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-600 block mb-1">Lot Size (acres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={typeof lotSizeAcres === 'string' ? parseFloat(lotSizeAcres) : lotSizeAcres}
                  onChange={(e) => setEditedProperty({...editedProperty, lotSize: e.target.value ? Math.round(Number(e.target.value) * 43560) : undefined})}
                  className="w-full text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="e.g. 0.25"
                />
                <p className="text-xs text-gray-500 mt-1">{(editedProperty.lotSize || 0).toLocaleString()} sqft</p>
              </div>
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

// Updated property data structure with more detailed information
const portfolioData = {
  primaryResidence: {
    id: 'primary-1',
    address: "Primary Residence", // User needs to provide actual address
    city: "Location TBD",
    state: "AZ",
    zipCode: "00000",
    type: "Single Family Home",
    status: "Owner Occupied",
    currentValue: 875000, // User needs to provide current market value
    purchasePrice: 620000, // User needs to provide actual purchase price
    purchaseDate: "2020-03-15",
    mortgageBalance: 420000, // User needs to provide current mortgage balance
    monthlyPayment: 3200,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2850,
    lotSize: 0.75,
    yearBuilt: 2005,
    hasPool: true,
    hasCasita: true,
    features: ["Pool", "Casita", "Mountain View", "3-car garage"],
    lastAnalysis: "2024-01-15"
  },
  rentalProperties: [
    {
      id: 'rental-1',
      address: "Rental Property #1", // User needs actual address
      city: "Mesa",
      state: "AZ", 
      zipCode: "85202",
      type: "Single Family Home",
      status: "Rental Income",
      currentValue: 425000,
      purchasePrice: 285000,
      purchaseDate: "2018-06-20",
      mortgageBalance: 180000,
      monthlyRent: 2400,
      monthlyMortgage: 1650,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1650,
      lotSize: 0.25,
      yearBuilt: 1998,
      hasPool: false,
      hasCasita: false,
      tenantType: "Long-term Family",
      managementType: "Self-managed",
      lastAnalysis: "2023-12-10"
    },
    {
      id: 'rental-2',
      address: "Rental Property #2", // User needs actual address
      city: "Tempe",
      state: "AZ",
      zipCode: "85284", 
      type: "Townhouse",
      status: "Rental Income",
      currentValue: 385000,
      purchasePrice: 295000,
      purchaseDate: "2019-08-12",
      mortgageBalance: 195000,
      monthlyRent: 2200,
      monthlyMortgage: 1580,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1480,
      lotSize: 0.15,
      yearBuilt: 2002,
      hasPool: false,
      hasCasita: false,
      tenantType: "Long-term Professional",
      managementType: "Self-managed",
      lastAnalysis: "2023-11-28"
    }
  ]
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
  
  // ONLY calculate rental income/expenses from rental properties (exclude primary residence)
  const rentalProperties = realProperties.filter(p => p.property_type === 'rental');
  const monthlyRentalIncome = rentalProperties.reduce((sum, prop) => sum + (prop.user_mortgage_data?.monthly_rent || 0), 0);
  const monthlyRentalExpenses = rentalProperties.reduce((sum, prop) => sum + (prop.user_mortgage_data?.monthly_payment || 0), 0);

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

  const handleConfirmProperty = async (
    propertyType: 'primary' | 'rental', 
    financialData?: FinancialData,
    editedPropertyData?: Partial<ZillowPropertyData>
  ) => {
    if (!scrapedProperty) return;

    try {
      console.log('Saving property to database as:', propertyType);
      console.log('Financial data:', financialData);
      console.log('Edited property data:', editedPropertyData);

      // Merge edited property data with scraped data
      const finalPropertyData = {
        ...scrapedProperty,
        ...editedPropertyData  // Override with edited values
      };

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
          property: finalPropertyData,  // Use merged data
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
            <>
              {/* Primary Residence Section */}
              {realProperties.some(p => p.property_type === 'primary') && (
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
                  <div className="space-y-6">
                    {realProperties
                      .filter(p => p.property_type === 'primary')
                      .map((propertyRecord) => {
                        const property = propertyRecord.property_data;
                        return (
                          <div key={propertyRecord.id} className="domain-card">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="domain-title-small">{property.address}</h4>
                                <p className="text-sm text-text-secondary">
                                  {property.city}, {property.state} {property.zipCode}
                                </p>
                              </div>
                              {/* Property Image */}
                              <div className="ml-4 relative">
                                {property.photos && property.photos.length > 0 ? (
                                  <div className="w-32 h-24 rounded-lg overflow-hidden">
                                    <img 
                                      src={property.photos[0]} 
                                      alt="Property" 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Hide image if it fails to load
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-32 h-24 rounded-lg bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No Image</span>
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    // Create a hidden file input
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (!file) return;

                                      // Check file size (max 5MB)
                                      if (file.size > 5 * 1024 * 1024) {
                                        alert('File is too large. Maximum size is 5MB.');
                                        return;
                                      }

                                      try {
                                        const formData = new FormData();
                                        formData.append('propertyId', propertyRecord.id);
                                        formData.append('file', file);

                                        const response = await fetch('/api/properties/upload-photo', {
                                          method: 'POST',
                                          body: formData
                                        });

                                        if (!response.ok) throw new Error('Upload failed');

                                        await fetchProperties();
                                        alert('Photo added successfully!');
                                      } catch (err) {
                                        alert('Failed to add photo: ' + (err as Error).message);
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                                >
                                  {property.photos && property.photos.length > 0 ? 'Change Photo' : '+ Add Photo'}
                                </button>
                              </div>
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
              )}

              {/* Rental Properties Section */}
              {realProperties.some(p => p.property_type === 'rental') && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text-primary">Rental Properties</h3>
                    {!showAddProperty && !realProperties.some(p => p.property_type === 'primary') && (
                      <button 
                        onClick={() => setShowAddProperty(true)}
                        className="btn-primary"
                      >
                        + New Property
                      </button>
                    )}
                  </div>
                  <div className="space-y-6">
                    {realProperties
                      .filter(p => p.property_type === 'rental')
                      .map((propertyRecord) => {
                        const property = propertyRecord.property_data;
                        return (
                          <div key={propertyRecord.id} className="domain-card">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="domain-title-small">{property.address}</h4>
                                <p className="text-sm text-text-secondary">
                                  {property.city}, {property.state} {property.zipCode}
                                </p>
                              </div>
                              {/* Property Image */}
                              <div className="ml-4 relative">
                                {property.photos && property.photos.length > 0 ? (
                                  <div className="w-32 h-24 rounded-lg overflow-hidden">
                                    <img 
                                      src={property.photos[0]} 
                                      alt="Property" 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Hide image if it fails to load
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-32 h-24 rounded-lg bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No Image</span>
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    // Create a hidden file input
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (!file) return;

                                      // Check file size (max 5MB)
                                      if (file.size > 5 * 1024 * 1024) {
                                        alert('File is too large. Maximum size is 5MB.');
                                        return;
                                      }

                                      try {
                                        const formData = new FormData();
                                        formData.append('propertyId', propertyRecord.id);
                                        formData.append('file', file);

                                        const response = await fetch('/api/properties/upload-photo', {
                                          method: 'POST',
                                          body: formData
                                        });

                                        if (!response.ok) throw new Error('Upload failed');

                                        await fetchProperties();
                                        alert('Photo added successfully!');
                                      } catch (err) {
                                        alert('Failed to add photo: ' + (err as Error).message);
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                                >
                                  {property.photos && property.photos.length > 0 ? 'Change Photo' : '+ Add Photo'}
                                </button>
                              </div>
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
                                      {propertyRecord.user_mortgage_data.monthly_rent && (
                                        <p><span className="text-text-secondary">Monthly Rent:</span> <span className="text-green-400 font-semibold">${propertyRecord.user_mortgage_data.monthly_rent.toLocaleString()}</span></p>
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
              )}
            </>
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
            
            <div className="domain-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="domain-title-small">{portfolioData.primaryResidence.address}</h4>
                  <p className="text-sm text-text-secondary">
                    {portfolioData.primaryResidence.city}, {portfolioData.primaryResidence.state} {portfolioData.primaryResidence.zipCode}
                  </p>
                </div>
                <div className="domain-badge active">Primary</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-semibold text-text-primary mb-2">Property Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-text-secondary">Type:</span> {portfolioData.primaryResidence.type}</p>
                    <p><span className="text-text-secondary">Size:</span> {portfolioData.primaryResidence.bedrooms}br/{portfolioData.primaryResidence.bathrooms}ba</p>
                    <p><span className="text-text-secondary">Square Feet:</span> {portfolioData.primaryResidence.sqft.toLocaleString()} sqft</p>
                    <p><span className="text-text-secondary">Lot Size:</span> {portfolioData.primaryResidence.lotSize} acres</p>
                    <p><span className="text-text-secondary">Year Built:</span> {portfolioData.primaryResidence.yearBuilt}</p>
                    <p><span className="text-text-secondary">Features:</span> {portfolioData.primaryResidence.features.join(', ')}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-text-primary mb-2">Financial Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-text-secondary">Current Value:</span> <span className="text-accent-primary font-semibold">${portfolioData.primaryResidence.currentValue.toLocaleString()}</span></p>
                    <p><span className="text-text-secondary">Purchase Price:</span> ${portfolioData.primaryResidence.purchasePrice.toLocaleString()}</p>
                    <p><span className="text-text-secondary">Mortgage Balance:</span> ${(portfolioData.primaryResidence as any).mortgageBalance.toLocaleString()}</p>
                    <p><span className="text-text-secondary">Current Equity:</span> <span className="text-status-active font-semibold">${(portfolioData.primaryResidence.currentValue - (portfolioData.primaryResidence as any).mortgageBalance).toLocaleString()}</span></p>
                    <p><span className="text-text-secondary">Monthly Payment:</span> ${(portfolioData.primaryResidence as any).monthlyPayment.toLocaleString()}</p>
                    <p><span className="text-text-secondary">Purchase Date:</span> {new Date(portfolioData.primaryResidence.purchaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-text-primary mb-2">Performance</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-text-secondary">Appreciation:</span> <span className="text-status-active font-semibold">+${(portfolioData.primaryResidence.currentValue - portfolioData.primaryResidence.purchasePrice).toLocaleString()}</span></p>
                    <p><span className="text-text-secondary">Total ROI:</span> <span className="text-status-active font-semibold">{(((portfolioData.primaryResidence.currentValue - portfolioData.primaryResidence.purchasePrice) / portfolioData.primaryResidence.purchasePrice) * 100).toFixed(1)}%</span></p>
                    <p><span className="text-text-secondary">Years Owned:</span> {Math.round((new Date().getTime() - new Date(portfolioData.primaryResidence.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}</p>
                    <p><span className="text-text-secondary">Last Analysis:</span> {portfolioData.primaryResidence.lastAnalysis}</p>
                  </div>
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
          </div>

          {/* Rental Properties */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-primary">Rental Properties</h3>
            </div>
            <div className="space-y-6">
              {portfolioData.rentalProperties.map((property, index) => {
                const equity = property.currentValue - property.mortgageBalance;
                const appreciation = property.currentValue - property.purchasePrice;
                const monthlyProfit = property.monthlyRent - property.monthlyMortgage;
                const roi = ((appreciation / property.purchasePrice) * 100);
                const yearsOwned = Math.round((new Date().getTime() - new Date(property.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                
                return (
                  <div key={property.id} className="domain-card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="domain-title-small">Rental Property #{index + 1}</h4>
                        <p className="text-sm text-text-secondary">
                          {property.address} - {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                      <div className="domain-badge development">Rental</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-semibold text-text-primary mb-2">Property Details</h5>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-text-secondary">Type:</span> {property.type}</p>
                          <p><span className="text-text-secondary">Size:</span> {property.bedrooms}br/{property.bathrooms}ba</p>
                          <p><span className="text-text-secondary">Square Feet:</span> {property.sqft.toLocaleString()} sqft</p>
                          <p><span className="text-text-secondary">Lot Size:</span> {property.lotSize} acres</p>
                          <p><span className="text-text-secondary">Year Built:</span> {property.yearBuilt}</p>
                          <p><span className="text-text-secondary">Management:</span> {property.managementType}</p>
                          <p><span className="text-text-secondary">Tenant:</span> {property.tenantType}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-text-primary mb-2">Financial Details</h5>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-text-secondary">Current Value:</span> <span className="text-accent-primary font-semibold">${property.currentValue.toLocaleString()}</span></p>
                          <p><span className="text-text-secondary">Purchase Price:</span> ${property.purchasePrice.toLocaleString()}</p>
                          <p><span className="text-text-secondary">Mortgage Balance:</span> ${property.mortgageBalance.toLocaleString()}</p>
                          <p><span className="text-text-secondary">Current Equity:</span> <span className="text-status-active font-semibold">${equity.toLocaleString()}</span></p>
                          <p><span className="text-text-secondary">Monthly Rent:</span> <span className="text-status-active font-semibold">${property.monthlyRent.toLocaleString()}</span></p>
                          <p><span className="text-text-secondary">Monthly Mortgage:</span> ${property.monthlyMortgage.toLocaleString()}</p>
                          <p><span className="text-text-secondary">Monthly Profit:</span> <span className="text-status-active font-semibold">${monthlyProfit.toLocaleString()}</span></p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-text-primary mb-2">Performance</h5>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-text-secondary">Appreciation:</span> <span className="text-status-active font-semibold">+${appreciation.toLocaleString()}</span></p>
                          <p><span className="text-text-secondary">Total ROI:</span> <span className="text-status-active font-semibold">{roi.toFixed(1)}%</span></p>
                          <p><span className="text-text-secondary">Annual ROI:</span> <span className="text-status-active font-semibold">{(roi / yearsOwned).toFixed(1)}%</span></p>
                          <p><span className="text-text-secondary">Cap Rate:</span> <span className="text-status-active font-semibold">{((property.monthlyRent * 12) / property.currentValue * 100).toFixed(1)}%</span></p>
                          <p><span className="text-text-secondary">Years Owned:</span> {yearsOwned}</p>
                          <p><span className="text-text-secondary">Last Analysis:</span> {property.lastAnalysis}</p>
                        </div>
                        <div className="mt-4 space-y-2">
                          <button className="btn-secondary w-full">
                            Re-analyze Property
                          </button>
                          <button className="btn-secondary w-full">
                            Edit Details
                          </button>
                          <button className="btn-destructive w-full">
                            Delete Property
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
