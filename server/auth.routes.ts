import express, { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config/environment";

export const authRouter = Router();
authRouter.use(express.json());

// Verify JWT_SECRET is properly configured
function verifyJWTSecret(): string {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (config.JWT_SECRET === 'production-safe-jwt-secret-2024-arbiconnect-platform' && config.NODE_ENV === 'production') {
    console.warn('⚠️ [AUTH] Using default JWT_SECRET in production - please set a custom JWT_SECRET');
  }
  
  return config.JWT_SECRET;
}

const users = [
  {
    email: process.env.OWNER_EMAIL || "9791207@gmail.com",
    password: process.env.OWNER_PASSWORD || "owner123",
    role: "OWNER",
    sub: "owner-1",
    username: "owner",
  },
  {
    email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",
    password: process.env.ADVERTISER_PASSWORD || "adv123",
    role: "ADVERTISER",
    sub: "adv-1",
    username: "advertiser",
  },
  {
    email: process.env.PARTNER_EMAIL || "4321@gmail.com",
    password: process.env.PARTNER_PASSWORD || "partner123",
    role: "PARTNER",
    sub: "partner-1",
    username: "partner",
  },
  {
    email: process.env.SUPER_ADMIN_EMAIL || "superadmin@gmail.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "77GeoDav=",
    role: "SUPER_ADMIN",
    sub: "super-admin-1",
    username: "super_admin",
  },
  {
    email: process.env.AFFILIATE_EMAIL || "pablota096@gmail.com",
    password: process.env.AFFILIATE_PASSWORD || "7787877As",
    role: "AFFILIATE",
    sub: "affiliate-1",
    username: "affiliate",
  },
];

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  
  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  
  try {
    const secret = verifyJWTSecret();
    
    const token = jwt.sign(
      { sub: user.sub, role: user.role, email: user.email, username: user.username },
      secret,
      { expiresIn: config.JWT_EXPIRES_IN || "7d" }
    );
    
    return res.json({ 
      token, 
      user: {
        email: user.email,
        role: user.role,
        username: user.username,
        sub: user.sub
      }
    });
  } catch (error) {
    console.error('JWT signing error:', error);
    return res.status(500).json({ error: "Authentication service error" });
  }
});

// Add register endpoint for testing
authRouter.post("/register", (req, res) => {
  const { email, password, role = "PARTNER" } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: "user already exists" });
  }
  
  try {
    const secret = verifyJWTSecret();
    
    const newUser = {
      email,
      password,
      role: role.toUpperCase(),
      sub: `${role.toLowerCase()}-${Date.now()}`,
      username: email.split('@')[0],
    };
    
    const token = jwt.sign(
      { sub: newUser.sub, role: newUser.role, email: newUser.email, username: newUser.username },
      secret,
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
      secret,
      { expiresIn: "7d" }
    );
    
    return res.json({ token });
  } catch (error) {
    console.error('JWT signing error:', error);
    return res.status(500).json({ error: "Authentication service error" });
  }
});
