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
 * Get games with advanced filtering and search.
 */
export async function getGames(params?: GameFilters): Promise<GameResponse[]> {
  return apiClient.get<GameResponse[]>('/api/v1/games', { params });
}

/**
 * Get total count of games matching filters.
 */
export async function getGamesCount(params?: Omit<GameFilters, 'skip' | 'limit'>): Promise<number> {
  const response = await apiClient.get<{ count: number }>('/api/v1/games/count', { params });
  return response.count;
}

/**
 * Get a specific game by ID.
 */
export async function getGame(id: UUID): Promise<GameResponse> {
  return apiClient.get<GameResponse>(`/api/v1/games/${id}`);
}

/**
 * Create a new game (admin only).
 */
export async function createGame(data: GameCreate): Promise<GameResponse> {
  return apiClient.post<GameResponse>('/api/v1/games', data);
}

/**
 * Update an existing game (admin only).
 */
export async function updateGame(id: UUID, data: GameUpdate): Promise<GameResponse> {
  return apiClient.put<GameResponse>(`/api/v1/games/${id}`, data);
}

/**
 * Delete a game (admin only).
 */
export async function deleteGame(id: UUID): Promise<void> {
  return apiClient.delete<void>(`/api/v1/games/${id}`);
}

/**
 * Search games by name.
 */
export async function searchGamesByName(name: string, limit?: number): Promise<GameResponse[]> {
  const params: SearchParams = { name };
  if (limit !== undefined) {
    params.limit = limit;
  }
  return apiClient.get<GameResponse[]>('/api/v1/games/search', { params });
}

/**
 * Get game by BoardGameArena ID.
 */
export async function getGameByBgaId(bgaId: string): Promise<GameResponse> {
  return apiClient.get<GameResponse>(`/api/v1/games/bga/${bgaId}`);
}

/**
 * Get game compatibility with player preferences.
 */
export async function getGameCompatibility(
  gameId: UUID, 
  playerId: UUID
): Promise<CompatibilityResponse> {
  return apiClient.get<CompatibilityResponse>(`/api/v1/games/${gameId}/compatibility`, {
    params: { player_id: playerId }
  });
} 