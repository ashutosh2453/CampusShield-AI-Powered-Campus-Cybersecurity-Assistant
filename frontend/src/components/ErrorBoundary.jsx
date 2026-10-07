import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log internally without crashing UI or exposing stack to user
    console.error('CampusShield UI Caught Error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-wrapper">
              <AlertTriangle className="w-12 h-12 text-rose-400" />
            </div>
            <h2>Something went wrong</h2>
            <p>
              An unexpected display issue occurred in CampusShield.
              Your data has been preserved where possible.
            </p>
            <p className="error-boundary-secondary">
              Please refresh the page and try again.
            </p>
            <button
              onClick={this.handleReload}
              className="btn btn-primary mt-4"
              type="button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
