/**
 * Authentication store hooks for easy component integration.
 * Provides typed selectors and actions for auth-related functionality.
 */

import { useStore } from '../index';
import type { AuthSlice } from '../types';

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Hook to get the current authentication state.
 * @returns Authentication state object
 */
export const useAuthState = () => {
  return useStore((state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    currentPlayerId: state.auth.currentPlayerId,
    loading: state.auth.loading,
    error: state.auth.error,
    loginAttempts: state.auth.loginAttempts,
    lastActivity: state.auth.lastActivity,
    tokenExpiry: state.auth.tokenExpiry,
  }));
};

/**
 * Hook to get authentication actions.
 * @returns Authentication actions
 */
export const useAuthActions = () => {
  return useStore((state) => ({
    login: state.auth.login,
    logout: state.auth.logout,
    refreshSession: state.auth.refreshSession,
    updateActivity: state.auth.updateActivity,
    clearError: state.auth.clearError,
    checkAuthStatus: state.auth.checkAuthStatus,
  }));
};

/**
 * Hook to get the full auth slice.
 * Use sparingly as it may cause unnecessary re-renders.
 * @returns Complete auth slice
 */
export const useAuth = () => {
  return useStore((state) => state.auth);
};

// =============================================================================
// SPECIFIC SELECTORS
// =============================================================================

/**
 * Hook to check if user is authenticated.
 * @returns True if authenticated
 */
export const useIsAuthenticated = () => {
  return useStore((state) => state.auth.isAuthenticated);
};

/**
 * Hook to get the current player ID.
 * @returns Current player ID or null
 */
export const useCurrentPlayerId = () => {
  return useStore((state) => state.auth.currentPlayerId);
};

/**
 * Hook to get authentication loading state.
 * @returns True if auth operation is in progress
 */
export const useAuthLoading = () => {
  return useStore((state) => state.auth.loading);
};

/**
 * Hook to get authentication error.
 * @returns Current auth error or null
 */
export const useAuthError = () => {
  return useStore((state) => state.auth.error);
};

/**
 * Hook to check if session is expired.
 * @returns True if session is expired
 */
export const useIsSessionExpired = () => {
  return useStore((state) => {
    if (!state.auth.tokenExpiry) return true;
    return Date.now() > state.auth.tokenExpiry;
  });
};

/**
 * Hook to get remaining session time in minutes.
 * @returns Minutes remaining or 0 if expired
 */
export const useSessionTimeRemaining = () => {
  return useStore((state) => {
    if (!state.auth.tokenExpiry) return 0;
    const remaining = state.auth.tokenExpiry - Date.now();
    return Math.max(0, Math.floor(remaining / (1000 * 60)));
  });
};

// =============================================================================
// COMPUTED SELECTORS
// =============================================================================

/**
 * Hook to get authentication status summary.
 * @returns Object with authentication status information
 */
export const useAuthStatus = () => {
  return useStore((state) => {
    const isExpired = state.auth.tokenExpiry ? Date.now() > state.auth.tokenExpiry : true;
    const remaining = state.auth.tokenExpiry ? 
      Math.max(0, Math.floor((state.auth.tokenExpiry - Date.now()) / (1000 * 60))) : 0;
    
    return {
      isAuthenticated: state.auth.isAuthenticated,
      isExpired,
      timeRemaining: remaining,
      needsRefresh: remaining < 5 && remaining > 0, // Less than 5 minutes remaining
      hasError: Boolean(state.auth.error),
      isLoading: state.auth.loading,
    };
  });
};

// =============================================================================
// ACTION HOOKS WITH ERROR HANDLING
// =============================================================================

/**
 * Hook for login with error handling.
 * @returns Login function with enhanced error handling
 */
export const useLogin = () => {
  const login = useStore((state) => state.auth.login);
  const addToast = useStore((state) => state.ui.addToast);

  return async (playerId: string, token?: string) => {
    try {
      await login(playerId, token);
      addToast({
        type: 'success',
        message: 'Successfully logged in',
        description: 'Welcome back to Game Decider!',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Login failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 0, // Don't auto-dismiss errors
      });
      throw error;
    }
  };
};

/**
 * Hook for logout with confirmation.
 * @returns Logout function with toast notification
 */
export const useLogout = () => {
  const logout = useStore((state) => state.auth.logout);
  const addToast = useStore((state) => state.ui.addToast);

  return () => {
    logout();
    addToast({
      type: 'info',
      message: 'Logged out successfully',
      description: 'See you next time!',
    });
  };
};

/**
 * Hook for session refresh with error handling.
 * @returns Refresh function with error handling
 */
export const useRefreshSession = () => {
  const refreshSession = useStore((state) => state.auth.refreshSession);
  const addToast = useStore((state) => state.ui.addToast);

  return async () => {
    try {
      await refreshSession();
    } catch (error) {
      addToast({
        type: 'warning',
        message: 'Session refresh failed',
        description: 'Please log in again to continue',
      });
      throw error;
    }
  };
}; 