import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    ownerId?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from storage
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

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

// Экспортируем функции для совместимости с другими файлами
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('=== AUTHENTICATING TOKEN ===');
  console.log('Request method:', req.method, 'URL:', req.url);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Auth header present:', !!authHeader);
  console.log('Token present:', !!token);
  if (token) {
    console.log('Token first 20 chars:', token.substring(0, 20) + '...');
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