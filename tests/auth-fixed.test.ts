import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';

// Mock the middleware and database functions before importing the router
jest.mock('../server/middleware/security', () => ({
  recordFailedLogin: jest.fn(),
  auditLog: jest.fn()
}));

jest.mock('../src/services/users', () => ({
  findUserByEmail: jest.fn(),
  checkPassword: jest.fn()
}));

// Import the router after mocking
import authFixedRouter from '../server/routes/auth-fixed';

// Create test app with fixed auth
function createFixedAuthTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth/fixed', authFixedRouter);
  return app;
}

// Set up environment
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-authentication-tests';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  delete process.env.JWT_SECRET;
  delete process.env.NODE_ENV;
});

describe('Fixed Authentication System', () => {
  
  describe('User 9791207@gmail.com Authentication', () => {
    
    it('should successfully authenticate user with correct password using bcrypt', async () => {
      // Mock user data
      const mockUser = {
        id: '1',
        email: '9791207@gmail.com',
        username: 'owner',
        role: 'OWNER',
        passwordHash: await bcrypt.hash('owner123', 12),
        twoFactorEnabled: false
      };
      
      // Mock database functions
      const { findUserByEmail, checkPassword } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (checkPassword as jest.Mock).mockImplementation(async (user: any, password: string) => {
        return bcrypt.compare(password, user.passwordHash);
      });
      
      const app = createFixedAuthTestApp();
      
      const response = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: '9791207@gmail.com',
          password: 'owner123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('9791207@gmail.com');
      expect(response.body.user.role).toBe('OWNER');
      
      // Verify JWT token
      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe('9791207@gmail.com');
      expect(decoded.role).toBe('OWNER');
    });

    it('should reject authentication with wrong password', async () => {
      const mockUser = {
        id: '1',
        email: '9791207@gmail.com',
        username: 'owner',
        role: 'OWNER',
        passwordHash: await bcrypt.hash('owner123', 12),
        twoFactorEnabled: false
      };
      
      const { findUserByEmail, checkPassword } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (checkPassword as jest.Mock).mockImplementation(async (user: any, password: string) => {
        return bcrypt.compare(password, user.passwordHash);
      });
      
      const app = createFixedAuthTestApp();
      
      const response = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: '9791207@gmail.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should reject authentication for non-existent user', async () => {
      const { findUserByEmail } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(null);
      
      const app = createFixedAuthTestApp();
      
      const response = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: 'nonexistent@gmail.com',
          password: 'anypassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should require both email and password', async () => {
      const app = createFixedAuthTestApp();
      
      const responseNoEmail = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          password: 'owner123'
        });

      expect(responseNoEmail.status).toBe(400);
      expect(responseNoEmail.body.error).toBe('Email/username and password are required');

      const responseNoPassword = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: '9791207@gmail.com'
        });

      expect(responseNoPassword.status).toBe(400);
      expect(responseNoPassword.body.error).toBe('Email/username and password are required');
    });

    it('should check if user exists using check-user endpoint', async () => {
      const mockUser = {
        id: '1',
        email: '9791207@gmail.com',
        username: 'owner',
        role: 'OWNER',
        passwordHash: 'hashed_password',
        twoFactorEnabled: false
      };
      
      const { findUserByEmail } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      
      const app = createFixedAuthTestApp();
      
      const response = await request(app)
        .post('/api/auth/fixed/check-user')
        .send({
          email: '9791207@gmail.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.exists).toBe(true);
      expect(response.body.user).toEqual({
        id: '1',
        email: '9791207@gmail.com',
        username: 'owner',
        role: 'OWNER',
        hasPasswordHash: true,
        twoFactorEnabled: false
      });
    });

  });

  describe('Authentication Logging and Security', () => {
    
    it('should log authentication attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockUser = {
        id: '1',
        email: '9791207@gmail.com',
        username: 'owner',
        role: 'OWNER',
        passwordHash: await bcrypt.hash('owner123', 12),
        twoFactorEnabled: false
      };
      
      const { findUserByEmail, checkPassword } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (checkPassword as jest.Mock).mockImplementation(async (user: any, password: string) => {
        return bcrypt.compare(password, user.passwordHash);
      });
      
      const app = createFixedAuthTestApp();
      
      await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: '9791207@gmail.com',
          password: 'owner123'
        });

      // Check that logging occurred
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] Login attempt for: 9791207@gmail.com')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User found in database:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] Password valid for user: 9791207@gmail.com')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle JWT_SECRET missing gracefully', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const mockUser = {
        id: '1',
        email: '9791207@gmail.com',
        username: 'owner',
        role: 'OWNER',
        passwordHash: await bcrypt.hash('owner123', 12),
        twoFactorEnabled: false
      };
      
      const { findUserByEmail, checkPassword } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (checkPassword as jest.Mock).mockImplementation(async (user: any, password: string) => {
        return bcrypt.compare(password, user.passwordHash);
      });
      
      const app = createFixedAuthTestApp();
      
      const response = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: '9791207@gmail.com',
          password: 'owner123'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Authentication service error');
      
      process.env.JWT_SECRET = originalSecret;
    });

  });

  describe('Password Security', () => {
    
    it('should use bcrypt for password verification', async () => {
      const testPassword = 'securepassword123';
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
        passwordHash: hashedPassword,
        twoFactorEnabled: false
      };
      
      const { findUserByEmail, checkPassword } = await import('../src/services/users');
      (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (checkPassword as jest.Mock).mockImplementation(async (user: any, password: string) => {
        return bcrypt.compare(password, user.passwordHash);
      });
      
      const app = createFixedAuthTestApp();
      
      const response = await request(app)
        .post('/api/auth/fixed/login')
        .send({
          email: 'test@example.com',
          password: testPassword
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      // Verify that checkPassword was called with correct parameters
      expect(checkPassword).toHaveBeenCalledWith(mockUser, testPassword);
    });

  });

});