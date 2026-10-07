import React, { useState } from 'react';
import { Shield, ShieldAlert, Clock, Info, Menu, X, RefreshCw, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export function Navbar({ activeTab, onTabChange, backendHealth, onCheckHealth, isCheckingHealth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'analyze', label: 'Analyze', icon: ShieldAlert },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleSelectTab = (id) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => handleSelectTab('chat')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleSelectTab('chat')}>
          <div className="brand-logo-glow">
            <Shield className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">Campus<span className="brand-name-accent">Shield</span></span>
            <span className="brand-tagline">AI Campus Cybersecurity</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                type="button"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Backend Status Indicator */}
        <div className="navbar-actions">
          <button
            onClick={onCheckHealth}
            disabled={isCheckingHealth}
            className={`server-status-pill ${backendHealth.online ? 'status-online' : 'status-offline'}`}
            title={`Backend: ${backendHealth.online ? 'Online' : 'Offline'} - Click to re-check`}
            aria-label={`Server status: ${backendHealth.online ? 'Online' : 'Offline'}. Click to re-check.`}
            type="button"
          >
            <span className={`status-dot ${isCheckingHealth ? 'anim-pulse' : ''}`} />
            <span className="status-label">
              {isCheckingHealth ? 'Checking...' : backendHealth.online ? 'Server online' : 'Server unavailable'}
            </span>
            <RefreshCw className={`status-refresh-icon ${isCheckingHealth ? 'anim-spin' : ''}`} />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                type="button"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="mobile-status-row">
            <span className={`status-dot ${backendHealth.online ? 'dot-online' : 'dot-offline'}`} />
            <span className="text-xs text-slate-400">
              Backend ({backendHealth.online ? 'Connected' : 'Disconnected'}): {API_BASE_URL}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
