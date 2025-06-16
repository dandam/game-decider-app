'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui';
import { useGames } from './hooks/useGames';
import { useGameFilters } from './hooks/useGameFilters';
import { useGameSearch } from './hooks/useGameSearch';
import { GameLibraryHeader } from './components/GameLibraryHeader';
import { GameFilters } from './components/GameFilters';
import { GameGrid } from './components/GameGrid';
import { GameResponse, GameFilters as GameFiltersType } from '@/lib/api/types';

export default function GamesPage() {
  const [showFilters, setShowFilters] = useState(false);

  // Custom hooks for state management
  const { searchValue, setSearchValue, debouncedSearchValue, clearSearch } = useGameSearch();
  const { filters, setFilters, resetFilters } = useGameFilters();

  // Convert our filter state to API parameters
  const apiFilters = useMemo((): GameFiltersType => {
    const apiParams: GameFiltersType = {
      limit: 100, // Curated set size - reduced from 150
      skip: 0,
    };

    // Add search if present
    if (debouncedSearchValue.trim()) {
      apiParams.search = debouncedSearchValue.trim();
      // Increase limit for search results
      apiParams.limit = 50;
    } else {
      // For initial load, focus on games suitable for 2-6 players (most common)
      apiParams.min_players = 2;
      apiParams.max_players = 6;
      // Focus on games with reasonable play times (30-120 minutes)
      apiParams.min_play_time = 30;
      apiParams.max_play_time = 120;
    }

    // Add player count filters
    if (filters.playerCount.min !== undefined) {
      apiParams.min_players = filters.playerCount.min;
    }
    if (filters.playerCount.max !== undefined) {
      apiParams.max_players = filters.playerCount.max;
    }

    // Add play time filters
    if (filters.playTime.min !== undefined) {
      apiParams.min_play_time = filters.playTime.min;
    }
    if (filters.playTime.max !== undefined) {
      apiParams.max_play_time = filters.playTime.max;
    }

    // Add complexity filters
    if (filters.complexity.min !== undefined) {
      apiParams.min_complexity = filters.complexity.min;
    }
    if (filters.complexity.max !== undefined) {
      apiParams.max_complexity = filters.complexity.max;
    }

    // TODO: Implement category filtering when categories are available
    // TODO: Implement "played games only" filter based on game history

    return apiParams;
  }, [debouncedSearchValue, filters]);

  // Load games data with dynamic filters
  const { games, loading, error, totalCount, hasNextPage, refresh } = useGames({
    initialFilters: apiFilters,
    pageSize: 100, // Reduced to match curated set
  });

  // Handle game click (placeholder for future implementation)
  const handleGameClick = (game: GameResponse) => {
    console.warn('Game clicked:', game.name);
    // TODO: Implement game detail modal or navigation
  };

  // Handle filter reset
  const handleFilterReset = () => {
    resetFilters();
    clearSearch();
  };

  // Show error state
  if (error) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Games</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 space-y-6">
        {/* Header with search and controls */}
        <GameLibraryHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchClear={clearSearch}
          totalCount={totalCount}
          filteredCount={games.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Filters panel (collapsible) */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <GameFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleFilterReset}
              totalCount={totalCount}
              filteredCount={games.length}
            />
          </div>
        )}

        {/* Games grid */}
        <GameGrid games={games} loading={loading} onGameClick={handleGameClick} />

        {/* Load more button (if needed) */}
        {hasNextPage && !loading && (
          <div className="flex justify-center pt-8">
            <button
              onClick={() => {
                // TODO: Implement load more functionality
                console.warn('Load more clicked');
              }}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Load More Games
            </button>
          </div>
        )}
      </div>
    </Container>
  );
}
