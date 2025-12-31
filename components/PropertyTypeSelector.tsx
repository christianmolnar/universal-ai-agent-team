/**
 * PropertyTypeSelector Component
 * Allows user to select analysis type: Primary, Investment Property, or Both
 */

'use client';

import { useState } from 'react';

export type PropertyTypeOption = 'rentals' | 'primary' | 'both';

interface PropertyTypeSelectorProps {
  defaultValue?: PropertyTypeOption;
  onChange: (value: PropertyTypeOption) => void;
}

export default function PropertyTypeSelector({ 
  defaultValue = 'rentals', 
  onChange 
}: PropertyTypeSelectorProps) {
  const [selected, setSelected] = useState<PropertyTypeOption>(defaultValue);

  const handleSelect = (value: PropertyTypeOption) => {
    setSelected(value);
    onChange(value);
  };

  const options: { value: PropertyTypeOption; label: string; description: string }[] = [
    {
      value: 'primary',
      label: 'Primary Residence',
      description: 'Personal home for owner occupancy'
    },
    {
      value: 'rentals',
      label: 'Investment Property',
      description: 'Investment properties for rental income'
    },
    {
      value: 'both',
      label: 'Both',
      description: 'Analyze rental and primary residence options'
    }
  ];

  return (
    <div className="mb-12">
      <h3 className="section-title mb-6">What type of properties do you want to analyze?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`
              bg-[var(--card-background)] border-2 rounded-lg p-6 text-left cursor-pointer
              transition-all duration-200
              hover:bg-[var(--hover-background)]
              ${selected === option.value 
                ? 'border-[var(--accent-primary)] bg-[var(--hover-background)] shadow-[0_0_0_3px_rgba(255,179,71,0.1)]' 
                : 'border-[var(--border-color)] hover:border-[var(--accent-secondary)]'
              }
            `}
          >
            <div className="flex items-start">
              <div className={`
                w-5 h-5 border-2 rounded-full mr-4 flex-shrink-0 flex items-center justify-center
                transition-all duration-200
                ${selected === option.value 
                  ? 'border-[var(--accent-primary)]' 
                  : 'border-[var(--border-color)]'
                }
              `}>
                {selected === option.value && (
                  <div className="w-2.5 h-2.5 bg-[var(--accent-primary)] rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {option.label}
                </div>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
