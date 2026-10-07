import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RiskReasons({ reasons = [], riskLevel = 'LOW' }) {
  const safeReasons = Array.isArray(reasons) ? reasons.filter(r => Boolean(r && String(r).trim())) : [];
  const isHighRisk = String(riskLevel).toUpperCase() === 'HIGH';

  return (
    <div className="risk-reasons-card">
      <div className="risk-reasons-header">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
        <h3 className="risk-reasons-title">Why was this message flagged?</h3>
      </div>

      {safeReasons.length === 0 ? (
        <div className="risk-reasons-empty">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p>No additional risk indicators were detected.</p>
        </div>
      ) : (
        <ul className="risk-reasons-list">
          {safeReasons.map((reason, index) => (
            <li key={`reason-${index}`} className="risk-reason-item">
              <div className="risk-reason-icon-bullet">
                <AlertCircle className={`w-4 h-4 ${isHighRisk ? 'text-rose-400' : 'text-amber-400'}`} />
              </div>
              <span className="risk-reason-text">{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
