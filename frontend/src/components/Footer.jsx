import React from 'react';
import { Shield, ExternalLink, Terminal } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const swaggerUrl = `${API_BASE_URL}/docs`;

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="footer-brand-title">CampusShield</span>
            </div>
            <p className="footer-tagline">
              AI-powered cybersecurity assistant helping college students detect phishing, scams, and deceptive messages.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-link-group">
              <span className="footer-group-title">Development & API</span>
              <a
                href={swaggerUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="footer-nav-link"
              >
                <Terminal className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                API Documentation (Swagger)
                <ExternalLink className="w-3 h-3 ml-1 text-slate-500" />
              </a>
              <span className="footer-api-host font-mono text-xs text-slate-400">
                Connected to: {API_BASE_URL}
              </span>
            </div>

            <div className="footer-link-group">
              <span className="footer-group-title">Model Architecture</span>
              <span className="footer-text-meta">TF-IDF Vectorizer + Logistic Regression</span>
              <span className="footer-text-meta">Rule-based observable risk scoring engine</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer-note">
            CampusShield is an academic AI safety project. Automated analysis does not replace careful verification. When in doubt, contact official college authorities.
          </p>
          <div className="footer-copy">
            © {CURRENT_YEAR} CampusShield Project. Built for student digital security.
          </div>
        </div>
      </div>
    </footer>
  );
}
