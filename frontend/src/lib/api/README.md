# Game Decider API Client

A comprehensive, type-safe API client for the Game Decider application built with TypeScript and native fetch API.

## Features

- **Type Safety**: Full TypeScript support with types that mirror backend Pydantic schemas
- **Error Handling**: Comprehensive error handling with custom error classes
- **Retry Logic**: Automatic retry with exponential backoff for network failures
- **Request Deduplication**: Prevents duplicate GET requests when made simultaneously
- **Development Logging**: Detailed request/response logging in development mode
- **Environment Configuration**: Configurable base URL via environment variables
- **Tree Shaking**: Optimized exports for minimal bundle size

## Quick Start

```typescript
import { getPlayers, createPlayer, ApiError } from '@/lib/api';

try {
  // Get all players
  const players = await getPlayers({ limit: 10 });
  
  // Create a new player
  const newPlayer = await createPlayer({
    username: 'alice',
    display_name: 'Alice'
  });
  
  console.log('Created player:', newPlayer);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
  }
}
```

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Custom Client Configuration

```typescript
import { createApiClient } from '@/lib/api';

const customClient = createApiClient({
  baseUrl: 'https://api.myapp.com',
  timeout: 10000,
  retryConfig: {
    maxRetries: 5,
    baseDelay: 2000,
  }
});
```

## API Reference

### Players

```typescript
import { Players } from '@/lib/api';

// Get all players with pagination
const players = await Players.getPlayers({ skip: 0, limit: 20 });

// Get specific player
const player = await Players.getPlayer('player-id');

// Create new player
const newPlayer = await Players.createPlayer({
  username: 'johndoe',
  display_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg'
});

// Update player
const updatedPlayer = await Players.updatePlayer('player-id', {
  display_name: 'John Smith'
});

// Delete player
await Players.deletePlayer('player-id');

// Player preferences
const preferences = await Players.getPlayerPreferences('player-id');
const updatedPreferences = await Players.updatePlayerPreferences('player-id', {
  minimum_play_time: 30,
  maximum_play_time: 120,
  preferred_category_ids: ['category-1', 'category-2']
});
```

### Games

```typescript
import { Games } from '@/lib/api';

// Get games with filtering
const games = await Games.getGames({
  skip: 0,
  limit: 10,
  min_players: 2,
  max_players: 4,
  category_ids: ['strategy', 'euro'],
  category_filter_mode: 'any'
});

// Get games count
const count = await Games.getGamesCount({ min_players: 2 });

// Search games by name
const searchResults = await Games.searchGamesByName('Wingspan', 10);

// Get game by BoardGameArena ID
const bgaGame = await Games.getGameByBgaId('123456');

// Get game compatibility
const compatibility = await Games.getGameCompatibility('game-id', 'player-id');
```

### Preferences

```typescript
import { Preferences } from '@/lib/api';

// Get player preferences
const preferences = await Preferences.getPreferences('player-id');

// Update preferences
const updated = await Preferences.updatePreferences('player-id', {
  preferred_complexity_min: 2.0,
  preferred_complexity_max: 4.0,
  preferred_category_ids: ['strategy']
});

// Get compatibility
const compatibility = await Preferences.getCompatibility('game-id', 'player-id');
```

### Health Checks

```typescript
import { Health } from '@/lib/api';

// Check API health
const health = await Health.healthCheck();

// Check database health
const dbHealth = await Health.databaseHealthCheck();
```

## Error Handling

The API client provides three main error types:

### ApiError
Standard API errors (4xx, 5xx responses):

```typescript
try {
  await getPlayer('nonexistent-id');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);        // 404
    console.log('Message:', error.message);      // "Player not found"
    console.log('Data:', error.data);            // Response data
  }
}
```

### ValidationError
Validation errors (422 responses):

```typescript
try {
  await createPlayer({ username: 'ab' }); // Too short
} catch (error) {
  if (error instanceof ValidationError) {
    error.validationErrors.forEach(err => {
      console.log(`${err.loc.join('.')}: ${err.msg}`);
    });
  }
}
```

