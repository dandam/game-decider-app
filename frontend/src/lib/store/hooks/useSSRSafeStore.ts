/**
 * SSR-safe store hooks that prevent hydration mismatches.
 * Uses useSyncExternalStore with proper server/client state handling.
 */

import { useSyncExternalStore } from 'react';
import { useStore } from '../index';
import type { RootState } from '../types';

/**
 * Creates an SSR-safe selector hook that returns consistent values during SSR.
 * @param selector - Function to select state from the store
 * @param serverState - Default state to use during SSR
 * @returns Selected state value
 */
export function useSSRSafeStore<T>(
  selector: (state: RootState) => T,
  serverState: T
): T {
  return useSyncExternalStore(
    useStore.subscribe,
    () => selector(useStore.getState()),
    () => serverState
  );
}

/**
 * SSR-safe auth state hook
 */
export const useSSRSafeAuthState = () => {
  return useSSRSafeStore(
    (state) => ({
      isAuthenticated: state.auth.isAuthenticated,
      currentPlayerId: state.auth.currentPlayerId,
      loading: state.auth.loading,
      error: state.auth.error,
      loginAttempts: state.auth.loginAttempts,
      lastActivity: state.auth.lastActivity,
      tokenExpiry: state.auth.tokenExpiry,
    }),
    {
      isAuthenticated: false,
      currentPlayerId: null,
      loading: false,
      error: null,
      loginAttempts: 0,
      lastActivity: Date.now(),
      tokenExpiry: null,
    }
  );
};

/**
 * SSR-safe auth actions hook
 */
export const useSSRSafeAuthActions = () => {
  return useSSRSafeStore(
    (state) => ({
      login: state.auth.login,
      logout: state.auth.logout,
      refreshSession: state.auth.refreshSession,
      updateActivity: state.auth.updateActivity,
      clearError: state.auth.clearError,
      checkAuthStatus: state.auth.checkAuthStatus,
    }),
    {
      login: async () => {},
      logout: () => {},
      refreshSession: async () => {},
      updateActivity: () => {},
      clearError: () => {},
      checkAuthStatus: () => false,
    }
  );
};

/**
 * SSR-safe UI state hook
 */
export const useSSRSafeUIState = () => {
  return useSSRSafeStore(
    (state) => ({
      theme: state.ui.theme,
      toasts: state.ui.toasts,
      modals: state.ui.modals,
    }),
    {
      theme: 'system' as const,
      toasts: [],
      modals: {},
    }
  );
};

/**
 * SSR-safe UI actions hook
 */
export const useSSRSafeUIActions = () => {
  return useSSRSafeStore(
    (state) => ({
      setTheme: state.ui.setTheme,
      addToast: state.ui.addToast,
      removeToast: state.ui.removeToast,
      clearToasts: state.ui.clearToasts,
      openModal: state.ui.openModal,
      closeModal: state.ui.closeModal,
    }),
    {
      setTheme: () => {},
      addToast: () => '',
      removeToast: () => {},
      clearToasts: () => {},
      openModal: () => {},
      closeModal: () => {},
    }
  );
};

/**
 * SSR-safe games state hook
 */
export const useSSRSafeGamesState = () => {
  return useSSRSafeStore(
    (state) => ({
      games: state.games.games,
      filters: state.games.filters,
      favoriteGames: state.games.favoriteGames,
      recentlyViewed: state.games.recentlyViewed,
    }),
    {
      games: { 
        items: [], 
        total: 0, 
        hasMore: false, 
        page: 1, 
        limit: 20,
        loading: false,
        error: null,
        lastUpdated: null,
      },
      filters: {
        search: '',
        category_ids: [],
        min_players: undefined,
        max_players: undefined,
        min_play_time: undefined,
        max_play_time: undefined,
        min_complexity: undefined,
        max_complexity: undefined,
      },
      favoriteGames: [],
      recentlyViewed: [],
    }
  );
}; 