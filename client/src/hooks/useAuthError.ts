/**
 * Centralized Error Handling Hook
 * Provides consistent error handling throughout the authentication system
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthError } from '@/types/auth';
import { SecureAPIError } from '@/lib/secure-api';

interface UseAuthErrorReturn {
  error: AuthError | null;
  setError: (error: AuthError | string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  isRateLimited: boolean;
  retryAfter?: number;
}

export function useAuthError(): UseAuthErrorReturn {
  const [error, setErrorState] = useState<AuthError | null>(null);
  const { toast } = useToast();

  const setError = useCallback((errorInput: AuthError | string | null) => {
    if (!errorInput) {
      setErrorState(null);
      return;
    }

    if (typeof errorInput === 'string') {
      const authError: AuthError = {
        code: 'GENERIC_ERROR',
        message: errorInput,
        timestamp: new Date()
      };
      setErrorState(authError);
    } else {
      setErrorState(errorInput);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((errorInput: unknown, context = 'Operation') => {
    console.error(`[AUTH_ERROR] ${context}:`, errorInput);

    if (errorInput instanceof SecureAPIError) {
      const authError: AuthError = {
        code: errorInput.code || 'API_ERROR',
        message: getErrorMessage(errorInput, context),
        status: errorInput.status,
        details: errorInput,
        timestamp: new Date()
      };

      setErrorState(authError);

      // Show toast for user-facing errors
      if (errorInput.status !== 401) { // Don't show toast for auth failures - handled by login form
        toast({
          title: 'Ошибка',
          description: authError.message,
          variant: 'destructive',
        });
      }
    } else if (errorInput instanceof Error) {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: errorInput.message || `${context} failed`,
        details: errorInput,
        timestamp: new Date()
      };

      setErrorState(authError);

      toast({
        title: 'Ошибка',
        description: authError.message,
        variant: 'destructive',
      });
    } else {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: `${context} failed unexpectedly`,
        details: errorInput,
        timestamp: new Date()
      };

      setErrorState(authError);

      toast({
        title: 'Ошибка',
        description: authError.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const isRateLimited = error?.code === 'RATE_LIMITED' || error?.status === 429;
  const retryAfter = error?.details?.retryAfter;

  return {
    error,
    setError,
    clearError,
    handleError,
    isRateLimited,
    retryAfter
  };
}

/**
 * Convert various error types to user-friendly messages
 */
function getErrorMessage(error: SecureAPIError, context: string): string {
  const { status, code, statusText } = error;

  switch (status) {
    case 400:
      return 'Неверные данные запроса. Проверьте введённую информацию.';
    case 401:
      return 'Неверный email или пароль';
    case 403:
      if (code === 'CSRF_ERROR') {
        return 'Ошибка безопасности. Попробуйте обновить страницу.';
      }
      return 'Доступ запрещён';
    case 404:
      return 'Запрашиваемый ресурс не найден';
    case 409:
      return 'Пользователь с таким email уже существует';
    case 422:
      return 'Некорректные данные. Проверьте правильность заполнения полей.';
    case 429:
      const minutes = Math.ceil((error.retryAfter || 60) / 60);
      return `Слишком много попыток. Попробуйте через ${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'}.`;
    case 500:
      return 'Внутренняя ошибка сервера. Попробуйте позже.';
    case 0:
      return 'Ошибка соединения. Проверьте интернет-подключение.';
    default:
      return statusText || `${context} failed`;
  }
}
