'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };
  
  const navigation = [
    {
      title: 'Platform',
      items: [
        { label: 'Dashboard', href: '/', icon: '🏠' },
        { label: 'Portfolio', href: '/portfolio', icon: '📊' },
      ]
    },
    {
      title: 'Analysis Domains',
      items: [
        { label: 'Real Estate', href: '/real-estate', icon: '🏘️', badge: 'Active' },
        { label: 'Business Analysis', href: '/business', icon: '💼', badge: 'Development' },
        { label: 'Research Platform', href: '/research', icon: '🔬', badge: 'Development' },
        { label: 'Financial Analysis', href: '/financial', icon: '📈', badge: 'Development' },
        { label: 'Configuration', href: '/config', icon: '⚙️' },
      ]
    }
  ];

  return (
    <div className="dashboard-layout">
      {/* Hamburger Button */}
      <button
        onClick={handleToggle}
        className="hamburger-button"
        aria-label="Toggle navigation"
      >
        <svg
          className="hamburger-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {(isSidebarOpen && !isMobile) || (isMobileMenuOpen && isMobile) ? (
            // X icon when open
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // Hamburger icon when closed
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Navigation */}
      <aside className={`left-nav ${isSidebarOpen ? 'open' : 'collapsed'} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="left-nav-content">
          {/* Brand */}
          <div className="nav-brand">
            <h1>Universal AI Agent Team</h1>
            <p>Professional Analysis Platform</p>
          </div>

          {/* Navigation Sections */}
          {navigation.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <header className="main-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">
                {pathname === '/' && 'Dashboard'}
                {pathname === '/real-estate' && 'Real Estate Analysis'}
                {pathname === '/config' && 'Configuration'}
                {pathname === '/portfolio' && 'Current Portfolio'}
              </h1>
              <p className="page-subtitle">
                {pathname === '/' && 'Overview of your analysis platform and portfolio'}
                {pathname === '/real-estate' && 'Property evaluation with proven methodology'}
                {pathname === '/config' && 'Configure your analysis preferences'}
                {pathname === '/portfolio' && 'Manage your property investments'}
              </p>
            </div>
            <div className="header-actions">
              <div className="user-info">
                <span className="user-name">Christian Molnar</span>
                <div className="user-avatar">CM</div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
