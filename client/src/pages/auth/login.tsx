import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { login, getCurrentUser, HOME } from '@/lib/auth';
import type { User } from '@/lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const home = HOME[user.role] || '/';
      setLocation(home);
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await login({ email, password });
      // Redirect based on user role
      const home = HOME[user.role] || '/';
      setLocation(home);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 420, 
      margin: '64px auto', 
      fontFamily: 'system-ui',
      padding: '0 24px'
    }}>
      <h1 style={{ marginBottom: 32, textAlign: 'center' }}>Sign in</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            required
            disabled={loading}
          />
        </div>
        
        {error && (
          <div style={{ 
            color: '#dc2626', 
            fontSize: '14px', 
            padding: '8px', 
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      
      <div style={{ 
        marginTop: '24px', 
        textAlign: 'center', 
        fontSize: '14px', 
        color: '#6b7280' 
      }}>
        Don't have an account? <a href="/register" style={{ color: '#3b82f6' }}>Register here</a>
      </div>
    </div>
  );
};

export default LoginPage;