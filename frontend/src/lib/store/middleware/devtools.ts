/**
 * Redux DevTools middleware configuration for Zustand store.
 * Provides enhanced debugging capabilities in development.
 */

import { devtools } from 'zustand/middleware';
import type { RootState } from '../types';

/**
 * DevTools configuration options.
 */
export interface DevToolsConfig {
  name?: string;
  enabled?: boolean;
  serialize?: boolean;
  actionSanitizer?: (action: any, id: number) => any;
  stateSanitizer?: (state: any, index: number) => any;
}

/**
 * Creates devtools middleware with optimized configuration.
 * @param config - DevTools configuration options
 * @returns Configured devtools middleware
 */
export const createDevToolsMiddleware = (config: DevToolsConfig = {}) => {
  const {
    name = 'GameDeciderStore',
    enabled = process.env.NODE_ENV === 'development',
    serialize = true,
  } = config;

  // Disable in production or when explicitly disabled
  if (!enabled) {
    return (f: any) => f;
  }

  return devtools(
    (set, get, api) => api,
    {
      name,
      serialize: {
        // Enable serialization for better debugging
        options: serialize,
      },
      // Action sanitizer to clean up sensitive data
      actionSanitizer: (action: any, id: number) => {
        // Remove sensitive authentication data from devtools
        if (action.type?.includes('auth/login')) {
          return {
            ...action,
            // Redact sensitive fields
            sessionToken: '[REDACTED]',
          };
        }
        return action;
      },
      // State sanitizer to prevent logging sensitive data
      stateSanitizer: (state: RootState) => {
        return {
          ...state,
          auth: {
            ...state.auth,
            // Redact sensitive authentication fields
            sessionToken: state.auth.sessionToken ? '[REDACTED]' : null,
          },
        };
      },
      // Enable action stack traces in development
      trace: true,
      // Show action diffs
      diff: true,
    }
  );
};

/**
 * Default devtools configuration for the main store.
 */
export const defaultDevToolsConfig: DevToolsConfig = {
  name: 'GameDeciderStore',
  enabled: process.env.NODE_ENV === 'development',
  serialize: true,
}; 