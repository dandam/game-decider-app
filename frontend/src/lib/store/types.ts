/**
 * State management types for the Game Decider application.
 * Defines all store slices and their corresponding actions.
 */

import type {
  UUID,
  PlayerResponse,
  GameResponse,
  PlayerPreferencesResponse,
  GameFilters,
  PaginationParams,
  CompatibilityResponse,
  ApiError,
} from '@/lib/api/types';

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface AsyncState {
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface PaginatedState<T> extends AsyncState {
  items: T[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// =============================================================================
// AUTH SLICE
// =============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  currentPlayerId: UUID | null;
  sessionToken: string | null;
  tokenExpiry: number | null;
  loginAttempts: number;
  lastActivity: number;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (playerId: UUID, token?: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateActivity: () => void;
  clearError: () => void;
  checkAuthStatus: () => boolean;
}

export type AuthSlice = AuthState & AuthActions;

// =============================================================================
// PLAYER SLICE
// =============================================================================

export interface PlayerState {
  currentPlayer: PlayerResponse | null;
  allPlayers: PaginatedState<PlayerResponse>;
  playerPreferences: Record<UUID, PlayerPreferencesResponse>;
  selectedPlayers: UUID[];
  searchQuery: string;
  filters: {
    username?: string;
    display_name?: string;
  };
}

export interface PlayerActions {
  // Current player management
  setCurrentPlayer: (player: PlayerResponse | null) => void;
  updateCurrentPlayer: (updates: Partial<PlayerResponse>) => Promise<void>;
  
  // All players management
  fetchPlayers: (params?: PaginationParams) => Promise<void>;
  searchPlayers: (query: string) => Promise<void>;
  loadMorePlayers: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
  
  // Player preferences
  fetchPlayerPreferences: (playerId: UUID) => Promise<void>;
  updatePlayerPreferences: (playerId: UUID, preferences: Partial<PlayerPreferencesResponse>) => Promise<void>;
  
  // Player selection (for group sessions)
  selectPlayer: (playerId: UUID) => void;
  unselectPlayer: (playerId: UUID) => void;
  clearSelectedPlayers: () => void;
  
  // Filters and search
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<PlayerState['filters']>) => void;
  clearFilters: () => void;
  
  // Utilities
  getPlayerById: (playerId: UUID) => PlayerResponse | null;
  clearError: () => void;
}

export type PlayerSlice = PlayerState & PlayerActions;

// =============================================================================
// GAMES SLICE
// =============================================================================

export interface GameState {
  games: PaginatedState<GameResponse>;
  selectedGame: GameResponse | null;
  favoriteGames: UUID[];
  recentlyViewed: UUID[];
  gameCompatibility: Record<string, CompatibilityResponse & { timestamp: number }>; // key: `${gameId}-${playerId}`
  searchQuery: string;
  filters: GameFilters;
  sortBy: 'name' | 'complexity_rating' | 'average_play_time' | 'min_players' | 'max_players';
  sortOrder: 'asc' | 'desc';
}

export interface GameActions {
  // Game library management
  fetchGames: (params?: GameFilters) => Promise<void>;
  searchGames: (query: string) => Promise<void>;
  loadMoreGames: () => Promise<void>;
  refreshGames: () => Promise<void>;
  
  // Game selection
  setSelectedGame: (game: GameResponse | null) => void;
  fetchGameById: (gameId: UUID) => Promise<void>;
  
  // Favorites
  addToFavorites: (gameId: UUID) => void;
  removeFromFavorites: (gameId: UUID) => void;
  toggleFavorite: (gameId: UUID) => void;
  
  // Recently viewed
  addToRecentlyViewed: (gameId: UUID) => void;
  clearRecentlyViewed: () => void;
  
  // Compatibility
  fetchGameCompatibility: (gameId: UUID, playerId: UUID) => Promise<void>;
  getCompatibilityForGame: (gameId: UUID, playerId: UUID) => CompatibilityResponse | null;
  
  // Filtering and sorting
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<GameFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: GameState['sortBy'], sortOrder: GameState['sortOrder']) => void;
  
  // Utilities
  getGameById: (gameId: UUID) => GameResponse | null;
  getFilteredGames: () => GameResponse[];
  clearError: () => void;
}

export type GameSlice = GameState & GameActions;

// =============================================================================
// PREFERENCES SLICE
// =============================================================================

export interface PreferencesState {
  playerPreferences: Record<UUID, PlayerPreferencesResponse>;
  loading: Record<UUID, boolean>;
  errors: Record<UUID, string | null>;
  lastUpdated: Record<UUID, number>;
}

export interface PreferencesActions {
  fetchPreferences: (playerId: UUID) => Promise<PlayerPreferencesResponse>;
  updatePreferences: (playerId: UUID, preferences: Partial<PlayerPreferencesResponse>) => Promise<PlayerPreferencesResponse>;
  getPreferences: (playerId: UUID) => PlayerPreferencesResponse | null;
  clearPreferences: (playerId: UUID) => void;
  clearError: (playerId: UUID) => void;
}

export type PreferencesSlice = PreferencesState & PreferencesActions;

// =============================================================================
// UI SLICE
// =============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  modals: Record<string, ModalState>;
  toasts: ToastState[];
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  pageTitle: string | null;
}

export interface UIActions {
  // Theme management
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal management
  openModal: (id: string, modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Toast management
  addToast: (toast: Omit<ToastState, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading states
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key: string) => void;
  
  // Error states
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Navigation
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;
  setPageTitle: (title: string | null) => void;
  
  // Utilities
  isLoading: (key: string) => boolean;
  getError: (key: string) => string | null;
}

export type UISlice = UIState & UIActions;

// =============================================================================
// ROOT STORE TYPE
// =============================================================================

export interface RootState {
  auth: AuthSlice;
  player: PlayerSlice;
  games: GameSlice;
  preferences: PreferencesSlice;
  ui: UISlice;
}

// =============================================================================
// STORE CONFIGURATION
// =============================================================================

export interface StoreConfig {
  enableDevtools: boolean;
  enablePersistence: boolean;
  persistenceKey: string;
  persistenceVersion: number;
}

export interface StoreMiddleware {
  logger?: boolean;
  persist?: {
    key: string;
    version: number;
    partialize?: (state: RootState) => Partial<RootState>;
  };
  devtools?: boolean;
} 