/**
 * Tests for API endpoints.
 */

// Mock the client before importing endpoints
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { apiClient } from '../client';
import * as playersApi from '../endpoints/players';
import * as gamesApi from '../endpoints/games';
import * as preferencesApi from '../endpoints/preferences';
import * as healthApi from '../endpoints/health';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Players API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlayers', () => {
    it('should call GET with correct path and params', async () => {
      const mockResponse = [{ id: '1', username: 'test' }];
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { skip: 0, limit: 10 };
      const result = await playersApi.getPlayers(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/players', { params });
      expect(result).toBe(mockResponse);
    });

    it('should work without parameters', async () => {
      const mockResponse: any[] = [];
      mockApiClient.get.mockResolvedValue(mockResponse);

      await playersApi.getPlayers();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/players', { params: undefined });
    });
  });

  describe('getPlayer', () => {
    it('should call GET with correct path', async () => {
      const mockResponse = { id: '1', username: 'test' };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const playerId = '1';
      const result = await playersApi.getPlayer(playerId);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/players/1');
      expect(result).toBe(mockResponse);
    });
  });

  describe('createPlayer', () => {
    it('should call POST with correct path and data', async () => {
      const playerData = { username: 'newuser', display_name: 'New User' };
      const mockResponse = { id: '1', ...playerData };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await playersApi.createPlayer(playerData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/players', playerData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('updatePlayer', () => {
    it('should call PUT with correct path and data', async () => {
      const playerId = '1';
      const updateData = { display_name: 'Updated Name' };
      const mockResponse = { id: '1', username: 'test', ...updateData };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await playersApi.updatePlayer(playerId, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/players/1', updateData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deletePlayer', () => {
    it('should call DELETE with correct path', async () => {
      const playerId = '1';
      mockApiClient.delete.mockResolvedValue(undefined);

      await playersApi.deletePlayer(playerId);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/players/1');
    });
  });

  describe('Player preferences', () => {
    describe('getPlayerPreferences', () => {
      it('should call GET with correct path', async () => {
        const playerId = '1';
        const mockResponse = { 
          id: '1', 
          player_id: playerId, 
          minimum_play_time: 30,
          preferred_categories: []
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await playersApi.getPlayerPreferences(playerId);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/players/1/preferences');
        expect(result).toBe(mockResponse);
      });
    });

    describe('updatePlayerPreferences', () => {
      it('should call PUT with correct path and data', async () => {
        const playerId = '1';
        const preferencesData = { 
          minimum_play_time: 45,
          preferred_category_ids: ['cat1', 'cat2']
        };
        const mockResponse = { 
          id: '1', 
          player_id: playerId, 
          ...preferencesData,
          preferred_categories: []
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await playersApi.updatePlayerPreferences(playerId, preferencesData);

        expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/players/1/preferences', preferencesData);
        expect(result).toBe(mockResponse);
      });
    });
  });
});

describe('Games API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGames', () => {
    it('should call GET with correct path and params', async () => {
      const mockResponse = [{ id: '1', name: 'Test Game' }];
      mockApiClient.get.mockResolvedValue(mockResponse);

      const filters = { 
        skip: 0, 
        limit: 10, 
        min_players: 2, 
        max_players: 4,
        category_ids: ['cat1', 'cat2']
      };
      const result = await gamesApi.getGames(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games', { params: filters });
      expect(result).toBe(mockResponse);
    });
  });

  describe('getGamesCount', () => {
    it('should call GET and return count', async () => {
      const mockResponse = { count: 42 };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const filters = { min_players: 2 };
      const result = await gamesApi.getGamesCount(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games/count', { params: filters });
      expect(result).toBe(42);
    });
  });

  describe('searchGamesByName', () => {
    it('should call GET with search parameters', async () => {
      const mockResponse = [{ id: '1', name: 'Matching Game' }];
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamesApi.searchGamesByName('test', 5);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games/search', { 
        params: { name: 'test', limit: 5 } 
      });
      expect(result).toBe(mockResponse);
    });

    it('should work without limit parameter', async () => {
      const mockResponse: any[] = [];
      mockApiClient.get.mockResolvedValue(mockResponse);

      await gamesApi.searchGamesByName('test');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games/search', { 
        params: { name: 'test' } 
      });
    });
  });

  describe('getGameByBgaId', () => {
    it('should call GET with BGA ID path', async () => {
      const mockResponse = { id: '1', name: 'BGA Game' };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamesApi.getGameByBgaId('123456');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games/bga/123456');
      expect(result).toBe(mockResponse);
    });
  });

  describe('getGameCompatibility', () => {
    it('should call GET with compatibility parameters', async () => {
      const mockResponse = {
        game_id: 'game1',
        player_id: 'player1',
        compatibility_score: 0.85,
        recommendation: 'recommended' as const,
        details: { categories: 'compatible' }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamesApi.getGameCompatibility('game1', 'player1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games/game1/compatibility', { 
        params: { player_id: 'player1' } 
      });
      expect(result).toBe(mockResponse);
    });
  });
});

describe('Preferences API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should call GET with correct path', async () => {
      const mockResponse = { 
        id: '1', 
        player_id: 'player1',
        preferred_categories: []
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await preferencesApi.getPreferences('player1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/players/player1/preferences');
      expect(result).toBe(mockResponse);
    });
  });

  describe('updatePreferences', () => {
    it('should call PUT with correct path and data', async () => {
      const preferencesData = { minimum_play_time: 30 };
      const mockResponse = { 
        id: '1', 
        player_id: 'player1',
        ...preferencesData,
        preferred_categories: []
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await preferencesApi.updatePreferences('player1', preferencesData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/players/player1/preferences', preferencesData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getCompatibility', () => {
    it('should call GET with compatibility parameters', async () => {
      const mockResponse = {
        game_id: 'game1',
        player_id: 'player1',
        compatibility_score: 0.75,
        recommendation: 'recommended' as const,
        details: {}
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await preferencesApi.getCompatibility('game1', 'player1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/games/game1/compatibility', { 
        params: { player_id: 'player1' } 
      });
      expect(result).toBe(mockResponse);
    });
  });
});

describe('Health API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should call GET health endpoint', async () => {
      const mockResponse = { 
        status: 'healthy', 
        service: 'game-night-api' 
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await healthApi.healthCheck();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/health');
      expect(result).toBe(mockResponse);
    });
  });

  describe('databaseHealthCheck', () => {
    it('should call GET database health endpoint', async () => {
      const mockResponse = { 
        status: 'healthy', 
        database: 'postgresql' 
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await healthApi.databaseHealthCheck();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/health/database');
      expect(result).toBe(mockResponse);
    });
  });
}); 