import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export function RiskGauge({ score = 0, level = 'LOW', probability = null }) {
  // Normalize score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const upperLevel = (level || 'LOW').toUpperCase();

  // SVG parameters
  const size = 180;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  // Arc proportion (0 to 1)
  const offset = circumference - (normalizedScore / 100) * circumference;

  // Determine styles & icons based on semantic risk level
  let theme = {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    label: 'LOW RISK',
    icon: ShieldCheck,
    tagClass: 'risk-tag-low',
    textGlow: '0 0 16px rgba(16, 185, 129, 0.4)',
  };

  if (upperLevel === 'HIGH' || normalizedScore >= 75) {
    theme = {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      label: 'HIGH RISK',
      icon: AlertTriangle,
      tagClass: 'risk-tag-high',
      textGlow: '0 0 16px rgba(239, 68, 68, 0.4)',
    };
  } else if (upperLevel === 'MEDIUM' || normalizedScore >= 40) {
    theme = {
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      label: 'MEDIUM RISK',
      icon: AlertCircle,
      tagClass: 'risk-tag-medium',
      textGlow: '0 0 16px rgba(245, 158, 11, 0.4)',
    };
  }

  const IconComponent = theme.icon;

  // Probability formatting: 0.9832 -> 98.32%
  let formattedProb = 'Unavailable';
  if (typeof probability === 'number' && !isNaN(probability)) {
    formattedProb = `${(probability * 100).toFixed(2)}%`;
  }

  return (
    <div className="risk-gauge-card" style={{ borderColor: theme.borderColor }}>
      <div className="risk-gauge-visual">
        <svg
          className="risk-gauge-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`Risk gauge showing score ${normalizedScore} out of 100, ${theme.label}`}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Active progress stroke */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={theme.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${theme.color})`,
            }}
          />
        </svg>

        {/* Center score display */}
        <div className="risk-gauge-center">
          <span className="risk-gauge-number" style={{ color: theme.color, textShadow: theme.textGlow }}>
            {normalizedScore}
          </span>
          <span className="risk-gauge-max">/ 100</span>
          <span className="risk-gauge-subtext">Risk Score</span>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`risk-level-badge ${theme.tagClass}`}>
        <IconComponent className="w-4 h-4 mr-1.5 shrink-0" />
        <span className="font-bold tracking-wider">{theme.label}</span>
      </div>

      {/* Phishing Probability sub-metric */}
      <div className="probability-stat-pill">
        <span className="text-slate-400 text-xs font-medium">Phishing Probability</span>
        <span className="text-slate-100 text-sm font-semibold font-mono">{formattedProb}</span>
      </div>
    </div>
  );
}
