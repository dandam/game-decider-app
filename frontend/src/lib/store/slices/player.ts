/**
 * Player slice for managing player profiles, preferences, and multi-player selection.
 * Handles current player state, player list with pagination, and group session management.
 */

import { StateCreator } from 'zustand';
import { produce } from 'immer';
import {
  getPlayers,
  getPlayer,
  updatePlayer,
  getPlayerPreferences,
  updatePlayerPreferences,
  ApiError,
  ValidationError,
} from '@/lib/api';
import type { PlayerSlice, RootState, PaginatedState } from '../types';
import type { PlayerResponse, PlayerPreferencesResponse, PaginationParams } from '@/lib/api/types';

/**
 * Creates the player slice with all player-related state and actions.
 */
export const createPlayerSlice: StateCreator<
  RootState,
  [['zustand/devtools', never]],
  [],
  PlayerSlice
> = (set, get) => ({
  // =============================================================================
  // INITIAL STATE
  // =============================================================================

  currentPlayer: null,
  allPlayers: {
    items: [],
    total: 0,
    hasMore: true,
    page: 0,
    limit: 20,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  playerPreferences: {},
  selectedPlayers: [],
  searchQuery: '',
  filters: {},

  // =============================================================================
  // CURRENT PLAYER ACTIONS
  // =============================================================================

  /**
   * Sets the current player. Usually called from auth slice.
   * @param player - The player to set as current
   */
  setCurrentPlayer: player => {
    set(
      produce((state: RootState) => {
        state.player.currentPlayer = player;
      }),
      false,
      'player/set-current-player'
    );
  },

  /**
   * Updates the current player's profile.
   * @param updates - Partial player data to update
   */
  updateCurrentPlayer: async updates => {
    const currentPlayer = get().player.currentPlayer;

    if (!currentPlayer) {
      throw new Error('No current player set');
    }

    try {
      const updatedPlayer = await updatePlayer(currentPlayer.id, updates);

      set(
        produce((state: RootState) => {
          state.player.currentPlayer = updatedPlayer;

          // Update in allPlayers list if present
          const index = state.player.allPlayers.items.findIndex(p => p.id === updatedPlayer.id);
          if (index !== -1) {
            state.player.allPlayers.items[index] = updatedPlayer;
          }
        }),
        false,
        'player/update-current-player'
      );
    } catch (error) {
      console.error('Failed to update current player:', error);
      throw error;
    }
  },

  // =============================================================================
  // ALL PLAYERS MANAGEMENT
  // =============================================================================

  /**
   * Fetches players with pagination support.
   * @param params - Pagination and filter parameters
   */
  fetchPlayers: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const isFirstPage = skip === 0;

    set(
      produce((state: RootState) => {
        state.player.allPlayers.loading = true;
        if (isFirstPage) {
          state.player.allPlayers.error = null;
        }
      }),
      false,
      'player/fetch-players/start'
    );

    try {
      const players = await getPlayers({ limit, skip, ...get().player.filters });

      set(
        produce((state: RootState) => {
          if (isFirstPage) {
            state.player.allPlayers.items = players;
            state.player.allPlayers.page = 0;
          } else {
            state.player.allPlayers.items.push(...players);
            state.player.allPlayers.page = Math.floor(skip / limit);
          }

          state.player.allPlayers.hasMore = players.length === limit;
          state.player.allPlayers.loading = false;
          state.player.allPlayers.lastUpdated = Date.now();
        }),
        false,
        'player/fetch-players/success'
      );
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch players';

      set(
        produce((state: RootState) => {
          state.player.allPlayers.loading = false;
          state.player.allPlayers.error = errorMessage;
        }),
        false,
        'player/fetch-players/error'
      );

      throw error;
    }
  },

  /**
   * Searches players by query string.
   * @param query - Search query
   */
  searchPlayers: async query => {
    set(
      produce((state: RootState) => {
        state.player.searchQuery = query;
        state.player.allPlayers.loading = true;
        state.player.allPlayers.error = null;
      }),
      false,
      'player/search-players/start'
    );

    try {
      // For now, we'll use the basic getPlayers with a search filter
      // In a real implementation, this would use a dedicated search endpoint
      const searchParams = {
        limit: 50, // Higher limit for search results
        skip: 0,
        ...get().player.filters,
      };

      const players = await getPlayers(searchParams);

      // Filter results client-side for now
      const filteredPlayers = query
        ? players.filter(
            player =>
              player.username.toLowerCase().includes(query.toLowerCase()) ||
              player.display_name.toLowerCase().includes(query.toLowerCase())
          )
        : players;

      set(
        produce((state: RootState) => {
          state.player.allPlayers.items = filteredPlayers;
          state.player.allPlayers.hasMore = false; // Search results don't support pagination
          state.player.allPlayers.loading = false;
          state.player.allPlayers.lastUpdated = Date.now();
        }),
        false,
        'player/search-players/success'
      );
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Search failed';

      set(
        produce((state: RootState) => {
          state.player.allPlayers.loading = false;
          state.player.allPlayers.error = errorMessage;
        }),
        false,
        'player/search-players/error'
      );

      throw error;
    }
  },

  /**
   * Loads more players for pagination.
   */
  loadMorePlayers: async () => {
    const { allPlayers } = get().player;

    if (!allPlayers.hasMore || allPlayers.loading) {
      return;
    }

    const nextSkip = allPlayers.items.length;
    await get().player.fetchPlayers({ skip: nextSkip, limit: allPlayers.limit });
  },

  /**
   * Refreshes the player list.
   */
  refreshPlayers: async () => {
    await get().player.fetchPlayers({ skip: 0, limit: get().player.allPlayers.limit });
  },

  // =============================================================================
  // PLAYER PREFERENCES
  // =============================================================================

  /**
   * Fetches player preferences.
   * @param playerId - The player ID
   */
  fetchPlayerPreferences: async playerId => {
    try {
      const preferences = await getPlayerPreferences(playerId);

      set(
        produce((state: RootState) => {
          state.player.playerPreferences[playerId] = preferences;
        }),
        false,
        'player/fetch-preferences/success'
      );
    } catch (error) {
      console.error(`Failed to fetch preferences for player ${playerId}:`, error);
      throw error;
    }
  },

  /**
   * Updates player preferences.
   * @param playerId - The player ID
   * @param preferences - Preferences to update
   */
  updatePlayerPreferences: async (playerId, preferences) => {
    try {
      const updatedPreferences = await updatePlayerPreferences(playerId, preferences);

      set(
        produce((state: RootState) => {
          state.player.playerPreferences[playerId] = updatedPreferences;
        }),
        false,
        'player/update-preferences/success'
      );
    } catch (error) {
      console.error(`Failed to update preferences for player ${playerId}:`, error);
      throw error;
    }
  },

  // =============================================================================
  // PLAYER SELECTION (for group sessions)
  // =============================================================================

  /**
   * Selects a player for a group session.
   * @param playerId - The player ID to select
   */
  selectPlayer: playerId => {
    set(
      produce((state: RootState) => {
        if (!state.player.selectedPlayers.includes(playerId)) {
          state.player.selectedPlayers.push(playerId);
        }
      }),
      false,
      'player/select-player'
    );
  },

  /**
   * Unselects a player from a group session.
   * @param playerId - The player ID to unselect
   */
  unselectPlayer: playerId => {
    set(
      produce((state: RootState) => {
        state.player.selectedPlayers = state.player.selectedPlayers.filter(id => id !== playerId);
      }),
      false,
      'player/unselect-player'
    );
  },

  /**
   * Clears all selected players.
   */
  clearSelectedPlayers: () => {
    set(
      produce((state: RootState) => {
        state.player.selectedPlayers = [];
      }),
      false,
      'player/clear-selected-players'
    );
  },

  // =============================================================================
  // FILTERS AND SEARCH
  // =============================================================================

  /**
   * Sets the search query.
   * @param query - Search query string
   */
  setSearchQuery: query => {
    set(
      produce((state: RootState) => {
        state.player.searchQuery = query;
      }),
      false,
      'player/set-search-query'
    );
  },

  /**
   * Sets player filters.
   * @param filters - Filters to apply
   */
  setFilters: filters => {
    set(
      produce((state: RootState) => {
        state.player.filters = { ...state.player.filters, ...filters };
      }),
      false,
      'player/set-filters'
    );
  },

  /**
   * Clears all filters.
   */
  clearFilters: () => {
    set(
      produce((state: RootState) => {
        state.player.filters = {};
        state.player.searchQuery = '';
      }),
      false,
      'player/clear-filters'
    );
  },

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Gets a player by ID from the current loaded players.
   * @param playerId - The player ID
   * @returns The player or null if not found
   */
  getPlayerById: playerId => {
    const { allPlayers, currentPlayer } = get().player;

    // Check current player first
    if (currentPlayer?.id === playerId) {
      return currentPlayer;
    }

    // Check in all players list
    return allPlayers.items.find(player => player.id === playerId) || null;
  },

  /**
   * Clears the player list error.
   */
  clearError: () => {
    set(
      produce((state: RootState) => {
        state.player.allPlayers.error = null;
      }),
      false,
      'player/clear-error'
    );
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Determines if a player list refresh is needed based on age.
 * @param lastUpdated - Timestamp of last update
 * @param maxAge - Maximum age in milliseconds (default: 5 minutes)
 * @returns True if refresh is needed
 */
export const shouldRefreshPlayerList = (
  lastUpdated: number | null,
  maxAge: number = 5 * 60 * 1000
): boolean => {
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated > maxAge;
};

/**
 * Formats player display name with fallback.
 * @param player - The player object
 * @returns Formatted display name
 */
export const formatPlayerDisplayName = (player: PlayerResponse): string => {
  return player.display_name || player.username || 'Unknown Player';
};

/**
 * Validates if a player selection is valid for group sessions.
 * @param selectedPlayers - Array of selected player IDs
 * @param minPlayers - Minimum required players
 * @param maxPlayers - Maximum allowed players
 * @returns Validation result with error message if invalid
 */
export const validatePlayerSelection = (
  selectedPlayers: string[],
  minPlayers: number = 1,
  maxPlayers: number = 8
): { valid: boolean; error?: string } => {
  if (selectedPlayers.length < minPlayers) {
    return {
      valid: false,
      error: `At least ${minPlayers} player${minPlayers > 1 ? 's' : ''} required`,
    };
  }

  if (selectedPlayers.length > maxPlayers) {
    return {
      valid: false,
      error: `Maximum ${maxPlayers} players allowed`,
    };
  }

  return { valid: true };
};
