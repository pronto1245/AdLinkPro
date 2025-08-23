/**
 * Global State Management Hook
 * Provides centralized loading and error state management
 */

import { createContext, useContext, useCallback, useReducer, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GlobalState {
  loading: {
    auth: boolean;
    api: boolean;
    page: boolean;
    [key: string]: boolean;
  };
  errors: {
    auth: string | null;
    api: string | null;
    network: string | null;
    [key: string]: string | null;
  };
}

type GlobalAction =
  | { type: 'SET_LOADING'; key: string; loading: boolean }
  | { type: 'SET_ERROR'; key: string; error: string | null }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_ALL_LOADING' }
  | { type: 'RESET_STATE' };

interface GlobalStateContextValue {
  state: GlobalState;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
  clearAllLoading: () => void;
  resetState: () => void;
  // Convenience methods
  isLoading: (key?: string) => boolean;
  hasError: (key?: string) => boolean;
  getError: (key: string) => string | null;
}

const initialState: GlobalState = {
  loading: {
    auth: false,
    api: false,
    page: false,
  },
  errors: {
    auth: null,
    api: null,
    network: null,
  },
};

function globalStateReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: action.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.error,
        },
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: Object.keys(state.errors).reduce((acc, key) => {
          acc[key] = null;
          return acc;
        }, {} as { [key: string]: string | null }),
      };

    case 'CLEAR_ALL_LOADING':
      return {
        ...state,
        loading: Object.keys(state.loading).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {} as { [key: string]: boolean }),
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

const GlobalStateContext = createContext<GlobalStateContextValue | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);
  const { toast } = useToast();

  const setLoading = useCallback((key: string, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', key, loading });
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', key, error });

    // Show toast for critical errors
    if (error && ['auth', 'network'].includes(key)) {
      toast({
        title: 'Ошибка',
        description: error,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const clearAllLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LOADING' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return state.loading[key] || false;
    }
    // Return true if any loading state is active
    return Object.values(state.loading).some(loading => loading);
  }, [state.loading]);

  const hasError = useCallback((key?: string) => {
    if (key) {
      return !!state.errors[key];
    }
    // Return true if any error exists
    return Object.values(state.errors).some(error => !!error);
  }, [state.errors]);

  const getError = useCallback((key: string) => {
    return state.errors[key] || null;
  }, [state.errors]);

  const value: GlobalStateContextValue = {
    state,
    setLoading,
    setError,
    clearErrors,
    clearAllLoading,
    resetState,
    isLoading,
    hasError,
    getError,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
}

/**
 * Hook for managing specific loading states
 */
export function useLoadingState(key: string) {
  const { setLoading, isLoading } = useGlobalState();

  return {
    loading: isLoading(key),
    setLoading: (loading: boolean) => setLoading(key, loading),
  };
}

/**
 * Hook for managing specific error states
 */
export function useErrorState(key: string) {
  const { setError, getError, hasError } = useGlobalState();

  return {
    error: getError(key),
    hasError: hasError(key),
    setError: (error: string | null) => setError(key, error),
  };
}
