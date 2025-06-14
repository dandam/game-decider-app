/**
 * Games slice for managing game library, filtering, search, favorites, and compatibility.
 * Handles game list with pagination, advanced filtering, and game selection workflows.
 */

import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { 
  getGames, 
  getGame, 
  searchGamesByName,
  getGameCompatibility,
  ApiError,
} from '@/lib/api';
import type { GameSlice, RootState } from '../types';
import type { GameResponse, GameFilters, CompatibilityResponse } from '@/lib/api/types';

// Maximum number of recently viewed games to keep
const MAX_RECENTLY_VIEWED = 10;

// Maximum number of favorite games (for performance)
const MAX_FAVORITES = 100;

// Cache expiry for compatibility scores (5 minutes)
const COMPATIBILITY_CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Creates the games slice with all game-related state and actions.
 */
export const createGameSlice: StateCreator<
  RootState,
  [['zustand/devtools', never]],
  [],
  GameSlice
> = (set, get) => ({
  // =============================================================================
  // INITIAL STATE
  // =============================================================================
  
  games: {
    items: [],
    total: 0,
    hasMore: true,
    page: 0,
    limit: 20,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  selectedGame: null,
  favoriteGames: [],
  recentlyViewed: [],
  gameCompatibility: {},
  searchQuery: '',
  filters: {},
  sortBy: 'name',
  sortOrder: 'asc',

  // =============================================================================
  // GAME LIBRARY MANAGEMENT
  // =============================================================================

  /**
   * Fetches games with filtering and pagination.
   * @param params - Filter and pagination parameters
   */
  fetchGames: async (params = {}) => {
    const currentState = get().games;
    const { limit = 20, skip = 0 } = params;
    const isFirstPage = skip === 0;

    // Merge with current filters
    const filters = { ...currentState.filters, ...params };

    set(produce((state: RootState) => {
      state.games.games.loading = true;
      if (isFirstPage) {
        state.games.games.error = null;
      }
    }), false, 'games/fetch-games/start');

    try {
      const games = await getGames({ limit, skip, ...filters });
      
      set(produce((state: RootState) => {
        if (isFirstPage) {
          state.games.games.items = games;
          state.games.games.page = 0;
        } else {
          state.games.games.items.push(...games);
          state.games.games.page = Math.floor(skip / limit);
        }
        
        state.games.games.hasMore = games.length === limit;
        state.games.games.loading = false;
        state.games.games.lastUpdated = Date.now();
        
        // Apply sorting
        state.games.games.items = sortGames(
          state.games.games.items, 
          state.games.sortBy, 
          state.games.sortOrder
        );
      }), false, 'games/fetch-games/success');

    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch games';
      
      set(produce((state: RootState) => {
        state.games.games.loading = false;
        state.games.games.error = errorMessage;
      }), false, 'games/fetch-games/error');

      throw error;
    }
  },

  /**
   * Searches games by name.
   * @param query - Search query
   */
  searchGames: async (query) => {
    set(produce((state: RootState) => {
      state.games.searchQuery = query;
      state.games.games.loading = true;
      state.games.games.error = null;
    }), false, 'games/search-games/start');

    try {
      let games: GameResponse[];
      
      if (query.trim()) {
        games = await searchGamesByName(query, 50);
      } else {
        // If no query, fetch all games with current filters
        games = await getGames({ limit: 50, ...get().games.filters });
      }

      set(produce((state: RootState) => {
        state.games.games.items = sortGames(games, state.games.sortBy, state.games.sortOrder);
        state.games.games.hasMore = false; // Search results don't support pagination
        state.games.games.loading = false;
        state.games.games.lastUpdated = Date.now();
      }), false, 'games/search-games/success');

    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Search failed';
      
      set(produce((state: RootState) => {
        state.games.games.loading = false;
        state.games.games.error = errorMessage;
      }), false, 'games/search-games/error');

      throw error;
    }
  },

  /**
   * Loads more games for pagination.
   */
  loadMoreGames: async () => {
    const { games } = get().games;
    
    if (!games.hasMore || games.loading) {
      return;
    }

    const nextSkip = games.items.length;
    await get().games.fetchGames({ skip: nextSkip, limit: games.limit });
  },

  /**
   * Refreshes the game list.
   */
  refreshGames: async () => {
    await get().games.fetchGames({ skip: 0, limit: get().games.games.limit });
  },

  // =============================================================================
  // GAME SELECTION
  // =============================================================================

  /**
   * Sets the selected game.
   * @param game - The game to select
   */
  setSelectedGame: (game) => {
    set(produce((state: RootState) => {
      state.games.selectedGame = game;
      
      // Add to recently viewed if not already there
      if (game) {
        get().games.addToRecentlyViewed(game.id);
      }
    }), false, 'games/set-selected-game');
  },

  /**
   * Fetches a game by ID and sets it as selected.
   * @param gameId - The game ID to fetch
   */
  fetchGameById: async (gameId) => {
    try {
      const game = await getGame(gameId);
      get().games.setSelectedGame(game);
    } catch (error) {
      console.error(`Failed to fetch game ${gameId}:`, error);
      throw error;
    }
  },

  // =============================================================================
  // FAVORITES MANAGEMENT
  // =============================================================================

  /**
   * Adds a game to favorites.
   * @param gameId - The game ID to add
   */
  addToFavorites: (gameId) => {
    set(produce((state: RootState) => {
      if (!state.games.favoriteGames.includes(gameId)) {
        // Respect maximum favorites limit
        if (state.games.favoriteGames.length >= MAX_FAVORITES) {
          state.games.favoriteGames.shift(); // Remove oldest
        }
        state.games.favoriteGames.push(gameId);
        
        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('game-decider-favorites', JSON.stringify(state.games.favoriteGames));
        }
      }
    }), false, 'games/add-to-favorites');
  },

  /**
   * Removes a game from favorites.
   * @param gameId - The game ID to remove
   */
  removeFromFavorites: (gameId) => {
    set(produce((state: RootState) => {
      state.games.favoriteGames = state.games.favoriteGames.filter(id => id !== gameId);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('game-decider-favorites', JSON.stringify(state.games.favoriteGames));
      }
    }), false, 'games/remove-from-favorites');
  },

  /**
   * Toggles a game's favorite status.
   * @param gameId - The game ID to toggle
   */
  toggleFavorite: (gameId) => {
    const { favoriteGames } = get().games;
    
    if (favoriteGames.includes(gameId)) {
      get().games.removeFromFavorites(gameId);
    } else {
      get().games.addToFavorites(gameId);
    }
  },

  // =============================================================================
  // RECENTLY VIEWED
  // =============================================================================

  /**
   * Adds a game to recently viewed list.
   * @param gameId - The game ID to add
   */
  addToRecentlyViewed: (gameId) => {
    set(produce((state: RootState) => {
      // Remove if already in list
      state.games.recentlyViewed = state.games.recentlyViewed.filter(id => id !== gameId);
      
      // Add to beginning
      state.games.recentlyViewed.unshift(gameId);
      
      // Respect maximum limit
      if (state.games.recentlyViewed.length > MAX_RECENTLY_VIEWED) {
        state.games.recentlyViewed = state.games.recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);
      }
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('game-decider-recently-viewed', JSON.stringify(state.games.recentlyViewed));
      }
    }), false, 'games/add-to-recently-viewed');
  },

  /**
   * Clears the recently viewed list.
   */
  clearRecentlyViewed: () => {
    set(produce((state: RootState) => {
      state.games.recentlyViewed = [];
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('game-decider-recently-viewed');
      }
    }), false, 'games/clear-recently-viewed');
  },

  // =============================================================================
  // COMPATIBILITY
  // =============================================================================

  /**
   * Fetches game compatibility for a player.
   * @param gameId - The game ID
   * @param playerId - The player ID
   */
  fetchGameCompatibility: async (gameId, playerId) => {
    const cacheKey = `${gameId}-${playerId}`;
    const cached = get().games.gameCompatibility[cacheKey];
    
    // Check if we have a recent cached result
    if (cached && Date.now() - cached.timestamp < COMPATIBILITY_CACHE_EXPIRY) {
      return;
    }

    try {
      const compatibility = await getGameCompatibility(gameId, playerId);
      
      set(produce((state: RootState) => {
        state.games.gameCompatibility[cacheKey] = {
          ...compatibility,
          timestamp: Date.now(),
        };
      }), false, 'games/fetch-compatibility/success');

    } catch (error) {
      console.error(`Failed to fetch compatibility for game ${gameId} and player ${playerId}:`, error);
      throw error;
    }
  },

  /**
   * Gets cached compatibility data for a game and player.
   * @param gameId - The game ID
   * @param playerId - The player ID
   * @returns Compatibility data or null if not cached
   */
  getCompatibilityForGame: (gameId, playerId) => {
    const cacheKey = `${gameId}-${playerId}`;
    const cached = get().games.gameCompatibility[cacheKey];
    
    if (!cached) return null;
    
    // Check if cached data is still valid
    if (Date.now() - cached.timestamp > COMPATIBILITY_CACHE_EXPIRY) {
      return null;
    }
    
    return cached;
  },

  // =============================================================================
  // FILTERING AND SORTING
  // =============================================================================

  /**
   * Sets the search query.
   * @param query - Search query string
   */
  setSearchQuery: (query) => {
    set(produce((state: RootState) => {
      state.games.searchQuery = query;
    }), false, 'games/set-search-query');
  },

  /**
   * Sets game filters.
   * @param filters - Filters to apply
   */
  setFilters: (filters) => {
    set(produce((state: RootState) => {
      state.games.filters = { ...state.games.filters, ...filters };
    }), false, 'games/set-filters');
  },

  /**
   * Clears all filters.
   */
  clearFilters: () => {
    set(produce((state: RootState) => {
      state.games.filters = {};
      state.games.searchQuery = '';
    }), false, 'games/clear-filters');
  },

  /**
   * Sets sorting criteria.
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort order (asc/desc)
   */
  setSorting: (sortBy, sortOrder) => {
    set(produce((state: RootState) => {
      state.games.sortBy = sortBy;
      state.games.sortOrder = sortOrder;
      
      // Re-sort current games
      state.games.games.items = sortGames(state.games.games.items, sortBy, sortOrder);
    }), false, 'games/set-sorting');
  },

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Gets a game by ID from the current loaded games.
   * @param gameId - The game ID
   * @returns The game or null if not found
   */
  getGameById: (gameId) => {
    const { games, selectedGame } = get().games;
    
    // Check selected game first
    if (selectedGame?.id === gameId) {
      return selectedGame;
    }
    
    // Check in games list
    return games.items.find(game => game.id === gameId) || null;
  },

  /**
   * Gets filtered games based on current filters and search.
   * @returns Filtered and sorted games
   */
  getFilteredGames: () => {
    const { games, searchQuery, filters, sortBy, sortOrder } = get().games;
    let filteredGames = [...games.items];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredGames = filteredGames.filter(game =>
        game.name.toLowerCase().includes(query) ||
        (game.description && game.description.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.min_players) {
      filteredGames = filteredGames.filter(game => game.max_players >= filters.min_players!);
    }
    if (filters.max_players) {
      filteredGames = filteredGames.filter(game => game.min_players <= filters.max_players!);
    }
    if (filters.min_play_time) {
      filteredGames = filteredGames.filter(game => game.average_play_time >= filters.min_play_time!);
    }
    if (filters.max_play_time) {
      filteredGames = filteredGames.filter(game => game.average_play_time <= filters.max_play_time!);
    }
    if (filters.min_complexity) {
      filteredGames = filteredGames.filter(game => game.complexity_rating >= filters.min_complexity!);
    }
    if (filters.max_complexity) {
      filteredGames = filteredGames.filter(game => game.complexity_rating <= filters.max_complexity!);
    }

    // Apply category filters
    if (filters.category_ids && filters.category_ids.length > 0) {
      const filterMode = filters.category_filter_mode || 'any';
      filteredGames = filteredGames.filter(game => {
        const gameCategoryIds = game.categories.map(cat => cat.id);
        
        if (filterMode === 'all') {
          return filters.category_ids!.every(categoryId => gameCategoryIds.includes(categoryId));
        } else {
          return filters.category_ids!.some(categoryId => gameCategoryIds.includes(categoryId));
        }
      });
    }

    return sortGames(filteredGames, sortBy, sortOrder);
  },

  /**
   * Clears the games error.
   */
  clearError: () => {
    set(produce((state: RootState) => {
      state.games.games.error = null;
    }), false, 'games/clear-error');
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Sorts games by the specified criteria.
 * @param games - Games to sort
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order
 * @returns Sorted games array
 */
const sortGames = (
  games: GameResponse[], 
  sortBy: GameSlice['sortBy'], 
  sortOrder: GameSlice['sortOrder']
): GameResponse[] => {
  return [...games].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'complexity_rating':
        aValue = a.complexity_rating;
        bValue = b.complexity_rating;
        break;
      case 'average_play_time':
        aValue = a.average_play_time;
        bValue = b.average_play_time;
        break;
      case 'min_players':
        aValue = a.min_players;
        bValue = b.min_players;
        break;
      case 'max_players':
        aValue = a.max_players;
        bValue = b.max_players;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Hydrates favorites and recently viewed from localStorage.
 * Should be called during app initialization.
 */
export const hydrateGamesPersistentState = () => {
  if (typeof window === 'undefined') {
    return { favoriteGames: [], recentlyViewed: [] };
  }

  const favoritesJson = localStorage.getItem('game-decider-favorites');
  const recentlyViewedJson = localStorage.getItem('game-decider-recently-viewed');

  const favoriteGames = favoritesJson ? JSON.parse(favoritesJson) : [];
  const recentlyViewed = recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];

  return {
    favoriteGames: favoriteGames.slice(0, MAX_FAVORITES),
    recentlyViewed: recentlyViewed.slice(0, MAX_RECENTLY_VIEWED),
  };
};

/**
 * Validates game filters.
 * @param filters - Filters to validate
 * @returns Validation result
 */
export const validateGameFilters = (filters: GameFilters): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (filters.min_players && filters.max_players && filters.min_players > filters.max_players) {
    errors.push('Minimum players cannot be greater than maximum players');
  }

  if (filters.min_play_time && filters.max_play_time && filters.min_play_time > filters.max_play_time) {
    errors.push('Minimum play time cannot be greater than maximum play time');
  }

  if (filters.min_complexity && filters.max_complexity && filters.min_complexity > filters.max_complexity) {
    errors.push('Minimum complexity cannot be greater than maximum complexity');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}; 