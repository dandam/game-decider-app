/**
 * Main store configuration for the Game Decider application.
 * SSR-safe implementation with proper hydration patterns.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { logger } from './middleware/logger';
import { createAuthSlice } from './slices/auth';
import { createPlayerSlice } from './slices/player';
import { createGameSlice } from './slices/games';
import { createPreferencesSlice } from './slices/preferences';
import { createUISlice } from './slices/ui';
import type { RootState } from './types';

/**
 * Check if we're running on the client side
 */
const isClient = typeof window !== 'undefined';

/**
 * Store configuration options.
 */
export interface StoreConfig {
  enableDevtools?: boolean;
  enableLogger?: boolean;
  name?: string;
}

/**
 * Creates the main application store with all slices and middleware.
 * This version is SSR-safe and doesn't access localStorage during creation.
 */
const createAppStore = () => {
  const enableDevtools = process.env.NODE_ENV === 'development' && isClient;
  const name = 'GameDeciderStore';

  // Create the store with all slices - no localStorage access here
  const storeCreator = (set: any, get: any, api: any) => ({
    // Authentication slice
    auth: createAuthSlice(set, get, api),

    // Player slice
    player: createPlayerSlice(set, get, api),

    // Games slice
    games: createGameSlice(set, get, api),

    // Preferences slice
    preferences: createPreferencesSlice(set, get, api),

    // UI slice
    ui: createUISlice(set, get, api),
  });

  // Apply middleware conditionally
  if (enableDevtools) {
    return create<RootState>()(
      subscribeWithSelector(
        devtools(storeCreator, { name })
      )
    );
  } else {
    return create<RootState>()(
      subscribeWithSelector(storeCreator)
    );
  }
};

/**
 * Main application store instance.
 */
export const useStore = createAppStore();

/**
 * Flag to track if hydration has been completed
 */
let isHydrated = false;

/**
 * Hydrate the store with persisted data on the client side only.
 * This should be called after the component mounts to avoid SSR mismatches.
 */
export const hydrateStore = () => {
  if (!isClient || isHydrated) return;

  console.log('🔄 Starting store hydration...');

  try {
    // Hydrate auth state
    const { hydrateAuthState } = require('./slices/auth');
    const authState = hydrateAuthState();
    if (authState) {
      console.log('✅ Hydrating auth state:', { playerId: authState.currentPlayerId });
      useStore.setState((state) => ({
        auth: { ...state.auth, ...authState }
      }));
    }

    // Hydrate games state
    const { hydrateGamesPersistentState } = require('./slices/games');
    const gamesState = hydrateGamesPersistentState();
    if (gamesState) {
      console.log('✅ Hydrating games state:', { 
        favoriteGames: gamesState.favoriteGames?.length || 0,
        recentlyViewed: gamesState.recentlyViewed?.length || 0
      });
      useStore.setState((state) => ({
        games: { 
          ...state.games, 
          favoriteGames: gamesState.favoriteGames || [],
          recentlyViewed: gamesState.recentlyViewed || [],
        }
      }));
    }

    // Hydrate UI state (theme)
    const { hydrateTheme } = require('./slices/ui');
    const theme = hydrateTheme();
    if (theme) {
      console.log('✅ Hydrating theme:', theme);
      useStore.setState((state) => ({
        ui: { ...state.ui, theme }
      }));
    }

    isHydrated = true;
    console.log('✅ Store hydration completed');

  } catch (error) {
    console.error('❌ Store hydration failed:', error);
  }
};

/**
 * Get hydration status
 */
export const getHydrationStatus = () => isHydrated;

/**
 * Store type for use with selectors and hooks.
 */
export type Store = ReturnType<typeof createAppStore>;

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export types for convenience
export type { RootState } from './types';
export type {
  AuthSlice,
  PlayerSlice,
  GameSlice,
  PreferencesSlice,
  UISlice,
  Theme,
  ToastState,
  ModalState,
} from './types';

// Re-export utility functions
export {
  hydrateAuthState,
  isSessionExpired,
  getRemainingSessionTime,
} from './slices/auth';

export {
  shouldRefreshPlayerList,
  formatPlayerDisplayName,
  validatePlayerSelection,
} from './slices/player';

export {
  hydrateGamesPersistentState,
  validateGameFilters,
} from './slices/games';

export {
  shouldRefreshPreferences,
  validatePreferences,
  formatPreferencesForDisplay,
  calculatePreferencesCompleteness,
  getDefaultPreferences,
} from './slices/preferences';

export {
  hydrateTheme,
  addSuccessToast,
  addErrorToast,
  addWarningToast,
  addInfoToast,
} from './slices/ui';

// Default export
export default useStore; 