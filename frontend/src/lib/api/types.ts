/**
 * TypeScript types for the Game Decider API.
 * These types mirror the backend Pydantic schemas exactly.
 */

// ==================================================
// BASE TYPES
// ==================================================

export type UUID = string;

// ==================================================
// PLAYER TYPES
// ==================================================

export interface PlayerBase {
  username: string;
  display_name: string;
  avatar_url?: string | null;
}

export interface PlayerCreate extends PlayerBase {}

export interface PlayerUpdate {
  display_name?: string;
  avatar_url?: string | null;
}

export interface PlayerInDB extends PlayerBase {
  id: UUID;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface PlayerResponse extends PlayerInDB {}

// ==================================================
// GAME CATEGORY & TAG TYPES
// ==================================================

export interface GameCategoryBase {
  name: string;
  description?: string | null;
}

export interface GameCategoryCreate extends GameCategoryBase {}

export interface GameCategoryUpdate {
  name?: string;
  description?: string | null;
}

export interface GameCategoryInDB extends GameCategoryBase {
  id: UUID;
  created_at: string;
  updated_at: string;
}

export interface GameCategoryResponse extends GameCategoryInDB {}

export interface GameTagBase {
  name: string;
  description?: string | null;
}

export interface GameTagCreate extends GameTagBase {}

export interface GameTagUpdate {
  name?: string;
  description?: string | null;
}

export interface GameTagInDB extends GameTagBase {
  id: UUID;
  created_at: string;
  updated_at: string;
}

export interface GameTagResponse extends GameTagInDB {}

// ==================================================
// GAME TYPES
// ==================================================

export interface GameBase {
  name: string;
  description?: string | null;
  min_players: number;
  max_players: number;
  average_play_time: number;
  complexity_rating: number;
}

export interface GameCreate extends GameBase {
  category_ids?: UUID[];
  tag_ids?: UUID[];
}

export interface GameUpdate {
  name?: string;
  description?: string | null;
  min_players?: number;
  max_players?: number;
  average_play_time?: number;
  complexity_rating?: number;
  category_ids?: UUID[];
  tag_ids?: UUID[];
}

export interface GameInDB extends GameBase {
  id: UUID;
  created_at: string;
  updated_at: string;
  categories: GameCategoryResponse[];
  tags: GameTagResponse[];
}

export interface GameResponse extends GameInDB {}

// ==================================================
// PLAYER PREFERENCES TYPES
// ==================================================

export interface PlayerPreferencesBase {
  minimum_play_time?: number | null;
  maximum_play_time?: number | null;
  preferred_player_count?: number | null;
  preferred_complexity_min?: number | null;
  preferred_complexity_max?: number | null;
}

export interface PlayerPreferencesCreate extends PlayerPreferencesBase {
  player_id: UUID;
  preferred_category_ids?: UUID[];
}

export interface PlayerPreferencesUpdate extends PlayerPreferencesBase {
  preferred_category_ids?: UUID[];
}

export interface PlayerPreferencesInDB extends PlayerPreferencesBase {
  id: UUID;
  player_id: UUID;
  created_at: string;
  updated_at: string;
  preferred_categories: GameCategoryResponse[];
}

export interface PlayerPreferencesResponse extends PlayerPreferencesInDB {}

// ==================================================
// PLAYER GAME HISTORY TYPES
// ==================================================

export interface PlayerGameHistoryBase {
  play_date: string; // ISO datetime string
  rating?: number | null;
  notes?: string | null;
}

export interface PlayerGameHistoryCreate extends PlayerGameHistoryBase {
  player_id: UUID;
  game_id: UUID;
}

export interface PlayerGameHistoryUpdate {
  rating?: number | null;
  notes?: string | null;
}

export interface PlayerGameHistoryInDB extends PlayerGameHistoryBase {
  id: UUID;
  player_id: UUID;
  game_id: UUID;
  created_at: string;
  updated_at: string;
  game: GameResponse;
}

export interface PlayerGameHistoryResponse extends PlayerGameHistoryInDB {}

// ==================================================
// COMPATIBILITY TYPES
// ==================================================

export interface CompatibilityResponse {
  game_id: UUID;
  player_id: UUID;
  compatibility_score: number; // 0.0 to 1.0
  recommendation: 'recommended' | 'not_recommended';
  details: Record<string, string>;
}

// ==================================================
// API UTILITY TYPES
// ==================================================

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface GameFilters extends PaginationParams {
  search?: string;
  min_players?: number;
  max_players?: number;
  min_play_time?: number;
  max_play_time?: number;
  min_complexity?: number;
  max_complexity?: number;
  category_ids?: UUID[];
  tag_ids?: UUID[];
  category_filter_mode?: 'any' | 'all';
  tag_filter_mode?: 'any' | 'all';
}

export interface SearchParams {
  name: string;
  limit?: number;
}

// ==================================================
// ERROR TYPES
// ==================================================

export interface ApiErrorDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: any;
}

export interface ValidationErrorResponse {
  detail: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  detail: string;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class ValidationError extends ApiError {
  public validationErrors: ApiErrorDetail[];

  constructor(message: string, status: number, statusText: string, validationErrors: ApiErrorDetail[]) {
    super(message, status, statusText, validationErrors);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// ==================================================
// HEALTH CHECK TYPES
// ==================================================

export interface HealthCheckResponse {
  status: string;
  service: string;
  request_id?: string;
}

export interface DatabaseHealthResponse {
  status: string;
  database: string;
  request_id?: string;
} 