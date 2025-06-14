/**
 * Game Decider API Client
 * 
 * This module provides a comprehensive, type-safe API client for the Game Decider application.
 * It includes support for players, games, preferences, health checks, and more with robust
 * error handling, retry logic, and development-friendly logging.
 * 
 * @example
 * ```typescript
 * import { getPlayers, createPlayer, ApiError } from '@/lib/api';
 * 
 * try {
 *   const players = await getPlayers({ limit: 10 });
 *   const newPlayer = await createPlayer({ 
 *     username: 'alice', 
 *     display_name: 'Alice' 
 *   });
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error('API Error:', error.status, error.message);
 *   }
 * }
 * ```
 */

// ==================================================
// CLIENT & CONFIGURATION
// ==================================================

export { ApiClient, createApiClient, apiClient } from './client';

// ==================================================
// TYPE EXPORTS
// ==================================================

export type {
  // Base types
  UUID,
  
  // Player types
  PlayerBase,
  PlayerCreate,
  PlayerUpdate,
  PlayerInDB,
  PlayerResponse,
  
  // Game category & tag types
  GameCategoryBase,
  GameCategoryCreate,
  GameCategoryUpdate,
  GameCategoryInDB,
  GameCategoryResponse,
  GameTagBase,
  GameTagCreate,
  GameTagUpdate,
  GameTagInDB,
  GameTagResponse,
  
  // Game types
  GameBase,
  GameCreate,
  GameUpdate,
  GameInDB,
  GameResponse,
  
  // Player preferences types
  PlayerPreferencesBase,
  PlayerPreferencesCreate,
  PlayerPreferencesUpdate,
  PlayerPreferencesInDB,
  PlayerPreferencesResponse,
  
  // Player game history types
  PlayerGameHistoryBase,
  PlayerGameHistoryCreate,
  PlayerGameHistoryUpdate,
  PlayerGameHistoryInDB,
  PlayerGameHistoryResponse,
  
  // Compatibility types
  CompatibilityResponse,
  
  // Utility types
  PaginationParams,
  GameFilters,
  SearchParams,
  
  // Error types
  ApiErrorDetail,
  ValidationErrorResponse,
  ApiErrorResponse,
  
  // Health check types
  HealthCheckResponse,
  DatabaseHealthResponse,
} from './types';

// ==================================================
// ERROR EXPORTS
// ==================================================

export { ApiError, ValidationError, NetworkError } from './types';

// ==================================================
// PLAYER ENDPOINTS
// ==================================================

export {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerPreferences,
  updatePlayerPreferences,
} from './endpoints/players';

// ==================================================
// GAME ENDPOINTS
// ==================================================

export {
  getGames,
  getGamesCount,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  searchGamesByName,
  getGameByBgaId,
  getGameCompatibility,
} from './endpoints/games';

// ==================================================
// PREFERENCES ENDPOINTS
// ==================================================

export {
  getPreferences,
  updatePreferences,
  getCompatibility,
} from './endpoints/preferences';

// ==================================================
// HEALTH ENDPOINTS
// ==================================================

export {
  healthCheck,
  databaseHealthCheck,
} from './endpoints/health';

// ==================================================
// UTILITY EXPORTS
// ==================================================

export {
  buildUrl,
  generateRequestId,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_CONFIG,
} from '../utils/http';

// ==================================================
// CONVENIENCE EXPORTS
// ==================================================

/**
 * Namespace for player-related operations.
 */
export * as Players from './endpoints/players';

/**
 * Namespace for game-related operations.
 */
export * as Games from './endpoints/games';

/**
 * Namespace for preference-related operations.
 */
export * as Preferences from './endpoints/preferences';

/**
 * Namespace for health check operations.
 */
export * as Health from './endpoints/health'; 