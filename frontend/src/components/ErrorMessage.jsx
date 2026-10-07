import React from 'react';
import { AlertCircle, ServerCrash, X, RefreshCw } from 'lucide-react';

export function ErrorMessage({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const isServerDown = error.status === 'NETWORK_ERROR' || error.message?.includes('server is unavailable');

  return (
    <div className="error-alert-box" role="alert">
      <div className="error-alert-icon-col">
        {isServerDown ? (
          <ServerCrash className="w-6 h-6 text-rose-400 shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
        )}
      </div>

      <div className="error-alert-content">
        <h4 className="error-alert-title">{error.message || 'An error occurred during analysis'}</h4>
        {error.secondary && (
          <p className="error-alert-secondary">{error.secondary}</p>
        )}
        {isServerDown && (
          <div className="error-hint-pill">
            Tip: Run <code>uvicorn backend.main:app --reload</code> in the CampusShield root directory.
          </div>
        )}
      </div>

      <div className="error-alert-actions">
        {onRetry && (
          <button
            onClick={onRetry}
            className="error-retry-btn"
            title="Retry request"
            type="button"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="error-dismiss-btn"
            aria-label="Dismiss error"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
