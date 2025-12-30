/**
 * PropertyResultsTable Component
 * Sortable table displaying batch analysis results with expandable rows
 */

'use client';

import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { PropertyAnalysis } from '@/src/types/batch-analysis';

interface PropertyResultsTableProps {
  properties: PropertyAnalysis[];
  onPropertyClick?: (property: PropertyAnalysis) => void;
}

type SortField = 'address' | 'score' | 'recommendation' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function PropertyResultsTable({ properties, onPropertyClick }: PropertyResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'score' ? 'desc' : 'asc');
    }
  };

  const toggleRow = (propertyId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedProperties = [...properties].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'address':
        comparison = (a.property_data?.address || '').localeCompare(b.property_data?.address || '');
        break;
      case 'score':
        comparison = (a.quality_score || 0) - (b.quality_score || 0);
        break;
      case 'recommendation':
        const recOrder = { PROCEED: 3, CAUTION: 2, REJECT: 1 };
        comparison = (recOrder[a.recommendation as keyof typeof recOrder] || 0) - 
                    (recOrder[b.recommendation as keyof typeof recOrder] || 0);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getRecommendationBadge = (recommendation: string) => {
    const styles = {
      PROCEED: 'bg-green-500 bg-opacity-20 text-green-400 border-green-500',
      CAUTION: 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500',
      REJECT: 'bg-red-500 bg-opacity-20 text-red-400 border-red-500'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[recommendation as keyof typeof styles] || ''}`}>
        {recommendation}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border-2 border-[var(--border-color)]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-[var(--card-background)] border-b-2 border-[var(--border-color)]">
            <tr>
              <th className="w-8 p-4"></th>
              <th 
                className="p-4 text-left text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
                onClick={() => handleSort('address')}
              >
                Property <SortIcon field="address" />
              </th>
              <th 
                className="p-4 text-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
                onClick={() => handleSort('score')}
              >
                Score <SortIcon field="score" />
              </th>
              <th 
                className="p-4 text-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
                onClick={() => handleSort('recommendation')}
              >
                Recommendation <SortIcon field="recommendation" />
              </th>
              <th className="p-4 text-center text-sm font-semibold text-[var(--text-primary)]">
                Quality
              </th>
              <th 
                className="p-4 text-right text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
                onClick={() => handleSort('created_at')}
              >
                Date <SortIcon field="created_at" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--input-background)]">
            {sortedProperties.map((property) => {
              const isExpanded = expandedRows.has(property.id);
              
              return (
                <tr key={property.id} className="border-b border-[var(--border-color)] last:border-b-0">
                  <td colSpan={6} className="p-0">
                    {/* Main Row */}
                    <div 
                      className="flex items-center cursor-pointer hover:bg-[var(--hover-background)] transition-colors"
                      onClick={() => toggleRow(property.id)}
                    >
                      <div className="w-8 p-4 flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronUpIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-5 gap-4 items-center py-3 pr-4">
                        <div className="text-sm text-[var(--text-primary)]">
                          {property.property_data?.address || 'Unknown Address'}
                          {property.property_data?.city && (
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                              {property.property_data.city}, {property.property_data.state} {property.property_data.zipCode}
                            </div>
                          )}
                        </div>
                        <div className={`text-center text-2xl font-bold ${getScoreColor(property.quality_score || 0)}`}>
                          {property.quality_score || 0}
                        </div>
                        <div className="text-center">
                          {getRecommendationBadge(property.recommendation || 'REJECT')}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {property.confidence || 0}%
                          </div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">
                            {property.quality_review?.issues?.length || 0} issues
                          </div>
                        </div>
                        <div className="text-right text-sm text-[var(--text-secondary)]">
                          {new Date(property.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="bg-[var(--card-background)] p-6 space-y-6 border-t border-[var(--border-color)]">
                        {/* Property Details */}
                        <div>
                          <h4 className="text-sm font-bold text-[var(--accent-primary)] mb-3">Property Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {property.property_data?.price && (
                              <div>
                                <div className="text-xs text-[var(--text-muted)]">Price</div>
                                <div className="text-sm font-semibold text-[var(--text-primary)]">
                                  ${property.property_data.price.toLocaleString()}
                                </div>
                              </div>
                            )}
                            {property.property_data?.bedrooms && (
                              <div>
                                <div className="text-xs text-[var(--text-muted)]">Bedrooms</div>
                                <div className="text-sm font-semibold text-[var(--text-primary)]">
                                  {property.property_data.bedrooms}
                                </div>
                              </div>
                            )}
                            {property.property_data?.bathrooms && (
                              <div>
                                <div className="text-xs text-[var(--text-muted)]">Bathrooms</div>
                                <div className="text-sm font-semibold text-[var(--text-primary)]">
                                  {property.property_data.bathrooms}
                                </div>
                              </div>
                            )}
                            {property.property_data?.livingArea && (
                              <div>
                                <div className="text-xs text-[var(--text-muted)]">Square Feet</div>
                                <div className="text-sm font-semibold text-[var(--text-primary)]">
                                  {property.property_data.livingArea.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Analysis Summary */}
                        <div>
                          <h4 className="text-sm font-bold text-[var(--accent-primary)] mb-3">Analysis Summary</h4>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {property.primary_analysis?.analysis.summary || 'No analysis summary available.'}
                          </p>
                        </div>

                        {/* Key Findings */}
                        {property.primary_analysis?.analysis.keyFindings && property.primary_analysis.analysis.keyFindings.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-[var(--accent-primary)] mb-3">Key Findings</h4>
                            <ul className="space-y-2">
                              {property.primary_analysis.analysis.keyFindings.map((finding: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-[var(--accent-primary)] mt-1">•</span>
                                  <span className="text-sm text-[var(--text-secondary)]">{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Quality Issues */}
                        {property.quality_review?.issues && property.quality_review.issues.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-red-400 mb-3">Quality Issues</h4>
                            <div className="space-y-2">
                              {property.quality_review.issues.map((issue: any, index: number) => (
                                <div key={index} className="p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
                                  <div className="flex items-start justify-between">
                                    <span className="text-sm font-semibold text-red-400">{issue.category}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      issue.severity === 'high' ? 'bg-red-500 text-white' :
                                      issue.severity === 'medium' ? 'bg-yellow-500 text-black' :
                                      'bg-blue-500 text-white'
                                    }`}>
                                      {issue.severity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[var(--text-secondary)] mt-1">{issue.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onPropertyClick?.(property);
                            }}
                            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--background)] font-semibold transition-colors"
                          >
                            View Full Report
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(property.zillow_url, '_blank');
                            }}
                            className="px-4 py-2 rounded-lg border-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold transition-colors"
                          >
                            View on Zillow
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sortedProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">No properties to display</p>
        </div>
      )}
    </div>
  );
}
