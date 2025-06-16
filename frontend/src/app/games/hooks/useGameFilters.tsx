'use client';

import { useState, useCallback, useMemo } from 'react';
import { GameLibraryFilters, UseGameFiltersReturn } from '../types/games';

const DEFAULT_FILTERS: GameLibraryFilters = {
  search: '',
  playerCount: {},
  playTime: {},
  complexity: {},
  categories: [],
  showOnlyPlayedGames: false,
};

export function useGameFilters(initialFilters?: Partial<GameLibraryFilters>): UseGameFiltersReturn {
  const [filters, setFiltersState] = useState<GameLibraryFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const setFilters = useCallback((newFilters: Partial<GameLibraryFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Count how many filters are currently applied
  const appliedFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.search.trim()) count++;
    if (filters.playerCount.min !== undefined || filters.playerCount.max !== undefined) count++;
    if (filters.playTime.min !== undefined || filters.playTime.max !== undefined) count++;
    if (filters.complexity.min !== undefined || filters.complexity.max !== undefined) count++;
    if (filters.categories.length > 0) count++;
    if (filters.showOnlyPlayedGames) count++;

    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    resetFilters,
    appliedFiltersCount,
  };
}
