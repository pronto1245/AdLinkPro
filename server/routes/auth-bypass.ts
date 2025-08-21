import { Router, json } from 'express';
const jwt = require('jsonwebtoken');

const router = Router();
router.use(json());

router.post('/login', (req, res) => {
  const body = (req as any).body || {};
  const sub = body.userId || body.email || body.username || '1';
  const token = jwt.sign({ sub }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.json({ token, user: { sub } });
});

router.post('/2fa/verify', (_req, res) => {
  const sub = '1';
  const token = jwt.sign({ sub }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.json({ token, user: { sub } });
});

export default router;