### NetworkError
Network-related errors:

```typescript
try {
  await getPlayers();
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
    console.log('Original error:', error.originalError);
  }
}
```

## TypeScript Types

All types are exported and can be imported:

```typescript
import type { 
  PlayerResponse, 
  GameResponse, 
  PlayerPreferencesUpdate,
  GameFilters,
  CompatibilityResponse 
} from '@/lib/api';

function handlePlayer(player: PlayerResponse) {
  // Fully typed player object
  console.log(player.username, player.display_name);
}

function filterGames(filters: GameFilters) {
  return getGames(filters);
}
```

## Advanced Usage

### Request Deduplication

Identical GET requests made simultaneously are automatically deduplicated:

```typescript
// These will result in only one network request
const [players1, players2] = await Promise.all([
  getPlayers({ limit: 10 }),
  getPlayers({ limit: 10 })
]);
```

### Custom Headers

```typescript
await apiClient.get('/api/v1/players', {
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

### Request Cancellation

```typescript
const controller = new AbortController();

try {
  const players = await getPlayers(
    { limit: 10 }, 
    { signal: controller.signal }
  );
} catch (error) {
  if (error instanceof NetworkError && error.message.includes('cancelled')) {
    console.log('Request was cancelled');
  }
}

// Cancel the request
controller.abort();
```

### Retry Configuration

```typescript
await apiClient.get('/api/v1/players', {
  retry: true,
  retryConfig: {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  }
});
```

## Development

### Running Tests

```bash
npm test -- src/lib/api/__tests__/
```

### Build Optimization

The API client is designed for optimal tree shaking. Import only what you need:

```typescript
// Good - only imports what's needed
import { getPlayers, createPlayer } from '@/lib/api';

// Also good - namespace import
import { Players } from '@/lib/api';

// Avoid - imports everything
import * as api from '@/lib/api';
```

### Debugging

Set `NODE_ENV=development` to enable detailed request/response logging:

```bash
NODE_ENV=development npm run dev
```

This will show console logs for all API requests including:
- Request ID
- URL and method
- Request/response data
- Timestamps
- Error details

## Contributing

When adding new endpoints:

1. Add types to `types.ts`
2. Add endpoint methods to appropriate file in `endpoints/`
3. Export from `index.ts`
4. Add comprehensive tests
5. Update this README

## Examples

### Complete Player Management

```typescript
import { 
  getPlayers, 
  createPlayer, 
  updatePlayerPreferences,
  ApiError,
  ValidationError 
} from '@/lib/api';

async function managePlayer() {
  try {
    // Create player
    const player = await createPlayer({
      username: 'gamer123',
      display_name: 'Epic Gamer'
    });

    // Set preferences
    await updatePlayerPreferences(player.id, {
      minimum_play_time: 30,
      maximum_play_time: 90,
      preferred_complexity_min: 2.0,
      preferred_complexity_max: 4.0,
      preferred_category_ids: ['strategy', 'euro-game']
    });

    // Get all players
    const allPlayers = await getPlayers({ limit: 50 });
    
    return { player, allPlayers };
    
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.validationErrors);
    } else if (error instanceof ApiError) {
      console.error('API error:', error.status, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

### Game Search and Compatibility

```typescript
import { 
  searchGamesByName, 
  getGameCompatibility,
  getGames 
} from '@/lib/api';

async function findCompatibleGames(playerId: string) {
  // Search for games
  const searchResults = await searchGamesByName('Wingspan');
  
  // Get strategy games for 2-4 players
  const strategyGames = await getGames({
    min_players: 2,
    max_players: 4,
    category_ids: ['strategy'],
    limit: 20
  });

  // Check compatibility for each game
  const compatibilityPromises = strategyGames.map(game =>
    getGameCompatibility(game.id, playerId)
  );
  
  const compatibilities = await Promise.all(compatibilityPromises);
  
  // Filter recommended games
  const recommendedGames = strategyGames.filter((game, index) =>
    compatibilities[index].recommendation === 'recommended'
  );

  return recommendedGames;
}
``` 