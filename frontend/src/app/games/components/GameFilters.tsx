'use client';

import { Button, Badge } from '@/components/ui';
import { GameFiltersProps } from '../types/games';

const PLAYER_COUNT_OPTIONS = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6+' },
];

const PLAY_TIME_OPTIONS = [
  { value: { max: 30 }, label: '< 30min' },
  { value: { min: 30, max: 60 }, label: '30-60min' },
  { value: { min: 60, max: 90 }, label: '60-90min' },
  { value: { min: 90 }, label: '90min+' },
];

const COMPLEXITY_OPTIONS = [
  { value: { max: 2 }, label: 'Light (1-2)' },
  { value: { min: 2, max: 3.5 }, label: 'Medium (2-3.5)' },
  { value: { min: 3.5 }, label: 'Heavy (3.5+)' },
];

export function GameFilters({
  filters,
  onFiltersChange,
  onReset,
  totalCount: _totalCount,
  filteredCount,
}: GameFiltersProps) {
  const handlePlayerCountChange = (playerCount: number) => {
    const newPlayerCount = { ...filters.playerCount };

    if (playerCount === 6) {
      // Handle 6+ players
      newPlayerCount.min = 6;
      delete newPlayerCount.max;
    } else {
      // Handle exact player count
      newPlayerCount.min = playerCount;
      newPlayerCount.max = playerCount;
    }

    onFiltersChange({ playerCount: newPlayerCount });
  };

  const handlePlayTimeChange = (playTime: { min?: number; max?: number }) => {
    onFiltersChange({ playTime });
  };

  const handleComplexityChange = (complexity: { min?: number; max?: number }) => {
    onFiltersChange({ complexity });
  };

  const handleShowPlayedGamesToggle = () => {
    onFiltersChange({ showOnlyPlayedGames: !filters.showOnlyPlayedGames });
  };

  // New handlers for input-based filters
  const handlePlayerCountInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    const newPlayerCount = { ...filters.playerCount };

    if (type === 'min') {
      newPlayerCount.min = numValue;
    } else {
      newPlayerCount.max = numValue;
    }

    onFiltersChange({ playerCount: newPlayerCount });
  };

  const handlePlayTimeInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    const newPlayTime = { ...filters.playTime };

    if (type === 'min') {
      newPlayTime.min = numValue;
    } else {
      newPlayTime.max = numValue;
    }

    onFiltersChange({ playTime: newPlayTime });
  };

  const handleComplexityInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    const newComplexity = { ...filters.complexity };

    if (type === 'min') {
      newComplexity.min = numValue;
    } else {
      newComplexity.max = numValue;
    }

    onFiltersChange({ complexity: newComplexity });
  };

  const isPlayerCountActive = (playerCount: number) => {
    if (playerCount === 6) {
      return filters.playerCount.min === 6 && !filters.playerCount.max;
    }
    return filters.playerCount.min === playerCount && filters.playerCount.max === playerCount;
  };

  const isPlayTimeActive = (playTime: { min?: number; max?: number }) => {
    return filters.playTime.min === playTime.min && filters.playTime.max === playTime.max;
  };

  const isComplexityActive = (complexity: { min?: number; max?: number }) => {
    return filters.complexity.min === complexity.min && filters.complexity.max === complexity.max;
  };

  return (
    <div className="space-y-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Filters</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {filteredCount} games in curated library
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="text-sm">
          Reset All
        </Button>
      </div>

      {/* Player Count */}
      <div className="space-y-3">
        <label htmlFor="player-count-min" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          Player Count
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="player-count-min" className="block text-xs text-surface-600 dark:text-surface-400 mb-1">
              Min Players
            </label>
            <input
              id="player-count-min"
              type="number"
              min="1"
              max="20"
              value={filters.playerCount.min || ''}
              onChange={(e) => handlePlayerCountInputChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-800"
              placeholder="1"
            />
          </div>
          <div>
            <label htmlFor="player-count-max" className="block text-xs text-surface-600 dark:text-surface-400 mb-1">
              Max Players
            </label>
            <input
              id="player-count-max"
              type="number"
              min="1"
              max="20"
              value={filters.playerCount.max || ''}
              onChange={(e) => handlePlayerCountInputChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-800"
              placeholder="20"
            />
          </div>
        </div>
      </div>

      {/* Play Time */}
      <div className="space-y-3">
        <label htmlFor="play-time-min" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          Play Time (minutes)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="play-time-min" className="block text-xs text-surface-600 dark:text-surface-400 mb-1">
              Min Time
            </label>
            <input
              id="play-time-min"
              type="number"
              min="5"
              max="480"
              step="5"
              value={filters.playTime.min || ''}
              onChange={(e) => handlePlayTimeInputChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-800"
              placeholder="15"
            />
          </div>
          <div>
            <label htmlFor="play-time-max" className="block text-xs text-surface-600 dark:text-surface-400 mb-1">
              Max Time
            </label>
            <input
              id="play-time-max"
              type="number"
              min="5"
              max="480"
              step="5"
              value={filters.playTime.max || ''}
              onChange={(e) => handlePlayTimeInputChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-800"
              placeholder="120"
            />
          </div>
        </div>
      </div>

      {/* Complexity */}
      <div className="space-y-3">
        <label htmlFor="complexity-min" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          Complexity (1-5 scale)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="complexity-min" className="block text-xs text-surface-600 dark:text-surface-400 mb-1">
              Min Complexity
            </label>
            <input
              id="complexity-min"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={filters.complexity.min || ''}
              onChange={(e) => handleComplexityInputChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-800"
              placeholder="1.0"
            />
          </div>
          <div>
            <label htmlFor="complexity-max" className="block text-xs text-surface-600 dark:text-surface-400 mb-1">
              Max Complexity
            </label>
            <input
              id="complexity-max"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={filters.complexity.max || ''}
              onChange={(e) => handleComplexityInputChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-800"
              placeholder="5.0"
            />
          </div>
        </div>
      </div>

      {/* Played Games Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
          Game Collection
        </label>
        <div>
          <Button
            variant={filters.showOnlyPlayedGames ? 'default' : 'outline'}
            size="sm"
            onClick={handleShowPlayedGamesToggle}
            className="text-sm"
          >
            Show only played games
          </Button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.playerCount.min ||
        filters.playTime.min ||
        filters.complexity.min ||
        filters.showOnlyPlayedGames) && (
        <div className="pt-4 border-t border-surface-200 dark:border-surface-600">
          <div className="flex flex-wrap gap-1">
            {filters.playerCount.min && (
              <Badge variant="secondary" size="sm">
                {filters.playerCount.min === filters.playerCount.max
                  ? `${filters.playerCount.min} players`
                  : `${filters.playerCount.min}+ players`}
              </Badge>
            )}
            {filters.playTime.min && (
              <Badge variant="secondary" size="sm">
                {filters.playTime.min}min
                {filters.playTime.max ? `-${filters.playTime.max}min` : '+'}
              </Badge>
            )}
            {filters.complexity.min && (
              <Badge variant="secondary" size="sm">
                Complexity {filters.complexity.min}
                {filters.complexity.max ? `-${filters.complexity.max}` : '+'}
              </Badge>
            )}
            {filters.showOnlyPlayedGames && (
              <Badge variant="secondary" size="sm">
                Played games only
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
