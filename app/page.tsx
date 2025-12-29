'use client'

import { useState } from 'react'

export default function UniversalAIPlatform() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [analysisHistory] = useState([
    {
      id: 'h06-redbird',
      title: 'H06 Redbird Lane Analysis', 
      domain: 'Real Estate',
      score: 92.3,
      status: 'PURCHASED',
      price: '$875,000',
      date: '2025-12-29'
    },
    {
      id: 'h07-139th',
      title: 'H07 139th Street Analysis',
      domain: 'Real Estate', 
      score: 83.0,
      status: 'PASSED',
      price: '$825,000',
      date: '2025-12-29'
    }
  ])

  const domains = [
    {
      id: 'real-estate',
      name: 'Real Estate Analysis',
      description: 'Property analysis with your proven methodology',
      status: 'ACTIVE',
      analyses: 2,
      avgScore: 87.8
    },
    {
      id: 'business',
      name: 'Business Intelligence', 
      description: 'Business opportunity analysis',
      status: 'COMING SOON',
      analyses: 0,
      avgScore: 0
    },
    {
      id: 'research',
      name: 'Research & Development',
      description: 'Advanced research analysis',
      status: 'COMING SOON', 
      analyses: 0,
      avgScore: 0
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Universal AI Agent Team Platform</h1>
              <p className="text-gray-600">Professional analysis with 85+ quality gates</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Quality Score</div>
                <div className="text-lg font-semibold text-green-600">87.8/100</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="hero-gradient rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Universal AI Agent Team Platform</h2>
          <p className="text-xl text-blue-100 mb-6">
            Your proven real estate methodology has been validated and is ready for any domain.
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="status-dot status-green"></div>
              <span>Phase 1B Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-dot status-yellow"></div>
              <span>87.8 Average Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-dot status-purple"></div>
              <span>160x AI Efficiency</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Domain Modules */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Domain Modules</h3>
            <div className="grid gap-6">
              {domains.map((domain) => (
                <div 
                  key={domain.id}
                  className={`card card-hover cursor-pointer p-6 ${
                    selectedDomain === domain.id ? 'card-selected' : ''
                  }`}
                  onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{domain.name}</h4>
                      <p className="text-gray-600 mt-1">{domain.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`badge ${
                          domain.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'
                        }`}>
                          {domain.status}
                        </span>
                        {domain.analyses > 0 && (
                          <span className="text-sm text-gray-600">
                            {domain.analyses} analyses
                          </span>
                        )}
                      </div>
                    </div>
                    {domain.avgScore > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{domain.avgScore}</div>
                        <div className="text-sm text-gray-500">Quality Score</div>
                      </div>
                    )}
                  </div>
                  
                  {selectedDomain === domain.id && domain.status === 'ACTIVE' && (
                    <div className="mt-6 pt-6 border-b">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-gray-900">Quick Actions</h5>
                        <button className="btn btn-primary">
                          New Analysis
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Analysis History */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Analyses</h3>
            <div className="space-y-4">
              {analysisHistory.map((analysis) => (
                <div key={analysis.id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{analysis.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{analysis.domain}</p>
                      <p className="text-sm text-gray-500 mt-1">{analysis.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{analysis.score}</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`badge ${
                      analysis.status === 'PURCHASED' ? 'badge-green' : 'badge-gray'
                    }`}>
                      {analysis.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{analysis.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
