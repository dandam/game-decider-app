'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Players,
  Games,
  Health,
  type PlayerResponse,
  type GameResponse,
  type HealthCheckResponse,
  ApiError,
  ValidationError,
  NetworkError
} from '@/lib/api';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function ApiDemo() {
  // Health check state
  const [healthLoading, setHealthLoading] = useState<LoadingState>('idle');
  const [healthError, setHealthError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  // Players state
  const [playersLoading, setPlayersLoading] = useState<LoadingState>('idle');
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [playersData, setPlayersData] = useState<PlayerResponse[]>([]);

  // Games state
  const [gamesLoading, setGamesLoading] = useState<LoadingState>('idle');
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [gamesData, setGamesData] = useState<GameResponse[]>([]);

  // Auto-run health check on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthLoading('loading');
    setHealthError(null);
    
    try {
      const result = await Health.healthCheck();
      setHealth(result);
      setHealthLoading('success');
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? `API Error: ${error.message}` 
        : error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      setHealthError(errorMessage);
      setHealthLoading('error');
    }
  };

  const fetchPlayers = async () => {
    setPlayersLoading('loading');
    setPlayersError(null);
    
    try {
      const result = await Players.getPlayers();
      setPlayersData(result);
      setPlayersLoading('success');
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? `API Error: ${error.message}` 
        : error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      setPlayersError(errorMessage);
      setPlayersLoading('error');
    }
  };

  const fetchGames = async () => {
    setGamesLoading('loading');
    setGamesError(null);
    
    try {
      const result = await Games.getGames({ limit: 10 });
      setGamesData(result);
      setGamesLoading('success');
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? `API Error: ${error.message}` 
        : error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      setGamesError(errorMessage);
      setGamesLoading('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              API Client Demo
            </h1>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                ← Back to Home
              </button>
            </Link>
          </div>

          <div className="space-y-8">
            {/* Health Check Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Health Check
                </h2>
                <button
                  onClick={checkHealth}
                  disabled={healthLoading === 'loading'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {healthLoading === 'loading' ? 'Checking...' : 'Check Health'}
                </button>
              </div>

              {healthError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <strong>Error:</strong> {healthError}
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
                  disabled={playersLoading === 'loading'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {playersLoading === 'loading' ? 'Loading...' : 'Fetch Players'}
                </button>
              </div>

              {playersError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <strong>Error:</strong> {playersError}
                </div>
              )}

              {playersData.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {playersData.map((player) => (
                    <div key={player.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {player.display_name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">@{player.username}</p>
                      {player.avatar_url && (
                        <img
                          src={player.avatar_url}
                          alt="Avatar"
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
                  Games (Top 10)
                </h2>
                <button
                  onClick={fetchGames}
                  disabled={gamesLoading === 'loading'}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {gamesLoading === 'loading' ? 'Loading...' : 'Fetch Games'}
                </button>
              </div>

              {gamesError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <strong>Error:</strong> {gamesError}
                </div>
              )}

              {gamesData.length > 0 && (
                <div className="grid gap-4">
                  {gamesData.map((game) => (
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
                      {game.categories && game.categories.length > 0 && (
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

            {/* Info Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                API Client Features
              </h2>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="text-gray-700 dark:text-gray-300">
                  This demo showcases the comprehensive API client implementation:
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
                  Open browser dev tools to see detailed request/response logging in development mode.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 