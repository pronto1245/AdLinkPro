/**
 * Frontend integration test to verify login flow and routing
 */

import { login, logout, getCurrentUser } from '../client/src/lib/auth';
import { routeByRole } from '../client/src/utils/routeByRole';

describe('Frontend Login Flow Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  it('should handle login flow for PARTNER role', async () => {
    const mockLoginResponse = {
      user: {
        email: '4321@gmail.com',
        role: 'PARTNER',
        username: 'partner'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJwYXJ0bmVyIiwicm9sZSI6IlBBUlRORVIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.demo-token'
    };

    // Mock the API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse)
    });

    const result = await login({
      email: '4321@gmail.com',
      password: 'partner123'
    });

    expect(result.user.role).toBe('partner');
    expect(result.token).toBeTruthy();
    
    // Check localStorage
    expect(localStorage.getItem('token')).toBe(mockLoginResponse.token);
    expect(localStorage.getItem('user')).toContain('partner');
    expect(localStorage.getItem('role')).toBe('partner');

    // Check routing
    const route = routeByRole('partner');
    expect(route).toBe('/dashboard/partner');
  });

  it('should handle login flow for ADVERTISER role', async () => {
    const mockLoginResponse = {
      user: {
        email: '12345@gmail.com',
        role: 'ADVERTISER',
        username: 'advertiser'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZHZlcnRpc2VyIiwicm9sZSI6IkFEVkVSVElTRVIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.demo-token'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse)
    });

    const result = await login({
      email: '12345@gmail.com', 
      password: 'adv123'
    });

    expect(result.user.role).toBe('advertiser');
    const route = routeByRole('advertiser');
    expect(route).toBe('/dashboard/advertiser');
  });

  it('should handle login flow for OWNER role', async () => {
    const mockLoginResponse = {
      user: {
        email: '9791207@gmail.com',
        role: 'OWNER',
        username: 'owner'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJvd25lciIsInJvbGUiOiJPV05FUiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.demo-token'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse)
    });

    const result = await login({
      email: '9791207@gmail.com',
      password: 'owner123'
    });

    expect(result.user.role).toBe('owner');
    const route = routeByRole('owner');
    expect(route).toBe('/dashboard/owner');
  });

  it('should handle login flow for SUPER_ADMIN role', async () => {
    const mockLoginResponse = {
      user: {
        email: 'superadmin@gmail.com',
        role: 'SUPER_ADMIN',
        username: 'superadmin'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJzdXBlcmFkbWluIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.demo-token'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse)
    });

    const result = await login({
      email: 'superadmin@gmail.com',
      password: '77GeoDav='
    });

    expect(result.user.role).toBe('super_admin');
    const route = routeByRole('super_admin');
    expect(route).toBe('/dashboard/super-admin');
  });

  it('should handle logout correctly', () => {
    // Set up some data first
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ role: 'partner' }));
    localStorage.setItem('role', 'partner');

    logout();

    // Check all data is cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });

  it('should handle role normalization correctly', () => {
    // Test various role formats
    expect(routeByRole('PARTNER')).toBe('/dashboard/partner');
    expect(routeByRole('partner')).toBe('/dashboard/partner');
    expect(routeByRole('Partner')).toBe('/dashboard/partner');
    expect(routeByRole('SUPER_ADMIN')).toBe('/dashboard/super-admin');
    expect(routeByRole('super admin')).toBe('/dashboard/super-admin');
    expect(routeByRole('super_admin')).toBe('/dashboard/super-admin');
    expect(routeByRole('STAFF')).toBe('/dashboard/staff');
    expect(routeByRole('staff')).toBe('/dashboard/staff');
    expect(routeByRole(null)).toBe('/dashboard/partner'); // default fallback
    expect(routeByRole('')).toBe('/dashboard/partner'); // default fallback
  });
});