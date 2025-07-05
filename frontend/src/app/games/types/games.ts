import { GameResponse, GameFilters } from '@/lib/api';

// Re-export core types for convenience
export type { GameResponse, GameFilters } from '@/lib/api';

// Game library specific filter state
export interface GameLibraryFilters {
  search: string;
  playerCount: {
    min?: number;
    max?: number;
  };
  playTime: {
    min?: number;
    max?: number;
  };
  complexity: {
    min?: number;
    max?: number;
  };
  categories: string[];
  showOnlyPlayedGames: boolean;
}

// UI state interfaces
export interface GameLibraryState {
  games: GameResponse[];
  filteredGames: GameResponse[];
  loading: boolean;
  error: string | null;
  filters: GameLibraryFilters;
  totalCount: number;
  hasNextPage: boolean;
}

// Filter options for UI components
export interface PlayerCountOption {
  value: number;
  label: string;
}

export interface PlayTimeOption {
  value: { min?: number; max?: number };
  label: string;
}

export interface ComplexityLevel {
  value: number;
  label: string;
  description: string;
}

// Game curation types
export interface CuratedGameSet {
  playedGames: GameResponse[];
  similarGames: GameResponse[];
  totalCount: number;
}

// Component prop interfaces
export interface GameCardProps {
  game: GameResponse & { players_who_played?: string[] };
  showCompatibility?: boolean;
  onGameClick?: (game: GameResponse) => void;
  className?: string;
}

export interface GameGridProps {
  games: GameResponse[];
  loading?: boolean;
  onGameClick?: (game: GameResponse) => void;
  className?: string;
}

// Filter component types
export interface FilterOption<T = any> {
  value: T;
  label: string;
  count?: number;
}

export interface GameFiltersProps {
  filters: GameLibraryFilters;
  onFiltersChange: (filters: Partial<GameLibraryFilters>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

// Search component types
export interface GameSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

// Hook return types
export interface UseGamesReturn {
  games: GameResponse[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  loadMore: () => void;
  refresh: (newFilters?: Partial<GameFilters>) => void;
}

export interface UseGameFiltersReturn {
  filters: GameLibraryFilters;
  setFilters: (filters: Partial<GameLibraryFilters>) => void;
  resetFilters: () => void;
  appliedFiltersCount: number;
}

export interface UseGameSearchReturn {
  searchValue: string;
  setSearchValue: (value: string) => void;
  debouncedSearchValue: string;
  clearSearch: () => void;
  isSearching: boolean;
}
