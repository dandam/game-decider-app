'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/layout/Container';
import { Stack } from '@/components/ui/layout/Stack';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/data-display/Card';
import { Badge } from '@/components/ui/data-display/Badge';
import Link from 'next/link';

interface DatabaseStats {
  games: number;
  players: number;
  gameHistory: number;
  playerPreferences: number;
}

interface Player {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

interface Game {
  id: string;
  name: string;
  min_players: number;
  max_players: number;
  average_play_time: number;
  complexity_rating: number;
  created_at: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export default function DataDemoPage() {
  const [dbStats, setDbStats] = useState<ApiResponse<DatabaseStats>>({ loading: true });
  const [players, setPlayers] = useState<ApiResponse<Player[]>>({ loading: true });
  const [games, setGames] = useState<ApiResponse<Game[]>>({ loading: true });
  const [searchResults, setSearchResults] = useState<ApiResponse<Game[]>>({ loading: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [dbHealth, setDbHealth] = useState<ApiResponse<{ status: string; message: string }>>({ loading: true });

  // Fetch database health
  useEffect(() => {
    fetch('/api/health/db')
      .then(res => res.json())
      .then(data => setDbHealth({ data, loading: false }))
      .catch(error => setDbHealth({ error: error.message, loading: false }));
  }, []);

  // Fetch database stats
  useEffect(() => {
    fetch('/api/stats/db')
      .then(res => res.json())
      .then(data => {
        setDbStats({
          data: {
            games: data.games,
            players: data.players,
            gameHistory: data.game_history,
            playerPreferences: data.player_preferences
          },
          loading: false
        });
      })
      .catch(error => setDbStats({ error: error.message, loading: false }));
  }, []);

  // Fetch players
  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers({ data, loading: false }))
      .catch(error => setPlayers({ error: error.message, loading: false }));
  }, []);

