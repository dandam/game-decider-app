'use client';

import React from 'react';
import { handleComponentError, getUserErrorMessage } from '@/lib/errors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use centralized error handling
    const appError = handleComponentError(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} reset={this.reset} />;
      }

      return (
        <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Application Error
                </h1>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Something went wrong while rendering this component
                </p>
              </div>
            </div>

            <div className="bg-red-100 dark:bg-red-900/50 rounded-md p-4 mb-4">
              <h2 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                What happened:
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error
                  ? getUserErrorMessage({
                      message: error.message,
                      timestamp: new Date(),
                      code: 'COMPONENT_ERROR',
                    })
                  : 'Unknown error occurred'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && error?.stack && (
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Stack Trace (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.reset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: string) => {
    handleComponentError(error, { context });
  }, []);
}
