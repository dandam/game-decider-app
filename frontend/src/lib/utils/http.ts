/**
 * HTTP utility functions for API client.
 */

import { ApiError, NetworkError, ValidationError } from '../api/types';

/**
 * Generate a unique request ID for tracking.
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Build URL with query parameters.
 */
export function buildUrl(baseUrl: string, path: string, params?: Record<string, any>): string {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array parameters (e.g., category_ids)
          value.forEach(item => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  return url.toString();
}

/**
 * Process and standardize API errors.
 */
export async function processApiError(response: Response): Promise<never> {
  const contentType = response.headers.get('content-type');
  let errorData: any;

  try {
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = { detail: await response.text() };
    }
  } catch (parseError) {
    // If we can't parse the error response, create a generic error
    errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
  }

  // Handle validation errors (422)
  if (response.status === 422 && Array.isArray(errorData.detail)) {
    throw new ValidationError(
      'Validation failed',
      response.status,
      response.statusText,
      errorData.detail
    );
  }

  // Handle other API errors
  const message =
    typeof errorData.detail === 'string'
      ? errorData.detail
      : `HTTP ${response.status}: ${response.statusText}`;

  throw new ApiError(message, response.status, response.statusText, errorData);
}

/**
 * Default request timeout in milliseconds.
 */
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Create an AbortController with timeout.
 */
export function createTimeoutController(timeoutMs: number = DEFAULT_TIMEOUT): AbortController {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // Clear timeout if request completes normally
  const originalSignal = controller.signal;
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  return controller;
}

/**
 * Retry configuration for network requests.
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

/**
 * Calculate retry delay with exponential backoff.
 */
export function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Check if an error is retryable.
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof ApiError) {
    // Retry on server errors (5xx) but not client errors (4xx)
    return error.status >= 500;
  }

  return false;
}

/**
 * Sleep for a specified number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log request details in development mode.
 */
export function logRequest(method: string, url: string, requestId: string, body?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🌐 API Request: ${method} ${url}`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    if (body) {
      console.log('Body:', body);
    }
    console.groupEnd();
  }
}

/**
 * Log response details in development mode.
 */
export function logResponse(
  method: string,
  url: string,
  requestId: string,
  status: number,
  statusText: string,
  data?: any
): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📡 API Response: ${method} ${url}`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Status: ${status} ${statusText}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }
}

/**
 * Log error details in development mode.
 */
export function logError(method: string, url: string, requestId: string, error: Error): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ API Error: ${method} ${url}`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Error: ${error.message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.error(error);
    console.groupEnd();
  }
}
