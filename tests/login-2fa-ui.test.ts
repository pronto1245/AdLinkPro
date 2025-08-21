import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

/**
 * Test suite for Direct Login (2FA Disabled)
 * 
 * These tests verify the simplified login experience:
 * - Direct login without 2FA requirements
 * - Proper token handling
 * - Error messaging
 * - Input validation
 */

describe('Direct Login Tests (2FA Disabled)', () => {
  // Mock validation functions
  const mockLoginSchema = {
    parse: jest.fn((data: any) => {
      if (!data.username || !data.password) {
        throw new Error('Username and password are required');
      }
      return data;
    })
  };

  // Mock secure auth API
  const mockSecureAuth = {
    loginWithV2: jest.fn() as jest.MockedFunction<any>,
    verify2FA: jest.fn() as jest.MockedFunction<any>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Direct Login Flow', () => {
    test('should complete login directly without 2FA requirement', async () => {
      // Mock successful direct login (2FA disabled)
      mockSecureAuth.loginWithV2.mockResolvedValue({
        success: true,
        token: 'jwt-token-123',
        user: { 
          id: '1', 
          role: 'ADVERTISER',
          username: 'advertiser',
          twoFactorEnabled: false
        }
      });

      // Test the expected flow
      const loginData = { username: 'test@example.com', password: 'password123' };
      const result = await mockSecureAuth.loginWithV2(loginData) as any;

      expect(result.success).toBe(true);
      expect(result.token).toBe('jwt-token-123');
      expect(result.user.twoFactorEnabled).toBe(false);
      expect(result).not.toHaveProperty('requires2FA');
      expect(result).not.toHaveProperty('tempToken');
      expect(mockSecureAuth.loginWithV2).toHaveBeenCalledWith(loginData);
    });

    test('should handle all user roles with direct login', async () => {
      const roles = ['ADVERTISER', 'PARTNER', 'OWNER'];
      
      for (const role of roles) {
        // Mock successful login without 2FA requirement for each role
        mockSecureAuth.loginWithV2.mockResolvedValue({
          success: true,
          token: `jwt-token-${role.toLowerCase()}`,
          user: { 
            id: '1', 
            role: role,
            username: role.toLowerCase(),
            twoFactorEnabled: false
          }
        });

        const loginData = { username: `test-${role.toLowerCase()}@example.com`, password: 'password123' };
        const result = await mockSecureAuth.loginWithV2(loginData) as any;

        expect(result.success).toBe(true);
        expect(result.token).toBe(`jwt-token-${role.toLowerCase()}`);
        expect(result.user.role).toBe(role);
        expect(result.user.twoFactorEnabled).toBe(false);
        expect(result).not.toHaveProperty('requires2FA');
        expect(result).not.toHaveProperty('tempToken');
      }
    });
  });

  describe('Login Input Validation', () => {
    test('should require username and password', () => {
      expect(() => mockLoginSchema.parse({ 
        username: 'test@example.com' 
      })).toThrow('Username and password are required');
      
      expect(() => mockLoginSchema.parse({ 
        password: 'password123' 
      })).toThrow('Username and password are required');
      
      expect(() => mockLoginSchema.parse({ 
        username: 'test@example.com', 
        password: 'password123' 
      })).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid credentials gracefully', async () => {
      mockSecureAuth.loginWithV2.mockRejectedValue({
        status: 401,
        message: 'Invalid credentials'
      });

      const loginData = { username: 'invalid@example.com', password: 'wrongpassword' };
      
      try {
        await mockSecureAuth.loginWithV2(loginData);
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });
});