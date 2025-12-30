/**
 * AnalysisProgressModal Component
 * Real-time progress display during batch property analysis
 */

'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, ArrowPathIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface PropertyStatus {
  id: string;
  address: string;
  status: 'pending' | 'scraping' | 'analyzing' | 'reviewing' | 'validating' | 'completed' | 'failed';
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
  overallProgress: number; // 0-100
  canClose?: boolean; // Allow closing during analysis
}

export default function AnalysisProgressModal({
  isOpen,
  onClose,
  batchId,
  totalProperties,
  currentStep,
  propertyStatuses,
  overallProgress,
  canClose = false
}: AnalysisProgressModalProps) {
  const completedCount = propertyStatuses.filter(p => p.status === 'completed').length;
  const failedCount = propertyStatuses.filter(p => p.status === 'failed').length;

  const getStatusIcon = (status: PropertyStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-[var(--status-active)]" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-[var(--border-color)]"></div>;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />;
    }
  };

  const getStatusLabel = (status: PropertyStatus['status']) => {
    const labels: Record<typeof status, string> = {
      pending: 'Pending',
      scraping: 'Scraping data...',
      analyzing: 'Analyzing...',
      reviewing: 'Quality review...',
      validating: 'Final validation...',
      completed: 'Complete',
      failed: 'Failed'
    };
    return labels[status];
  };

  const processSteps = [
    { id: 'scraping', label: 'Data Scraping', status: overallProgress > 10 ? 'complete' : overallProgress > 0 ? 'active' : 'pending' },
    { id: 'analyzing', label: 'Primary Analysis (Claude)', status: overallProgress > 40 ? 'complete' : overallProgress > 10 ? 'active' : 'pending' },
    { id: 'reviewing', label: 'Quality Review (GPT-4)', status: overallProgress > 70 ? 'complete' : overallProgress > 40 ? 'active' : 'pending' },
    { id: 'validating', label: 'Final Validation', status: overallProgress > 90 ? 'complete' : overallProgress > 70 ? 'active' : 'pending' },
    { id: 'complete', label: 'Report Generation', status: overallProgress === 100 ? 'complete' : 'pending' }
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={canClose ? onClose : () => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[var(--card-background)] border-2 border-[var(--border-color)] p-8 text-left align-middle shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold text-[var(--text-primary)]">
                    {overallProgress === 100 ? 'Analysis Complete!' : 'Analyzing Properties'}
                  </Dialog.Title>
                  {canClose && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-[var(--hover-background)] transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                  )}
                </div>

                {/* Overall Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-[var(--accent-primary)]">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--input-background)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    {currentStep}
                  </p>
                </div>

                {/* Property Status List */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Properties ({completedCount}/{totalProperties} completed)
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {propertyStatuses.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-background)]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getStatusIcon(property.status)}
                          <span className="text-sm text-[var(--text-primary)] truncate">
                            {property.address || 'Property'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {property.score !== undefined && (
                            <span className="text-sm font-bold text-[var(--accent-primary)]">
                              {property.score}/100
                            </span>
                          )}
                          <span className={`text-xs ${
                            property.status === 'completed' ? 'text-[var(--status-active)]' :
                            property.status === 'failed' ? 'text-red-500' :
                            'text-[var(--text-secondary)]'
                          }`}>
                            {getStatusLabel(property.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process Steps */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Process
                  </h3>
                  <div className="space-y-2">
                    {processSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${step.status === 'complete' 
                            ? 'bg-[var(--status-active)] text-[var(--background)]' 
                            : step.status === 'active'
                            ? 'bg-[var(--accent-primary)] text-[var(--background)] animate-pulse'
                            : 'bg-[var(--input-background)] text-[var(--text-muted)]'
                          }
                        `}>
                          {step.status === 'complete' ? '✓' : index + 1}
                        </div>
                        <span className={`text-sm ${
                          step.status === 'complete' || step.status === 'active'
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)]'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {overallProgress === 100 && (
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--background)] font-semibold transition-colors"
                  >
                    View Results
                  </button>
                )}

                {failedCount > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
                    <p className="text-sm text-red-500">
                      {failedCount} {failedCount === 1 ? 'property' : 'properties'} failed to analyze. 
                      Results will be available for successfully analyzed properties.
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
