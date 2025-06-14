/**
 * Centralized error handling for the Game Decider application.
 * Provides consistent error logging, reporting, and user feedback.
 */

export interface AppError {
  message: string;
  code?: string;
  context?: Record<string, any>;
  timestamp: Date;
  stack?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Creates a standardized error object
 */
export function createAppError(
  message: string,
  options: {
    code?: string;
    context?: Record<string, any>;
    originalError?: Error;
  } = {}
): AppError {
  return {
    message,
    code: options.code,
    context: options.context,
    timestamp: new Date(),
    stack: options.originalError?.stack,
  };
}

/**
 * Logs errors with appropriate severity level
 */
export function logError(error: AppError, severity: ErrorSeverity = 'medium'): void {
  const logMethod = severity === 'critical' || severity === 'high' ? console.error : console.warn;
  
  logMethod(`[${severity.toUpperCase()}] ${error.message}`, {
    code: error.code,
    context: error.context,
    timestamp: error.timestamp.toISOString(),
  });
}

/**
 * Error handler for React components
 */
export function handleComponentError(error: Error, errorInfo?: any): AppError {
  const appError = createAppError(
    `Component error: ${error.message}`,
    {
      code: 'COMPONENT_ERROR',
      context: { errorInfo },
      originalError: error,
    }
  );
  
  logError(appError, 'high');
  return appError;
}

/**
 * Error handler for async operations
 */
export function handleAsyncError(error: Error, operation: string): AppError {
  const appError = createAppError(
    `Async operation failed: ${operation}`,
    {
      code: 'ASYNC_ERROR',
      context: { operation, originalMessage: error.message },
      originalError: error,
    }
  );
  
  logError(appError, 'medium');
  return appError;
}

/**
 * Error handler for state management operations
 */
export function handleStateError(error: Error, action: string): AppError {
  const appError = createAppError(
    `State operation failed: ${action}`,
    {
      code: 'STATE_ERROR',
      context: { action, originalMessage: error.message },
      originalError: error,
    }
  );
  
  logError(appError, 'medium');
  return appError;
}

/**
 * User-friendly error messages for common error codes
 */
export const ERROR_MESSAGES: Record<string, string> = {
  COMPONENT_ERROR: 'Something went wrong while loading this section. Please try refreshing the page.',
  ASYNC_ERROR: 'Unable to complete the requested operation. Please try again.',
  STATE_ERROR: 'There was an issue updating the application state. Please refresh the page.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

/**
 * Gets user-friendly error message
 */
export function getUserErrorMessage(error: AppError): string {
  return ERROR_MESSAGES[error.code || ''] || 'An unexpected error occurred. Please try again.';
} 