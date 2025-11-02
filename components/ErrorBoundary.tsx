

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  // FIX: The constructor-based state initialization was causing type errors in this environment.
  // Switched to a class property initializer for state.
  public state: State = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
      window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const bgColor = isDarkMode ? 'bg-dark-bg' : 'bg-light-bg';
      const textColor = isDarkMode ? 'text-dark-text' : 'text-light-text';
      const cardColor = isDarkMode ? 'bg-dark-card' : 'bg-light-card';
      const borderColor = isDarkMode ? 'border-dark-border' : 'border-light-border';
      const secondaryTextColor = isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary';

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${bgColor} ${textColor}`}>
            <div className={`max-w-lg w-full p-8 rounded-xl border ${cardColor} ${borderColor} text-center`}>
                <h1 className="text-3xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h1>
                <p className={`mb-6 ${secondaryTextColor}`}>We've encountered an unexpected error. Please refresh the page to continue.</p>
                <button
                    onClick={this.handleRefresh}
                    className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Refresh Page
                </button>
                {this.state.error && (
                     <details className={`mt-6 text-left text-sm ${secondaryTextColor}`}>
                        <summary className="cursor-pointer">Error Details</summary>
                        <pre className={`mt-2 p-2 rounded-md overflow-auto text-xs ${bgColor}`}>
                            <code>{this.state.error.stack || this.state.error.toString()}</code>
                        </pre>
                    </details>
                )}
            </div>
        </div>
      );
    }

    // FIX: Moved the return statement to be inside the render method. An Error Boundary must return its children if there is no error.
    return this.props.children;
  }
}

export default ErrorBoundary;