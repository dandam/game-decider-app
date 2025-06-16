/**
 * Game store hooks for easy component integration.
 * Provides typed selectors and actions for game-related functionality.
 */

import { useStore } from '../index';
import type { GameResponse, GameFilters } from '@/lib/api/types';
import type { GameSlice } from '../types';

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Hook to get the games list state.
 * @returns Games list with pagination info
 */
export const useGamesState = () => {
  return useStore(state => ({
    games: state.games.games.items,
    loading: state.games.games.loading,
    error: state.games.games.error,
    hasMore: state.games.games.hasMore,
    total: state.games.games.total,
    page: state.games.games.page,
    lastUpdated: state.games.games.lastUpdated,
  }));
};

/**
 * Hook to get game actions.
 * @returns Game-related actions
 */
export const useGameActions = () => {
  return useStore(state => ({
    fetchGames: state.games.fetchGames,
    searchGames: state.games.searchGames,
    loadMoreGames: state.games.loadMoreGames,
    refreshGames: state.games.refreshGames,
    setSelectedGame: state.games.setSelectedGame,
    fetchGameById: state.games.fetchGameById,
    addToFavorites: state.games.addToFavorites,
    removeFromFavorites: state.games.removeFromFavorites,
    toggleFavorite: state.games.toggleFavorite,
    setSearchQuery: state.games.setSearchQuery,
    setFilters: state.games.setFilters,
    clearFilters: state.games.clearFilters,
    setSorting: state.games.setSorting,
    clearError: state.games.clearError,
  }));
};

/**
 * Hook to get the full games slice.
 * Use sparingly as it may cause unnecessary re-renders.
 * @returns Complete games slice
 */
export const useGames = () => {
  return useStore(state => state.games);
};

// =============================================================================
// SPECIFIC SELECTORS
// =============================================================================

/**
 * Hook to get the current games list.
 * @returns Array of games
 */
export const useGamesList = () => {
  return useStore(state => state.games.games.items);
};

/**
 * Hook to get the selected game.
 * @returns Selected game or null
 */
export const useSelectedGame = () => {
  return useStore(state => state.games.selectedGame);
};

/**
 * Hook to get favorite games list.
 * @returns Array of favorite game IDs
 */
export const useFavoriteGames = () => {
  return useStore(state => state.games.favoriteGames);
};

/**
 * Hook to get recently viewed games.
 * @returns Array of recently viewed game IDs
 */
export const useRecentlyViewedGames = () => {
  return useStore(state => state.games.recentlyViewed);
};

/**
 * Hook to get current search query.
 * @returns Current search query string
 */
export const useGameSearchQuery = () => {
  return useStore(state => state.games.searchQuery);
};

/**
 * Hook to get current filters.
 * @returns Current game filters
 */
export const useGameFilters = () => {
  return useStore(state => state.games.filters);
};

/**
 * Hook to get current sorting.
 * @returns Current sort criteria
 */
export const useGameSorting = () => {
  return useStore(state => ({
    sortBy: state.games.sortBy,
    sortOrder: state.games.sortOrder,
  }));
};

/**
 * Hook to get games loading state.
 * @returns True if games are loading
 */
export const useGamesLoading = () => {
  return useStore(state => state.games.games.loading);
};

/**
 * Hook to get games error.
 * @returns Current games error or null
 */
export const useGamesError = () => {
  return useStore(state => state.games.games.error);
};

// =============================================================================
// COMPUTED SELECTORS
// =============================================================================

/**
 * Hook to get filtered games based on current filters and search.
 * @returns Filtered games array
 */
export const useFilteredGames = () => {
  return useStore(state => state.games.getFilteredGames());
};

/**
 * Hook to get a specific game by ID.
 * @param gameId - Game ID to find
 * @returns Game object or null
 */
export const useGameById = (gameId: string | null) => {
  return useStore(state => {
    if (!gameId) return null;
    return state.games.getGameById(gameId);
  });
};

/**
 * Hook to check if a game is favorited.
 * @param gameId - Game ID to check
 * @returns True if game is in favorites
 */
export const useIsGameFavorited = (gameId: string | null) => {
  return useStore(state => {
    if (!gameId) return false;
    return state.games.favoriteGames.includes(gameId);
  });
};

