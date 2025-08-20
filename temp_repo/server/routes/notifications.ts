import { Router } from 'express';

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

router.get('/notifications', requireAuth, (_req, res) => {
  res.json({ items: [] });
});

export default router;
