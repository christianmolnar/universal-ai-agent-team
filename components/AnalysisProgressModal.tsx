/**
 * Analysis Progress Modal
 * Real-time progress display for batch property analysis
 */

'use client';

import React from 'react';

export interface PropertyStatus {
  id: string;
  address: string;
  status: 'completed' | 'in-progress' | 'pending' | 'error';
  score?: number;
  error?: string;
}

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  totalProperties: number;
  currentStep: string;
  propertyStatuses: PropertyStatus[];
  overallProgress: number;
  canClose: boolean;
  onStopAfterCurrent?: () => void;
  onCancel?: () => void;
  isStopping?: boolean;
}

export default function AnalysisProgressModal({
  isOpen,
  onClose,
  batchId,
  totalProperties,
  currentStep,
  propertyStatuses,
  overallProgress,
  canClose,
  onStopAfterCurrent,
  onCancel,
  isStopping = false,
}: AnalysisProgressModalProps) {
  if (!isOpen) return null;

  const completedCount = propertyStatuses.filter((p) => p.status === 'completed').length;
  const isComplete = completedCount === totalProperties && overallProgress >= 100;

  // Status icons
  const getStatusIcon = (status: PropertyStatus['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⟳';
      case 'pending':
        return '○';
      case 'error':
        return '✗';
    }
  };

  // Status colors
  const getStatusColor = (status: PropertyStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600 animate-spin';
      case 'pending':
        return 'text-gray-400';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-[var(--card-background)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Analyzing Properties
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Batch ID: {batchId}
            </p>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Stopping Banner */}
        {isStopping && (
          <div className="px-6 py-3 bg-orange-500 bg-opacity-10 border-b border-orange-500">
            <div className="flex items-center gap-2 text-orange-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold">Stopping after current property...</span>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="p-6 space-y-4 border-b border-[var(--border-color)]">
          {/* Overall Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">Overall Progress</span>
              <span className="text-sm font-semibold text-[var(--accent-primary)]">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-[var(--input-background)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-300 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="flex items-center gap-3 p-4 bg-[var(--input-background)] rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 0116 0" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {currentStep}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Property {completedCount + 1} of {totalProperties}
              </div>
            </div>
          </div>
        </div>

        {/* Property Status List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Properties ({completedCount}/{totalProperties})
          </h3>
          <div className="space-y-2">
            {propertyStatuses.map((property) => (
              <div
                key={property.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  property.status === 'in-progress'
                    ? 'bg-blue-500 bg-opacity-10 border border-blue-500'
                    : property.status === 'completed'
                    ? 'bg-green-500 bg-opacity-10'
                    : property.status === 'error'
                    ? 'bg-red-500 bg-opacity-10'
                    : 'bg-[var(--input-background)]'
                }`}
              >
                <span className={`text-xl ${getStatusColor(property.status)}`}>
                  {getStatusIcon(property.status)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text-primary)] truncate">
                    {property.address}
                  </div>
                  {property.score !== undefined && (
                    <div className="text-sm text-[var(--text-secondary)]">
                      Score: {property.score}/100
                    </div>
                  )}
                  {property.error && (
                    <div className="text-sm text-red-600">
                      Error: {property.error}
                    </div>
                  )}
                </div>
                {property.status === 'in-progress' && (
                  <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t-2 border-[var(--border-color)] flex items-center justify-between">
          {!isComplete && (onStopAfterCurrent || onCancel) && (
            <div className="flex gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  disabled={isStopping}
                  className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                >
                  Cancel Analysis
                </button>
              )}
              {onStopAfterCurrent && (
                <button
                  onClick={onStopAfterCurrent}
                  disabled={isStopping}
                  className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                >
                  {isStopping ? 'Stopping...' : 'Stop After Current'}
                </button>
              )}
            </div>
          )}
          {isComplete && (
            <button
              onClick={onClose}
              className="ml-auto px-8 py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--background)] font-bold transition-colors"
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
