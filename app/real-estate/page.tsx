'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { UniversalLayout } from '../../components/UniversalLayout'

// Sample data matching your real analyses
const sampleProperties = [
  {
    id: 'H06',
    address: 'H06 Redbird Lane',
    city: 'Bonney Lake, WA',
    price: 875000,
    score: 92.3,
    stars: 5,
    status: 'PURCHASED',
    analysis: {
      data: { score: 95, weight: 25, details: 'Excellent location, recent updates, strong comps' },
      logic: { score: 90, weight: 25, details: 'Solid investment logic, meets all criteria' },
      action: { score: 88, weight: 20, details: 'Quick decision process, competitive offer' },
      complete: { score: 95, weight: 20, details: 'Comprehensive analysis, all factors considered' },
      present: { score: 90, weight: 10, details: 'Clear presentation, actionable insights' }
    },
    features: ['4 BR', '3 BA', '2,400 sqft', 'Updated Kitchen', 'Large Lot'],
    dateAnalyzed: '2025-12-29'
  },
  {
    id: 'H07',
    address: 'H07 139th Street',
    city: 'Bonney Lake, WA',
    price: 825000,
    score: 83.0,
    stars: 4,
    status: 'PASSED',
    analysis: {
      data: { score: 85, weight: 25, details: 'Good location, some maintenance needs' },
      logic: { score: 80, weight: 25, details: 'Marginal investment case, budget constraints' },
      action: { score: 85, weight: 20, details: 'Deliberate decision to pass' },
      complete: { score: 85, weight: 20, details: 'Thorough analysis completed' },
      present: { score: 75, weight: 10, details: 'Analysis documented' }
    },
    features: ['3 BR', '2.5 BA', '2,100 sqft', 'Needs Updates', 'Standard Lot'],
    dateAnalyzed: '2025-12-29'
  }
]

// Mock data for layout
const mockUser = {
  id: '1',
  name: 'Christian Molnar',
  role: 'analyst' as const,
  preferences: {
    theme: 'light' as const,
    density: 'comfortable' as const,
    notifications: true,
    analysisStyle: 'detailed' as const,
  },
  domains: ['real-estate'],
  currentDomain: 'real-estate'
}

const mockDomains = [
  {
    id: 'real-estate',
    name: 'Real Estate Analysis',
    icon: 'HomeIcon',
    description: 'Property analysis with proven methodology',
    version: '1.0.0',
    status: 'active' as const,
    capabilities: ['Property Scoring', 'Market Analysis', 'ROI Calculation'],
    configurationRequired: false,
    qualityMetrics: {
      averageScore: 87.8,
      totalAnalyses: 2,
      successRate: 100
    }
  }
]

const mockNavigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'HomeIcon' as const,
    href: '/',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: 'HomeIcon' as const,
    href: '/real-estate',
    badge: { text: 'Active', variant: 'success' as const }
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: 'CogIcon' as const,
    href: '/config',
  }
]

export default function RealEstatePage() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [analysisView, setAnalysisView] = useState<'overview' | 'detailed'>('overview')
  const [newAnalysis, setNewAnalysis] = useState(false)

  const currentSession = {
    id: 'real-estate-session',
    domainId: 'real-estate',
    title: 'Real Estate Analysis',
    status: 'completed' as const,
    quality: {
      score: 87.8,
      threshold: 85,
      level: 'good' as const,
      stars: 4,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['real-estate', 'property-analysis'],
    configuration: {},
  }

  return (
    <UniversalLayout
      user={mockUser}
      domains={mockDomains}
      currentSession={currentSession}
      navigation={mockNavigation}
    >
      <div className="p-8">
        {/* V2 Upgrade Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-lg p-4 border-2 border-[var(--accent-primary)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-[var(--background)]" />
              <div>
                <h3 className="text-lg font-bold text-[var(--background)]">
                  Try Real Estate Analysis V2
                </h3>
                <p className="text-sm text-[var(--background)] opacity-90">
                  AI-powered batch analysis • Claude + GPT-4 validation • Real-time progress
                </p>
              </div>
            </div>
            <a
              href="/real-estate-v2"
              className="px-6 py-2 bg-[var(--background)] text-[var(--accent-primary)] rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <span>Launch V2</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Real Estate Analysis
              </h1>
              <p className="text-neutral-600">
                Property evaluation with your proven methodology
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setNewAnalysis(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>New Analysis</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Properties Analyzed"
            value="2"
            subtitle="Total evaluations"
            icon={HomeIcon}
            color="primary"
          />
          <StatCard
            title="Average Score"
            value="87.8"
            subtitle="Quality threshold: 85+"
            icon={StarIcon}
            color="success"
          />
          <StatCard
            title="Success Rate"
            value="100%"
            subtitle="Analyses above threshold"
            icon={CheckCircleIcon}
            color="success"
          />
          <StatCard
            title="Properties Purchased"
            value="1"
            subtitle="High-confidence decisions"
            icon={CurrencyDollarIcon}
            color="warning"
          />
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">
                Property Portfolio
              </h2>
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <ChartBarIcon className="w-4 h-4" />
                <span>Sorted by score</span>
              </div>
            </div>

            <div className="space-y-4">
              {sampleProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty === property.id}
                  onSelect={() => setSelectedProperty(
                    selectedProperty === property.id ? null : property.id
                  )}
                />
              ))}
            </div>
          </motion.div>

          {/* Analysis Detail Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            {selectedProperty ? (
              <PropertyAnalysis
                property={sampleProperties.find(p => p.id === selectedProperty)!}
                view={analysisView}
                onViewChange={setAnalysisView}
              />
            ) : (
              <div className="card-body text-center py-12">
                <HomeIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Select a Property
                </h3>
                <p className="text-neutral-600">
                  Choose a property from the list to view detailed analysis
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* New Analysis Modal */}
        <AnimatePresence>
          {newAnalysis && (
            <NewAnalysisModal onClose={() => setNewAnalysis(false)} />
          )}
        </AnimatePresence>
      </div>
    </UniversalLayout>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<any>
  color: 'primary' | 'success' | 'warning' | 'error'
}) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    error: 'text-error-600 bg-error-50'
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card card-hover"
    >
      <div className="card-body">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900">{value}</div>
            <div className="text-sm text-neutral-600">{title}</div>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>
      </div>
    </motion.div>
  )
}

