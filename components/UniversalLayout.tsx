'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface User {
  id: string;
  name: string;
  role: 'analyst' | 'admin' | 'viewer';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    density: 'compact' | 'comfortable' | 'spacious';
    notifications: boolean;
    analysisStyle: 'quick' | 'detailed' | 'comprehensive';
  };
  domains: string[];
  currentDomain: string;
}

export interface Domain {
  id: string;
  name: string;
  icon: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'development';
  capabilities: string[];
  configurationRequired: boolean;
  qualityMetrics: {
    averageScore: number;
    totalAnalyses: number;
    successRate: number;
  };
}

export interface Session {
  id: string;
  domainId: string;
  title: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  quality: {
    score: number;
    threshold: number;
    level: 'poor' | 'fair' | 'good' | 'excellent';
    stars: number;
  };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  configuration?: any;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: 'HomeIcon' | 'CogIcon' | 'ChartBarIcon' | 'DocumentTextIcon';
  href: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'error';
  };
}

export interface UniversalLayoutProps {
  user: User;
  domains: Domain[];
  currentSession?: Session;
  navigation: NavigationItem[];
  children: React.ReactNode;
}

export function UniversalLayout({ 
  user, 
  domains, 
  currentSession, 
  navigation, 
  children 
}: UniversalLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-neutral-900">
                Universal AI Agent Team
              </Link>
              {currentSession && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-600">{currentSession.title}</span>
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < currentSession.quality.stars
                              ? 'text-yellow-400'
                              : 'text-neutral-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-neutral-500 text-xs">
                      {currentSession.quality.score}/100
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-600">
                {user.name}
              </div>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-medium text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <div className="flex">
        <nav className="w-64 bg-white border-r border-neutral-200 min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.badge.variant === 'success' ? 'bg-success-100 text-success-700' :
                      item.badge.variant === 'warning' ? 'bg-warning-100 text-warning-700' :
                      item.badge.variant === 'info' ? 'bg-blue-100 text-blue-700' :
                      'bg-error-100 text-error-700'
                    }`}>
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
