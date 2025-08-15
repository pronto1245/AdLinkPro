import * as jwt from 'jsonwebtoken';
import type { Express, Request, Response } from 'express';

export function registerDevRoutes(app: Express) {
  try { app.use(require('express').json()); } catch {}

  if (process.env.ALLOW_SEED === '1') {
    app.post('/api/dev/dev-token', (req: Request, res: Response) => {
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
      const token = (jwt as any).sign(
        { sub: 'dev-admin', role: 'ADMIN', email: process.env.SEED_EMAIL || 'admin@example.com', username: process.env.SEED_USERNAME || 'admin' },
        secret as any, { expiresIn: '7d' }
      );
      return res.json({ token });
    });
  }

  app.get('/api/me', (req: Request, res: Response) => {
    try {
      const h = req.headers.authorization || '';
      const token = h.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'no token' });
      const payload: any = (jwt as any).verify(token, process.env.JWT_SECRET as any);
      return res.json({ id: payload.sub, role: payload.role, email: payload.email, username: payload.username });
    } catch {
      return res.status(401).json({ error: 'invalid token' });
    }
  });
}
