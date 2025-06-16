/**
 * Base HTTP client for the Game Decider API.
 * Provides type-safe, robust HTTP communication with error handling,
 * logging, retry logic, and request deduplication.
 */

import { NetworkError } from './types';
import {
  buildUrl,
  processApiError,
  generateRequestId,
  createTimeoutController,
  DEFAULT_RETRY_CONFIG,
  RetryConfig,
  calculateRetryDelay,
  isRetryableError,
  sleep,
  logRequest,
  logResponse,
  logError,
} from '../utils/http';

/**
 * Configuration for the API client.
 */
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
}

/**
 * Request options for API calls.
 */
interface RequestOptions {
  timeout?: number;
  retry?: boolean;
  retryConfig?: Partial<RetryConfig>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Internal request cache for deduplication.
 */
interface PendingRequest {
  promise: Promise<any>;
  controller: AbortController;
}

/**
 * Base HTTP client class.
 */
export class ApiClient {
  private config: Required<ApiClientConfig>;
  private pendingRequests = new Map<string, PendingRequest>();

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      retryConfig: { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig } as RetryConfig,
    };
  }

  /**
   * Generate cache key for request deduplication.
   */
  private getCacheKey(method: string, url: string, body?: any): string {
    const bodyKey = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyKey}`;
  }

  /**
   * Perform HTTP request with full error handling and retry logic.
   */
  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions & { body?: any; params?: Record<string, any> } = {}
  ): Promise<T> {
    const {
      body,
      params,
      timeout = this.config.timeout,
      retry = true,
      retryConfig = {},
      headers = {},
      signal,
    } = options;

    const url = buildUrl(this.config.baseUrl, path, params);
    const requestId = generateRequestId();
    const finalRetryConfig: RetryConfig = {
      ...this.config.retryConfig,
      ...retryConfig,
    } as RetryConfig;

    // Request deduplication for GET requests
    if (method === 'GET') {
      const cacheKey = this.getCacheKey(method, url, body);
      const pending = this.pendingRequests.get(cacheKey);

      if (pending) {
        return pending.promise;
      }
    }

    const executeRequest = async (attempt: number = 0): Promise<T> => {
      // Create timeout controller unless external signal provided
      const controller = signal ? new AbortController() : createTimeoutController(timeout);

      // If external signal is provided, abort our controller when it aborts
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      try {
        // Prepare request headers
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...headers,
        };

        // Log request in development
        logRequest(method, url, requestId, body);

        // Make the request
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        // Handle successful response
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          let data: T;

          if (contentType?.includes('application/json')) {
            data = await response.json();
          } else {
            data = (await response.text()) as unknown as T;
          }

          // Log response in development
          logResponse(method, url, requestId, response.status, response.statusText, data);

          return data;
        }

        // Handle error response
        await processApiError(response);

        // This line should never be reached due to processApiError throwing
        throw new Error('Unexpected error processing response');
      } catch (error) {
        // Handle abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          if (signal?.aborted) {
            throw new NetworkError('Request cancelled', error);
          } else {
            throw new NetworkError('Request timeout', error);
          }
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new NetworkError('Network request failed', error);

          // Retry logic for retryable errors
          if (retry && isRetryableError(networkError) && attempt < finalRetryConfig.maxRetries) {
            const delay = calculateRetryDelay(attempt, finalRetryConfig);

            logError(
              method,
              url,
              requestId,
              new Error(`Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error.message}`)
            );

            await sleep(delay);
            return executeRequest(attempt + 1);
          }

          throw networkError;
        }

        // Log error in development
        logError(method, url, requestId, error as Error);

        // Re-throw API errors and validation errors as-is
        throw error;
      }
    };

    // Execute request with caching for GET requests
    if (method === 'GET') {
      const cacheKey = this.getCacheKey(method, url, body);
      const controller = createTimeoutController(timeout);

      const promise = executeRequest().finally(() => {
        // Remove from cache when request completes
        this.pendingRequests.delete(cacheKey);
      });

      this.pendingRequests.set(cacheKey, { promise, controller });
      return promise;
    }

    return executeRequest();
  }

  /**
   * Perform GET request.
   */
  async get<T>(
    path: string,
    options?: RequestOptions & { params?: Record<string, any> }
  ): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  /**
   * Perform POST request.
   */
  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  /**
   * Perform PUT request.
   */
  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  /**
   * Perform PATCH request.
   */
  async patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  /**
   * Perform DELETE request.
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  /**
   * Cancel all pending requests.
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach(({ controller }) => {
      controller.abort();
    });
    this.pendingRequests.clear();
  }

  /**
   * Get the base URL configuration.
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Update configuration.
   */
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      retryConfig: { ...this.config.retryConfig, ...newConfig.retryConfig },
    };
  }
}

/**
 * Create API client instance with environment-based configuration.
 */
export function createApiClient(): ApiClient {
  // In Docker environment, use Next.js API routes instead of direct backend connection
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  return new ApiClient({
    baseUrl,
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
    },
  });
}

/**
 * Default API client instance.
 */
export const apiClient = createApiClient();
