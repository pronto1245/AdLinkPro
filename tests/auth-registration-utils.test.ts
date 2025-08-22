import { validateJWTFormat } from '../server/utils/errorHandler';
import { validateRegistrationJWT, validateRegistrationData, generateUsername } from '../server/utils/registrationHelpers';

// Mock the schema import to avoid dependency issues during testing
jest.mock('@shared/schema', () => ({}));

// Mock the security middleware
jest.mock('../server/middleware/security', () => ({
  auditLog: jest.fn()
}));

describe('Enhanced Authentication and Registration Utils', () => {
  
  describe('JWT Format Validation', () => {
    it('should reject empty tokens', () => {
      const result = validateJWTFormat('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Token is missing');
    });

    it('should reject tokens with incorrect part count', () => {
      const result = validateJWTFormat('invalid.token');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Token must have 3 parts separated by dots');
    });

    it('should reject tokens with invalid base64url encoding', () => {
      const result = validateJWTFormat('invalid+base64.invalid+base64.invalid+base64');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('not valid base64url'))).toBe(true);
    });

    it('should reject tokens that are too short', () => {
      const result = validateJWTFormat('a.b.c');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Token is too short (min 20 characters)');
    });

    it('should accept valid JWT format', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = validateJWTFormat(validToken);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject tokens that are too long', () => {
      const longToken = 'a'.repeat(3000) + '.' + 'b'.repeat(3000) + '.' + 'c'.repeat(3000);
      const result = validateJWTFormat(longToken);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Token is too long (max 8192 characters)');
    });
  });

  describe('Registration JWT Validation', () => {
    it('should validate JWT structure more thoroughly', () => {
      const invalidToken = 'header+invalid.payload+invalid.signature+invalid';
      const result = validateRegistrationJWT(invalidToken);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('not valid base64url'))).toBe(true);
    });

    it('should check for required JWT header fields', () => {
      // Create a token with missing header fields
      const header = Buffer.from(JSON.stringify({})).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ sub: '123', exp: Date.now() / 1000 + 3600 })).toString('base64url');
      const signature = 'signature';
      const token = `${header}.${payload}.${signature}`;
      
      const result = validateRegistrationJWT(token);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('JWT header missing required fields (alg, typ)');
    });

    it('should check for required JWT payload fields', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({})).toString('base64url');
      const signature = 'signature';
      const token = `${header}.${payload}.${signature}`;
      
      const result = validateRegistrationJWT(token);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('JWT payload missing user identifier (sub or id)');
      expect(result.errors).toContain('JWT payload missing expiration time (exp)');
    });

    it('should accept valid JWT with proper structure', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ 
        sub: '12345', 
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'PARTNER' 
      })).toString('base64url');
      const signature = 'valid_signature_here';
      const token = `${header}.${payload}.${signature}`;
      
      const result = validateRegistrationJWT(token);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Registration Data Validation', () => {
    it('should require valid email', () => {
      const data = { password: 'password123' };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required and must be a string');
    });

    it('should validate email format', () => {
      const data = { email: 'invalid-email', password: 'password123', name: 'John Doe' };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email format is invalid');
    });

    it('should require password with minimum length', () => {
      const data = { email: 'test@example.com', password: '123' };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });

    it('should require either name or firstName/lastName', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Either name or both firstName and lastName are required');
    });

    it('should validate role if provided', () => {
      const data = { 
        email: 'test@example.com', 
        password: 'password123', 
        name: 'John Doe',
        role: 'INVALID_ROLE' 
      };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid role specified');
    });

    it('should accept valid registration data with name', () => {
      const data = { 
        email: 'test@example.com', 
        password: 'password123', 
        name: 'John Doe',
        role: 'PARTNER' 
      };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid registration data with firstName/lastName', () => {
      const data = { 
        email: 'test@example.com', 
        password: 'password123', 
        firstName: 'John',
        lastName: 'Doe'
      };
      const result = validateRegistrationData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Username Generation', () => {
    it('should generate username from email', () => {
      const username = generateUsername('john.doe@example.com');
      expect(username).toMatch(/^johndoe\d{4}$/);
    });

    it('should handle special characters in email', () => {
      const username = generateUsername('user+tag@example.com');
      expect(username).toMatch(/^usertag\d{4}$/);
    });

    it('should handle email with numbers', () => {
      const username = generateUsername('user123@example.com');
      expect(username).toMatch(/^user123\d{4}$/);
    });
  });
});