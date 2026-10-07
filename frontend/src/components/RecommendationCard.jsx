import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export function RecommendationCard({ recommendation = '', riskLevel = 'LOW' }) {
  const upperLevel = String(riskLevel).toUpperCase();
  const safeText = recommendation && recommendation.trim()
    ? recommendation
    : 'Verify the message through an official campus channel before taking any action.';

  let icon = ShieldCheck;
  let borderClass = 'rec-card-low';

  if (upperLevel === 'HIGH') {
    icon = AlertTriangle;
    borderClass = 'rec-card-high';
  } else if (upperLevel === 'MEDIUM') {
    icon = ShieldAlert;
    borderClass = 'rec-card-medium';
  }

  const IconComp = icon;

  return (
    <div className={`recommendation-card ${borderClass}`}>
      <div className="recommendation-header">
        <div className="recommendation-icon-box">
          <IconComp className="w-5 h-5" />
        </div>
        <div className="recommendation-title-group">
          <span className="recommendation-badge">Actionable Guidance</span>
          <h3 className="recommendation-title">Recommended Action</h3>
        </div>
      </div>
      <p className="recommendation-body">{safeText}</p>
    </div>
  );
}
