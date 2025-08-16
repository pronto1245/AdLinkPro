// Production Authentication Fix Utility
// Fixes cross-environment token issues between dev and production

export const isProductionEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname.includes('replit.app') || 
         hostname.includes('netlify.app') ||
         hostname.includes('vercel.app') ||
         (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'));
};

export const clearInvalidTokens = (): void => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  // Clear any invalid tokens
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('🧹 Cleared invalid tokens for production environment');
  }
};

export const forceProductionLogout = (): void => {
  // Clear all authentication data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token'); 
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  
  // Clear any cached query data
  if ((window as any).queryClient) {
    (window as any).queryClient.clear();
  }
  
  console.log('🔄 Forced logout for production environment');
  
  // Redirect to login
  window.location.href = '/login';
};

export const initProductionAuthFix = (): void => {
  if (!isProductionEnvironment()) {
    return; // Only run in production
  }
  
  console.log('🔧 Initializing production auth fix...');
  
  // Check if we have a valid token
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  if (!token || token === 'null' || token === 'undefined') {
    console.log('❌ No valid token found, forcing logout');
    forceProductionLogout();
    return;
  }
  
  // Test token validity with a simple API call
  fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      console.log('❌ Token validation failed, forcing re-login');
      forceProductionLogout();
    } else {
      console.log('✅ Token valid for production environment');
    }
  })
  .catch(() => {
    console.log('❌ Network error during token validation, forcing re-login');
    forceProductionLogout();
  });
};