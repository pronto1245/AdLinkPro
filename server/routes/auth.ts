import { Router } from 'express';

const router = Router();

// Демо-логин
router.post('/auth/login', (req, res) => {
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
