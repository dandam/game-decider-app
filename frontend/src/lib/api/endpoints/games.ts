/**
 * Game API endpoints.
 */

import { apiClient } from '../client';
import {
  UUID,
  GameResponse,
  GameCreate,
  GameUpdate,
  GameFilters,
  SearchParams,
  CompatibilityResponse,
} from '../types';

/**
 * Get games with filtering and pagination.
 */
export async function getGames(filters: GameFilters = {}): Promise<GameResponse[]> {
  return apiClient.get<GameResponse[]>('/api/games', { params: filters });
}

/**
 * Get total count of games matching filters.
 */
export async function getGamesCount(filters: Omit<GameFilters, 'skip' | 'limit'> = {}): Promise<number> {
  const response = await apiClient.get<{ count: number }>('/api/games/count', { params: filters });
  return response.count;
}

/**
 * Get curated game library (played games + similar games for MVP).
 */
export async function getCuratedGames(filters: GameFilters = {}): Promise<GameResponse[]> {
  return apiClient.get<GameResponse[]>('/api/games/curated', { params: filters });
}

/**
 * Get count of curated games.
 */
export async function getCuratedGamesCount(): Promise<{ played_games: number; similar_games: number; total_curated: number }> {
  return apiClient.get<{ played_games: number; similar_games: number; total_curated: number }>('/api/games/curated/count');
}

/**
 * Get games that have been played by specified players.
 */
export async function getPlayedGames(
  playerUsernames?: string[],
  filters: GameFilters = {}
): Promise<GameResponse[]> {
  const params: any = { ...filters };
  if (playerUsernames && playerUsernames.length > 0) {
    params.player_usernames = playerUsernames;
  }
  return apiClient.get<GameResponse[]>('/api/games/played-games', { params });
}

/**
 * Get a specific game by ID.
 */
export async function getGame(gameId: UUID): Promise<GameResponse> {
  return apiClient.get<GameResponse>(`/api/games/${gameId}`);
}

/**
 * Create a new game (admin only).
 */
export async function createGame(data: GameCreate): Promise<GameResponse> {
  return apiClient.post<GameResponse>('/api/games', data);
}

/**
 * Update an existing game (admin only).
 */
export async function updateGame(id: UUID, data: GameUpdate): Promise<GameResponse> {
  return apiClient.put<GameResponse>(`/api/games/${id}`, data);
}

/**
 * Delete a game (admin only).
 */
export async function deleteGame(id: UUID): Promise<void> {
  return apiClient.delete<void>(`/api/games/${id}`);
}

/**
 * Search games by name.
 */
export async function searchGamesByName(name: string, limit = 10): Promise<GameResponse[]> {
  return apiClient.get<GameResponse[]>('/api/games/search', {
    params: { name, limit },
  });
}

/**
 * Get game by BoardGameArena ID.
 */
export async function getGameByBgaId(bgaId: string): Promise<GameResponse> {
  return apiClient.get<GameResponse>(`/api/games/bga/${bgaId}`);
}

/**
 * Get game compatibility with player preferences.
 */
export async function getGameCompatibility(
  gameId: UUID,
  playerId: UUID
): Promise<CompatibilityResponse> {
  return apiClient.get<CompatibilityResponse>(`/api/games/${gameId}/compatibility`, {
    params: { player_id: playerId },
  });
}
