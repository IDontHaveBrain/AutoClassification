import React from 'react';

interface TranslationErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface TranslationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary that catches translation-related errors and provides fallback UI
 * This prevents the entire application from crashing when translation errors occur
 */
export class TranslationErrorBoundary extends React.Component<
  TranslationErrorBoundaryProps,
  TranslationErrorBoundaryState
> {
  constructor(props: TranslationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TranslationErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Translation Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      const FallbackComponent = this.props.fallback || DefaultFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Default fallback component when translation errors occur
 */
const DefaultFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
    }}
  >
    <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
      Translation Error
    </h2>
    <p style={{ color: '#666', marginBottom: '24px' }}>
      There was an error loading translations. Please refresh the page or try again later.
    </p>
    {process.env.NODE_ENV === 'development' && error && (
      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
          Show error details
        </summary>
        <pre
          style={{
            backgroundColor: '#f4f4f4',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            textAlign: 'left',
            marginTop: '8px',
            fontSize: '12px',
          }}
        >
          {error.message}
          {error.stack && `\n\nStack trace:\n${error.stack}`}
        </pre>
      </details>
    )}
    <button
      onClick={() => window.location.reload()}
      style={{
        marginTop: '16px',
        padding: '8px 16px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Refresh Page
    </button>
  </div>
);

/**
 * Higher-order component that wraps components with translation error boundary
 */
export const withTranslationErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error }>,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void,
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <TranslationErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </TranslationErrorBoundary>
  );

  WrappedComponent.displayName = `withTranslationErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};