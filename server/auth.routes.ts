import express, { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByEmail, checkPassword } from "../../src/services/users";
import { config } from "./config/environment";
import { recordFailedLogin, auditLog } from "./middleware/security";

export const authRouter = Router();
authRouter.use(express.json());

// Enhanced logging for authentication
function logAuthAttempt(req: express.Request, email: string, success: boolean, reason?: string) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  console.log(`🔐 [AUTH] ${success ? 'SUCCESS' : 'FAILED'} - ${email} from ${ip}`, {
    timestamp: new Date().toISOString(),
    email,
    success,
    reason,
    ip,
    userAgent: userAgent.substring(0, 100)
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

// Verify JWT_SECRET is properly configured
function verifyJWTSecret(): string {
  const secret = config.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (secret === 'production-safe-jwt-secret-2024-arbiconnect-platform' && config.NODE_ENV === 'production') {
    console.warn('⚠️ [AUTH] Using default JWT_SECRET in production - please set a custom JWT_SECRET');
  }
  
  return secret;
}

// FIXED: Main login endpoint now uses DATABASE authentication with bcrypt
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password, username } = req.body || {};
    
    // Support both email and username login
    const loginIdentifier = email || username;
    
    console.log(`🔐 [AUTH] Database login attempt for: ${loginIdentifier}`);
    
    if (!loginIdentifier || !password) {
      logAuthAttempt(req, loginIdentifier || 'unknown', false, 'Missing credentials');
      return res.status(400).json({ 
        error: "Email/username and password are required" 
      });
    }
    
    // Try to find user in database first
    console.log(`🔍 [AUTH] Looking up user in database: ${loginIdentifier}`);
    let user = await findUserByEmail(loginIdentifier.toLowerCase());
    
    if (!user) {
      console.log(`❌ [AUTH] User not found in database: ${loginIdentifier}`);
      
      // FALLBACK: If user not in database, try hardcoded users for development
      const hardcodedUsers = [
        {
          id: 'owner-1',
          email: process.env.OWNER_EMAIL || "9791207@gmail.com",
          password: process.env.OWNER_PASSWORD || "owner123",
          role: "OWNER",
          username: "owner",
          passwordHash: null
        },
        {
          id: 'adv-1',
          email: process.env.ADVERTISER_EMAIL || "12345@gmail.com", 
          password: process.env.ADVERTISER_PASSWORD || "adv123",
          role: "ADVERTISER",
          username: "advertiser",
          passwordHash: null
        },
        {
          id: 'partner-1',
          email: process.env.PARTNER_EMAIL || "4321@gmail.com",
          password: process.env.PARTNER_PASSWORD || "partner123",
          role: "PARTNER",
          username: "partner",
          passwordHash: null
        },
      ];
      
      const hardcodedUser = hardcodedUsers.find(u => 
        u.email.toLowerCase() === loginIdentifier.toLowerCase() ||
        u.username.toLowerCase() === loginIdentifier.toLowerCase()
      );
      
      if (hardcodedUser && hardcodedUser.password === password) {
        console.log(`⚠️ [AUTH] Using hardcoded user authentication (database fallback): ${hardcodedUser.email}`);
        
        const secret = verifyJWTSecret();
        const token = jwt.sign(
          { sub: hardcodedUser.id, role: hardcodedUser.role, email: hardcodedUser.email, username: hardcodedUser.username },
          secret as jwt.Secret,
          { expiresIn: config.JWT_EXPIRES_IN || "7d" }
        );
        
        logAuthAttempt(req, loginIdentifier, true, 'Hardcoded user fallback');
        return res.json({ 
          token, 
          user: {
            id: hardcodedUser.id,
            email: hardcodedUser.email,
            role: hardcodedUser.role,
            username: hardcodedUser.username
          }
        });
      }
      
      logAuthAttempt(req, loginIdentifier, false, 'User not found');
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }
    
    console.log(`✅ [AUTH] User found in database:`, {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      hasPasswordHash: !!user.passwordHash
    });
    
    // Check password using bcrypt for database users
    console.log(`🔑 [AUTH] Checking password with bcrypt for user: ${user.email}`);
    const passwordValid = await checkPassword(user, password);
    
    if (!passwordValid) {
      console.log(`❌ [AUTH] Invalid password for user: ${user.email}`);
      logAuthAttempt(req, loginIdentifier, false, 'Invalid password');
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }
    
    console.log(`✅ [AUTH] Password valid for user: ${user.email}`);
    
    try {
      const secret = verifyJWTSecret();
      
      const token = jwt.sign(
        { sub: user.id, role: user.role, email: user.email, username: user.username },
        secret as jwt.Secret,
        { expiresIn: config.JWT_EXPIRES_IN || "7d" }
      );
      
      console.log(`✅ [AUTH] JWT token generated successfully for user: ${user.email}`);
      logAuthAttempt(req, loginIdentifier, true);
      
      return res.json({ 
        token, 
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
          twoFactorEnabled: user.twoFactorEnabled || false
        }
      });
    } catch (error) {
      console.error('JWT signing error:', error);
      logAuthAttempt(req, loginIdentifier, false, 'JWT signing error');
      return res.status(500).json({ error: "Authentication service error" });
    }
    
  } catch (error) {
    console.error(`💥 [AUTH] Login error:`, error);
    logAuthAttempt(req, req.body?.email || req.body?.username || 'unknown', false, 'Internal error');
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
});

// Add register endpoint for testing
authRouter.post("/register", (req, res) => {
  const { email, password, role = "PARTNER" } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  
  // This is a placeholder - in production you'd save to database with bcrypt
  console.log(`📝 [AUTH] Registration attempt (placeholder): ${email}`);
  
  try {
    const secret = verifyJWTSecret();
    
    const newUser = {
      email,
      password, // In production, this would be hashed
      role: role.toUpperCase(),
      sub: `${role.toLowerCase()}-${Date.now()}`,
      username: email.split('@')[0],
    };
    
    const token = jwt.sign(
      { sub: newUser.sub, role: newUser.role, email: newUser.email, username: newUser.username },
      secret as jwt.Secret,
      { expiresIn: config.JWT_EXPIRES_IN || "7d" }
    );
    
    return res.json({ token, user: newUser });
  } catch (error) {
    console.error('JWT signing error:', error);
    return res.status(500).json({ error: "Authentication service error" });
  }
});

// Add dev-token endpoint for testing
authRouter.post("/dev-token", (req, res) => {
  if (config.NODE_ENV === 'production') {
    return res.status(403).json({ error: "dev-token not available in production" });
  }
  
  try {
    const secret = verifyJWTSecret();
    
    const token = jwt.sign(
      { 
        sub: 'dev-admin', 
        role: 'ADMIN', 
        email: 'dev@example.com', 
        username: 'dev-admin' 
      },
      secret as jwt.Secret,
      { expiresIn: "7d" }
    );
    
    return res.json({ token });
  } catch (error) {
    console.error('JWT signing error:', error);
    return res.status(500).json({ error: "Authentication service error" });
  }
});
