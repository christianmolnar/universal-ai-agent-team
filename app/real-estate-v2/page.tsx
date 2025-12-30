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
  const [propertyType, setPropertyType] = useState<PropertyTypeOption>('rentals');
  const [urls, setUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressUpdate | null>(null);
  const [results, setResults] = useState<PropertyAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
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
    setResults([]);

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
    } catch (err) {
      console.error('Fetch results error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      setIsAnalyzing(false);
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

      statuses.push({
        id: `property-${i}`,
        address: progressData.propertyAddress || `Property ${i + 1}`,
        status: isCompleted ? 'completed' : isCurrent ? getCurrentStatus(progressData.eventType) : 'pending',
        score: isCompleted && progressData.data?.score ? progressData.data.score : undefined,
      });
    }

    return statuses;
  };

  const getCurrentStatus = (eventType: string): PropertyStatus['status'] => {
    if (eventType.includes('scraping')) return 'scraping';
    if (eventType.includes('analysis')) return 'analyzing';
    if (eventType.includes('quality')) return 'reviewing';
    if (eventType.includes('validation')) return 'validating';
    return 'pending';
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
        {isAnalyzing && progressData && (
          <AnalysisProgressModal
            isOpen={isAnalyzing}
            onClose={() => {}} // Don't allow closing during analysis
            batchId={currentBatchId || ''}
            totalProperties={progressData.progress.total}
            currentStep={getStepDescription(progressData.eventType)}
            propertyStatuses={getPropertyStatuses()}
            overallProgress={progressData.progress.percentage}
            canClose={false}
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
                  setUrls([]);
                }}
                className="px-6 py-3 rounded-lg border-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold transition-colors"
              >
                Start New Analysis
              </button>
            </div>

            <PropertyResultsTable
              properties={results}
              onPropertyClick={(property) => {
                console.log('View property details:', property);
                // TODO: Open property detail modal
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
