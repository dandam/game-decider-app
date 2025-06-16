/**
 * Player preferences API endpoints.
 *
 * Note: These are also available through the players endpoints,
 * but separated here for clarity and organization.
 */

import { apiClient } from '../client';
import {
  UUID,
  PlayerPreferencesResponse,
  PlayerPreferencesUpdate,
  CompatibilityResponse,
} from '../types';

/**
 * Get player preferences by player ID.
 */
export async function getPreferences(playerId: UUID): Promise<PlayerPreferencesResponse> {
  return apiClient.get<PlayerPreferencesResponse>(`/api/v1/players/${playerId}/preferences`);
}

/**
 * Update player preferences.
 */
export async function updatePreferences(
  playerId: UUID,
  data: PlayerPreferencesUpdate
): Promise<PlayerPreferencesResponse> {
  return apiClient.put<PlayerPreferencesResponse>(`/api/v1/players/${playerId}/preferences`, data);
}

/**
 * Get game compatibility for a player.
 */
export async function getCompatibility(
  gameId: UUID,
  playerId: UUID
): Promise<CompatibilityResponse> {
  return apiClient.get<CompatibilityResponse>(`/api/v1/games/${gameId}/compatibility`, {
    params: { player_id: playerId },
  });
}
