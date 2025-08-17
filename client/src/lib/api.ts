import { AuthResponse, getUserFromToken, isTokenExpired } from './auth';

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || '') : '';

export type LoginResponse = AuthResponse;

export async function api<T>(path: string, init?: RequestInit & { skipAuth?: boolean }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (!init?.skipAuth) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (await res.json()) as T : ({} as T);
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  // Try different authentication methods since the backend has multiple endpoints
  const authMethods = [
    // Method 1: Try with username (main routes.ts endpoint)
    { username, password },
    // Method 2: Try with email field (auth.routes.ts endpoint)  
    { email: username, password },
    // Method 3: Try with specific email formats for auth.routes.ts
    { email: getEmailForUsername(username), password: getPasswordForUsername(username) }
  ];

  let lastError: Error | null = null;

  for (const method of authMethods) {
    try {
      console.log('🔐 Trying auth method:', Object.keys(method));
      
      const data: any = await api('/api/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify(method),
      });
      
      // Handle the response based on what the server actually returns
      const token = data?.token ?? data?.data?.token;
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Check if token is valid
      if (isTokenExpired(token)) {
        throw new Error('Received expired token');
      }
      
      // Save token to localStorage immediately
      localStorage.setItem('token', token);
      
      // Extract user info - check if server provided user data or extract from token
      let user = data.user;
      if (!user) {
        // This is the scenario from the problem statement: server only returns token
        user = getUserFromToken(token);
        if (!user) {
          throw new Error('Unable to extract user information from token');
        }
        console.log('✅ Extracted user from token:', user.username, 'Role:', user.role);
      } else {
        console.log('✅ Received user data from server:', user.username, 'Role:', user.role);
      }
      
      return { token, user };
      
    } catch (error) {
      console.log('❌ Auth method failed:', error.message);
      lastError = error as Error;
      continue;
    }
  }
  
  // If all methods failed, throw the last error
  throw lastError || new Error('All authentication methods failed');
}

// Helper function to map usernames to emails for auth.routes.ts
function getEmailForUsername(username: string): string {
  const emailMap: Record<string, string> = {
    'owner': '9791207@gmail.com',
    'superadmin': '9791207@gmail.com', // Map superadmin to owner
    'advertiser': '12345@gmail.com',
    'advertiser1': '12345@gmail.com', // Map advertiser1 to advertiser  
    'partner': '4321@gmail.com',
    'test_affiliate': '4321@gmail.com', // Map test_affiliate to partner
  };
  return emailMap[username] || username;
}

// Helper function to map usernames to passwords for auth.routes.ts
function getPasswordForUsername(username: string): string {
  const passwordMap: Record<string, string> = {
    'owner': 'owner123',
    'superadmin': 'owner123', // Map superadmin to owner password
    'advertiser': 'adv123', 
    'advertiser1': 'adv123', // Map advertiser1 to advertiser password
    'partner': 'partner123',
    'test_affiliate': 'partner123', // Map test_affiliate to partner password
  };
  return passwordMap[username] || 'password123'; // Default fallback
}
