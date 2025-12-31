/**
 * Real Estate Batch Analysis Page
 * Complete workflow for analyzing multiple properties with AI-powered insights
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import PropertyTypeSelector, { PropertyTypeOption } from '@/components/PropertyTypeSelector';
import URLInputGrid from '@/components/URLInputGrid';
import AnalysisProgressModal, { PropertyStatus } from '@/components/AnalysisProgressModal';
import PropertyResultsTable from '@/components/PropertyResultsTable';
import { PropertyAnalysis, ProgressUpdate } from '@/src/types/batch-analysis';

export default function RealEstateAnalysisV2Page() {
  // Core analysis state
  const [propertyType, setPropertyType] = useState<PropertyTypeOption>('rentals');
  const [urls, setUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressUpdate | null>(null);
  const [results, setResults] = useState<PropertyAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Search import state
  const [showSearchImport, setShowSearchImport] = useState(false);
  const [searchUrl, setSearchUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProperties, setPreviewProperties] = useState<Array<{ url: string; address?: string }>>([]);
  const [selectedProperties, setSelectedProperties] = useState<Set<number>>(new Set());
  
  // Progress tracking state
  const [propertyAddresses, setPropertyAddresses] = useState<Map<number, string>>(new Map());
  const [shouldStopAfterCurrent, setShouldStopAfterCurrent] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  /**
   * Start batch analysis
   */
  const handleStartAnalysis = async () => {
    if (urls.length === 0) {
      setError('Please add at least one Zillow URL');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setShowProgressModal(true);
    setResults([]);
    setPropertyAddresses(new Map()); // Clear previous addresses

    try {
      // Convert property type from UI format to API format
      const apiPropertyType = propertyType === 'rentals' ? 'rental' : propertyType === 'primary' ? 'primary' : 'both';
      
      // Map URLs to property objects based on selected type
      const properties = urls.map(url => ({
        url,
        type: apiPropertyType === 'both' ? 'rental' : apiPropertyType,
      }));

      // Start batch analysis
      const response = await fetch('/api/analysis/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user', // TODO: Get from auth session
          propertyType: apiPropertyType,
          properties,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start analysis');
      }

      const data = await response.json();
      setCurrentBatchId(data.batchId);

      // Connect to WebSocket for real-time updates
      connectWebSocket(data.batchId);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setIsAnalyzing(false);
    }
  };

  /**
   * Connect to WebSocket for real-time progress updates
   */
  const connectWebSocket = (batchId: string) => {
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Determine WebSocket URL (ws or wss based on protocol)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/progress?batchId=${batchId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'progress') {
        // Update progress data
        const update: ProgressUpdate = {
          ...message,
          timestamp: new Date(message.timestamp),
        };
        setProgressData(update);

        // Store property address if provided
        if (message.propertyAddress && message.propertyIndex !== undefined) {
          setPropertyAddresses(prev => {
            const newMap = new Map(prev);
            newMap.set(message.propertyIndex, message.propertyAddress);
            return newMap;
          });
        }

        // Check if batch is complete
        if (message.eventType === 'batch_completed') {
          fetchResults(batchId);
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  /**
   * Fetch final results
   */
  const fetchResults = async (batchId: string) => {
    try {
      const response = await fetch(`/api/analysis/batch?batchId=${batchId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data.results || []);
      setIsAnalyzing(false);
      // Keep modal open so user can click "View Results"
    } catch (err) {
      console.error('Fetch results error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      setIsAnalyzing(false);
    }
  };

  /**
   * Import properties from Zillow search URL
   */
  const handleImportFromSearch = async () => {
    if (!searchUrl || !searchUrl.includes('zillow.com')) {
      setError('Please enter a valid Zillow search URL');
      return;
    }

    setError(null);
    setIsImporting(true);
    setImportProgress({ current: 0, total: 3 }); // Assume 3 pages max

    try {
      // Simulate progress updates (since API doesn't provide streaming)
      const progressInterval = setInterval(() => {
        setImportProgress(prev => ({
          ...prev,
          current: Math.min(prev.current + 1, prev.total)
        }));
      }, 1000);

      const response = await fetch('/api/zillow/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchUrl,
          maxPages: 3,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import search results');
      }

      const data = await response.json();
      
      if (data.propertyUrls && data.propertyUrls.length > 0) {
        const validUrls = data.propertyUrls.filter((url: string) => 
          url.includes('homedetails') && (url.includes('_zpid') || url.includes('zpid='))
        );
        
        if (validUrls.length > 0) {
          // Convert URLs to property objects with extracted addresses
          const properties = validUrls.map((url: string) => {
            // Extract address from URL
            const match = url.match(/\/homedetails\/([^/]+)/);
            const address = match ? decodeURIComponent(match[1]).replace(/-/g, ' ') : undefined;
            return { url, address };
          });
          
          setPreviewProperties(properties);
          setSelectedProperties(new Set(properties.map((_: any, index: number) => index)));
          setShowPreviewModal(true);
          setShowSearchImport(false);
          setSearchUrl('');
        } else {
          setError('No valid property URLs found in search results');
        }
      } else {
        setError('No properties found in search results');
      }
    } catch (err) {
      console.error('Search import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import search results');
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  /**
   * Handle "Stop After Current" button
   */
  const handleStopAfterCurrent = () => {
    setShouldStopAfterCurrent(true);
    // Don't close WebSocket - let it finish current property and receive final update
    // The backend will send batch_completed event when done
  };

  /**
   * Handle "Cancel Analysis" button
   */
  const handleCancelAnalysis = () => {
    setShouldStopAfterCurrent(true);
    setIsAnalyzing(false);
    
    // Close WebSocket for immediate cancel
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Fetch partial results
    if (currentBatchId) {
      fetchResults(currentBatchId);
    }
  };

  /**
   * Convert ProgressUpdate to PropertyStatus array for modal
   */
  const getPropertyStatuses = (): PropertyStatus[] => {
    if (!progressData) return [];

    // Create status entries based on progress
    const statuses: PropertyStatus[] = [];
    const totalProps = progressData.progress.total;
    const completedProps = progressData.progress.completed;

    for (let i = 0; i < totalProps; i++) {
      const isCompleted = i < completedProps;
      const isCurrent = i === completedProps;
      
      // Get stored address or extract from URL
      let address = propertyAddresses.get(i);
      if (!address && urls[i]) {
        // Fallback: extract from URL
        const urlMatch = urls[i].match(/\/homedetails\/([^/]+)/);
        address = urlMatch ? decodeURIComponent(urlMatch[1]).replace(/-/g, ' ') : `Property ${i + 1}`;
      }
      if (!address) {
        address = `Property ${i + 1}`;
      }

      statuses.push({
        id: `property-${i}`,
        address,
        status: isCompleted ? 'completed' : isCurrent ? getCurrentStatus(progressData.eventType) : 'pending',
        score: isCompleted && progressData.data?.score ? progressData.data.score : undefined,
      });
    }

    return statuses;
  };

  const getCurrentStatus = (eventType: string): PropertyStatus['status'] => {
    // Map event types to valid PropertyStatus values
    if (eventType.includes('error') || eventType.includes('failed')) return 'error';
    if (eventType.includes('completed')) return 'completed';
    return 'in-progress'; // Any active event means in-progress
  };

  const getStepDescription = (eventType: string): string => {
    const descriptions: Record<string, string> = {
      batch_started: 'Initializing batch analysis...',
      scraping_started: 'Scraping property data from Zillow...',
      scraping_completed: 'Property data extracted',
      analysis_started: 'AI analyzing property with Claude...',
      analysis_completed: 'Primary analysis complete',
      quality_review_started: 'GPT-4 reviewing analysis quality...',
      quality_review_completed: 'Quality review complete',
      final_validation_started: 'Performing final validation...',
      final_validation_completed: 'Validation complete',
      batch_completed: 'All properties analyzed!',
    };
    return descriptions[eventType] || 'Processing...';
  };

  /**
   * Cleanup WebSocket on unmount
   */
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Real Estate Batch Analysis
          </h1>
          <p className="text-[var(--text-secondary)]">
            Analyze multiple properties with AI-powered insights. Three-model validation ensures accuracy.
          </p>
        </div>

        {/* Analysis Configuration */}
        {!isAnalyzing && results.length === 0 && (
          <div className="space-y-6">
            {/* Property Type Selection */}
            <div className="bg-[var(--card-background)] border-2 border-[var(--border-color)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Step 1: Select Property Type
              </h2>
              <PropertyTypeSelector
                defaultValue={propertyType}
                onChange={setPropertyType}
              />
            </div>

            {/* Import from Search */}
            <div className="bg-[var(--card-background)] border-2 border-[var(--border-color)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Step 2a: Import from Search (Optional)
                </h2>
                <button
                  onClick={() => setShowSearchImport(!showSearchImport)}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--background)] font-semibold transition-colors"
                >
                  {showSearchImport ? 'Hide Import' : 'Import from Search'}
                </button>
              </div>
              
              {showSearchImport && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Zillow Search Results URL
                    </label>
                    <input
                      type="url"
                      value={searchUrl}
                      onChange={(e) => setSearchUrl(e.target.value)}
                      placeholder="https://www.zillow.com/homes/for_sale/..."
                      className="w-full px-4 py-3 rounded-lg bg-[var(--input-background)] border-2 border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      Paste the URL from a Zillow search results page. We'll extract all property URLs from up to 3 pages.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleImportFromSearch}
                    disabled={!searchUrl || isImporting}
                    className="w-full py-3 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-[var(--input-background)] disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>
                          {importProgress.total > 0 
                            ? `Scraping page ${importProgress.current} of ${importProgress.total}...` 
                            : 'Importing Properties...'}
                        </span>
                      </>
                    ) : (
                      <>
                        🔍 Import Properties from Search
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div className="bg-[var(--card-background)] border-2 border-[var(--border-color)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Step 2: Add Zillow Property URLs
              </h2>
              <URLInputGrid
                sectionTitle="Property URLs"
                initialCount={4}
                onUrlsChange={setUrls}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500 bg-opacity-10 border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-500 font-semibold">{error}</p>
              </div>
            )}

            {/* Start Analysis Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={urls.length === 0}
              className="w-full py-4 px-6 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] disabled:bg-[var(--input-background)] disabled:cursor-not-allowed text-[var(--background)] font-bold text-lg transition-colors"
            >
              {urls.length === 0 ? 'Add URLs to Start Analysis' : `Analyze ${urls.length} ${urls.length === 1 ? 'Property' : 'Properties'}`}
            </button>

            {/* Info Box */}
            <div className="bg-[var(--input-background)] border border-[var(--border-color)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                How It Works
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-1">1.</span>
                  <span><strong>Data Scraping:</strong> Extract property details from Zillow using Firecrawl</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-1">2.</span>
                  <span><strong>Primary Analysis:</strong> Claude 3.5 Sonnet analyzes each property with comprehensive scoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-1">3.</span>
                  <span><strong>Quality Review:</strong> GPT-4 validates analysis accuracy and flags issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-1">4.</span>
                  <span><strong>Final Validation:</strong> Quality-adjusted scores and recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Progress Modal */}
        {showProgressModal && progressData && (
          <AnalysisProgressModal
            isOpen={showProgressModal}
            onClose={() => {
              setShowProgressModal(false);
              // Results table will now be visible
            }}
            batchId={currentBatchId || ''}
            totalProperties={progressData.progress.total}
            currentStep={getStepDescription(progressData.eventType)}
            propertyStatuses={getPropertyStatuses()}
            overallProgress={progressData.progress.percentage}
            canClose={!isAnalyzing} // Allow closing only when complete
            onStopAfterCurrent={isAnalyzing ? handleStopAfterCurrent : undefined}
            onCancel={handleCancelAnalysis}
            isStopping={shouldStopAfterCurrent}
          />
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  Analysis Results
                </h2>
                <p className="text-[var(--text-secondary)] mt-1">
                  {results.length} {results.length === 1 ? 'property' : 'properties'} analyzed
                </p>
              </div>
              <button
                onClick={() => {
                  setResults([]);
                  setCurrentBatchId(null);
                  setProgressData(null);
                  setShowProgressModal(false);
                  setUrls([]);
                }}
                className="px-6 py-3 rounded-lg border-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold transition-colors"
              >
                Start New Analysis
              </button>
            </div>

            <PropertyResultsTable
              properties={results}
              onPropertyClick={(property: PropertyAnalysis) => {
                console.log('View property details:', property);
                // TODO: Open property detail modal
              }}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewProperties.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-[var(--card-background)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-[var(--border-color)] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Imported Properties ({previewProperties.length})
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Selection Controls */}
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--input-background)]">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const allIndices = new Set(previewProperties.map((_, i) => i));
                    setSelectedProperties(allIndices);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedProperties(new Set())}
                  className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                >
                  Deselect All
                </button>
              </div>
              <div className="text-[var(--text-primary)] font-semibold">
                {selectedProperties.size} of {previewProperties.length} selected
              </div>
            </div>

            {/* Property List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {previewProperties.map((property, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const newSelection = new Set(selectedProperties);
                      if (newSelection.has(index)) {
                        newSelection.delete(index);
                      } else {
                        newSelection.add(index);
                      }
                      setSelectedProperties(newSelection);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProperties.has(index)
                        ? 'border-[var(--accent-primary)]'
                        : 'border-[var(--border-color)] hover:border-[var(--accent-secondary)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProperties.has(index)}
                        onChange={() => {}} // Handled by parent div click
                        className="mt-1 w-5 h-5 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--text-primary)] mb-1">
                          {property.address || `Property ${index + 1}`}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] break-all">
                          {property.url}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t-2 border-[var(--border-color)] flex items-center justify-between">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const selectedUrls = previewProperties
                    .filter((_, index) => selectedProperties.has(index))
                    .map(p => p.url);
                  
                  // Set URLs and close modal
                  setUrls(selectedUrls);
                  setShowPreviewModal(false);
                  setShowSearchImport(false);
                  
                  // Start analysis immediately
                  if (selectedUrls.length > 0) {
                    // Give state time to update, then start
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    setError(null);
                    setIsAnalyzing(true);
                    setShowProgressModal(true);
                    setResults([]);
                    setPropertyAddresses(new Map());

                    try {
                      const apiPropertyType = propertyType === 'rentals' ? 'rental' : propertyType === 'primary' ? 'primary' : 'both';
                      
                      const properties = selectedUrls.map(url => ({
                        url,
                        type: apiPropertyType === 'both' ? 'rental' : apiPropertyType,
                      }));

                      const response = await fetch('/api/analysis/batch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: 'demo-user',
                          propertyType: apiPropertyType,
                          properties,
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to start analysis');
                      }

                      const data = await response.json();
                      setCurrentBatchId(data.batchId);
                      connectWebSocket(data.batchId);

                    } catch (err) {
                      console.error('Analysis error:', err);
                      setError(err instanceof Error ? err.message : 'Failed to start analysis');
                      setIsAnalyzing(false);
                    }
                  }
                }}
                disabled={selectedProperties.size === 0}
                className="px-6 py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] disabled:bg-[var(--input-background)] disabled:cursor-not-allowed text-[var(--background)] font-bold transition-colors"
              >
                Start Analysis - {selectedProperties.size} {selectedProperties.size === 1 ? 'Property' : 'Properties'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
