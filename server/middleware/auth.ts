import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

import { config } from '../config/environment.js';
const JWT_SECRET = config.JWT_SECRET;

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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required', code: 'TOKEN_MISSING' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      res.sendStatus(403);
      return;
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      res.sendStatus(403);
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
    console.error('JWT verification failed:', error.message);
    res.sendStatus(403);
  }
};

export const getAuthenticatedUser = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
};