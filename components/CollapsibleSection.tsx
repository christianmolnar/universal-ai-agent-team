'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true,
  className = ''
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible-section ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="collapsible-header"
        aria-expanded={isOpen}
      >
        <h2 className="collapsible-title">{title}</h2>
        <span className="collapsible-icon">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}
