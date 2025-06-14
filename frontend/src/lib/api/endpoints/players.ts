/**
 * Player API endpoints.
 */

import { apiClient } from '../client';
import {
  UUID,
  PlayerResponse,
  PlayerCreate,
  PlayerUpdate,
  PlayerPreferencesResponse,
  PlayerPreferencesUpdate,
  PaginationParams,
} from '../types';

/**
 * Get all players with pagination.
 */
export async function getPlayers(params?: PaginationParams): Promise<PlayerResponse[]> {
  return apiClient.get<PlayerResponse[]>('/api/v1/players', { params });
}

/**
 * Get a specific player by ID.
 */
export async function getPlayer(id: UUID): Promise<PlayerResponse> {
  return apiClient.get<PlayerResponse>(`/api/v1/players/${id}`);
}

/**
 * Create a new player.
 */
export async function createPlayer(data: PlayerCreate): Promise<PlayerResponse> {
  return apiClient.post<PlayerResponse>('/api/v1/players', data);
}

/**
 * Update an existing player.
 */
export async function updatePlayer(id: UUID, data: PlayerUpdate): Promise<PlayerResponse> {
  return apiClient.put<PlayerResponse>(`/api/v1/players/${id}`, data);
}

/**
 * Delete a player.
 */
export async function deletePlayer(id: UUID): Promise<void> {
  return apiClient.delete<void>(`/api/v1/players/${id}`);
}

/**
 * Get player preferences by player ID.
 */
export async function getPlayerPreferences(id: UUID): Promise<PlayerPreferencesResponse> {
  return apiClient.get<PlayerPreferencesResponse>(`/api/v1/players/${id}/preferences`);
}

/**
 * Update player preferences.
 */
export async function updatePlayerPreferences(
  id: UUID, 
  data: PlayerPreferencesUpdate
): Promise<PlayerPreferencesResponse> {
  return apiClient.put<PlayerPreferencesResponse>(`/api/v1/players/${id}/preferences`, data);
} 