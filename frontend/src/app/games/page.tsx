'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui';
import { GameLibraryHeader } from './components/GameLibraryHeader';
import { GameGrid } from './components/GameGrid';
import { GameResponse } from '@/lib/api/types';

export default function GamesPage() {
  const [games, setGames] = useState<GameResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');


  // Simple direct API call without complex hooks
  useEffect(() => {
    let mounted = true;

    async function loadGames() {
      try {
        setLoading(true);
        setError(null);

        // Get curated games count and games in parallel
        const [countResponse, gamesResponse] = await Promise.all([
          fetch('/api/games/curated/count'),
          fetch('/api/games/curated?limit=10')
        ]);

        if (!countResponse.ok || !gamesResponse.ok) {
          throw new Error('Failed to load games');
        }

        const [countData, gamesData] = await Promise.all([
          countResponse.json(),
          gamesResponse.json()
        ]);

        if (mounted) {
          setGames(gamesData);
          setTotalCount(countData.total_curated || 0);
        }
      } catch (err) {
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load games';
          setError(errorMsg);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Load games immediately
    loadGames();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter games based on search
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle game click
  const handleGameClick = (game: GameResponse) => {
    // TODO: Navigate to game detail page or open modal
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
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 space-y-6">


        {/* Header with search */}
        <GameLibraryHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchClear={() => setSearchValue('')}
          totalCount={totalCount}
          filteredCount={filteredGames.length}
          showFilters={false}
          onToggleFilters={() => {}}
        />

        {/* Games grid */}
        <GameGrid games={filteredGames} loading={loading} onGameClick={handleGameClick} />

        {/* Success message */}
        {!loading && filteredGames.length > 0 && (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">
              🎉 Success! Game library is now working with {filteredGames.length} games displayed.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
