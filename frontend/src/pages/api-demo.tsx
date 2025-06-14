/**
 * Demo page showcasing the API client functionality.
 * This can be accessed at /api-demo to test the API integration.
 */

import React, { useState, useEffect } from 'react';
import { 
  getPlayers, 
  healthCheck, 
  getGames,
  ApiError, 
  ValidationError, 
  NetworkError,
  type PlayerResponse,
  type GameResponse,
  type HealthCheckResponse
} from '@/lib/api';

export default function ApiDemo() {
  const [players, setPlayers] = useState<PlayerResponse[]>([]);
  const [games, setGames] = useState<GameResponse[]>([]);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setLoadingState = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setError = (key: string, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  const clearError = (key: string) => {
    setErrors(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleApiCall = async (
    key: string,
    apiCall: () => Promise<any>,
    onSuccess: (data: any) => void
  ) => {
    setLoadingState(key, true);
    clearError(key);
    
    try {
      const data = await apiCall();
      onSuccess(data);
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof ValidationError) {
        errorMessage = `Validation Error: ${error.validationErrors.map(e => e.msg).join(', ')}`;
      } else if (error instanceof ApiError) {
        errorMessage = `API Error ${error.status}: ${error.message}`;
      } else if (error instanceof NetworkError) {
        errorMessage = `Network Error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(key, errorMessage);
      console.error(`API call failed (${key}):`, error);
    } finally {
      setLoadingState(key, false);
    }
  };

  const fetchPlayers = () => {
    handleApiCall(
      'players',
      () => getPlayers({ limit: 5 }),
      (data) => setPlayers(data)
    );
  };

  const fetchGames = () => {
    handleApiCall(
      'games',
      () => getGames({ limit: 5 }),
      (data) => setGames(data)
    );
  };

  const checkHealth = () => {
    handleApiCall(
      'health',
      () => healthCheck(),
      (data) => setHealth(data)
    );
  };

  useEffect(() => {
    // Automatically check health on component mount
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            API Client Demo
          </h1>
          
          <div className="space-y-8">
            {/* Health Check Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Health Check
                </h2>
                <button
                  onClick={checkHealth}
                  disabled={loading.health}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.health ? 'Checking...' : 'Check Health'}
                </button>
              </div>
              
              {errors.health && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.health}
                </div>
              )}
              
              {health && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  <p><strong>Status:</strong> {health.status}</p>
                  <p><strong>Service:</strong> {health.service}</p>
                  {health.request_id && (
                    <p><strong>Request ID:</strong> {health.request_id}</p>
                  )}
                </div>
              )}
            </section>

            {/* Players Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Players
                </h2>
                <button
                  onClick={fetchPlayers}
                  disabled={loading.players}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading.players ? 'Loading...' : 'Fetch Players'}
                </button>
              </div>
              
              {errors.players && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.players}
                </div>
              )}
              
              {players.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {players.map((player) => (
                    <div key={player.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {player.display_name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">@{player.username}</p>
                      {player.avatar_url && (
                        <img 
                          src={player.avatar_url} 
                          alt={`${player.display_name}'s avatar`}
                          className="w-8 h-8 rounded-full mt-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Games Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Games
                </h2>
                <button
                  onClick={fetchGames}
                  disabled={loading.games}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading.games ? 'Loading...' : 'Fetch Games'}
                </button>
              </div>
              
              {errors.games && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.games}
                </div>
              )}
              
              {games.length > 0 && (
                <div className="grid gap-4">
                  {games.map((game) => (
                    <div key={game.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {game.name}
                      </h3>
                      {game.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {game.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Players: {game.min_players}-{game.max_players}</span>
                        <span>Time: {game.average_play_time} min</span>
                        <span>Complexity: {game.complexity_rating}/5</span>
                      </div>
                      {game.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {game.categories.map((category) => (
                            <span 
                              key={category.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* API Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                API Client Information
              </h2>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="text-gray-700 dark:text-gray-300">
                  This demo page showcases the comprehensive API client implementation.
                  The client includes:
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Type-safe TypeScript interfaces mirroring backend schemas</li>
                  <li>Comprehensive error handling with custom error classes</li>
                  <li>Automatic retry logic with exponential backoff</li>
                  <li>Request deduplication for identical GET requests</li>
                  <li>Development logging (check browser console)</li>
                  <li>Environment-based configuration</li>
                </ul>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Check the browser console to see detailed API request/response logging.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 