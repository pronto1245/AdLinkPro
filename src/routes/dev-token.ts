import { Router } from 'express';
import jwt from 'jsonwebtoken';

const r = Router();

/** POST /api/dev/dev-token — выдать временный JWT админа (если ALLOW_SEED=1) */
r.post('/dev-token', (req, res) => {
  if (process.env.ALLOW_SEED !== '1') {
    return res.status(403).json({ error: 'disabled' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

  const token = jwt.sign(
    {
      sub: 'dev-admin',
      role: 'ADMIN',
      email: process.env.SEED_EMAIL || 'admin@example.com',
      username: process.env.SEED_USERNAME || 'admin',
    },
    secret,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

export default r;
