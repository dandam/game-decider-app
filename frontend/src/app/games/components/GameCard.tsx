'use client';

import { Card, CardContent, Badge } from '@/components/ui';
import { GameCardProps } from '../types/games';

export function GameCard({
  game,
  showCompatibility = false,
  onGameClick,
  className,
}: GameCardProps) {
  const handleClick = () => {
    onGameClick?.(game);
  };

  const formatPlayTime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const formatPlayerCount = (min: number, max: number) => {
    if (min === max) return `${min} players`;
    return `${min}-${max} players`;
  };

  const formatComplexity = (complexity?: number) => {
    if (!complexity) return 0;
    return Math.round(complexity * 10) / 10;
  };

  const getComplexityColor = (complexity?: number) => {
    if (!complexity) return 'text-gray-400';
    if (complexity <= 2) return 'text-green-600';
    if (complexity <= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const cardClasses = [
    'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
    'border-surface-200 dark:border-surface-700',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card className={cardClasses} onClick={handleClick}>
      <CardContent className="p-4">
        {/* Game Title */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {game.name}
          </h3>
          {game.description && (
            <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-2 mt-1">
              {game.description}
            </p>
          )}
        </div>

        {/* Game Stats */}
        <div className="space-y-2 mb-3">
          {/* Player Count */}
          <div className="flex items-center text-sm text-surface-700 dark:text-surface-300">
            <svg
              className="w-4 h-4 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span className="font-medium">
              {formatPlayerCount(game.min_players, game.max_players)}
            </span>
          </div>

          {/* Play Time */}
          {game.average_play_time && (
            <div className="flex items-center text-sm text-surface-700 dark:text-surface-300">
              <svg
                className="w-4 h-4 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatPlayTime(game.average_play_time)}</span>
            </div>
          )}

          {/* Complexity */}
          {game.complexity_rating && (
            <div className="flex items-center text-sm text-surface-700 dark:text-surface-300">
              <svg
                className={`w-4 h-4 mr-2 ${getComplexityColor(game.complexity_rating)}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span>Complexity: {formatComplexity(game.complexity_rating)}/5</span>
            </div>
          )}
        </div>

        {/* Categories */}
        {game.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.categories.slice(0, 3).map(category => (
              <Badge key={category.id} variant="secondary" size="sm" className="text-xs">
                {category.name}
              </Badge>
            ))}
            {game.categories.length > 3 && (
              <Badge variant="outline" size="sm" className="text-xs">
                +{game.categories.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Compatibility Indicator (Future Feature) */}
        {showCompatibility && (
          <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
              <span>Compatibility:</span>
              <span className="text-green-600 font-medium">Coming Soon</span>
            </div>
          </div>
        )}

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg pointer-events-none" />
      </CardContent>
    </Card>
  );
}
