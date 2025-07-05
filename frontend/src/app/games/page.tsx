'use client';

import { useState, useEffect, useMemo } from 'react';
import { Container } from '@/components/ui';

type GameMode = 'curated' | 'played' | 'all';

interface GameWithPlayers {
  id: string;
  name: string;
  min_players: number;
  max_players: number;
  avg_play_time: number;
  complexity_rating: number;
  categories: Array<{ name: string }>;
  players_who_played?: string[];
}

export default function GamesPage() {
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('curated');
  const [totalCounts, setTotalCounts] = useState({ played: 0, curated: 0, all: 0 });
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Load games based on selected mode
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(0);
        setHasMore(true);
        
        let endpoint = '';
        switch (gameMode) {
          case 'played':
            endpoint = '/api/games/played-games?limit=141'; // Load all played games
            break;
          case 'curated':
            endpoint = '/api/games/curated/with-players?limit=50';
            break;
          case 'all':
            endpoint = '/api/games?limit=50';
            break;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const gamesData = await response.json();
        setGames(gamesData);
        
        // Set hasMore based on game mode
        if (gameMode === 'played') {
          setHasMore(false); // All played games loaded at once
        } else {
          setHasMore(gamesData.length === 50);
        }
      } catch (err) {
        console.error('Error loading games:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load games';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadGames, 100);
    return () => clearTimeout(timer);
  }, [gameMode]);

  // Load more games function
  const loadMoreGames = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const skip = nextPage * 50;
      
      let endpoint = '';
      switch (gameMode) {
        case 'played':
          // Played games are loaded all at once, no pagination needed
          return;
        case 'curated':
          endpoint = `/api/games/curated/with-players?limit=50&skip=${skip}`;
          break;
        case 'all':
          endpoint = `/api/games?limit=50&skip=${skip}`;
          break;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newGames = await response.json();
      setGames(prevGames => [...prevGames, ...newGames]);
      setCurrentPage(nextPage);
      setHasMore(newGames.length === 50);
    } catch (err) {
      console.error('Error loading more games:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load total counts for display
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [curatedCount, playedGames] = await Promise.all([
          fetch('/api/games/curated/count').then(r => r.json()),
          fetch('/api/games/played-games?limit=500').then(r => r.json()) // Fetch all played games for count
        ]);
        
        setTotalCounts({
          played: playedGames.length,
          curated: curatedCount.total_curated,
          all: 1082 // Known total from documentation
        });
      } catch (err) {
        console.error('Error loading counts:', err);
      }
    };

    loadCounts();
  }, []);

  // Filter games based on search
  const filteredGames = useMemo(() => {
    if (!searchValue.trim()) return games;
    
    const searchTerm = searchValue.toLowerCase();
    return games.filter(game => 
      game.name?.toLowerCase().includes(searchTerm) ||
      game.categories?.some((cat: any) => cat.name?.toLowerCase().includes(searchTerm))
    );
  }, [games, searchValue]);

  // Get mode display info
  const getModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'played':
        return { label: 'Played Games', count: totalCounts.played, description: 'Games our group has played' };
      case 'curated':
        return { label: 'Curated Games', count: totalCounts.curated, description: 'Played games + similar recommendations' };
      case 'all':
        return { label: 'All Games', count: totalCounts.all, description: 'Complete BoardGameArena catalog' };
    }
  };

  const currentModeInfo = getModeInfo(gameMode);

  // Show error state
  if (error) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Games</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
            Game Library
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Discover games perfect for your next game night
          </p>
          
          {/* Game Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-surface-100 dark:bg-surface-800 p-1 rounded-lg inline-flex">
              {(['curated', 'played', 'all'] as GameMode[]).map((mode) => {
                const modeInfo = getModeInfo(mode);
                return (
                  <button
                    key={mode}
                    onClick={() => setGameMode(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      gameMode === mode
                        ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                    }`}
                  >
                    {modeInfo.label} ({modeInfo.count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Description */}
          <p className="text-sm text-surface-500 dark:text-surface-500 mb-2">
            {currentModeInfo.description}
          </p>

          {/* Game Count */}
          {!loading && (
            <p className="text-sm text-surface-500 dark:text-surface-500">
              {searchValue.trim() ? (
                <>Showing {filteredGames.length} of {games.length} games matching "{searchValue}"</>
              ) : (
                <>Showing {games.length} of {currentModeInfo.count} {currentModeInfo.label.toLowerCase()}</>
              )}
            </p>
          )}
        </div>

        {/* Search Bar */}
        {!loading && (
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search games by name or category..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md leading-5 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-surface-400 hover:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full border-2 border-surface-300 border-t-primary h-8 w-8"></div>
          </div>
        )}

        {/* Games Grid */}
        {!loading && filteredGames.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game, index) => (
                <div
                  key={game.id || index}
                  className="group bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => console.log('Game clicked:', game.name)}
                >
                  {/* Game Header */}
                  <div className="p-4 border-b border-surface-100 dark:border-surface-700">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1 line-clamp-2">
                      {game.name || 'Unknown Game'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                      {game.categories && game.categories.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {game.categories[0].name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Game Stats */}
                  <div className="p-4 space-y-3">
                    {/* Player Count */}
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{game.min_players}-{game.max_players} players</span>
                    </div>

                    {/* Play Time */}
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{game.avg_play_time} minutes</span>
                    </div>

                    {/* Complexity */}
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Complexity: {game.complexity_rating}/5</span>
                    </div>

                    {/* Categories */}
                    {game.categories && game.categories.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {game.categories.slice(1, 3).map((category: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {game.categories.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 rounded-full">
                            +{game.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Player Information */}
                    {game.players_who_played && game.players_who_played.length > 0 && (
                      <div className="pt-2 border-t border-surface-100 dark:border-surface-700">
                        <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mb-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Played by:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {game.players_who_played.map((player, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                            >
                              {player}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !searchValue.trim() && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadMoreGames}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4"></div>
                      Loading more games...
                    </>
                  ) : (
                    <>
                      Load More Games
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Games Message */}
        {!loading && filteredGames.length === 0 && games.length > 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
              No games match your search
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              Try searching for a different game name or category.
            </p>
            <button
              onClick={() => setSearchValue('')}
              className="px-4 py-2 bg-surface-200 text-surface-900 rounded-md hover:bg-surface-300 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* No Games Message */}
        {!loading && games.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
              No games found
            </h3>
            <p className="text-surface-600 dark:text-surface-400">
              Unable to load games at this time.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