/**
 * Hook to get pagination info.
 * @returns Pagination state
 */
export const useGamesPagination = () => {
  return useStore(state => ({
    hasMore: state.games.games.hasMore,
    loading: state.games.games.loading,
    page: state.games.games.page,
    total: state.games.games.total,
    canLoadMore: state.games.games.hasMore && !state.games.games.loading,
  }));
};

/**
 * Hook to get compatibility score for a game and player.
 * @param gameId - Game ID
 * @param playerId - Player ID
 * @returns Compatibility data or null
 */
export const useGameCompatibility = (gameId: string | null, playerId: string | null) => {
  return useStore(state => {
    if (!gameId || !playerId) return null;
    return state.games.getCompatibilityForGame(gameId, playerId);
  });
};

// =============================================================================
// ACTION HOOKS WITH ERROR HANDLING
// =============================================================================

/**
 * Hook for fetching games with error handling.
 * @returns Fetch games function with error handling
 */
export const useFetchGames = () => {
  const fetchGames = useStore(state => state.games.fetchGames);
  const addToast = useStore(state => state.ui.addToast);

  return async (params?: GameFilters) => {
    try {
      await fetchGames(params);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to load games',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };
};

/**
 * Hook for searching games with debounced input.
 * @returns Search function with error handling
 */
export const useSearchGames = () => {
  const searchGames = useStore(state => state.games.searchGames);
  const addToast = useStore(state => state.ui.addToast);

  return async (query: string) => {
    try {
      await searchGames(query);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Search failed',
        description: error instanceof Error ? error.message : 'Failed to search games',
      });
      throw error;
    }
  };
};

/**
 * Hook for toggling game favorites with notifications.
 * @returns Toggle favorite function with toast notifications
 */
export const useToggleFavorite = () => {
  const toggleFavorite = useStore(state => state.games.toggleFavorite);
  const favoriteGames = useStore(state => state.games.favoriteGames);
  const getGameById = useStore(state => state.games.getGameById);
  const addToast = useStore(state => state.ui.addToast);

  return (gameId: string) => {
    const game = getGameById(gameId);
    const isCurrentlyFavorited = favoriteGames.includes(gameId);

    toggleFavorite(gameId);

    if (game) {
      addToast({
        type: 'success',
        message: isCurrentlyFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `${game.name} ${isCurrentlyFavorited ? 'removed from' : 'added to'} your favorites`,
      });
    }
  };
};

/**
 * Hook for selecting a game with navigation.
 * @returns Select game function
 */
export const useSelectGame = () => {
  const setSelectedGame = useStore(state => state.games.setSelectedGame);
  const addToRecentlyViewed = useStore(state => state.games.addToRecentlyViewed);

  return (game: GameResponse | null) => {
    setSelectedGame(game);
    if (game) {
      addToRecentlyViewed(game.id);
    }
  };
};

/**
 * Hook for advanced game filtering with validation.
 * @returns Set filters function with validation
 */
export const useSetGameFilters = () => {
  const setFilters = useStore(state => state.games.setFilters);
  const addToast = useStore(state => state.ui.addToast);

  return (filters: Partial<GameFilters>) => {
    // Basic validation
    if (filters.min_players && filters.max_players && filters.min_players > filters.max_players) {
      addToast({
        type: 'warning',
        message: 'Invalid filter',
        description: 'Minimum players cannot be greater than maximum players',
      });
      return;
    }

    if (
      filters.min_play_time &&
      filters.max_play_time &&
      filters.min_play_time > filters.max_play_time
    ) {
      addToast({
        type: 'warning',
        message: 'Invalid filter',
        description: 'Minimum play time cannot be greater than maximum play time',
      });
      return;
    }

    setFilters(filters);
  };
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to get games summary statistics.
 * @returns Games statistics object
 */
export const useGamesStats = () => {
  return useStore(state => {
    const games = state.games.games.items;
    const favorites = state.games.favoriteGames.length;
    const recentlyViewed = state.games.recentlyViewed.length;

    return {
      totalGames: games.length,
      favoritesCount: favorites,
      recentlyViewedCount: recentlyViewed,
      hasGames: games.length > 0,
      hasFavorites: favorites > 0,
      hasRecentlyViewed: recentlyViewed > 0,
    };
  });
};
