import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

// FIXED: Updated routes to use /login instead of /auth/login
// This ensures correct paths: POST /api/auth/login and POST /api/auth/register
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await checkPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // FIXED: Remove all 2FA logic - login flow now directly returns token and user
    // No more requires2FA, tempToken, or 2faSecret checks
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET missing' });
    }

    const token = jwt.sign(
      { 
        sub: user.id, 
        role: user.role, 
        email: user.email, 
        username: user.username 
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// FIXED: Updated routes to use /register instead of /auth/register  
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username, role = 'partner' } = req.body || {};
  
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  try {
    // Basic registration logic - in production this would create user in database
    // For now, return success response to match expected API behavior
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET missing' });
    }

    // Mock user creation - replace with actual database logic
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      role,
    };

    const token = jwt.sign(
      { 
        sub: newUser.id, 
        role: newUser.role, 
        email: newUser.email, 
        username: newUser.username 
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({ 
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// REMOVED: All 2FA routes (/2fa/verify, /2fa/setup) have been eliminated
// No more 2FA-related endpoints as per requirements

export { router as authV2Router };