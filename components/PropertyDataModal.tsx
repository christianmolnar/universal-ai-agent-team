/**
 * Property Data Modal Component
 * Shows detailed scraped property data for debugging and verification
 */

'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/src/types/batch-analysis';

interface PropertyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyData: PropertyData;
}

export default function PropertyDataModal({
  isOpen,
  onClose,
  propertyData,
}: PropertyDataModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[var(--card-background)] border-2 border-[var(--border-color)] p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold text-[var(--text-primary)]">
                    Property Data
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-[var(--hover-background)] transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                  </button>
                </div>

                {/* Property Data Grid */}
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Basic Info */}
                  <div className="bg-[var(--input-background)] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DataField label="ZPID" value={propertyData.zpid} />
                      <DataField label="Address" value={propertyData.address} />
                      <DataField label="City" value={propertyData.city} />
                      <DataField label="State" value={propertyData.state} />
                      <DataField label="Zip Code" value={propertyData.zipCode} />
                      <DataField 
                        label="Price" 
                        value={propertyData.price ? `$${propertyData.price.toLocaleString()}` : 'N/A'} 
                        highlight={true}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-[var(--input-background)] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                      Property Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DataField label="Bedrooms" value={propertyData.bedrooms} />
                      <DataField label="Bathrooms" value={propertyData.bathrooms} />
                      <DataField 
                        label="Living Area" 
                        value={propertyData.livingArea ? `${propertyData.livingArea.toLocaleString()} sqft` : 'N/A'} 
                      />
                      <DataField 
                        label="Lot Size" 
                        value={propertyData.lotAreaValue ? `${propertyData.lotAreaValue.toLocaleString()} ${propertyData.lotAreaUnit || 'sqft'}` : 'N/A'} 
                      />
                      <DataField label="Year Built" value={propertyData.yearBuilt || 'N/A'} />
                      <DataField label="Property Type" value={propertyData.propertyType || 'N/A'} />
                    </div>
                  </div>

                  {/* Estimates */}
                  {(propertyData.zestimate || propertyData.rentZestimate) && (
                    <div className="bg-[var(--input-background)] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                        Zillow Estimates
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {propertyData.zestimate && (
                          <DataField 
                            label="Zestimate" 
                            value={`$${propertyData.zestimate.toLocaleString()}`} 
                          />
                        )}
                        {propertyData.rentZestimate && (
                          <DataField 
                            label="Rent Zestimate" 
                            value={`$${propertyData.rentZestimate.toLocaleString()}/mo`} 
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {propertyData.description && (
                    <div className="bg-[var(--input-background)] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                        Description
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                        {propertyData.description}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  {propertyData.features && propertyData.features.length > 0 && (
                    <div className="bg-[var(--input-background)] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {propertyData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full bg-[var(--card-background)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Markdown (for debugging) */}
                  {propertyData.rawMarkdown && (
                    <div className="bg-[var(--input-background)] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-3">
                        Raw Scraped Data (First 1000 chars)
                      </h3>
                      <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap overflow-x-auto">
                        {propertyData.rawMarkdown.substring(0, 1000)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--background)] font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Helper component for data fields
function DataField({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)] uppercase mb-1">{label}</div>
      <div className={`text-sm font-medium ${highlight ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
    </div>
  );
}
