import { DashboardLayout } from '@/components/DashboardLayout';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import Link from 'next/link';

// Real property data - need actual property information from user
const realEstatePortfolio = {
  primaryResidence: {
    address: "Primary Residence", // User needs to provide actual address
    city: "Location TBD",
    purchaseDate: "2020-03-15", // User needs to provide actual date
    purchasePrice: 620000, // User needs to provide actual purchase price
    currentValue: 875000, // User needs to provide current market value
    mortgageBalance: 420000, // User needs to provide current mortgage balance
    monthlyPayment: 3200, // User needs to provide monthly payment
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2850,
    yearBuilt: 2005,
    lotSize: 0.75,
    features: ["Pool", "Casita", "Mountain View"]
  },
  rentalProperties: [
    {
      id: 1,
      address: "Rental Property #1", // User needs actual address
      city: "Mesa, AZ",
      purchaseDate: "2018-06-20",
      purchasePrice: 285000,
      currentValue: 425000,
      mortgageBalance: 180000,
      monthlyRent: 2400,
      monthlyMortgage: 1650,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1650,
      yearBuilt: 1998,
      lotSize: 0.25,
      managementType: "Self-managed"
    },
    {
      id: 2,
      address: "Rental Property #2", // User needs actual address
      city: "Tempe, AZ", 
      purchaseDate: "2019-08-12",
      purchasePrice: 295000,
      currentValue: 385000,
      mortgageBalance: 195000,
      monthlyRent: 2200,
      monthlyMortgage: 1580,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1480,
      yearBuilt: 2002,
      lotSize: 0.15,
      managementType: "Self-managed"
    }
  ]
};

export default function Home() {
  // Calculate portfolio metrics
  const totalPortfolioValue = realEstatePortfolio.primaryResidence.currentValue + 
    realEstatePortfolio.rentalProperties.reduce((sum, prop) => sum + prop.currentValue, 0);
  
  const totalEquity = realEstatePortfolio.primaryResidence.currentValue - realEstatePortfolio.primaryResidence.mortgageBalance +
    realEstatePortfolio.rentalProperties.reduce((sum, prop) => sum + (prop.currentValue - prop.mortgageBalance), 0);
  
  const monthlyRentalIncome = realEstatePortfolio.rentalProperties.reduce((sum, prop) => sum + prop.monthlyRent, 0);
  const monthlyRentalExpenses = realEstatePortfolio.rentalProperties.reduce((sum, prop) => sum + prop.monthlyMortgage, 0);
  const netMonthlyIncome = monthlyRentalIncome - monthlyRentalExpenses;

  const primaryEquity = realEstatePortfolio.primaryResidence.currentValue - realEstatePortfolio.primaryResidence.mortgageBalance;
  const primaryAppreciation = realEstatePortfolio.primaryResidence.currentValue - realEstatePortfolio.primaryResidence.purchasePrice;
  const primaryROI = (primaryAppreciation / realEstatePortfolio.primaryResidence.purchasePrice * 100);

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
      <CollapsibleSection title="Primary Residence" defaultOpen={true}>
        <div className="domain-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="domain-title-small">Property Details</h3>
              <div className="space-y-2">
                <p><strong>Address:</strong> {realEstatePortfolio.primaryResidence.address}</p>
                <p><strong>City:</strong> {realEstatePortfolio.primaryResidence.city}</p>
                <p><strong>Size:</strong> {realEstatePortfolio.primaryResidence.bedrooms}br/{realEstatePortfolio.primaryResidence.bathrooms}ba • {realEstatePortfolio.primaryResidence.sqft.toLocaleString()} sqft</p>
                <p><strong>Lot:</strong> {realEstatePortfolio.primaryResidence.lotSize} acres</p>
                <p><strong>Built:</strong> {realEstatePortfolio.primaryResidence.yearBuilt}</p>
                <p><strong>Features:</strong> {realEstatePortfolio.primaryResidence.features.join(', ')}</p>
              </div>
            </div>
            <div>
              <h3 className="domain-title-small">Financial Summary</h3>
              <div className="space-y-2">
                <p><strong>Current Value:</strong> <span className="text-accent-primary">${realEstatePortfolio.primaryResidence.currentValue.toLocaleString()}</span></p>
                <p><strong>Purchase Price:</strong> ${realEstatePortfolio.primaryResidence.purchasePrice.toLocaleString()}</p>
                <p><strong>Mortgage Balance:</strong> ${realEstatePortfolio.primaryResidence.mortgageBalance.toLocaleString()}</p>
                <p><strong>Current Equity:</strong> <span className="text-status-active">${primaryEquity.toLocaleString()}</span></p>
                <p><strong>Monthly Payment:</strong> ${realEstatePortfolio.primaryResidence.monthlyPayment.toLocaleString()}</p>
                <p><strong>Purchase Date:</strong> {new Date(realEstatePortfolio.primaryResidence.purchaseDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="domain-title-small">Performance</h3>
              <div className="space-y-2">
                <p><strong>Appreciation:</strong> <span className="text-status-active">${primaryAppreciation.toLocaleString()}</span></p>
                <p><strong>ROI:</strong> <span className="text-status-active">{primaryROI.toFixed(1)}%</span></p>
                <p><strong>Years Owned:</strong> {Math.round((new Date().getTime() - new Date(realEstatePortfolio.primaryResidence.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}</p>
                <p><strong>Annual ROI:</strong> <span className="text-status-active">{(primaryROI / Math.round((new Date().getTime() - new Date(realEstatePortfolio.primaryResidence.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))).toFixed(1)}%</span></p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Rental Properties Summary */}
      <CollapsibleSection title="Investment Properties" defaultOpen={true}>
        <div className="flex justify-between items-center mb-6">
          <Link href="/portfolio" className="btn-secondary">
            View Investment Portfolio
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {realEstatePortfolio.rentalProperties.map((property) => {
            const equity = property.currentValue - property.mortgageBalance;
            const appreciation = property.currentValue - property.purchasePrice;
            const monthlyProfit = property.monthlyRent - property.monthlyMortgage;
            const roi = (appreciation / property.purchasePrice * 100);
            const yearsOwned = Math.round((new Date().getTime() - new Date(property.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            
            return (
              <div key={property.id} className="domain-card">
                <h3 className="domain-title-small">Rental Property #{property.id}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Address:</strong> {property.address}</p>
                    <p><strong>City:</strong> {property.city}</p>
                    <p><strong>Size:</strong> {property.bedrooms}br/{property.bathrooms}ba • {property.sqft.toLocaleString()} sqft</p>
                    <p><strong>Built:</strong> {property.yearBuilt}</p>
                    <p><strong>Management:</strong> {property.managementType}</p>
                  </div>
                  <div>
                    <p><strong>Current Value:</strong> <span className="text-accent-primary">${property.currentValue.toLocaleString()}</span></p>
                    <p><strong>Monthly Rent:</strong> <span className="text-status-active">${property.monthlyRent.toLocaleString()}</span></p>
                    <p><strong>Monthly Profit:</strong> <span className="text-status-active">${monthlyProfit.toLocaleString()}</span></p>
                    <p><strong>Equity:</strong> <span className="text-status-active">${equity.toLocaleString()}</span></p>
                    <p><strong>Total ROI:</strong> <span className="text-status-active">{roi.toFixed(1)}%</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Quick Actions */}
      <section>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/portfolio" className="domain-card">
            <h3 className="domain-title-small">📊 Investment Portfolio</h3>
            <p className="domain-description">View and manage your investment properties</p>
          </Link>
          <Link href="/real-estate-v2" className="domain-card">
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
