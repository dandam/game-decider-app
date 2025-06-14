/**
 * Authentication slice for managing user sessions and login state.
 * Handles login, logout, session persistence, and authentication checks.
 */

import { StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getPlayer } from '@/lib/api';
import type { AuthSlice, RootState } from '../types';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Maximum login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5;

// Storage keys for persistence
const STORAGE_KEYS = {
  PLAYER_ID: 'game-decider-player-id',
  SESSION_TOKEN: 'game-decider-session-token',
  TOKEN_EXPIRY: 'game-decider-token-expiry',
  LAST_ACTIVITY: 'game-decider-last-activity',
} as const;

/**
 * Creates the authentication slice with all auth-related state and actions.
 */
export const createAuthSlice: StateCreator<
  RootState,
  [['zustand/devtools', never]],
  [],
  AuthSlice
> = (set, get) => ({
  // =============================================================================
  // INITIAL STATE
  // =============================================================================
  
  isAuthenticated: false,
  currentPlayerId: null,
  sessionToken: null,
  tokenExpiry: null,
  loginAttempts: 0,
  lastActivity: Date.now(),
  loading: false,
  error: null,

  // =============================================================================
  // ACTIONS
  // =============================================================================

  /**
   * Logs in a player and establishes a session.
   * @param playerId - The ID of the player to log in
   * @param token - Optional session token
   */
  login: async (playerId, token) => {
    const state = get().auth;
    
    // Check if too many login attempts
    if (state.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      set((state) => ({
        auth: {
          ...state.auth,
          error: 'Too many login attempts. Please try again later.',
        },
      }), false, 'auth/login/too-many-attempts');
      return;
    }

    set((state) => ({
      auth: {
        ...state.auth,
        loading: true,
        error: null,
      },
    }), false, 'auth/login/start');

    try {
      // Verify player exists
      const player = await getPlayer(playerId);
      
      if (!player) {
        throw new Error('Player not found');
      }

      const now = Date.now();
      const expiry = now + SESSION_TIMEOUT;
      const sessionToken = token || `session_${playerId}_${now}`;

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
        localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      }

      set((state) => ({
        auth: {
          ...state.auth,
          isAuthenticated: true,
          currentPlayerId: playerId,
          sessionToken,
          tokenExpiry: expiry,
          loginAttempts: 0,
          lastActivity: now,
          loading: false,
          error: null,
        },
      }), false, 'auth/login/success');

      // Update current player in player slice
      set((state) => ({
        player: {
          ...state.player,
          currentPlayer: player,
        },
      }), false, 'auth/login/set-current-player');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      set((state) => ({
        auth: {
          ...state.auth,
          loginAttempts: state.auth.loginAttempts + 1,
          loading: false,
          error: errorMessage,
        },
      }), false, 'auth/login/error');

      throw error;
    }
  },

  /**
   * Logs out the current user and cleans up the session.
   */
  logout: () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }

    set((state) => ({
      auth: {
        ...state.auth,
        isAuthenticated: false,
        currentPlayerId: null,
        sessionToken: null,
        tokenExpiry: null,
        lastActivity: Date.now(),
        error: null,
      },
      player: {
        ...state.player,
        currentPlayer: null,
      },
    }), false, 'auth/logout');
  },

  /**
   * Refreshes the current session if valid.
   */
  refreshSession: async () => {
    const state = get().auth;
    
    if (!state.isAuthenticated || !state.currentPlayerId) {
      return;
    }

    set((state) => ({
      auth: {
        ...state.auth,
        loading: true,
      },
    }), false, 'auth/refresh-session/start');

    try {
      // Verify player still exists
      const player = await getPlayer(state.currentPlayerId);
      
      if (!player) {
        get().auth.logout();
        return;
      }

      const now = Date.now();
      const expiry = now + SESSION_TIMEOUT;

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      }

      set((state) => ({
        auth: {
          ...state.auth,
          tokenExpiry: expiry,
          lastActivity: now,
          loading: false,
        },
        player: {
          ...state.player,
          currentPlayer: player,
        },
      }), false, 'auth/refresh-session/success');

    } catch (error) {
      console.error('Session refresh failed:', error);
      get().auth.logout();
    }
  },

  /**
   * Updates the last activity timestamp.
   */
  updateActivity: () => {
    const now = Date.now();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    }

    set((state) => ({
      auth: {
        ...state.auth,
        lastActivity: now,
      },
    }), false, 'auth/update-activity');
  },

  /**
   * Clears the current authentication error.
   */
  clearError: () => {
    set((state) => ({
      auth: {
        ...state.auth,
        error: null,
      },
    }), false, 'auth/clear-error');
  },

  /**
   * Checks if the current session is valid.
   * @returns True if authenticated and session is not expired
   */
  checkAuthStatus: () => {
    const state = get().auth;
    
    if (!state.isAuthenticated || !state.tokenExpiry) {
      return false;
    }

    const now = Date.now();
    const isExpired = now > state.tokenExpiry;
    
    if (isExpired) {
      get().auth.logout();
      return false;
    }

    return true;
  },
});

/**
 * Hydrates the auth state from localStorage on app startup.
 * Should be called once during app initialization.
 */
export const hydrateAuthState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const playerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
  const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);

  if (!playerId || !sessionToken || !tokenExpiry) {
    return null;
  }

  const expiry = parseInt(tokenExpiry, 10);
  const activity = lastActivity ? parseInt(lastActivity, 10) : Date.now();
  const now = Date.now();

  // Check if session is expired
  if (now > expiry) {
    // Clean up expired session
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return null;
  }

  return {
    isAuthenticated: true,
    currentPlayerId: playerId,
    sessionToken,
    tokenExpiry: expiry,
    lastActivity: activity,
    loginAttempts: 0,
    loading: false,
    error: null,
  };
};

/**
 * Utility to check if a session is expired.
 * @param tokenExpiry - The expiry timestamp
 * @returns True if the session is expired
 */
export const isSessionExpired = (tokenExpiry: number | null): boolean => {
  if (!tokenExpiry) return true;
  return Date.now() > tokenExpiry;
};

/**
 * Utility to get remaining session time in minutes.
 * @param tokenExpiry - The expiry timestamp
 * @returns Minutes remaining or 0 if expired
 */
export const getRemainingSessionTime = (tokenExpiry: number | null): number => {
  if (!tokenExpiry) return 0;
  const remaining = tokenExpiry - Date.now();
  return Math.max(0, Math.floor(remaining / (1000 * 60)));
}; 