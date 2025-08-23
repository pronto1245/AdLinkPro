/**
 * Unit Tests for API Client
 */

import { apiClient } from '@/lib/api/client';
import { secureStorage } from '@/lib/security';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock secure storage
jest.mock('@/lib/security', () => ({
  secureStorage: {
    getToken: jest.fn(),
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (secureStorage.getToken as jest.Mock).mockReturnValue(null);
  });

  it('should make GET requests correctly', async () => {
    const mockResponse = { data: 'test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiClient.get('/test');

    expect(mockFetch).toHaveBeenCalledWith('/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should include auth token when available', async () => {
    (secureStorage.getToken as jest.Mock).mockReturnValue('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    } as Response);

    await apiClient.get('/test');

    expect(mockFetch).toHaveBeenCalledWith('/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      credentials: 'include',
    });
  });

  it('should handle POST requests with data', async () => {
    const postData = { name: 'test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    } as Response);

    await apiClient.post('/test', postData);

    expect(mockFetch).toHaveBeenCalledWith('/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
      credentials: 'include',
    });
  });

  it('should throw error on failed requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ error: 'Not found' }),
    } as Response);

    await expect(apiClient.get('/test')).rejects.toThrow('HTTP 404: Not Found');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(apiClient.get('/test')).rejects.toThrow('Network error');
  });
});