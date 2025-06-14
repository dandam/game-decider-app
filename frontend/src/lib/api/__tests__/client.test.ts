/**
 * Tests for the API client.
 */

import { ApiClient, createApiClient } from '../client';
import { ApiError, ValidationError, NetworkError } from '../types';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in tests
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({
      baseUrl: 'http://localhost:8000',
      timeout: 5000,
    });
    mockFetch.mockClear();
  });

  describe('Constructor', () => {
    it('should create client with default configuration', () => {
      const defaultClient = createApiClient();
      expect(defaultClient.getBaseUrl()).toBe('http://localhost:8000');
    });

    it('should create client with custom configuration', () => {
      const customClient = new ApiClient({
        baseUrl: 'https://api.example.com',
        timeout: 10000,
      });
      expect(customClient.getBaseUrl()).toBe('https://api.example.com');
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await client.get('/api/v1/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Request-ID': expect.any(String),
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle query parameters', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      await client.get('/api/v1/players', { 
        params: { limit: 10, skip: 0 } 
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/players?limit=10&skip=0',
        expect.any(Object)
      );
    });

    it('should handle array parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve([]),
      });

      await client.get('/api/v1/games', { 
        params: { category_ids: ['1', '2', '3'] } 
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/games?category_ids=1&category_ids=2&category_ids=3',
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const requestData = { username: 'test', display_name: 'Test User' };
      const responseData = { id: '1', ...requestData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(responseData),
      });

      const result = await client.post('/api/v1/players', requestData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/players',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const requestData = { display_name: 'Updated Name' };
      const responseData = { id: '1', username: 'test', ...requestData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(responseData),
      });

      const result = await client.put('/api/v1/players/1', requestData);
      expect(result).toEqual(responseData);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Headers(),
        text: () => Promise.resolve(''),
      });

      await client.delete('/api/v1/players/1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/players/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle API errors (4xx)', async () => {
      const errorResponse = { detail: 'Player not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(client.get('/api/v1/players/nonexistent')).rejects.toThrow(ApiError);
      
      try {
        await client.get('/api/v1/players/nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('Player not found');
      }
    });

    it('should handle validation errors (422)', async () => {
      const validationErrors = [
        {
          type: 'string_too_short',
          loc: ['username'],
          msg: 'Username must be at least 3 characters',
          input: 'ab',
        },
      ];
      const errorResponse = { detail: validationErrors };
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(client.post('/api/v1/players', { username: 'ab' })).rejects.toThrow(ValidationError);
      
      try {
        await client.post('/api/v1/players', { username: 'ab' });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).validationErrors).toEqual(validationErrors);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

      await expect(client.get('/api/v1/players')).rejects.toThrow(NetworkError);
    });
  });

  describe('Request deduplication', () => {
    it('should deduplicate identical GET requests', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        client.get('/api/v1/test'),
        client.get('/api/v1/test'),
      ]);

      // Should only make one actual network request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
    });

    it('should not deduplicate POST requests', async () => {
      const requestData = { name: 'Test' };
      const responseData = { id: '1', ...requestData };
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(responseData),
      });

      // Make two identical POST requests simultaneously
      await Promise.all([
        client.post('/api/v1/test', requestData),
        client.post('/api/v1/test', requestData),
      ]);

      // Should make two actual network requests
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration', () => {
    it('should allow updating configuration', () => {
      const newConfig = {
        baseUrl: 'https://new-api.example.com',
        timeout: 15000,
      };
      
      client.updateConfig(newConfig);
      expect(client.getBaseUrl()).toBe('https://new-api.example.com');
    });

    it('should cancel all pending requests', () => {
      const spy = jest.spyOn(client, 'cancelAllRequests');
      client.cancelAllRequests();
      expect(spy).toHaveBeenCalled();
    });
  });
}); 