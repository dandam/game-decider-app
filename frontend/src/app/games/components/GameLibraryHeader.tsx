'use client';

import { Button } from '@/components/ui';
import { GameSearch } from './GameSearch';

interface GameLibraryHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  totalCount: number;
  filteredCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function GameLibraryHeader({
  searchValue,
  onSearchChange,
  onSearchClear,
  totalCount,
  filteredCount,
  showFilters,
  onToggleFilters,
}: GameLibraryHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title and Description */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">Game Library</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">
          Discover your next favorite game from our curated collection
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <GameSearch
            value={searchValue}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder="Search games..."
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Game Count Display */}
          <div className="text-sm text-surface-600 dark:text-surface-400">
            <span>{filteredCount} games</span>
            {searchValue && (
              <span className="ml-2 text-surface-500">
                • Search: "{searchValue}"
              </span>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>
    </div>
  );
}
