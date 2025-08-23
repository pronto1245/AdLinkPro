/**
 * Unit Tests for Authentication Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useAuthError } from '@/hooks/useAuthError';
import { SecureAPIError } from '@/lib/secure-api';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('useAuthError Hook', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useAuthError());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRateLimited).toBe(false);
  });

  it('should set and clear error correctly', () => {
    const { result } = renderHook(() => useAuthError());
    
    act(() => {
      result.current.setError('Test error message');
    });
    
    expect(result.current.error).toEqual(
      expect.objectContaining({
        code: 'GENERIC_ERROR',
        message: 'Test error message',
      })
    );
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should handle SecureAPIError correctly', () => {
    const { result } = renderHook(() => useAuthError());
    const apiError = new SecureAPIError(401, 'Unauthorized', 'AUTH_FAILED');
    
    act(() => {
      result.current.handleError(apiError, 'Login');
    });
    
    expect(result.current.error).toEqual(
      expect.objectContaining({
        code: 'AUTH_FAILED',
        message: 'Неверный email или пароль',
        status: 401,
      })
    );
  });

  it('should detect rate limiting correctly', () => {
    const { result } = renderHook(() => useAuthError());
    const rateLimitError = new SecureAPIError(429, 'Too Many Requests', 'RATE_LIMITED', 60);
    
    act(() => {
      result.current.handleError(rateLimitError, 'Login');
    });
    
    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.retryAfter).toBe(60);
  });

  it('should handle generic errors', () => {
    const { result } = renderHook(() => useAuthError());
    const genericError = new Error('Network error');
    
    act(() => {
      result.current.handleError(genericError, 'API Call');
    });
    
    expect(result.current.error).toEqual(
      expect.objectContaining({
        code: 'UNKNOWN_ERROR',
        message: 'Network error',
      })
    );
  });
});