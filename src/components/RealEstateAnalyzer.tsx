'use client';

import { useState } from 'react';

interface AnalysisResult {
  qualityScore: number;
  recommendation: string;
  analysis: {
    summary: string;
    keyFindings: string[];
    riskFactors: string[];
    opportunities: string[];
    financialMetrics: Record<string, number>;
  };
  confidence: number;
  generatedAt: string;
}

export default function RealEstateAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    propertyAddress: '',
    listingPrice: '',
    propertyType: 'single-family',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    yearBuilt: '',
    downPayment: '',
    interestRate: '7.5',
    targetCashFlow: '500'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData({
      ...formData,
      [target.name]: target.value
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisRequest = {
        domainType: 'real-estate',
        inputData: {
          propertyAddress: formData.propertyAddress,
          listingPrice: parseInt(formData.listingPrice),
          propertyType: formData.propertyType,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          squareFootage: parseInt(formData.squareFootage),
          yearBuilt: parseInt(formData.yearBuilt),
          downPayment: formData.downPayment ? parseInt(formData.downPayment) : undefined,
          interestRate: parseFloat(formData.interestRate) / 100,
          targetCashFlow: parseInt(formData.targetCashFlow)
        },
        qualityThreshold: 85
      };

      console.log('Submitting analysis request:', analysisRequest);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisRequest)
      });

      const data = await response.json() as {
        success: boolean;
        analysis?: AnalysisResult;
        error?: string;
      };

      if (data.success && data.analysis) {
        setResult(data.analysis);
        console.log('Analysis completed:', data.analysis);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = formData.propertyAddress && formData.listingPrice && 
                    formData.bedrooms && formData.bathrooms && formData.squareFootage;

  return (
    <div className="analyzer-container">
      <div className="analyzer-header">
        <h2 className="section-title">Real Estate Analysis</h2>
        <p className="analyzer-subtitle">Enter property details for comprehensive investment analysis</p>
      </div>

      <div className="analyzer-content">
        {/* Analysis Form */}
        <div className="analysis-form">
          <div className="form-section">
            <h3 className="form-section-title">Property Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="propertyAddress">Property Address</label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, City, State"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="listingPrice">Listing Price ($)</label>
                <input
                  type="number"
                  id="listingPrice"
                  name="listingPrice"
                  value={formData.listingPrice}
                  onChange={handleInputChange}
                  placeholder="425000"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="propertyType">Property Type</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="single-family">Single Family</option>
                  <option value="multi-family">Multi Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="3"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="2.5"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="squareFootage">Square Footage</label>
                <input
                  type="number"
                  id="squareFootage"
                  name="squareFootage"
                  value={formData.squareFootage}
                  onChange={handleInputChange}
                  placeholder="1850"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yearBuilt">Year Built</label>
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  placeholder="1995"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Financial Parameters</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="downPayment">Down Payment ($)</label>
                <input
                  type="number"
                  id="downPayment"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleInputChange}
                  placeholder="Leave blank for 25% default"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="interestRate">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  placeholder="7.5"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetCashFlow">Target Monthly Cash Flow ($)</label>
                <input
                  type="number"
                  id="targetCashFlow"
                  name="targetCashFlow"
                  value={formData.targetCashFlow}
                  onChange={handleInputChange}
                  placeholder="500"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className="btn-primary analyzer-btn"
            >
              {isAnalyzing ? 'Analyzing Property...' : 'Start Analysis'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {(result || error) && (
          <div className="analysis-results">
            {error && (
              <div className="error-message">
                <h3>Analysis Error</h3>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="result-display">
                <div className="result-header">
                  <div className="result-score">
                    <span className="score-value">{result.qualityScore}</span>
                    <span className="score-label">/100</span>
                  </div>
                  <div className="result-recommendation">
                    <span className={`recommendation ${result.recommendation.toLowerCase()}`}>
                      {result.recommendation}
                    </span>
                    <span className="confidence">Confidence: {Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="result-summary">
                  <h3>Analysis Summary</h3>
                  <pre className="summary-text">{result.analysis.summary}</pre>
                </div>

                <div className="result-sections">
                  <div className="result-section">
                    <h4>Financial Metrics</h4>
                    <div className="metrics-grid">
                      {Object.entries(result.analysis.financialMetrics).map(([key, value]) => (
                        <div key={key} className="metric-item">
                          <span className="metric-label">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>
                          <span className="metric-value">
                            {key.includes('Rate') || key.includes('ROI') ? `${value}%` : 
                             typeof value === 'number' && value > 1000 ? `$${value.toLocaleString()}` : 
                             `$${value}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="result-section">
                    <h4>Key Findings</h4>
                    <ul className="findings-list">
                      {result.analysis.keyFindings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="result-section">
                    <h4>Risk Factors</h4>
                    <ul className="risks-list">
                      {result.analysis.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="result-section">
                    <h4>Opportunities</h4>
                    <ul className="opportunities-list">
                      {result.analysis.opportunities.map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="analysis-footer">
                  <span className="analysis-date">
                    Generated: {new Date(result.generatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
