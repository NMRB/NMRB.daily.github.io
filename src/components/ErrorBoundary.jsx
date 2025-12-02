import React from "react";
import errorLogger from "../utils/errorLogger";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    errorLogger.logError(
      "React Error Boundary",
      {
        message: error.message,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        props: this.props,
      },
      error
    );

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Optional: Report to external service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportError = () => {
    // Download current error logs
    errorLogger.downloadLogFile();
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReportError={this.handleReportError}
          />
        );
      }

      // Default error UI - simple and clean
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <h2>Something went wrong</h2>
            <p>
              We're sorry, but an unexpected error occurred. Please try
              refreshing the page.
            </p>

            {import.meta.env.DEV && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-boundary__error">
                  {this.state.error && this.state.error.toString()}
                </pre>
                <pre className="error-boundary__stack">
                  {this.state.errorInfo?.componentStack ||
                    "No component stack available"}
                </pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <button
                onClick={this.handleRetry}
                className="error-boundary__button error-boundary__button--primary"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="error-boundary__button error-boundary__button--secondary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
