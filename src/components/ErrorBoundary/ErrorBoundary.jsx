/**
 * ErrorBoundary.jsx
 * React Error Boundary component to catch render errors gracefully.
 * Prevents the entire app from crashing due to unexpected component errors.
 */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Updates state when a rendering error is caught.
   * @param {Error} error - The error that was thrown
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Logs error information for debugging.
   * @param {Error} error
   * @param {React.ErrorInfo} info
   */
  componentDidCatch(error, info) {
    console.error('[FlowMind ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#f8fafc',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '8px', color: '#ef4444' }}>⚠️ Something went wrong</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            FlowMind encountered an issue. Please refresh the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            aria-label="Retry loading this section"
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
