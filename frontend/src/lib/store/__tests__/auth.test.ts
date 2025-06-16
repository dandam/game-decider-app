/**
 * Authentication slice tests.
 * Tests all auth-related functionality including login, logout, session management.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createStore } from '../index';
import { hydrateAuthState } from '../slices/auth';

// Mock the API module
jest.mock('@/lib/api', () => ({
  getPlayer: jest.fn(),
}));

import { getPlayer } from '@/lib/api';
const mockGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Store', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Create fresh store for each test
    store = createStore({ enableDevtools: false, enableLogger: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const authState = store.getState().auth;

      expect(authState.isAuthenticated).toBe(false);
      expect(authState.currentPlayerId).toBe(null);
      expect(authState.sessionToken).toBe(null);
      expect(authState.tokenExpiry).toBe(null);
      expect(authState.loginAttempts).toBe(0);
      expect(authState.loading).toBe(false);
      expect(authState.error).toBe(null);
      expect(typeof authState.lastActivity).toBe('number');
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockPlayer = {
        id: 'player-1',
        username: 'testuser',
        display_name: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockGetPlayer.mockResolvedValue(mockPlayer);

      const authActions = store.getState().auth;
      await authActions.login('player-1');

      const authState = store.getState().auth;

      expect(authState.isAuthenticated).toBe(true);
      expect(authState.currentPlayerId).toBe('player-1');
      expect(authState.sessionToken).toBeTruthy();
      expect(authState.tokenExpiry).toBeGreaterThan(Date.now());
      expect(authState.loginAttempts).toBe(0);
      expect(authState.loading).toBe(false);
      expect(authState.error).toBe(null);

      // Check localStorage calls
      expect(localStorageMock.setItem).toHaveBeenCalledWith('game-decider-player-id', 'player-1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'game-decider-session-token',
        expect.any(String)
      );
    });

    it('should handle login failure', async () => {
      const mockError = new Error('Player not found');
      mockGetPlayer.mockRejectedValue(mockError);

      const authActions = store.getState().auth;

      await expect(authActions.login('invalid-player')).rejects.toThrow('Player not found');

      const authState = store.getState().auth;

      expect(authState.isAuthenticated).toBe(false);
      expect(authState.loginAttempts).toBe(1);
      expect(authState.loading).toBe(false);
      expect(authState.error).toBe('Player not found');
    });

    it('should prevent login after max attempts', async () => {
      const authActions = store.getState().auth;

      // Simulate max login attempts
      for (let i = 0; i < 5; i++) {
        try {
          await authActions.login('invalid-player');
        } catch {
          // Expected to fail
        }
      }

      // Attempt one more login
      await authActions.login('valid-player');

      const authState = store.getState().auth;
      expect(authState.error).toBe('Too many login attempts. Please try again later.');
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // First login
      const mockPlayer = {
        id: 'player-1',
        username: 'testuser',
        display_name: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };
      mockGetPlayer.mockResolvedValue(mockPlayer);

      const authActions = store.getState().auth;
      await authActions.login('player-1');

      // Then logout
      authActions.logout();

      const authState = store.getState().auth;

      expect(authState.isAuthenticated).toBe(false);
      expect(authState.currentPlayerId).toBe(null);
      expect(authState.sessionToken).toBe(null);
      expect(authState.tokenExpiry).toBe(null);
      expect(authState.error).toBe(null);

      // Check localStorage cleanup
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game-decider-player-id');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game-decider-session-token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game-decider-token-expiry');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game-decider-last-activity');
    });
  });

  describe('Session Management', () => {
    it('should check auth status correctly', () => {
      const authActions = store.getState().auth;

      // Not authenticated initially
      expect(authActions.checkAuthStatus()).toBe(false);

      // Mock authenticated state
      store.setState(state => ({
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: true,
          tokenExpiry: Date.now() + 10000, // 10 seconds in future
        },
      }));

      expect(authActions.checkAuthStatus()).toBe(true);

      // Mock expired session
      store.setState(state => ({
        ...state,
        auth: {
          ...state.auth,
          tokenExpiry: Date.now() - 10000, // 10 seconds in past
        },
      }));

      expect(authActions.checkAuthStatus()).toBe(false);
    });

    it('should update activity timestamp', () => {
      const authActions = store.getState().auth;
      const initialActivity = store.getState().auth.lastActivity;

      // Wait a bit and update activity
      setTimeout(() => {
        authActions.updateActivity();
        const newActivity = store.getState().auth.lastActivity;
        expect(newActivity).toBeGreaterThan(initialActivity);
      }, 10);
    });

    it('should refresh session', async () => {
      const mockPlayer = {
        id: 'player-1',
        username: 'testuser',
        display_name: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };
      mockGetPlayer.mockResolvedValue(mockPlayer);

      // Setup authenticated state
      store.setState(state => ({
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: true,
          currentPlayerId: 'player-1',
          tokenExpiry: Date.now() + 1000,
        },
      }));

      const authActions = store.getState().auth;
      const initialExpiry = store.getState().auth.tokenExpiry;

      await authActions.refreshSession();

      const newExpiry = store.getState().auth.tokenExpiry;
      expect(newExpiry).toBeGreaterThan(initialExpiry!);
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', () => {
      // Set an error
      store.setState(state => ({
        ...state,
        auth: {
          ...state.auth,
          error: 'Test error',
        },
      }));

      const authActions = store.getState().auth;
      authActions.clearError();

      const authState = store.getState().auth;
      expect(authState.error).toBe(null);
    });
  });

  describe('State Hydration', () => {
    it('should hydrate from localStorage', () => {
      const now = Date.now();
      const futureExpiry = now + 30 * 60 * 1000; // 30 minutes

      (localStorageMock.getItem as jest.Mock)
        .mockReturnValueOnce('player-1') // game-decider-player-id
        .mockReturnValueOnce('mock-token') // game-decider-session-token
        .mockReturnValueOnce(futureExpiry.toString()) // game-decider-token-expiry
        .mockReturnValueOnce(now.toString()); // game-decider-last-activity

      const hydratedState = hydrateAuthState();

      expect(hydratedState).toEqual({
        isAuthenticated: true,
        currentPlayerId: 'player-1',
        sessionToken: 'mock-token',
        tokenExpiry: futureExpiry,
        lastActivity: now,
        loginAttempts: 0,
        loading: false,
        error: null,
      });
    });

    it('should handle expired sessions during hydration', () => {
      const pastExpiry = Date.now() - 10000; // 10 seconds ago

      (localStorageMock.getItem as jest.Mock)
        .mockReturnValueOnce('player-1') // game-decider-player-id
        .mockReturnValueOnce('mock-token') // game-decider-session-token
        .mockReturnValueOnce(pastExpiry.toString()); // game-decider-token-expiry

      const hydratedState = hydrateAuthState();

      expect(hydratedState).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('should handle missing localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const hydratedState = hydrateAuthState();

      expect(hydratedState).toBe(null);
    });
  });
});
