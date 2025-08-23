import { csrfManager, tokenStorage, rateLimitTracker, deviceFingerprint, sanitizeInput } from './security';

const API_BASE = '';

interface SecureRequestInit extends RequestInit {
  skipAuth?: boolean;
  skipCSRF?: boolean;
  identifier?: string; // For rate limiting
}

function resolveUrl(path: string) {
  if (!path) {return '';}
  if (/^https?:\/\//i.test(path)) {return path;}
  return `${API_BASE}${path}`;
}

export class SecureAPIError extends Error {
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
  console.log("🌐 [SECURE_API] Making request:", {
    path,
    method: init.method || 'GET',
    skipAuth: init.skipAuth,
    identifier: init.identifier
  });

  // Check rate limiting
  const identifier = init.identifier || 'anonymous';
  if (rateLimitTracker.isRateLimited(identifier)) {
    const remainingTime = rateLimitTracker.getRemainingTime(identifier);
    console.warn("🌐 [SECURE_API] Rate limited:", { identifier, remainingTime });
    throw new SecureAPIError(
      429,
      'Too Many Requests',
      'RATE_LIMITED',
      remainingTime
    );
  }

  // Get authentication token
  const token = !init.skipAuth ? tokenStorage.getToken() : null;
  console.log("🌐 [SECURE_API] Auth token:", {
    hasToken: !!token,
    skipAuth: init.skipAuth
  });

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
    console.log("🌐 [SECURE_API] Added CSRF protection");
  }

  // Add device fingerprint
  const fingerprint = deviceFingerprint.get() || deviceFingerprint.store();
  headers['X-Device-Fingerprint'] = fingerprint;

  try {
    console.log("🌐 [SECURE_API] Sending fetch request...");
    const res = await fetch(resolveUrl(path), {
      ...init,
      headers,
      credentials: 'include'
    });

    console.log("🌐 [SECURE_API] Fetch response:", {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText
    });

    // Handle rate limiting
    if (res.status === 429) {
      console.warn("🌐 [SECURE_API] Rate limited by server");
      rateLimitTracker.recordAttempt(identifier);
      const retryAfter = parseInt(res.headers.get('Retry-After') || '0');
      throw new SecureAPIError(429, 'Too Many Requests', 'RATE_LIMITED', retryAfter);
    }

    // Handle authentication errors
    if (res.status === 401) {
      console.warn("🌐 [SECURE_API] Authentication failed, clearing tokens");
      tokenStorage.clearToken();
      csrfManager.clearToken();
      throw new SecureAPIError(401, 'Unauthorized', 'AUTH_FAILED');
    }

    // Handle CSRF errors
    if (res.status === 403 && res.headers.get('X-CSRF-Error')) {
      console.warn("🌐 [SECURE_API] CSRF error, regenerating token");
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
        console.error("🌐 [SECURE_API] Server error:", {
          status: res.status,
          errorCode,
          errorMessage,
          errorData
        });
      } catch {
        console.error("🌐 [SECURE_API] Server error (no JSON):", {
          status: res.status,
          statusText: res.statusText
        });
      }

      throw new SecureAPIError(res.status, errorMessage, errorCode);
    }

    // Reset rate limiting on successful request
    if (res.ok && identifier !== 'anonymous') {
      rateLimitTracker.reset(identifier);
    }

    const ct = res.headers.get('content-type') || '';
    const result = ct.includes('application/json') ? res.json() : res.text();
    console.log("🌐 [SECURE_API] Request successful");
    return result;
    
  } catch (error) {
    console.error("🌐 [SECURE_API] Request error:", error);
    
    if (error instanceof SecureAPIError) {
      throw error;
    }
    
    // Network or other errors
    throw new SecureAPIError(0, 'Network Error', 'NETWORK_ERROR');
  }
}

