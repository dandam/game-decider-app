/**
 * Preferences slice for managing player preferences.
 * Handles individual player preferences with separate loading states and error handling.
 */

import { StateCreator } from 'zustand';
import { produce } from 'immer';
import {
  getPreferences,
  updatePreferences,
  getCompatibility,
  ApiError,
  ValidationError,
} from '@/lib/api';
import type { PreferencesSlice, RootState } from '../types';
import type { PlayerPreferencesResponse } from '@/lib/api/types';

/**
 * Creates the preferences slice with all preferences-related state and actions.
 */
export const createPreferencesSlice: StateCreator<
  RootState,
  [['zustand/devtools', never]],
  [],
  PreferencesSlice
> = (set, get) => ({
  // =============================================================================
  // INITIAL STATE
  // =============================================================================

  playerPreferences: {},
  loading: {},
  errors: {},
  lastUpdated: {},

  // =============================================================================
  // ACTIONS
  // =============================================================================

  /**
   * Fetches preferences for a specific player.
   * @param playerId - The player ID
   */
  fetchPreferences: async playerId => {
    set(
      produce((state: RootState) => {
        state.preferences.loading[playerId] = true;
        state.preferences.errors[playerId] = null;
      }),
      false,
      'preferences/fetch-preferences/start'
    );

    try {
      const preferences = await getPreferences(playerId);

      set(
        produce((state: RootState) => {
          state.preferences.playerPreferences[playerId] = preferences;
          state.preferences.loading[playerId] = false;
          state.preferences.lastUpdated[playerId] = Date.now();
        }),
        false,
        'preferences/fetch-preferences/success'
      );

      return preferences;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to fetch preferences';

      set(
        produce((state: RootState) => {
          state.preferences.loading[playerId] = false;
          state.preferences.errors[playerId] = errorMessage;
        }),
        false,
        'preferences/fetch-preferences/error'
      );

      throw error;
    }
  },

  /**
   * Updates preferences for a specific player.
   * @param playerId - The player ID
   * @param preferences - Preferences to update
   */
  updatePreferences: async (playerId, preferences) => {
    set(
      produce((state: RootState) => {
        state.preferences.loading[playerId] = true;
        state.preferences.errors[playerId] = null;
      }),
      false,
      'preferences/update-preferences/start'
    );

    try {
      const updatedPreferences = await updatePreferences(playerId, preferences);

      set(
        produce((state: RootState) => {
          state.preferences.playerPreferences[playerId] = updatedPreferences;
          state.preferences.loading[playerId] = false;
          state.preferences.lastUpdated[playerId] = Date.now();
        }),
        false,
        'preferences/update-preferences/success'
      );

      // Also update in player slice if it exists
      const playerSlice = get().player;
      if (playerSlice.playerPreferences[playerId]) {
        set(
          produce((state: RootState) => {
            state.player.playerPreferences[playerId] = updatedPreferences;
          }),
          false,
          'preferences/update-preferences/sync-player-slice'
        );
      }

      return updatedPreferences;
    } catch (error) {
      let errorMessage = 'Failed to update preferences';

      if (error instanceof ValidationError) {
        // Handle validation errors with detailed field information
        const fieldErrors = error.validationErrors
          .map(err => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
        errorMessage = `Validation error: ${fieldErrors}`;
      } else if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      set(
        produce((state: RootState) => {
          state.preferences.loading[playerId] = false;
          state.preferences.errors[playerId] = errorMessage;
        }),
        false,
        'preferences/update-preferences/error'
      );

      throw error;
    }
  },

  /**
   * Gets preferences for a specific player from the store.
   * @param playerId - The player ID
   * @returns Preferences or null if not loaded
   */
  getPreferences: playerId => {
    return get().preferences.playerPreferences[playerId] || null;
  },

  /**
   * Clears preferences for a specific player.
   * @param playerId - The player ID
   */
  clearPreferences: playerId => {
    set(
      produce((state: RootState) => {
        delete state.preferences.playerPreferences[playerId];
        delete state.preferences.loading[playerId];
        delete state.preferences.errors[playerId];
        delete state.preferences.lastUpdated[playerId];
      }),
      false,
      'preferences/clear-preferences'
    );
  },

  /**
   * Clears error for a specific player.
   * @param playerId - The player ID
   */
  clearError: playerId => {
    set(
      produce((state: RootState) => {
        state.preferences.errors[playerId] = null;
      }),
      false,
      'preferences/clear-error'
    );
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if preferences need to be refreshed based on age.
 * @param lastUpdated - Timestamp of last update
 * @param maxAge - Maximum age in milliseconds (default: 10 minutes)
 * @returns True if refresh is needed
 */
export const shouldRefreshPreferences = (
  lastUpdated: number | undefined,
  maxAge: number = 10 * 60 * 1000
): boolean => {
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated > maxAge;
};

/**
 * Validates player preferences data.
 * @param preferences - Preferences to validate
 * @returns Validation result
 */
export const validatePreferences = (
  preferences: Partial<PlayerPreferencesResponse>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate play time range
  if (preferences.minimum_play_time && preferences.maximum_play_time) {
    if (preferences.minimum_play_time > preferences.maximum_play_time) {
      errors.push('Minimum play time cannot be greater than maximum play time');
    }
  }

  // Validate play time values
  if (preferences.minimum_play_time && preferences.minimum_play_time < 0) {
    errors.push('Minimum play time cannot be negative');
  }
  if (preferences.maximum_play_time && preferences.maximum_play_time < 0) {
    errors.push('Maximum play time cannot be negative');
  }

  // Validate complexity range
  if (preferences.preferred_complexity_min && preferences.preferred_complexity_max) {
    if (preferences.preferred_complexity_min > preferences.preferred_complexity_max) {
      errors.push('Minimum complexity cannot be greater than maximum complexity');
    }
  }

  // Validate complexity values (typically 1-5 scale)
  if (
    preferences.preferred_complexity_min &&
    (preferences.preferred_complexity_min < 1 || preferences.preferred_complexity_min > 5)
  ) {
    errors.push('Minimum complexity must be between 1 and 5');
  }
  if (
    preferences.preferred_complexity_max &&
    (preferences.preferred_complexity_max < 1 || preferences.preferred_complexity_max > 5)
  ) {
    errors.push('Maximum complexity must be between 1 and 5');
  }

  // Validate preferred player count
  if (preferences.preferred_player_count && preferences.preferred_player_count < 1) {
    errors.push('Preferred player count must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Formats preferences for display.
 * @param preferences - Preferences to format
 * @returns Formatted preferences object
 */
export const formatPreferencesForDisplay = (
  preferences: PlayerPreferencesResponse
): Record<string, string> => {
  const formatted: Record<string, string> = {};

  if (preferences.minimum_play_time || preferences.maximum_play_time) {
    const min = preferences.minimum_play_time || 0;
    const max = preferences.maximum_play_time || '∞';
    formatted['Play Time'] = `${min} - ${max} minutes`;
  }

  if (preferences.preferred_complexity_min || preferences.preferred_complexity_max) {
    const min = preferences.preferred_complexity_min || 1;
    const max = preferences.preferred_complexity_max || 5;
    formatted['Complexity'] = `${min} - ${max} out of 5`;
  }

  if (preferences.preferred_player_count) {
    formatted['Preferred Players'] = `${preferences.preferred_player_count} players`;
  }

  if (preferences.preferred_categories.length > 0) {
    formatted['Preferred Categories'] = preferences.preferred_categories
      .map(cat => cat.name)
      .join(', ');
  }

  return formatted;
};

/**
 * Calculates a simple preferences completeness score.
 * @param preferences - Preferences to score
 * @returns Completeness score from 0 to 1
 */
export const calculatePreferencesCompleteness = (
  preferences: PlayerPreferencesResponse
): number => {
  let score = 0;
  const totalFields = 5; // Total number of preference fields

  if (preferences.minimum_play_time || preferences.maximum_play_time) score++;
  if (preferences.preferred_complexity_min || preferences.preferred_complexity_max) score++;
  if (preferences.preferred_player_count) score++;
  if (preferences.preferred_categories.length > 0) score++;

  // Check if at least one time preference is set
  if (preferences.minimum_play_time && preferences.maximum_play_time) score++;

  return Math.min(score / totalFields, 1);
};

/**
 * Gets default preferences for a new player.
 * @returns Default preferences object
 */
export const getDefaultPreferences = (): Partial<PlayerPreferencesResponse> => {
  return {
    minimum_play_time: 30,
    maximum_play_time: 120,
    preferred_player_count: 4,
    preferred_complexity_min: 2,
    preferred_complexity_max: 4,
    preferred_categories: [],
  };
};
