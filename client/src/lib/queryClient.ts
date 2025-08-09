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

  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
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
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    
    if (token) {
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
      staleTime: 5 * 60 * 1000, // 5 минут кеширования
      gcTime: 10 * 60 * 1000, // 10 минут в кеше (новый API)
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
