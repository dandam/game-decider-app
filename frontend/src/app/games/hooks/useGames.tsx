'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGames, getGamesCount, getCuratedGames, getCuratedGamesCount, getPlayedGames, ApiError } from '@/lib/api';
import { GameResponse, GameFilters } from '@/lib/api/types';
import { UseGamesReturn } from '../types/games';

interface UseGamesOptions {
  initialFilters?: Partial<GameFilters>;
  pageSize?: number;
  autoLoad?: boolean;
  useCurated?: boolean; // Use curated games endpoint
  usePlayedOnly?: boolean; // Use played games endpoint
}

export function useGames(options: UseGamesOptions = {}): UseGamesReturn {
  const { initialFilters = {}, pageSize = 100, autoLoad = true, useCurated = false, usePlayedOnly = false } = options;

  const [mounted, setMounted] = useState(false);
  const [games, setGames] = useState<GameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadGames = useCallback(async (filters: GameFilters, append = false) => {
    try {
      setLoading(true);
      setError(null);

      let gamesResult: GameResponse[];
      let countResult: number;
      
      if (usePlayedOnly) {
        // Load played games only
        const [playedGames, playedCount] = await Promise.all([
          getPlayedGames(undefined, filters), // No specific players, use all played games
          getPlayedGames(undefined, { ...filters, limit: 10000 }).then(games => games.length), // Get total count
        ]);
        
        gamesResult = playedGames;
        countResult = playedCount;
      } else if (useCurated) {
        // Load curated games and count in parallel
        const [curatedGames, curatedCount] = await Promise.all([
          getCuratedGames(filters),
          getCuratedGamesCount(),
        ]);
        
        gamesResult = curatedGames;
        countResult = curatedCount.total_curated;
      } else {
        // Load regular games and total count in parallel
        const [regularGames, regularCount] = await Promise.all([
          getGames(filters),
          getGamesCount(filters),
        ]);
        
        gamesResult = regularGames;
        countResult = regularCount;
      }

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

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [useCurated, usePlayedOnly]);

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

  // Load data when filters change - only after client-side hydration
  useEffect(() => {
    if (mounted && autoLoad) {
      const filters = {
        limit: pageSize,
        skip: 0,
        ...initialFilters,
      };
      loadGames(filters, false);
    }
  }, [mounted, autoLoad, loadGames, pageSize, JSON.stringify(initialFilters)]);

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
