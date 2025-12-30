/**
 * URLInputGrid Component
 * Dynamic URL input fields for property URLs with add/remove functionality
 */

'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface URLInputGridProps {
  sectionTitle: string;
  initialCount?: number;
  onUrlsChange: (urls: string[]) => void;
  validator?: (url: string) => boolean;
}

export default function URLInputGrid({
  sectionTitle,
  initialCount = 4,
  onUrlsChange,
  validator
}: URLInputGridProps) {
  const [urls, setUrls] = useState<string[]>(Array(initialCount).fill(''));
  const [errors, setErrors] = useState<Record<number, string>>({});

  const validateZillowUrl = (url: string): boolean => {
    if (!url) return true; // Empty is OK
    if (validator) return validator(url);
    
    // Default Zillow URL validation
    const zillowPattern = /^https?:\/\/(www\.)?zillow\.com\/homedetails\/.+\/\d+_zpid/i;
    return zillowPattern.test(url);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
    
    // Validate
    const newErrors = { ...errors };
    if (value && !validateZillowUrl(value)) {
      newErrors[index] = 'Please enter a valid Zillow property URL';
    } else {
      delete newErrors[index];
    }
    setErrors(newErrors);
    
    // Return only non-empty valid URLs
    const validUrls = newUrls.filter(url => url.trim() && validateZillowUrl(url));
    onUrlsChange(validUrls);
  };

  const handleRemove = (index: number) => {
    if (urls.length <= 1) return; // Keep at least one field
    
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
    
    const newErrors = { ...errors };
    delete newErrors[index];
    // Reindex remaining errors
    const reindexedErrors: Record<number, string> = {};
    Object.entries(newErrors).forEach(([key, value]) => {
      const oldIndex = parseInt(key);
      const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
      reindexedErrors[newIndex] = value;
    });
    setErrors(reindexedErrors);
    
    const validUrls = newUrls.filter(url => url.trim() && validateZillowUrl(url));
    onUrlsChange(validUrls);
  };

  const handleAdd = () => {
    setUrls([...urls, '']);
  };

  return (
    <div className="url-input-section mb-8">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-semibold text-[var(--text-primary)]">
          {sectionTitle}
        </h4>
        <span className="text-sm text-[var(--text-secondary)]">
          {urls.filter(url => url.trim() && validateZillowUrl(url)).length} valid URLs
        </span>
      </div>

      <div className="space-y-3">
        {urls.map((url, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://www.zillow.com/homedetails/..."
                className={`
                  w-full px-4 py-3 
                  bg-[var(--input-background)] 
                  border-2 rounded-lg
                  text-[var(--text-primary)]
                  placeholder-[var(--text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-50
                  transition-all duration-200
                  ${errors[index] 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[var(--border-color)] focus:border-[var(--accent-primary)]'
                  }
                `}
              />
              {errors[index] && (
                <p className="text-red-500 text-sm mt-1 ml-1">
                  {errors[index]}
                </p>
              )}
            </div>
            
            {urls.length > 1 && (
              <button
                onClick={() => handleRemove(index)}
                className="
                  p-3 rounded-lg
                  bg-[var(--card-background)]
                  border-2 border-[var(--border-color)]
                  hover:border-red-500 hover:bg-red-500 hover:bg-opacity-10
                  transition-all duration-200
                  flex-shrink-0
                "
                title="Remove URL"
              >
                <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)] hover:text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="
          mt-4 px-4 py-2 rounded-lg
          bg-[var(--card-background)]
          border-2 border-[var(--border-color)]
          hover:border-[var(--accent-primary)] hover:bg-[var(--hover-background)]
          text-[var(--text-secondary)] hover:text-[var(--accent-primary)]
          font-medium
          transition-all duration-200
          flex items-center gap-2
        "
      >
        <PlusIcon className="w-5 h-5" />
        Add Another URL
      </button>
    </div>
  );
}
