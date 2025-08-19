import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get current user info
router.get('/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user?.id || user?.sub,
    username: user?.username || user?.email,
    email: user?.email,
    role: user?.role || 'user',
    permissions: user?.permissions || [],
    profile: {
      name: user?.name || 'Demo User',
      company: user?.company || 'Demo Company'
    },
    settings: {
      language: 'en',
      timezone: 'UTC',
      notifications: true
    },
    lastLogin: new Date().toISOString()
  });
});

// Демо-логин
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  // супер-админ
  if (username === 'superadmin' && password === 'password123') {
    const payload = {
      user: { id: 1, username: 'superadmin', role: 'superadmin' },
      token: 'dev-token', // фронту всё равно — он шлёт Bearer как строку
      success: true,
      message: 'ok',
      data: {
        user: { id: 1, username: 'superadmin', role: 'superadmin' },
        token: 'dev-token'
      }
    };
    return res.json(payload);
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
