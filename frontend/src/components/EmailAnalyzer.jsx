import React, { useState } from 'react';
import { Mail, FileText, Send, Trash2, CheckSquare, Square, Sparkles, ExternalLink, CreditCard } from 'lucide-react';

// Email validation helper: allows empty, or basic valid email format
function isValidEmail(email) {
  if (!email || !email.trim()) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function EmailAnalyzer({
  formData,
  onChange,
  onAnalyze,
  onClear,
  isLoading,
}) {
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear validation error when user begins correcting
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading) return;

    // Validate body
    const trimmedBody = (formData.body || '').trim();
    if (!trimmedBody) {
      setValidationError('Please enter a message to analyze.');
      return;
    }

    // Validate sender email if provided
    if (formData.sender_email && !isValidEmail(formData.sender_email)) {
      setValidationError('Please enter a valid email address or leave the sender field empty.');
      return;
    }

    setValidationError('');
    onAnalyze();
  };

  const handleClear = () => {
    setValidationError('');
    onClear();
  };

  // Quick Preset Handlers for Easy College Testing
  const handleLoadSample = (sampleType) => {
    if (isLoading) return;
    setValidationError('');

    if (sampleType === 'phishing') {
      onChange({
        sender_email: 'careercentre.srm@gmail.com',
        subject: 'URGENT: Mandatory Placement Verification',
        body: 'Your placement verification is pending. Pay the processing fee today. Click https://example.com/verify immediately.',
        has_external_form: true,
        has_payment_request: true,
      });
    } else if (sampleType === 'legitimate') {
      onChange({
        sender_email: 'bnycareerspeople@people.bny.com',
        subject: 'Thank You for Applying to BNY Summer Internship Program',
        body: 'Thank you for applying to our internship program. We have received your application and our recruitment team is reviewing your profile.',
        has_external_form: false,
        has_payment_request: false,
      });
    }
  };

  return (
    <div className="analyzer-card">
      <div className="analyzer-header">
        <div className="analyzer-title-wrap">
          <h2 className="analyzer-title">Analyze Suspicious Messages</h2>
          <p className="analyzer-subtitle">
            Enter message details below to inspect phishing indicators, risk score, and safety recommendations.
          </p>
        </div>

        {/* Quick Test Samples */}
        <div className="quick-presets">
          <span className="preset-label">Test Samples:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('phishing')}
            className="preset-chip chip-phishing"
            disabled={isLoading}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            High-Risk Phishing
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('legitimate')}
            className="preset-chip chip-legitimate"
            disabled={isLoading}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Recruitment Notice
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="analyzer-form">
        {/* Validation Error Banner */}
        {validationError && (
          <div className="validation-error-banner" role="alert">
            <span>{validationError}</span>
          </div>
        )}

        {/* Sender Email Field */}
        <div className="form-group">
          <label htmlFor="sender_email" className="form-label">
            <Mail className="w-4 h-4 text-slate-400 mr-1.5" />
            Sender Email <span className="text-slate-500 font-normal text-xs">(optional)</span>
          </label>
          <input
            id="sender_email"
            name="sender_email"
            type="email"
            value={formData.sender_email}
            onChange={handleInputChange}
            placeholder="e.g. careercentre.srm@gmail.com"
            className="form-input"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {/* Subject Field */}
        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            <FileText className="w-4 h-4 text-slate-400 mr-1.5" />
            Subject <span className="text-slate-500 font-normal text-xs">(optional)</span>
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g. URGENT: Mandatory Placement Verification"
            className="form-input"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {/* Message Body Textarea */}
        <div className="form-group">
          <label htmlFor="body" className="form-label">
            <FileText className="w-4 h-4 text-slate-400 mr-1.5" />
            Message <span className="text-cyan-400">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            rows={7}
            value={formData.body}
            onChange={handleInputChange}
            placeholder="Paste the full email text, SMS, WhatsApp message, or notice here..."
            className="form-textarea"
            disabled={isLoading}
            required
            aria-required="true"
          />
          <div className="textarea-footer">
            <span className="text-xs text-slate-500">
              Input treated securely as plain text. Paste raw emails, URLs, or headers safely.
            </span>
            <span className="text-xs font-mono text-slate-400">
              {formData.body?.length || 0} chars
            </span>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="checkboxes-row">
          <label className="checkbox-custom-label">
            <input
              type="checkbox"
              name="has_external_form"
              checked={formData.has_external_form}
              onChange={handleInputChange}
              disabled={isLoading}
              className="sr-only"
            />
            <div className={`custom-check-box ${formData.has_external_form ? 'checked' : ''}`}>
              {formData.has_external_form ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </div>
            <div className="checkbox-text">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                Contains external form
              </span>
              <span className="text-xs text-slate-400">Message links to Google Forms, Typeform, or external registration</span>
            </div>
          </label>

          <label className="checkbox-custom-label">
            <input
              type="checkbox"
              name="has_payment_request"
              checked={formData.has_payment_request}
              onChange={handleInputChange}
              disabled={isLoading}
              className="sr-only"
            />
            <div className={`custom-check-box ${formData.has_payment_request ? 'checked' : ''}`}>
              {formData.has_payment_request ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </div>
            <div className="checkbox-text">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                Requests payment
              </span>
              <span className="text-xs text-slate-400">Mentions processing fees, deposits, UPI IDs, or account transfers</span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-analyze"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border mr-2" />
                <span>Analyzing Message...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                <span>Analyze Message</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary btn-clear"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Clear</span>
          </button>
        </div>
      </form>
    </div>
  );
}
