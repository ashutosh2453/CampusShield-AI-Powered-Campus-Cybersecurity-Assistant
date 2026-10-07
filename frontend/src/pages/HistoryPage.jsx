import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
} from 'lucide-react';
import { getStoredHistory, deleteStoredHistoryEntry, clearStoredHistory } from '../utils/historyStorage';

export function HistoryPage({ onLoadIntoAnalyzer }) {
  const [historyList, setHistoryList] = useState(getStoredHistory);
  const [expandedId, setExpandedId] = useState(null);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = deleteStoredHistoryEntry(id);
    setHistoryList(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all locally stored scan history?')) {
      clearStoredHistory();
      setHistoryList([]);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="history-page-container">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="history-title flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            Scan History
          </h1>
          <p className="history-subtitle">
            Review previous messages analyzed during your browser sessions.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn btn-secondary text-rose-400 hover:text-rose-300"
            type="button"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Privacy Notice Pill */}
      <div className="history-privacy-banner">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Privacy Note:</strong> History is stored locally in this browser. No personal messages are synced to the cloud or saved in external databases.
        </span>
      </div>

      {/* History List or Empty State */}
      {historyList.length === 0 ? (
        <div className="history-empty-card">
          <Clock className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No Analysis History Yet</h3>
          <p className="text-sm text-slate-400 max-w-md text-center">
            When you analyze suspicious emails or messages in CampusShield, your local scan records will appear here for review.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {historyList.map((item) => {
            const isPhishing = item.prediction === 'PHISHING';
            const isExpanded = expandedId === item.id;
            const probFormatted = typeof item.phishing_probability === 'number'
              ? `${(item.phishing_probability * 100).toFixed(2)}%`
              : 'Unavailable';

            return (
              <div
                key={item.id}
                className={`history-card ${isExpanded ? 'card-expanded' : ''}`}
                onClick={() => toggleExpand(item.id)}
              >
                {/* Main Row */}
                <div className="history-card-header">
                  <div className="history-meta-left">
                    <div className={`history-pred-badge ${isPhishing ? 'pred-badge-phishing' : 'pred-badge-legit'}`}>
                      {isPhishing ? (
                        <AlertTriangle className="w-4 h-4 mr-1 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 mr-1 shrink-0" />
                      )}
                      <span>{item.prediction}</span>
                    </div>

                    <div className="history-subject-group">
                      <h4 className="history-subject-text">
                        {item.subject || (item.body_snippet ? item.body_snippet.slice(0, 50) + '...' : 'Untitled Message')}
                      </h4>
                      <div className="history-sender-date">
                        {item.sender_email && (
                          <span className="history-sender font-mono">{item.sender_email} • </span>
                        )}
                        <span className="history-timestamp">{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-meta-right">
                    <div className="history-score-box">
                      <span className="history-score-label">Score</span>
                      <span className={`history-score-value ${isPhishing ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.risk_score}
                      </span>
                    </div>

                    <div className="history-actions-group">
                      {onLoadIntoAnalyzer && (
                        <button
                          type="button"
                          className="history-action-btn load-btn"
                          title="Load into analyzer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadIntoAnalyzer(item);
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="history-action-btn delete-btn"
                        title="Delete from history"
                        onClick={(e) => handleDelete(item.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="history-action-btn expand-btn"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="history-card-body animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="history-stats-grid">
                      <div className="history-stat-item">
                        <span className="history-stat-label">Risk Level</span>
                        <span className={`history-stat-val font-bold ${
                          item.risk_level === 'HIGH' ? 'text-rose-400' :
                          item.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {item.risk_level}
                        </span>
                      </div>
                      <div className="history-stat-item">
                        <span className="history-stat-label">Probability</span>
                        <span className="history-stat-val font-mono">{probFormatted}</span>
                      </div>
                      <div className="history-stat-item">
                        <span className="history-stat-label">External Form</span>
                        <span className="history-stat-val">{item.has_external_form ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="history-stat-item">
                        <span className="history-stat-label">Payment Request</span>
                        <span className="history-stat-val">{item.has_payment_request ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    {item.reasons && item.reasons.length > 0 && (
                      <div className="history-reasons-wrap">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Flagged Indicators:
                        </span>
                        <ul className="history-reasons-list">
                          {item.reasons.map((r, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.recommendation && (
                      <div className="history-rec-wrap">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Action Recommended:
                        </span>
                        <p className="text-xs text-slate-300 italic">{item.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
