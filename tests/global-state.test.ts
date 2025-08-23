/**
 * Unit Tests for Global State Management
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GlobalStateProvider, useGlobalState, useLoadingState, useErrorState } from '@/hooks/useGlobalState';

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const createWrapper = ({ children }: { children: React.ReactNode }) => (
  <GlobalStateProvider>{children}</GlobalStateProvider>
);

describe('Global State Management', () => {
  describe('useGlobalState', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGlobalState(), { wrapper: createWrapper });
      
      expect(result.current.isLoading()).toBe(false);
      expect(result.current.hasError()).toBe(false);
    });

    it('should manage loading states correctly', () => {
      const { result } = renderHook(() => useGlobalState(), { wrapper: createWrapper });
      
      act(() => {
        result.current.setLoading('auth', true);
      });
      
      expect(result.current.isLoading('auth')).toBe(true);
      expect(result.current.isLoading()).toBe(true);
      
      act(() => {
        result.current.setLoading('auth', false);
      });
      
      expect(result.current.isLoading('auth')).toBe(false);
      expect(result.current.isLoading()).toBe(false);
    });

    it('should manage error states correctly', () => {
      const { result } = renderHook(() => useGlobalState(), { wrapper: createWrapper });
      
      act(() => {
        result.current.setError('auth', 'Authentication failed');
      });
      
      expect(result.current.hasError('auth')).toBe(true);
      expect(result.current.getError('auth')).toBe('Authentication failed');
      expect(result.current.hasError()).toBe(true);
      
      act(() => {
        result.current.clearErrors();
      });
      
      expect(result.current.hasError('auth')).toBe(false);
      expect(result.current.hasError()).toBe(false);
    });

    it('should clear all loading states', () => {
      const { result } = renderHook(() => useGlobalState(), { wrapper: createWrapper });
      
      act(() => {
        result.current.setLoading('auth', true);
        result.current.setLoading('api', true);
      });
      
      expect(result.current.isLoading()).toBe(true);
      
      act(() => {
        result.current.clearAllLoading();
      });
      
      expect(result.current.isLoading()).toBe(false);
    });

    it('should reset state completely', () => {
      const { result } = renderHook(() => useGlobalState(), { wrapper: createWrapper });
      
      act(() => {
        result.current.setLoading('auth', true);
        result.current.setError('auth', 'Error');
      });
      
      expect(result.current.isLoading()).toBe(true);
      expect(result.current.hasError()).toBe(true);
      
      act(() => {
        result.current.resetState();
      });
      
      expect(result.current.isLoading()).toBe(false);
      expect(result.current.hasError()).toBe(false);
    });
  });

  describe('useLoadingState', () => {
    it('should manage specific loading state', () => {
      const { result } = renderHook(() => useLoadingState('auth'), { wrapper: createWrapper });
      
      expect(result.current.loading).toBe(false);
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });
  });

  describe('useErrorState', () => {
    it('should manage specific error state', () => {
      const { result } = renderHook(() => useErrorState('auth'), { wrapper: createWrapper });
      
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Test error');
    });
  });
});