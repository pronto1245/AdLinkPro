import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get API base URL from environment
const getApiBaseUrl = (): string => {
  // In production, use environment variable, fallback to current domain
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Production fallback - same domain
  return '';
};

// Build full API URL
const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  
  // If endpoint already has protocol, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If no base URL (same domain), return endpoint as is
  if (!baseUrl) {
    return endpoint;
  }
  
  // Combine base URL with endpoint
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${cleanBase}${cleanEndpoint}`;
};

export async function apiRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<any> {
  // CRITICAL FIX: Ensure method is always a string
  const httpMethod = typeof method === 'string' ? method : 'GET';
  
  if (typeof method !== 'string') {
    throw new Error(`Invalid method in apiRequest: ${typeof method}. Expected string, got ${typeof method}`);
  }

  // Build full API URL
  const fullUrl = buildApiUrl(url);

  // Get token from localStorage (both old and new format)
  let token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  // DEBUG: Log token status for CreateOffer debugging
  if (url.includes('/api/advertiser/offers') && method === 'POST') {
    console.log('🔍 CreateOffer Debug - Token status:', {
      hasAuthToken: !!localStorage.getItem('auth_token'),
      hasToken: !!localStorage.getItem('token'), 
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) || 'none'
    });
  }
  
  // FIX: Check that token is not null string and not empty
  if (token === 'null' || token === 'undefined' || !token || token.trim() === '') {
    // Clear invalid tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    token = null;
    if (url.includes('/api/advertiser/offers') && method === 'POST') {
      console.log('❌ No valid token found for CreateOffer request');
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    method: httpMethod,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (url.includes('/api/advertiser/offers') && method === 'POST') {
    console.log('📡 CreateOffer API Response:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    });
  }

  await throwIfResNotOk(res);
  
  // Return JSON if content exists
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build full API URL
    const fullUrl = buildApiUrl(queryKey[0] as string);
    
    // Get valid token from localStorage
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const headers: Record<string, string> = {};
    
    // FIX: Check that token is not null string and not empty
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(fullUrl, {
      method: 'GET',
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // ИЗМЕНЕНО: не выбрасываем ошибки в глобальном обработчике
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 секунд для живых данных
      gcTime: 5 * 60 * 1000, // 5 минут в кеше (более быстрое обновление)
      retry: (failureCount, error: any) => {
        // ИЗМЕНЕНО: Полностью отключаем retry для предотвращения promise rejections
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Добавляем глобальный error handler
      onError: (error: Error) => {
        // Тихо логируем ошибки без выброса unhandled promise rejection
        console.warn('Query error handled:', error.message);
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('4')) return false;
        return failureCount < 1;
      },
      // Добавляем глобальный error handler для mutations
      onError: (error: Error) => {
        console.warn('Mutation error handled:', error.message);
      },
    },
  },
  // Добавляем глобальный error boundary для QueryClient
  logger: {
    log: console.log,
    warn: console.warn,
    error: (message) => {
      // Предотвращаем unhandled promise rejections от QueryClient
      console.warn('QueryClient error handled:', message);
    },
  },
});

// Делаем queryClient доступным глобально для очистки кеша после логина
(window as any).queryClient = queryClient;

// Предварительная загрузка критических данных
export const prefetchCriticalData = async () => {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['/api/auth/me'],
      staleTime: 2 * 60 * 1000, // 2 минуты для данных пользователя
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/advertiser/offers'],
      staleTime: 5 * 60 * 1000, // 5 минут для списка офферов
    }),
  ]);
};

// Transform landing page URL with custom domain and essential tracking
export const transformLandingUrl = async (params: {
  originalUrl: string;
  offerId: string;
}): Promise<string> => {
  const response = await apiRequest('/api/partner/transform-landing-url', 'POST', params);
  return response.transformedUrl;
};
