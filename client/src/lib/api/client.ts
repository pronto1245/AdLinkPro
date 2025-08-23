/**
 * Base API Client with Enhanced Error Logging
 * Provides unified API request handling with comprehensive logging
 */

import { secureStorage } from '../security';

const API_BASE: string =
  (import.meta as { env?: Record<string, unknown> })?.env?.VITE_API_BASE as string || '';

interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  timestamp: Date;
}

class ApiClient {
  private readonly baseUrl: string;
  private requestId = 0;

  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private generateRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  private logRequest(requestId: string, method: string, url: string, config?: RequestConfig) {
    console.group(`🌐 [API_CLIENT:${requestId}] ${method.toUpperCase()} ${url}`);
    console.log('📤 Request details:', {
      url: this.baseUrl + url,
      method,
      headers: config?.headers,
      hasBody: !!config?.body,
      timestamp: new Date().toISOString()
    });
  }

  private logResponse(requestId: string, response: Response, duration: number) {
    console.log(`📥 Response received (${duration}ms):`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    });
  }

  private logError(requestId: string, error: unknown, duration: number) {
    console.error(`❌ Request failed (${duration}ms):`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });
    console.groupEnd();
  }

  private logSuccess(requestId: string, data: any, duration: number) {
    console.log(`✅ Request completed successfully (${duration}ms):`, {
      hasData: !!data,
      dataType: typeof data,
      timestamp: new Date().toISOString()
    });
    console.groupEnd();
  }

  async request<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    const method = config.method || 'GET';

    this.logRequest(requestId, method, url, config);

    try {
      // Get auth token
      const token = secureStorage.getToken();

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...config.headers,
      };

      // Make request
      const response = await fetch(this.baseUrl + url, {
        ...config,
        headers,
        credentials: 'include',
      });

      const duration = Date.now() - startTime;
      this.logResponse(requestId, response, duration);

      // Handle response
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errorBody: any = null;
        try {
          errorBody = contentType.includes('application/json')
            ? await response.json()
            : await response.text();
        } catch (parseError) {
          console.warn(`[API_CLIENT:${requestId}] Failed to parse error response:`, parseError);
        }

        const apiError = new Error(`HTTP ${response.status}: ${response.statusText}`) as Error & {
          status?: number;
          url?: string;
          body?: any;
          response?: Response;
        };

        apiError.status = response.status;
        apiError.url = this.baseUrl + url;
        apiError.body = errorBody;
        apiError.response = response;

        this.logError(requestId, apiError, duration);
        throw apiError;
      }

      // Parse successful response
      const data = contentType.includes('application/json') ? await response.json() : await response.text();
      this.logSuccess(requestId, data, duration);

      return data as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logError(requestId, error, duration);
      throw error;
    }
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiClient };
export type { RequestConfig, ApiResponse };
