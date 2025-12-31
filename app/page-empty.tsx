'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import Link from 'next/link';

export default function Home() {
  return (
    <DashboardLayout>
      {/* Empty Portfolio Summary Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <h3>Total Portfolio Value</h3>
            <p className="stat-value">$0</p>
            <span className="stat-label">0 Properties</span>
          </div>
          <div className="stat-card">
            <h3>Total Equity</h3>
            <p className="stat-value">$0</p>
            <span className="stat-label">Net Worth from Real Estate</span>
          </div>
          <div className="stat-card">
            <h3>Monthly Rental Income</h3>
            <p className="stat-value">$0</p>
            <span className="stat-label">Gross Rental Income</span>
          </div>
          <div className="stat-card">
            <h3>Net Monthly Cash Flow</h3>
            <p className="stat-value text-status-active">$0</p>
            <span className="stat-label">After Mortgage Payments</span>
          </div>
        </div>
      </section>

      {/* Empty State - No Properties */}
      <section className="mb-8">
        <div className="bg-card-background border-2 border-border-color rounded-lg p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Welcome to Your Real Estate Analysis Platform
            </h2>
            <p className="text-text-secondary mb-8">
              Get started by adding properties to your portfolio. Our AI-powered analysis will help you make informed investment decisions.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/portfolio" 
                className="px-6 py-3 bg-accent-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Add Your First Property
              </Link>
              <Link 
                href="/real-estate-v2" 
                className="px-6 py-3 border-2 border-accent-primary text-accent-primary rounded-lg font-semibold hover:bg-accent-primary hover:text-white transition-colors"
              >
                Analyze Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/portfolio" className="action-card">
            <div className="action-icon">🏘️</div>
            <h3>Add Property</h3>
            <p>Add properties to your portfolio and track their performance</p>
          </Link>
          <Link href="/real-estate-v2" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Analyze Property</h3>
            <p>Get AI-powered analysis and insights for potential investments</p>
          </Link>
          <Link href="/config" className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Configure</h3>
            <p>Set up your analysis preferences and methodologies</p>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}
