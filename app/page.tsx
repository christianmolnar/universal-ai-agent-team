'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
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

  // Calculate portfolio metrics from real properties
  const totalPortfolioValue = realProperties.reduce((sum, prop) => sum + (prop.property_data.price || 0), 0);
  const totalEquity = realProperties.reduce((sum, prop) => {
    const mortgageBalance = prop.user_mortgage_data?.mortgage_balance || 0;
    return sum + ((prop.property_data.price || 0) - mortgageBalance);
  }, 0);
  
  // ONLY calculate rental income/expenses from rental properties (exclude primary residence)
  const rentalProperties = realProperties.filter(p => p.property_type === 'rental');
  const primaryResidence = realProperties.find(p => p.property_type === 'primary');
  
  const monthlyRentalIncome = rentalProperties.reduce((sum, prop) => sum + (prop.user_mortgage_data?.monthly_rent || 0), 0);
  const monthlyRentalExpenses = rentalProperties.reduce((sum, prop) => sum + (prop.user_mortgage_data?.monthly_payment || 0), 0);
  const netMonthlyIncome = monthlyRentalIncome - monthlyRentalExpenses;

  // Primary residence calculations
  const primaryEquity = primaryResidence 
    ? (primaryResidence.property_data.price || 0) - (primaryResidence.user_mortgage_data?.mortgage_balance || 0)
    : 0;
  const primaryAppreciation = primaryResidence && primaryResidence.user_mortgage_data?.purchase_price
    ? (primaryResidence.property_data.price || 0) - primaryResidence.user_mortgage_data.purchase_price
    : 0;
  const primaryROI = primaryResidence && primaryResidence.user_mortgage_data?.purchase_price
    ? (primaryAppreciation / primaryResidence.user_mortgage_data.purchase_price * 100)
    : 0;

  return (
    <DashboardLayout>
      {/* Portfolio Summary Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <h3>Total Portfolio Value</h3>
            <p className="stat-value">${totalPortfolioValue.toLocaleString()}</p>
            <span className="stat-label">3 Properties</span>
          </div>
          <div className="stat-card">
            <h3>Total Equity</h3>
            <p className="stat-value">${totalEquity.toLocaleString()}</p>
            <span className="stat-label">Current Net Worth</span>
          </div>
          <div className="stat-card">
            <h3>Monthly Rental Income</h3>
            <p className="stat-value">${monthlyRentalIncome.toLocaleString()}</p>
            <span className="stat-label">Gross Rental Income</span>
          </div>
          <div className="stat-card">
            <h3>Net Cash Flow</h3>
            <p className="stat-value text-status-active">${netMonthlyIncome.toLocaleString()}</p>
            <span className="stat-label">Monthly After Mortgage</span>
          </div>
        </div>
      </section>

      {/* Primary Residence Summary */}
      <section className="mb-8">
        <h2 className="section-title">Primary Residence</h2>
        {isLoadingProperties ? (
          <div className="domain-card">
            <p className="text-text-secondary">Loading...</p>
          </div>
        ) : primaryResidence ? (
          <div className="domain-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="domain-title-small">Property Details</h3>
                <div className="space-y-2">
                  <p><strong>Address:</strong> {primaryResidence.property_data.address}</p>
                  <p><strong>City:</strong> {primaryResidence.property_data.city}, {primaryResidence.property_data.state} {primaryResidence.property_data.zipCode}</p>
                  <p><strong>Size:</strong> {primaryResidence.property_data.bedrooms}br/{primaryResidence.property_data.bathrooms}ba • {primaryResidence.property_data.sqft?.toLocaleString()} sqft</p>
                  <p><strong>Lot:</strong> {(primaryResidence.property_data.lotSize / 43560).toFixed(2)} acres</p>
                  <p><strong>Built:</strong> {primaryResidence.property_data.yearBuilt}</p>
                  {primaryResidence.property_data.features && primaryResidence.property_data.features.length > 0 && (
                    <p><strong>Features:</strong> {primaryResidence.property_data.features.slice(0, 5).join(', ')}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="domain-title-small">Financial Summary</h3>
                <div className="space-y-2">
                  <p><strong>Current Value:</strong> <span className="text-accent-primary">${primaryResidence.property_data.price?.toLocaleString()}</span></p>
                  {primaryResidence.user_mortgage_data?.purchase_price && (
                    <p><strong>Purchase Price:</strong> ${primaryResidence.user_mortgage_data.purchase_price.toLocaleString()}</p>
                  )}
                  {primaryResidence.user_mortgage_data?.mortgage_balance && (
                    <p><strong>Mortgage Balance:</strong> ${primaryResidence.user_mortgage_data.mortgage_balance.toLocaleString()}</p>
                  )}
                  <p><strong>Current Equity:</strong> <span className="text-status-active">${primaryEquity.toLocaleString()}</span></p>
                  {primaryResidence.user_mortgage_data?.monthly_payment && (
                    <p><strong>Monthly Payment:</strong> ${primaryResidence.user_mortgage_data.monthly_payment.toLocaleString()}</p>
                  )}
                  {primaryResidence.user_mortgage_data?.purchase_date && (
                    <p><strong>Purchase Date:</strong> {new Date(primaryResidence.user_mortgage_data.purchase_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="domain-title-small">Performance</h3>
                <div className="space-y-2">
                  {primaryResidence.user_mortgage_data?.purchase_price && (
                    <>
                      <p><strong>Appreciation:</strong> <span className="text-status-active">${((primaryResidence.property_data.price || 0) - primaryResidence.user_mortgage_data.purchase_price).toLocaleString()}</span></p>
                      <p><strong>ROI:</strong> <span className="text-status-active">{(((primaryResidence.property_data.price || 0) - primaryResidence.user_mortgage_data.purchase_price) / primaryResidence.user_mortgage_data.purchase_price * 100).toFixed(1)}%</span></p>
                    </>
                  )}
                  {primaryResidence.user_mortgage_data?.purchase_date && (
                    <p><strong>Years Owned:</strong> {Math.round((new Date().getTime() - new Date(primaryResidence.user_mortgage_data.purchase_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}</p>
                  )}
                  <p><strong>Added:</strong> {new Date(primaryResidence.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="domain-card">
            <p className="text-text-secondary">No primary residence added yet. <Link href="/portfolio" className="text-accent-primary hover:underline">Add one in Portfolio →</Link></p>
          </div>
        )}
      </section>

      {/* Rental Properties Summary */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title mb-0">Rental Properties</h2>
          <Link href="/portfolio" className="btn-secondary">
            View All Properties
          </Link>
        </div>
        {isLoadingProperties ? (
          <div className="domain-card">Loading properties...</div>
        ) : rentalProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentalProperties.map((property) => {
              const propertyValue = property.property_data.price || 0;
              const mortgageBalance = property.user_mortgage_data?.mortgageBalance || 0;
              const equity = propertyValue - mortgageBalance;
              const monthlyRent = property.user_mortgage_data?.monthlyRentalIncome || 0;
              const monthlyExpenses = property.user_mortgage_data?.monthlyRentalExpenses || 0;
              const monthlyProfit = monthlyRent - monthlyExpenses;
              
              return (
                <div key={property.zpid} className="domain-card">
                  <h3 className="domain-title-small">{property.property_data.address}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>City:</strong> {property.property_data.city}, {property.property_data.state}</p>
                      <p><strong>Size:</strong> {property.property_data.bedrooms}br/{property.property_data.bathrooms}ba • {property.property_data.livingArea?.toLocaleString() || 'N/A'} sqft</p>
                      <p><strong>Built:</strong> {property.property_data.yearBuilt || 'N/A'}</p>
                      <p><strong>Lot:</strong> {property.property_data.lotAreaValue ? `${property.property_data.lotAreaValue.toLocaleString()} ${property.property_data.lotAreaUnit || ''}` : 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Current Value:</strong> <span className="text-accent-primary">${propertyValue.toLocaleString()}</span></p>
                      <p><strong>Monthly Rent:</strong> <span className="text-status-active">${monthlyRent.toLocaleString()}</span></p>
                      <p><strong>Monthly Profit:</strong> <span className="text-status-active">${monthlyProfit.toLocaleString()}</span></p>
                      <p><strong>Equity:</strong> <span className="text-status-active">${equity.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="domain-card">No rental properties on file</div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/portfolio" className="domain-card">
            <h3 className="domain-title-small">📊 Manage Portfolio</h3>
            <p className="domain-description">View, edit, and add new properties to your portfolio</p>
          </Link>
          <Link href="/real-estate" className="domain-card">
            <h3 className="domain-title-small">🏘️ Analyze Property</h3>
            <p className="domain-description">Add a new property from Zillow URL for analysis</p>
          </Link>
          <Link href="/config" className="domain-card">
            <h3 className="domain-title-small">⚙️ Configure Preferences</h3>
            <p className="domain-description">Set your investment criteria and preferences</p>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}
