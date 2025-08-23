import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail, checkPassword } from '../../src/services/users';
// import { config } from "../config/environment";
import { recordFailedLogin, auditLog } from '../middleware/security';

// Get environment config safely
const getConfig = () => ({
  JWT_SECRET: process.env.JWT_SECRET || 'production-safe-jwt-secret-2024-arbiconnect-platform',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
});

export const authFixedRouter = Router();
authFixedRouter.use(express.json());

/**
 * @swagger
 * /api/auth/fixed/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Enhanced logging for authentication
function logAuthAttempt(req: Request, email: string, success: boolean, reason?: string) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  console.log(`🔐 [AUTH] ${success ? 'SUCCESS' : 'FAILED'} - ${email} from ${ip}`, {
    timestamp: new Date().toISOString(),
    email,
    success,
    reason,
    ip,
    userAgent: userAgent.substring(0, 100) // truncate for readability
  });

  // Audit log
  auditLog(req, success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED', undefined, success, {
    email,
    reason,
    ip,
    userAgent: userAgent.substring(0, 100)
  });

  // Record failed login for rate limiting
  if (!success) {
    recordFailedLogin(req);
  }
}

// Main login endpoint with proper database authentication
authFixedRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body || {};

    // Support both email and username login
    const loginIdentifier = email || username;

    console.log(`🔐 [AUTH] Login attempt for: ${loginIdentifier}`);

    if (!loginIdentifier || !password) {
      logAuthAttempt(req, loginIdentifier || 'unknown', false, 'Missing credentials');
      return res.status(400).json({
        error: 'Email/username and password are required'
      });
    }

    // First try to find user in database
    console.log(`🔍 [AUTH] Looking up user in database: ${loginIdentifier}`);
    const user = await findUserByEmail(loginIdentifier.toLowerCase());

    if (!user) {
      console.log(`❌ [AUTH] User not found in database: ${loginIdentifier}`);
      logAuthAttempt(req, loginIdentifier, false, 'User not found');
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.log(`✅ [AUTH] User found in database:`, {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      hasPasswordHash: !!user.passwordHash
    });

    // Check password using bcrypt
    console.log(`🔑 [AUTH] Checking password for user: ${user.email}`);
    const passwordValid = await checkPassword(user, password);

    if (!passwordValid) {
      console.log(`❌ [AUTH] Invalid password for user: ${user.email}`);
      logAuthAttempt(req, loginIdentifier, false, 'Invalid password');
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.log(`✅ [AUTH] Password valid for user: ${user.email}`);

    // Verify JWT_SECRET configuration
    const config = getConfig();
    const secret = config.JWT_SECRET;
    if (!secret) {
      console.error(`❌ [AUTH] JWT_SECRET not configured`);
      logAuthAttempt(req, loginIdentifier, false, 'JWT_SECRET missing');
      return res.status(500).json({
        error: 'Authentication service error'
      });
    }

    console.log(`🔐 [AUTH] Generating JWT token for user: ${user.email}`);

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
        username: user.username
      },
      secret as jwt.Secret,
      { expiresIn: config.JWT_EXPIRES_IN as string }
    );

    console.log(`✅ [AUTH] JWT token generated successfully for user: ${user.email}`);
    logAuthAttempt(req, loginIdentifier, true);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled || false
      }
    });

  } catch (error) {
    console.error(`💥 [AUTH] Login error:`, error);
    logAuthAttempt(req, req.body?.email || req.body?.username || 'unknown', false, 'Internal error');
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Test endpoint to check if user exists
authFixedRouter.post('/check-user', async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`🔍 [AUTH] Checking if user exists: ${email}`);
    const user = await findUserByEmail(email.toLowerCase());

    return res.json({
      exists: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        hasPasswordHash: !!user.passwordHash,
        twoFactorEnabled: user.twoFactorEnabled || false
      } : null
    });

  } catch (error) {
    console.error(`💥 [AUTH] Check user error:`, error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Test endpoint to create user with hashed password
authFixedRouter.post('/create-test-user', async (req: Request, res: Response) => {
  const config = getConfig();

  // Only allow in development
  if (config.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  try {
    const { email, password, username, role = 'PARTNER' } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`👤 [AUTH] Creating test user: ${email}`);

    // Check if user already exists
    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // This is a test endpoint - in a real implementation you'd save to database
    console.log(`✅ [AUTH] Test user would be created:`, {
      email: email.toLowerCase(),
      username: username || email.split('@')[0],
      role: role.toUpperCase(),
      passwordHash: hashedPassword.substring(0, 20) + '...' // truncated for logs
    });

    return res.json({
      message: 'Test user creation simulated (database integration required)',
      user: {
        email: email.toLowerCase(),
        username: username || email.split('@')[0],
        role: role.toUpperCase(),
        hashedPassword: hashedPassword.substring(0, 20) + '...'
      }
    });

  } catch (error) {
    console.error(`💥 [AUTH] Create test user error:`, error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default authFixedRouter;
