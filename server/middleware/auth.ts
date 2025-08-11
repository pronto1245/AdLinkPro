import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    ownerId?: string;
  };
}

// Удален старый authMiddleware - используем только authenticateToken

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Главный middleware для аутентификации
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('🚨🚨🚨 MAIN AUTH MIDDLEWARE CALLED 🚨🚨🚨');
  console.log('=== AUTHENTICATING TOKEN (DEBUG MODE) ===');
  console.log('Request method:', req.method, 'URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Auth header present:', !!authHeader);
  console.log('Auth header value:', authHeader);
  console.log('Token present:', !!token);
  if (token) {
    console.log('Token first 20 chars:', token.substring(0, 20) + '...');
    console.log('Token full length:', token.length);
  }

  if (!token) {
    console.log('No token provided - returning 401');
    res.setHeader('X-Auth-Error', 'token-missing');
    res.status(401).json({ error: 'Authentication required', code: 'TOKEN_MISSING' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('JWT decoded successfully:', decoded);
    console.log('JWT_SECRET used for verification:', JWT_SECRET);
    
    const userId = decoded.userId || decoded.id;
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('No userId found in token - returning 403');
      res.sendStatus(403);
      return;
    }
    
    const user = await storage.getUser(userId);
    console.log('User lookup result:', user ? `Found: ${user.username}` : 'Not found');
    
    if (!user) {
      console.log('User not found for ID:', userId, '- returning 403');
      res.sendStatus(403);
      return;
    }
    
    console.log('User authenticated successfully:', user.username, 'Role:', user.role);
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId
    };
    console.log('=== AUTH MIDDLEWARE SUCCESS ===');
    next();
  } catch (error) {
    console.log('JWT verification error:', error);
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('=== AUTH MIDDLEWARE FAILED ===');
    res.sendStatus(403);
  }
};

export const getAuthenticatedUser = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
};