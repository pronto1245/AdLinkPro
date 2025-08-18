import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loginV2, verify2FA, type LoginResponse } from '@/lib/api';
import { getCurrentUser, HOME } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/lib/auth';

// Role mapping for proper redirection
const ROLE_REDIRECTS: Record<string, string> = {
  'OWNER': '/dashboard/owner',
  'ADVERTISER': '/dashboard/advertiser', 
  'PARTNER': '/dashboard/partner',
  'SUPER_ADMIN': '/dashboard/super-admin'
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [, setLocation] = useLocation();
  const { user: contextUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    const user = getCurrentUser() || contextUser;
    if (user) {
      const home = ROLE_REDIRECTS[user.role] || HOME[user.role] || '/';
      setLocation(home);
    }
  }, [setLocation, contextUser]);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle retry logic with exponential backoff
  const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

  const handleRetry = async (loginFn: () => Promise<void>) => {
    const delay = getRetryDelay(retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));
    await loginFn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginV2(username, password);
      
      if (response.requires2FA) {
        setRequires2FA(true);
        setTempToken(response.tempToken || '');
        setError(null);
      } else if (response.success && response.user) {
        // Success - redirect based on role
        const userRole = response.user.role;
        const redirectPath = ROLE_REDIRECTS[userRole] || HOME[userRole.toLowerCase()] || '/';
        setLocation(redirectPath);
      } else {
        throw new Error(response.error || 'Login failed. Please check your credentials.');
      }
      
      setRetryCount(0); // Reset retry count on successful request
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      
      // Handle transient errors with retry logic
      if (err?.message?.includes('HTTP 5') || err?.message?.includes('Network')) {
        setRetryCount(prev => prev + 1);
        if (retryCount < 3) {
          setTimeout(() => handleRetry(() => handleSubmit(e)), getRetryDelay(retryCount));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || !twoFactorCode.trim()) {
      setError('Please enter the 2FA code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await verify2FA(tempToken, twoFactorCode.trim());

      if (response.success && response.user) {
        const userRole = response.user.role;
        const redirectPath = ROLE_REDIRECTS[userRole] || HOME[userRole.toLowerCase()] || '/';
        setLocation(redirectPath);
      } else {
        throw new Error(response.error || 'Invalid 2FA code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify 2FA code.');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced responsive styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '420px',
    margin: '64px auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '0 24px',
    minHeight: 'calc(100vh - 128px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '32px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb'
  };

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#374151',
    fontSize: '14px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    transform: loading ? 'none' : 'translateY(0)',
    ...(loading ? {} : { ':hover': { backgroundColor: '#2563eb', transform: 'translateY(-1px)' } })
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        <h1 style={{ 
          marginBottom: '8px', 
          textAlign: 'center', 
          fontSize: '28px', 
          fontWeight: 700, 
          color: '#111827' 
        }}>
          {requires2FA ? 'Enter 2FA Code' : 'Sign In'}
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          marginBottom: '24px', 
          fontSize: '14px' 
        }}>
          {requires2FA 
            ? 'Please enter the 6-digit code from your authenticator app' 
            : 'Welcome back! Please sign in to your account'
          }
        </p>

        {requires2FA ? (
          <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="twoFactorCode" style={labelStyle}>
                2FA Code
              </label>
              <input
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: '18px',
                  letterSpacing: '0.1em',
                  fontWeight: 600
                }}
                maxLength={6}
                required
                disabled={loading}
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                padding: '12px 16px', 
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !twoFactorCode.trim()} style={buttonStyle}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Verifying...
                </div>
              ) : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setTwoFactorCode('');
                setTempToken(null);
                setError(null);
              }}
              style={{
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="username" style={labelStyle}>
                Email or Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@example.com or username"
                style={inputStyle}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                padding: '12px 16px', 
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {retryCount > 0 ? `Login Failed (Attempt ${retryCount + 1}/4)` : 'Login Failed'}
                  </div>
                  <div>{error}</div>
                  {retryCount > 0 && retryCount < 3 && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      Retrying automatically in {getRetryDelay(retryCount) / 1000} seconds...
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>
        )}
        
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#6b7280',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '20px'
        }}>
          Don't have an account? {' '}
          <a 
            href="/register" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'none', 
              fontWeight: 600,
              ':hover': { textDecoration: 'underline' }
            }}
          >
            Register here
          </a>
        </div>
      </div>
      
      {/* Add CSS keyframes for spinner animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .login-container {
              padding: 0 16px !important;
              margin: 32px auto !important;
            }
            
            .login-form {
              padding: 24px !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
            }
          }
          
          input:focus {
            outline: none;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          }
        `
      }} />
    </div>
  );
};

export default LoginPage;