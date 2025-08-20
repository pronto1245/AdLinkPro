import { csrfManager, secureStorage, rateLimitTracker, deviceFingerprint, sanitizeInput } from './security';

const API_BASE = '';

interface SecureRequestInit extends RequestInit {
  skipAuth?: boolean;
  skipCSRF?: boolean;
  identifier?: string; // For rate limiting
}

function resolveUrl(path: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

class SecureAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public code?: string,
    public retryAfter?: number
  ) {
    super(`${status} ${statusText}`);
    this.name = 'SecureAPIError';
  }
}

async function secureApi(path: string, init: SecureRequestInit = {}) {
  // Check rate limiting
  const identifier = init.identifier || 'anonymous';
  if (rateLimitTracker.isRateLimited(identifier)) {
    const remainingTime = rateLimitTracker.getRemainingTime(identifier);
    throw new SecureAPIError(
      429,
      'Too Many Requests',
      'RATE_LIMITED',
      remainingTime
    );
  }

  // Get authentication token
  const token = !init.skipAuth ? secureStorage.getToken() : null;

  // Prepare headers
  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  // Add CSRF protection for state-changing operations
  if (!init.skipCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method?.toUpperCase() || 'GET')) {
    const csrfToken = csrfManager.getToken() || csrfManager.generateToken();
    Object.assign(headers, csrfManager.getHeaders());
  }

  // Add device fingerprint
  const fingerprint = deviceFingerprint.get() || deviceFingerprint.store();
  headers['X-Device-Fingerprint'] = fingerprint;

  try {
    const res = await fetch(resolveUrl(path), {
      ...init,
      headers,
      credentials: 'include'
    });

    // Handle rate limiting
    if (res.status === 429) {
      rateLimitTracker.recordAttempt(identifier);
      const retryAfter = parseInt(res.headers.get('Retry-After') || '0');
      throw new SecureAPIError(429, 'Too Many Requests', 'RATE_LIMITED', retryAfter);
    }

    // Handle authentication errors
    if (res.status === 401) {
      secureStorage.clearToken();
      csrfManager.clearToken();
      throw new SecureAPIError(401, 'Unauthorized', 'AUTH_FAILED');
    }

    // Handle CSRF errors
    if (res.status === 403 && res.headers.get('X-CSRF-Error')) {
      csrfManager.clearToken();
      csrfManager.generateToken();
      throw new SecureAPIError(403, 'CSRF Token Invalid', 'CSRF_ERROR');
    }

    if (!res.ok) {
      let errorCode = 'UNKNOWN_ERROR';
      let errorMessage = res.statusText;

      try {
        const errorData = await res.json();
        errorCode = errorData.code || errorCode;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use default error message if JSON parsing fails
      }

      throw new SecureAPIError(res.status, errorMessage, errorCode);
    }

    // Reset rate limiting on successful request
    if (res.ok && identifier !== 'anonymous') {
      rateLimitTracker.reset(identifier);
    }

    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
    
  } catch (error) {
    if (error instanceof SecureAPIError) {
      throw error;
    }
    
    // Network or other errors
    throw new SecureAPIError(0, 'Network Error', 'NETWORK_ERROR');
  }
}

// Secure authentication functions
export const secureAuth = {
  async login(data: { email: string; password: string; twoFactorCode?: string; rememberMe?: boolean }, identifier?: string) {
    // Sanitize inputs
    const cleanData = {
      email: sanitizeInput.cleanEmail(data.email),
      password: data.password, // Don't sanitize password, just validate
      ...(data.twoFactorCode && { twoFactorCode: data.twoFactorCode.replace(/\D/g, '') }),
      ...(data.rememberMe !== undefined && { rememberMe: data.rememberMe })
    };

    const result = await secureApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier: identifier || sanitizeInput.cleanEmail(data.email)
    });

    // Store token securely if login successful
    if (result.token) {
      secureStorage.setToken(result.token);
    }

    return result;
  },

  async loginWithV2(data: { username: string; password: string }, identifier?: string) {
    const cleanData = {
      username: sanitizeInput.cleanString(data.username),
      password: data.password
    };

    const result = await secureApi('/api/auth/v2/login', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier: identifier || cleanData.username
    });

    // Store token securely if login successful (same as regular login method)
    if (result.token) {
      secureStorage.setToken(result.token);
    }

    return result;
  },

  async verify2FA(data: { tempToken: string; code: string }, identifier?: string) {
    const cleanData = {
      token: sanitizeInput.cleanString(data.tempToken),
      code: data.code.replace(/\D/g, '') // Only digits
    };

    const result = await secureApi('/api/auth/v2/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier
    });

    // Store token securely if verification successful
    if (result.token) {
      secureStorage.setToken(result.token);
    }

    return result;
  },

  async register(data: {
    name: string;
    email: string;
    username?: string;
    password: string;
    phone?: string;
    company?: string;
    contactType?: string;
    contact?: string;
    role?: string;
    agreeTerms: boolean;
    agreePrivacy: boolean;
    agreeMarketing?: boolean;
  }, identifier?: string) {
    // Sanitize inputs
    const cleanData = {
      name: sanitizeInput.cleanString(data.name),
      email: sanitizeInput.cleanEmail(data.email),
      ...(data.username && { username: sanitizeInput.cleanUsername(data.username) }),
      password: data.password, // Don't sanitize password
      ...(data.phone && { phone: sanitizeInput.cleanPhone(data.phone) }),
      ...(data.company && { company: sanitizeInput.cleanString(data.company) }),
      ...(data.contactType && { contactType: data.contactType }),
      ...(data.contact && { contact: sanitizeInput.cleanString(data.contact) }),
      ...(data.role && { role: data.role }),
      agreeTerms: data.agreeTerms,
      agreePrivacy: data.agreePrivacy,
      ...(data.agreeMarketing !== undefined && { agreeMarketing: data.agreeMarketing })
    };

    return secureApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier: identifier || sanitizeInput.cleanEmail(data.email)
    });
  },

  async resetPassword(data: { email: string }, identifier?: string) {
    const cleanData = {
      email: sanitizeInput.cleanEmail(data.email)
    };

    return secureApi('/api/auth/v2/reset-password', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier: identifier || cleanData.email
    });
  },

  async validateResetToken(token: string) {
    const cleanToken = sanitizeInput.cleanString(token);

    return secureApi('/api/auth/v2/validate-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token: cleanToken }),
      skipAuth: true
    });
  },

  async completePasswordReset(token: string, newPassword: string) {
    const cleanToken = sanitizeInput.cleanString(token);

    return secureApi('/api/auth/v2/complete-password-reset', {
      method: 'POST',
      body: JSON.stringify({ 
        token: cleanToken,
        newPassword: newPassword // Don't sanitize password, just validate
      }),
      skipAuth: true
    });
  },

  async me() {
    return secureApi('/api/me');
  },

  async logout() {
    try {
      await secureApi('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors on logout
    } finally {
      // Always clear local storage
      secureStorage.clearToken();
      csrfManager.clearToken();
    }
  },

  async refreshToken() {
    try {
      const result = await secureApi('/api/auth/refresh', { method: 'POST' });
      if (result.token) {
        secureStorage.setToken(result.token);
      }
      return result;
    } catch {
      // If refresh fails, clear tokens
      secureStorage.clearToken();
      throw new SecureAPIError(401, 'Token refresh failed', 'REFRESH_FAILED');
    }
  }
};

// Export the secure API function and error class
export { secureApi, SecureAPIError };
export default secureApi;