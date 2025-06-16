'use client';

import React from 'react';
import { Loading } from '@/components/ui';
import { GameCard } from './GameCard';
import { GameResponse } from '@/lib/api/types';

interface GameGridProps {
  games: GameResponse[];
  loading: boolean;
  onGameClick: (game: GameResponse) => void;
  className?: string;
}

export function GameGrid({ games, loading, onGameClick, className }: GameGridProps) {
  const gridClasses = [
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
          No games found
        </h3>
        <p className="text-surface-600 dark:text-surface-400">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={gridClasses}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onGameClick={() => onGameClick(game)}
          />
        ))}
      </div>

      {loading && games.length > 0 && (
        <div className="flex justify-center py-8">
          <Loading size="default" text="Loading more games..." />
        </div>
      )}
    </div>
  );
}
