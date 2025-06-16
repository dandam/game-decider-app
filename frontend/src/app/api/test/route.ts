import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test all our API endpoints
    const [healthRes, statsRes, playersRes] = await Promise.all([
      fetch('http://backend:8000/api/v1/health/db'),
      fetch('http://backend:8000/api/v1/stats/db'),
      fetch('http://backend:8000/api/v1/players'),
    ]);

    const [health, stats, players] = await Promise.all([
      healthRes.json(),
      statsRes.json(),
      playersRes.json(),
    ]);

    const bgaPlayers = players.filter((p: any) => p.avatar_url.startsWith('/avatars/'));
    const seedPlayers = players.filter((p: any) => !p.avatar_url.startsWith('/avatars/'));

    return NextResponse.json({
      status: 'success',
      health: health.status,
      totalGames: stats.games,
      totalPlayers: stats.players,
      gameHistory: stats.game_history,
      playerPreferences: stats.player_preferences,
      bgaPlayers: bgaPlayers.length,
      seedPlayers: seedPlayers.length,
      sampleBgaPlayer: bgaPlayers[0]?.username,
      sampleSeedPlayer: seedPlayers[0]?.username,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
