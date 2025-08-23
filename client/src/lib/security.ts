// Simple random ID generator to replace nanoid for better compatibility
function generateRandomId(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * CSRF Token Management
 */
export class CSRFManager {
  private static instance: CSRFManager;
  private token: string | null = null;
  private readonly tokenKey = 'csrf_token';
  private readonly headerName = 'X-CSRF-Token';

  static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager();
    }
    return CSRFManager.instance;
  }

  generateToken(): string {
    this.token = generateRandomId(32);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, this.token);
    }
    return this.token;
  }

  getToken(): string | null {
    if (!this.token && typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(this.tokenKey);
    }
    return this.token;
  }

  getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { [this.headerName]: token } : {};
  }

  clearToken(): void {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }
}

/**
 * Input Sanitization
 */
export const sanitizeInput = {
  /**
   * Basic HTML escape to prevent XSS
   */
  escapeHtml: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Remove potentially dangerous characters from user input
   */
  cleanString: (input: string): string => {
    return input
      .replace(/[<>\"']/g, '') // Remove HTML-dangerous characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Validate and sanitize email
   */
  cleanEmail: (email: string): string => {
    return email
      .toLowerCase()
      .trim()
      .replace(/[<>\"']/g, '');
  },

  /**
   * Sanitize username (alphanumeric + allowed special chars)
   */
  cleanUsername: (username: string): string => {
    return username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '');
  },

  /**
   * Sanitize telegram username (@username format)
   */
  cleanTelegram: (telegram: string): string => {
    const cleaned = telegram
      .trim()
      .replace(/[^a-zA-Z0-9_@]/g, '');

    // Ensure it starts with @
    return cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
  },

  /**
   * Clean phone number (digits and + only)
   */
  cleanPhone: (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  }
};

/**
 * Rate Limiting Helper with improved UX
 */
export class RateLimitTracker {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly windowMs: number = 10 * 60 * 1000; // 10 minutes (reduced from 15)
  private readonly maxAttempts: number = 8; // increased from 5 for better UX

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      return false;
    }

    // Reset if window expired
    if (now - entry.lastAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return false;
    }

    return entry.count >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };

    // Reset counter if window expired
    if (now - entry.lastAttempt > this.windowMs) {
      entry.count = 1;
    } else {
      entry.count++;
    }

    entry.lastAttempt = now;
    this.attempts.set(identifier, entry);
  }

  getRemainingTime(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) {return 0;}

    const remaining = (entry.lastAttempt + this.windowMs) - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Simple Token Storage using localStorage only
 * Simplified approach for better compatibility and reliability
 */
export const tokenStorage = {
  setToken: (token: string): void => {
    if (typeof localStorage === 'undefined') {return;}

    // Clear any old tokens from different storage approaches
    localStorage.removeItem('auth:secure_token');
    localStorage.removeItem('auth:token');

    // Use single consistent key for token storage
    localStorage.setItem('token', token);
  },

  getToken: (): string | null => {
    if (typeof localStorage === 'undefined') {return null;}

    // Check primary token storage
    const token = localStorage.getItem('token');
    if (token) {return token;}

    // Fallback to legacy storage for compatibility
    const authToken = localStorage.getItem('auth:token');
    if (authToken) {
      // Migrate to new storage approach
      localStorage.setItem('token', authToken);
      localStorage.removeItem('auth:token');
      return authToken;
    }

    // Check secure token storage and migrate if found
    try {
      const secureTokenStr = localStorage.getItem('auth:secure_token');
      if (secureTokenStr) {
        const tokenData = JSON.parse(secureTokenStr);
        if (tokenData.token) {
          // Migrate to simple storage
          localStorage.setItem('token', tokenData.token);
          localStorage.removeItem('auth:secure_token');
          return tokenData.token;
        }
      }
    } catch {
      // If secure token is corrupted, clean it up
      localStorage.removeItem('auth:secure_token');
    }

    return null;
  },

  clearToken: (): void => {
    if (typeof localStorage === 'undefined') {return;}

    // Clear all possible token storage locations
    localStorage.removeItem('token');
    localStorage.removeItem('auth:token');
    localStorage.removeItem('auth:secure_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('auth:user');
  }
};

// Backward compatibility alias
export const secureStorage = tokenStorage;
/**
 * Password Strength Checker
 */
export const passwordStrength = {
  calculate: (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {score++;}
    else {feedback.push('Используйте минимум 8 символов');}

    if (/[A-Z]/.test(password)) {score++;}
    else {feedback.push('Добавьте заглавные буквы');}

    if (/[a-z]/.test(password)) {score++;}
    else {feedback.push('Добавьте строчные буквы');}

    if (/[0-9]/.test(password)) {score++;}
    else {feedback.push('Добавьте цифры');}

    if (/[^A-Za-z0-9]/.test(password)) {score++;}
    else {feedback.push('Добавьте специальные символы');}

    if (password.length >= 12) {score++;}

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Избегайте повторяющихся символов');
      score = Math.max(0, score - 1);
    }

    if (/123|abc|qwe|password/i.test(password)) {
      feedback.push('Избегайте простых последовательностей');
      score = Math.max(0, score - 1);
    }

    return { score, feedback };
  },

  getStrengthLabel: (score: number): { label: string; color: string } => {
    if (score <= 2) {return { label: 'Weak', color: 'text-red-500' };}
    if (score <= 4) {return { label: 'Medium', color: 'text-yellow-500' };}
    return { label: 'Strong', color: 'text-green-500' };
  }
};

/**
 * Device Fingerprinting (basic)
 */
export const deviceFingerprint = {
  generate: (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('AdLinkPro', 0, 0);
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvasFingerprint.slice(0, 100) // First 100 chars of canvas data
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
  },

  store: (): string => {
    const fingerprint = deviceFingerprint.generate();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('device_fingerprint', fingerprint);
    }
    return fingerprint;
  },

  get: (): string | null => {
    if (typeof localStorage === 'undefined') {return null;}
    return localStorage.getItem('device_fingerprint');
  }
};

// Initialize CSRF manager
export const csrfManager = CSRFManager.getInstance();
export const rateLimitTracker = new RateLimitTracker();
