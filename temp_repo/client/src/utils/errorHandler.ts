// Error handling utilities to suppress unnecessary console errors and provide user-friendly messages

export interface ErrorHandlerConfig {
  suppressConsoleErrors?: boolean;
  suppressNetworkErrors?: boolean;
  suppressJSONErrors?: boolean;
}

const defaultConfig: ErrorHandlerConfig = {
  suppressConsoleErrors: true,
  suppressNetworkErrors: true,  
  suppressJSONErrors: true,
};

let config = { ...defaultConfig };

export function configureErrorHandler(newConfig: Partial<ErrorHandlerConfig>): void {
  config = { ...config, ...newConfig };
}

// Console error suppression wrapper
export function suppressConsoleError<T>(
  operation: () => T,
  fallback?: T,
  customMessage?: string
): T {
  try {
    return operation();
  } catch (error) {
    if (config.suppressConsoleErrors) {
      // Only log to console.warn if it's important
      if (customMessage) {
        console.warn(customMessage, error);
      }
    } else {
      console.error(error);
    }
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw error;
  }
}

// Async version for promises
export async function suppressConsoleErrorAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  customMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (config.suppressConsoleErrors) {
      if (customMessage) {
        console.warn(customMessage, error);
      }
    } else {
      console.error(error);
    }
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw error;
  }
}

// Safe JSON parsing with error suppression
export function safeJsonParse<T = any>(
  jsonString: string,
  fallback: T = {} as T
): T {
  return suppressConsoleError(
    () => JSON.parse(jsonString),
    fallback,
    config.suppressJSONErrors ? undefined : "JSON parse error:"
  );
}

// Safe fetch wrapper with error suppression and better error messages
export async function safeFetch(
  url: string, 
  options?: RequestInit,
  customErrorMessages?: Record<number, string>
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (config.suppressNetworkErrors) {
      console.warn("Network request failed:", url, error);
    } else {
      console.error("Network request failed:", url, error);
    }
    
    // Create a mock response for network errors
    const mockResponse = new Response(
      JSON.stringify({ error: "Network error. Please check your connection." }),
      {
        status: 0,
        statusText: 'Network Error',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    return mockResponse;
  }
}

// Get user-friendly error message based on status code
export function getErrorMessage(
  status: number, 
  data?: any, 
  customMessages?: Record<number, string>
): string {
  if (customMessages && customMessages[status]) {
    return customMessages[status];
  }
  
  const defaultMessages: Record<number, string> = {
    0: "Network error. Please check your connection and try again.",
    400: "Invalid request. Please check your input.",
    401: "Authentication failed. Please check your credentials.",
    403: "Access forbidden. You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "Conflict. The resource already exists.",
    429: "Too many requests. Please wait and try again.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.", 
    504: "Request timeout. Please try again later.",
  };
  
  if (defaultMessages[status]) {
    return defaultMessages[status];
  }
  
  // Fallback to server message or generic error
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  
  return "An unexpected error occurred. Please try again.";
}

// Global error handler setup for unhandled promise rejections
export function setupGlobalErrorHandling(): void {
  if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('unhandledrejection', (event) => {
      if (config.suppressConsoleErrors) {
        console.warn('Unhandled promise rejection:', event.reason);
        event.preventDefault(); // Prevent the default console error
      }
    });
    
    window.addEventListener('error', (event) => {
      if (config.suppressConsoleErrors) {
        console.warn('Unhandled error:', event.error);
      }
    });
  }
}