  // Fetch sample games
  useEffect(() => {
    fetch('/api/games?limit=10')
      .then(res => res.json())
      .then(data => setGames({ data, loading: false }))
      .catch(error => setGames({ error: error.message, loading: false }));
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setSearchResults({ loading: true });
    fetch(`/api/games?search=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(data => setSearchResults({ data, loading: false }))
      .catch(error => setSearchResults({ error: error.message, loading: false }));
  };

  const getBgaPlayerCount = () => {
    if (!players.data) return 'Loading...';
    return players.data.filter(p => p.avatar_url.startsWith('/avatars/')).length;
  };

  const getSeedPlayerCount = () => {
    if (!players.data) return 'Loading...';
    return players.data.filter(p => !p.avatar_url.startsWith('/avatars/')).length;
  };

  return (
    <div className="min-h-screen bg-surface-100 text-surface-900">
      <Container>
        <div className="py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">Data & Database Demo</h1>
              <Link href="/">
                <Button variant="outline">← Back to Home</Button>
              </Link>
            </div>
            <p className="text-surface-600">
              Validate Task 26 BGA data processing results and explore the database state
            </p>
          </header>

          <Stack spacing="xl">
            {/* Database Health */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">System Health</h2>
              <Card>
                <CardContent className="pt-6">
                  {dbHealth.loading ? (
                    <p>Checking database health...</p>
                  ) : dbHealth.error ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="error">Error</Badge>
                      <span>{dbHealth.error}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="success">
                        {dbHealth.data?.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                      </Badge>
                      <span>{dbHealth.data?.message}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Database Statistics */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Database Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Games</CardTitle>
                    <CardDescription>Total game catalog</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-600">
                      {dbStats.loading ? '...' : dbStats.error ? 'Error' : dbStats.data?.games}
                    </div>
                    <p className="text-sm text-surface-600 mt-1">
                      {(dbStats.data?.games ?? 0) > 1000 ? 'BGA + seed data' : 'Including seed data'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Players</CardTitle>
                    <CardDescription>Registered players</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-600">
                      {players.loading ? '...' : players.error ? 'Error' : players.data?.length}
                    </div>
                    <p className="text-sm text-surface-600 mt-1">
                      {getBgaPlayerCount()} BGA + {getSeedPlayerCount()} seed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Game History</CardTitle>
                    <CardDescription>Player statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-600">
                      {dbStats.loading ? '...' : dbStats.error ? 'Error' : dbStats.data?.gameHistory}
                    </div>
                    <p className="text-sm text-surface-600 mt-1">
                      Player game records
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preferences</CardTitle>
                    <CardDescription>Player preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-600">
                      {dbStats.loading ? '...' : dbStats.error ? 'Error' : dbStats.data?.playerPreferences}
                    </div>
                    <p className="text-sm text-surface-600 mt-1">
                      All players configured
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Players Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Players</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Player Profiles</CardTitle>
                  <CardDescription>
                    BGA players have local avatars, seed players use external avatars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {players.loading ? (
                    <p>Loading players...</p>
                  ) : players.error ? (
                    <p className="text-red-600">Error: {players.error}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {players.data?.map((player) => (
                        <div key={player.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-200 flex items-center justify-center">
                              {player.avatar_url ? (
                                <img 
                                  src={player.avatar_url} 
                                  alt={`${player.username} avatar`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to chess piece if image fails to load
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = player.avatar_url.startsWith('/avatars/') ? '♛' : '♟';
                                  }}
                                />
                              ) : (
                                <span className="text-surface-500">♔</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{player.username}</h3>
                              <Badge variant={player.avatar_url.startsWith('/avatars/') ? 'default' : 'secondary'}>
                                {player.avatar_url.startsWith('/avatars/') ? 'BGA Player' : 'Seed Data'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-surface-600">
                            Created: {new Date(player.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Games Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Games Catalog</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Sample Games</CardTitle>
                  <CardDescription>
                    First 10 games from the BoardGameArena catalog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {games.loading ? (
                    <p>Loading games...</p>
                  ) : games.error ? (
                    <p className="text-red-600">Error: {games.error}</p>
                  ) : (
                    <div className="space-y-3">
                      {games.data?.map((game) => (
                        <div key={game.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{game.name}</h3>
                              <p className="text-sm text-surface-600">
                                {game.min_players}-{game.max_players} players • 
                                {game.average_play_time} min • 
                                Complexity: {game.complexity_rating}/5
                              </p>
                            </div>
                            <Badge variant="outline">BGA Game</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Search Demo */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Search Functionality</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Game Search</CardTitle>
                  <CardDescription>
                    Test the search functionality with the full BGA catalog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for games (e.g., 'chess', 'catan', 'ticket')"
                      className="flex-1 px-3 py-2 border border-surface-300 rounded-md"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
                      Search
                    </Button>
                  </div>

                  {searchResults.loading ? (
                    <p>Searching...</p>
                  ) : searchResults.error ? (
                    <p className="text-red-600">Error: {searchResults.error}</p>
                  ) : searchResults.data ? (
                    <div>
                      <p className="mb-3 text-surface-600">
                        Found {searchResults.data.length} games matching "{searchTerm}"
                      </p>
                      <div className="space-y-2">
                        {searchResults.data.map((game) => (
                          <div key={game.id} className="border rounded p-3">
                            <h4 className="font-semibold">{game.name}</h4>
                            <p className="text-sm text-surface-600">
                              {game.min_players}-{game.max_players} players • {game.average_play_time} min
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </section>

            {/* System Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">System Information</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Development Environment Status</CardTitle>
                  <CardDescription>
                    Current system state and data quality metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">🔧 Environment</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Backend: http://localhost:8000</li>
                        <li>• Frontend: http://localhost:3000</li>
                        <li>• Database: PostgreSQL (Docker)</li>
                        <li>• API Status: {dbHealth.data?.status || 'Checking...'}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">📊 Data Summary</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Total Games: {dbStats.data?.games || 'Loading...'}</li>
                        <li>• Total Players: {dbStats.data?.players || 'Loading...'}</li>
                        <li>• BGA Players: {getBgaPlayerCount()}</li>
                        <li>• Seed Players: {getSeedPlayerCount()}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Debug Tool</Badge>
                      <span className="font-semibold">Use this page to validate system state and test APIs</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      This page provides real-time data from the backend APIs and can be used 
                      to verify system health, test search functionality, and debug data issues.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </Stack>
        </div>
      </Container>
    </div>
  );
} 