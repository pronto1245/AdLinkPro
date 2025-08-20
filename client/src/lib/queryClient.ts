import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<any> {
  // CRITICAL FIX: Ensure method is always a string
  const httpMethod = typeof method === 'string' ? method : 'GET';
  
  console.log('🔧 apiRequest call:', {
    url,
    originalMethod: method,
    methodType: typeof method,
    finalMethod: httpMethod,
    methodValue: JSON.stringify(method)
  });

  if (typeof method !== 'string') {
    console.error('❌ INVALID METHOD IN apiRequest:', {
      method,
      methodType: typeof method,
      stack: new Error().stack
    });
    throw new Error(`Invalid method in apiRequest: ${typeof method}. Expected string, got ${typeof method}`);
  }

  // Get token from multiple possible locations for backward compatibility
  let token = localStorage.getItem('auth:token') || 
              localStorage.getItem('token') || 
              localStorage.getItem('auth_token');
  
  // FIX: Check that token is not null string and not empty
  if (token === 'null' || token === 'undefined' || !token || token.trim() === '') {
    console.log('🚨 Invalid token detected, clearing:', token);
    localStorage.removeItem('auth:token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    token = null;
  }
  
  console.log('🔐 apiRequest token check:', {
    url,
    method: httpMethod,
    hasToken: !!token,
    tokenStart: token ? token.substring(0, 20) + '...' : 'NO_TOKEN'
  });
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: httpMethod,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

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
    // Get token from multiple possible locations for backward compatibility
    const token = localStorage.getItem('auth:token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    
    // FIX: Check that token is not null string and not empty
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(queryKey[0] as string, {
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
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 секунд для живых данных
      gcTime: 5 * 60 * 1000, // 5 минут в кеше (более быстрое обновление)
      retry: (failureCount, error: any) => {
        // Не повторяем при 4xx ошибках
        if (error?.message?.includes('4')) return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('4')) return false;
        return failureCount < 1;
      },
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