// Secure authentication functions
export const secureAuth = {
  async login(
    data: { email: string; password: string; rememberMe?: boolean },
    identifier?: string
  ) {
    console.log("🔐 [SECURE_API] Login called with:", {
      email: data.email,
      hasPassword: !!data.password,
      rememberMe: data.rememberMe,
      identifier
    });

    const cleanData = {
      email: data.email?.trim() || '',
      password: data.password,
      ...(data.rememberMe !== undefined && { rememberMe: data.rememberMe })
    };

    console.log("🔐 [SECURE_API] Making API call to /api/auth/login...");

    try {
      const result = await secureApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(cleanData),
        skipAuth: true,
        identifier: identifier || cleanData.email
      });

      console.log("🔐 [SECURE_API] API call successful:", {
        hasToken: !!result.token,
        hasUser: !!result.user,
        result
      });

      if (result.token) {
        console.log("🔐 [SECURE_API] Storing token...");
        tokenStorage.setToken(result.token);
      } else {
        console.warn("🔐 [SECURE_API] No token in response:", result);
      }

      return result;
    } catch (error) {
      console.error("🔐 [SECURE_API] Login error:", error);
      throw error;
    }
  },

  async loginWithV2(
    data: { username: string; password: string },
    identifier?: string
  ) {
    const cleanData = {
      username: data.username.trim(),
      password: data.password
    };

    const result = await secureApi('/api/auth/v2/login', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier: identifier || cleanData.username
    });

    if (result.token) {
      tokenStorage.setToken(result.token);
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
    telegram?: string;
  }, identifier?: string) {
    const cleanData = {
      name: sanitizeInput.cleanString(data.name),
      email: sanitizeInput.cleanEmail(data.email),
      ...(data.username && { username: sanitizeInput.cleanUsername(data.username) }),
      password: data.password,
      ...(data.phone && { phone: sanitizeInput.cleanPhone(data.phone) }),
      ...(data.company && { company: sanitizeInput.cleanString(data.company) }),
      ...(data.contactType && { contactType: data.contactType }),
      ...(data.contact && { contact: sanitizeInput.cleanString(data.contact) }),
      ...(data.telegram && { telegram: sanitizeInput.cleanTelegram(data.telegram) }),
      ...(data.role && { role: data.role }),
      agreeTerms: data.agreeTerms,
      agreePrivacy: data.agreePrivacy,
      ...(data.agreeMarketing !== undefined && { agreeMarketing: data.agreeMarketing })
    };

    let endpoint = '/api/auth/register';
    if (data.role === 'PARTNER' || data.role === 'affiliate') {
      endpoint = '/api/auth/register/partner';
    } else if (data.role === 'ADVERTISER' || data.role === 'advertiser') {
      endpoint = '/api/auth/register/advertiser';
    }

    const result = await secureApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(cleanData),
      skipAuth: true,
      identifier: identifier || sanitizeInput.cleanEmail(data.email)
    });

    return result;
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
        newPassword: newPassword
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
      tokenStorage.clearToken();
      csrfManager.clearToken();
    }
  },

  async refreshToken() {
    try {
      const result = await secureApi('/api/auth/refresh', { method: 'POST' });
      if (result.token) {
        tokenStorage.setToken(result.token);
      }
      return result;
    } catch {
      tokenStorage.clearToken();
      throw new SecureAPIError(401, 'Token refresh failed', 'REFRESH_FAILED');
    }
  }
};

    // Store token securely if verification successful
    if (result.token) {
      tokenStorage.setToken(result.token);
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
    telegram?: string;
  }, identifier?: string) {
    // Add debugging console.log as required
    console.log("📤 Frontend registration request - Email:", data.email, "Role:", data.role);
    
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
      ...(data.telegram && { telegram: sanitizeInput.cleanTelegram(data.telegram) }),
      ...(data.role && { role: data.role }),
      agreeTerms: data.agreeTerms,
      agreePrivacy: data.agreePrivacy,
      ...(data.agreeMarketing !== undefined && { agreeMarketing: data.agreeMarketing })
    };

    // Use role-specific endpoints as required
    let endpoint = '/api/auth/register';
    if (data.role === 'PARTNER' || data.role === 'affiliate') {
      endpoint = '/api/auth/register/partner';
      console.log("📤 Using partner registration API:", endpoint);
    } else if (data.role === 'ADVERTISER' || data.role === 'advertiser') {
      endpoint = '/api/auth/register/advertiser';
      console.log("📤 Using advertiser registration API:", endpoint);
    }

    try {
      const result = await secureApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(cleanData),
        skipAuth: true,
        identifier: identifier || sanitizeInput.cleanEmail(data.email)
      });
      
      // Add debugging for server response as required
      console.log("✅ Registration server response:", result);
      
      return result;
    } catch (_error) {
      // Add debugging for errors as required
      console.log("❌ Registration error:", error?.message || error);
      throw error;
    }
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
      tokenStorage.clearToken();
      csrfManager.clearToken();
    }
  },

  async refreshToken() {
    try {
      const result = await secureApi('/api/auth/refresh', { method: 'POST' });
      if (result.token) {
        tokenStorage.setToken(result.token);
      }
      return result;
    } catch {
      // If refresh fails, clear tokens
      tokenStorage.clearToken();
      throw new SecureAPIError(401, 'Token refresh failed', 'REFRESH_FAILED');
    }
  }
};
