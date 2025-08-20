import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Current user endpoint
router.get('/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  
  res.json({
    id: user?.sub || user?.id,
    username: user?.username || 'user',
    email: user?.email || 'user@example.com', 
    role: user?.role || 'affiliate',
    firstName: user?.firstName || 'User',
    lastName: user?.lastName || 'Name',
    status: 'active',
    created_at: user?.iat ? new Date(user.iat * 1000).toISOString() : '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString()
  });
});

// Demo login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  
  // Super admin
  if (username === 'superadmin' && password === 'password123') {
    const payload = {
      user: { id: 1, username: 'superadmin', role: 'superadmin' },
      token: 'dev-token',
      success: true,
      message: 'ok',
      data: {
        user: { id: 1, username: 'superadmin', role: 'superadmin' },
        token: 'dev-token'
      }
    };
    return res.json(payload);
  }
  
  // Partner login
  if (username === 'partner1' && password === 'password') {
    const payload = {
      user: { id: 2, username: 'partner1', role: 'affiliate' },
      token: 'partner-token',
      success: true,
      message: 'ok',
      data: {
        user: { id: 2, username: 'partner1', role: 'affiliate' },
        token: 'partner-token'
      }
    };
    return res.json(payload);
  }
  
  // Advertiser login
  if (username === 'advertiser1' && password === 'password') {
    const payload = {
      user: { id: 3, username: 'advertiser1', role: 'advertiser' },
      token: 'advertiser-token',
      success: true,
      message: 'ok',
      data: {
        user: { id: 3, username: 'advertiser1', role: 'advertiser' },
        token: 'advertiser-token'
      }
    };
    return res.json(payload);
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
