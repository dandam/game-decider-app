/**
 * Logger middleware for Zustand store.
 * Provides detailed logging of state changes in development.
 */

import type { StateCreator } from 'zustand';
import type { RootState } from '../types';

/**
 * Logger configuration options.
 */
export interface LoggerConfig {
  enabled?: boolean;
  logActions?: boolean;
  logState?: boolean;
  logDiffs?: boolean;
  logPerformance?: boolean;
  actionFilter?: (actionType: string) => boolean;
  stateFilter?: (state: RootState) => Partial<RootState>;
  colors?: {
    action: string;
    prevState: string;
    nextState: string;
    diff: string;
    performance: string;
  };
}

/**
 * Default logger configuration.
 */
const defaultConfig: Required<LoggerConfig> = {
  enabled: process.env.NODE_ENV === 'development',
  logActions: true,
  logState: true,
  logDiffs: true,
  logPerformance: true,
  actionFilter: () => true,
  stateFilter: state => state,
  colors: {
    action: '#2196F3',
    prevState: '#FF9800',
    nextState: '#4CAF50',
    diff: '#9C27B0',
    performance: '#795548',
  },
};

/**
 * Creates a simple logger for development.
 * Note: This is a basic implementation for debugging purposes.
 * @param config - Logger configuration options
 * @returns Logger function
 */
export const logger = <T extends RootState>(config: LoggerConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (f: StateCreator<T>): StateCreator<T> => {
    return (set, get, api) => {
      const wrappedSet = (partial: any, replace?: any) => {
        if (!finalConfig.enabled) {
          return set(partial, replace);
        }

        const startTime = performance.now();
        const prevState = get();

        // Execute the state update
        const result = set(partial, replace);

        const nextState = get();
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Simple console logging
        if (finalConfig.logState && prevState !== nextState) {
          const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
          console.groupCollapsed(`🔄 State Update @ ${timestamp}`);

          if (finalConfig.logDiffs) {
            const diff = calculateStateDiff(prevState as RootState, nextState as RootState);
            if (Object.keys(diff).length > 0) {
              console.log('📊 Changed:', diff);
            }
          }

          if (finalConfig.logPerformance) {
            const emoji = duration > 10 ? '🐌' : '⚡';
            console.log(`${emoji} Performance: ${duration.toFixed(2)}ms`);

            if (duration > 10) {
              console.warn(`Slow state update detected: ${duration.toFixed(2)}ms`);
            }
          }

          console.groupEnd();
        }

        return result;
      };

      return f(wrappedSet as any, get, api);
    };
  };
};

/**
 * Calculates the difference between two state objects.
 * @param prev - Previous state
 * @param next - Next state
 * @returns Object containing only the changed properties
 */
function calculateStateDiff(prev: RootState, next: RootState): Partial<RootState> {
  const diff: any = {};

  // Check each slice for changes
  Object.keys(next).forEach(key => {
    const sliceKey = key as keyof RootState;
    const prevSlice = prev[sliceKey];
    const nextSlice = next[sliceKey];

    if (prevSlice !== nextSlice) {
      // For objects, do a deeper comparison
      if (
        typeof nextSlice === 'object' &&
        nextSlice !== null &&
        typeof prevSlice === 'object' &&
        prevSlice !== null
      ) {
        const sliceDiff = calculateObjectDiff(prevSlice, nextSlice);
        if (Object.keys(sliceDiff).length > 0) {
          diff[sliceKey] = sliceDiff;
        }
      } else {
        diff[sliceKey] = {
          from: prevSlice,
          to: nextSlice,
        };
      }
    }
  });

  return diff;
}

/**
 * Calculates the difference between two objects.
 * @param prev - Previous object
 * @param next - Next object
 * @returns Object containing only the changed properties
 */
function calculateObjectDiff(prev: any, next: any): any {
  const diff: any = {};

  // Check for changed or new properties
  Object.keys(next).forEach(key => {
    if (prev[key] !== next[key]) {
      if (
        typeof next[key] === 'object' &&
        next[key] !== null &&
        typeof prev[key] === 'object' &&
        prev[key] !== null
      ) {
        const nestedDiff = calculateObjectDiff(prev[key], next[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else {
        diff[key] = {
          from: prev[key],
          to: next[key],
        };
      }
    }
  });

  // Check for removed properties
  Object.keys(prev).forEach(key => {
    if (!(key in next)) {
      diff[key] = {
        from: prev[key],
        to: undefined,
      };
    }
  });

  return diff;
}

/**
 * Pre-configured logger for authentication actions only.
 */
export const authLogger = logger({
  actionFilter: actionType => actionType.startsWith('auth/'),
  stateFilter: state => ({ auth: state.auth }),
});

/**
 * Pre-configured logger for game-related actions only.
 */
export const gameLogger = logger({
  actionFilter: actionType => actionType.startsWith('games/'),
  stateFilter: state => ({ games: state.games }),
});

/**
 * Pre-configured logger for UI actions only.
 */
export const uiLogger = logger({
  actionFilter: actionType => actionType.startsWith('ui/'),
  stateFilter: state => ({ ui: state.ui }),
});

/**
 * Lightweight logger that only logs action names and performance.
 */
export const lightLogger = logger({
  logState: false,
  logDiffs: false,
  logPerformance: true,
});
