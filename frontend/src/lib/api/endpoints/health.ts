/**
 * Health check API endpoints.
 */

import { apiClient } from '../client';
import { HealthCheckResponse, DatabaseHealthResponse } from '../types';

/**
 * Check API health status.
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  return apiClient.get<HealthCheckResponse>('/api/v1/health');
}

/**
 * Check database health status.
 */
export async function databaseHealthCheck(): Promise<DatabaseHealthResponse> {
  return apiClient.get<DatabaseHealthResponse>('/api/v1/health/database');
} 