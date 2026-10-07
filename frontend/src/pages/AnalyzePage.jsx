import React from 'react';
import { Shield, Sparkles, AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { EmailAnalyzer } from '../components/EmailAnalyzer';
import { AnalysisResult } from '../components/AnalysisResult';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';

export function AnalyzePage({
  formData,
  onFormChange,
  onAnalyze,
  onClear,
  isLoading,
  error,
  onErrorDismiss,
  result,
  isFormDirty,
  onAskAssistant,
}) {
  return (
    <div className="analyze-page-container">
      {/* Hero Header */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
          <span>Intelligent Phishing & Scam Detection</span>
        </div>
        <h1 className="hero-title">
          Campus<span className="hero-title-accent">Shield</span>
        </h1>
        <p className="hero-tagline">
          Your AI-powered campus cybersecurity assistant
        </p>
        <p className="hero-description">
          Analyze suspicious emails, messages, and placement notices using fine-tuned machine learning and explainable risk analysis.
        </p>
      </section>

      {/* Main Analyzer Grid */}
      <div className="analyzer-layout-grid">
        {/* Input Column */}
        <div className="analyzer-input-column">
          <EmailAnalyzer
            formData={formData}
            onChange={onFormChange}
            onAnalyze={onAnalyze}
            onClear={onClear}
            isLoading={isLoading}
          />
        </div>

        {/* Results / Status Column */}
        <div className="analyzer-result-column">
          {/* Active Error Notice */}
          {error && (
            <ErrorMessage
              error={error}
              onDismiss={onErrorDismiss}
              onRetry={onAnalyze}
            />
          )}

          {/* Loading Animation */}
          {isLoading && <LoadingState />}

          {/* Successful Analysis Result */}
          {!isLoading && result && (
            <AnalysisResult
              result={result}
              isFormDirty={isFormDirty}
              onReanalyze={onAnalyze}
              onAskAssistant={onAskAssistant}
            />
          )}

          {/* Empty State before any analysis is run */}
          {!isLoading && !result && !error && (
            <div className="empty-state-card">
              <div className="empty-state-icon-wrapper">
                <Shield className="w-12 h-12 text-cyan-400/80" />
              </div>
              <h3 className="empty-state-title">Ready to check a suspicious message?</h3>
              <p className="empty-state-body">
                Paste an email or message above and CampusShield will analyze it for phishing and fraud indicators.
              </p>
              
              <div className="empty-state-feature-list">
                <div className="empty-feature-item">
                  <AlertOctagon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Machine-learning classification with probability breakdown</span>
                </div>
                <div className="empty-feature-item">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Explainable indicators: urgency, forms, and payment signals</span>
                </div>
                <div className="empty-feature-item">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Actionable safety advice tailored for students</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
