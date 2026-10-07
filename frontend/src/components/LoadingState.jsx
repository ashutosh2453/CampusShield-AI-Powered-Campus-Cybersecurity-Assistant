import React, { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';

const LOADING_STEPS = [
  'Analyzing message structure & sender...',
  'Extracting observable indicators...',
  'Evaluating language patterns via TF-IDF...',
  'Running CampusShield risk engine...',
];

export function LoadingState() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="loading-state-card"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-radar-ring">
        <div className="radar-sweep" />
        <Shield className="loading-center-shield w-8 h-8 text-cyan-400" />
      </div>

      <div className="loading-text-container">
        <div className="flex items-center gap-2 justify-center mb-1">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <h3 className="loading-title">Analyzing message...</h3>
        </div>
        <p className="loading-step-text font-mono text-cyan-300 text-sm">
          {LOADING_STEPS[currentStepIndex]}
        </p>
        <span className="sr-only">Analyzing message with CampusShield backend model</span>
      </div>
    </div>
  );
}
