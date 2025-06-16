'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGames, getGamesCount, ApiError } from '@/lib/api';
import { GameResponse, GameFilters } from '@/lib/api/types';
import { UseGamesReturn } from '../types/games';

interface UseGamesOptions {
  initialFilters?: Partial<GameFilters>;
  pageSize?: number;
  autoLoad?: boolean;
}

export function useGames(options: UseGamesOptions = {}): UseGamesReturn {
  const { initialFilters = {}, pageSize = 100, autoLoad = true } = options;

  const [games, setGames] = useState<GameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadGames = useCallback(async (filters: GameFilters, append = false) => {
    try {
      setLoading(true);
      setError(null);

      // Load games and total count in parallel
      const [gamesResult, countResult] = await Promise.all([
        getGames(filters),
        getGamesCount(filters),
      ]);

      if (append) {
        setGames(prev => [...prev, ...gamesResult]);
      } else {
        setGames(gamesResult);
      }

      setTotalCount(countResult);

      // Check if there are more pages
      const currentCount = append ? (filters.skip || 0) + gamesResult.length : gamesResult.length;
      setHasNextPage(currentCount < countResult);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? `Failed to load games: ${err.message}`
          : 'An unexpected error occurred while loading games';

      console.error('Error loading games:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasNextPage) return;

    const newFilters = {
      limit: pageSize,
      skip: games.length,
      ...initialFilters,
    };

    loadGames(newFilters, true);
  }, [games.length, hasNextPage, loading, loadGames, pageSize, initialFilters]);

  const refresh = useCallback(
    (newFilters?: Partial<GameFilters>) => {
      const filters = {
        limit: pageSize,
        skip: 0,
        ...initialFilters,
        ...newFilters,
      };

      loadGames(filters, false);
    },
    [loadGames, pageSize, initialFilters]
  );

  // Load data when filters change
  useEffect(() => {
    if (autoLoad) {
      const filters = {
        limit: pageSize,
        skip: 0,
        ...initialFilters,
      };
      loadGames(filters, false);
    }
  }, [autoLoad, loadGames, pageSize, initialFilters]); // Fixed dependency array

  return {
    games,
    loading,
    error,
    totalCount,
    hasNextPage,
    loadMore,
    refresh,
  };
}