// Property Card Component
function PropertyCard({
  property,
  isSelected,
  onSelect
}: {
  property: any
  isSelected: boolean
  onSelect: () => void
}) {
  const statusColors = {
    PURCHASED: 'text-success-600 bg-success-50 border-success-200',
    PASSED: 'text-neutral-600 bg-neutral-50 border-neutral-200'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`card cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-primary-300 shadow-lg' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-neutral-900">{property.address}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[property.status as keyof typeof statusColors]}`}>
                {property.status}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-3">
              <MapPinIcon className="w-4 h-4" />
              <span>{property.city}</span>
              <span>•</span>
              <CurrencyDollarIcon className="w-4 h-4" />
              <span>${property.price.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {property.features.map((feature: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${star <= property.stars ? 'star-filled' : 'star-empty'}`}
                />
              ))}
            </div>
            <div className="text-lg font-bold text-neutral-900">{property.score}</div>
            <div className="text-xs text-neutral-500">Quality Score</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Property Analysis Component
function PropertyAnalysis({
  property,
  view,
  onViewChange
}: {
  property: any
  view: 'overview' | 'detailed'
  onViewChange: (view: 'overview' | 'detailed') => void
}) {
  return (
    <>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {property.address}
            </h3>
            <p className="text-sm text-neutral-600">Analysis Details</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewChange('overview')}
              className={`px-3 py-1 text-sm rounded ${
                view === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onViewChange('detailed')}
              className={`px-3 py-1 text-sm rounded ${
                view === 'detailed' ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        {view === 'overview' ? (
          <OverviewAnalysis property={property} />
        ) : (
          <DetailedAnalysis property={property} />
        )}
      </div>
    </>
  )
}

// Overview Analysis Component
function OverviewAnalysis({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center py-6 border-b border-neutral-200">
        <div className="text-4xl font-bold text-neutral-900 mb-2">
          {property.score}
        </div>
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`w-6 h-6 ${star <= property.stars ? 'star-filled' : 'star-empty'}`}
            />
          ))}
        </div>
        <p className="text-neutral-600">Overall Quality Score</p>
        <div className={`inline-flex items-center space-x-1 mt-2 px-3 py-1 rounded-full text-sm font-medium ${
          property.status === 'PURCHASED' ? 'bg-success-50 text-success-700' : 'bg-neutral-50 text-neutral-700'
        }`}>
          {property.status === 'PURCHASED' ? (
            <CheckCircleIcon className="w-4 h-4" />
          ) : (
            <InformationCircleIcon className="w-4 h-4" />
          )}
          <span>{property.status}</span>
        </div>
      </div>

      {/* Key Insights */}
      <div>
        <h4 className="font-medium text-neutral-900 mb-3">Key Insights</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-success-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Strong Data Foundation</p>
              <p className="text-sm text-neutral-600">Excellent location data and recent comparable sales</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-success-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Solid Investment Logic</p>
              <p className="text-sm text-neutral-600">Meets all financial and strategic criteria</p>
            </div>
          </div>
          {property.score < 85 && (
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Below Threshold</p>
                <p className="text-sm text-neutral-600">Consider additional analysis before proceeding</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Detailed Analysis Component
function DetailedAnalysis({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      {Object.entries(property.analysis).map(([category, data]: [string, any]) => (
        <div key={category} className="border-b border-neutral-100 last:border-b-0 pb-4 last:pb-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-neutral-900 capitalize">{category}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-500">{data.weight}%</span>
              <span className={`text-sm font-medium ${
                data.score >= 85 ? 'text-success-600' : data.score >= 75 ? 'text-warning-600' : 'text-error-600'
              }`}>
                {data.score}/100
              </span>
            </div>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${
                data.score >= 85 ? 'bg-success-500' : data.score >= 75 ? 'bg-warning-500' : 'bg-error-500'
              }`}
              style={{ width: `${data.score}%` }}
            />
          </div>
          <p className="text-sm text-neutral-600">{data.details}</p>
        </div>
      ))}
    </div>
  )
}

// New Analysis Modal Component
function NewAnalysisModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">New Property Analysis</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Property Address
              </label>
              <input
                type="text"
                placeholder="Enter property address..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Asking Price
                </label>
                <input
                  type="number"
                  placeholder="875000"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Square Footage
                </label>
                <input
                  type="number"
                  placeholder="2400"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Start Analysis</span>
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
