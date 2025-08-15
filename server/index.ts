import { devLoginRouter } from "./dev.login";
import { authRouter } from "./auth.routes";
import { registerDevRoutes } from "./dev-routes";
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import authRouter from './routes/auth';

const app = express();
// mount dev login BEFORE other routers
app.use("/api/dev", devLoginRouter);
app.use("/api/auth", devLoginRouter); // alias: /api/auth/login
app.use("/api/dev", devLoginRouter);
app.use("/api/auth", authRouter);
registerDevRoutes(app);
const PORT = process.env.PORT || 5000;

// --- CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://adlinkpro.netlify.app',
];
const corsMw = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
});
app.use(express.json());
app.use(corsMw);
app.options('*', corsMw);

// --- Health ---
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// --- API: логин
app.use('/api', authRouter);

// --- простая проверка токена для стабов ---
function requireAuth(req: any, res: any, next: any) {
  const h = String(req.headers.authorization || '');
  if (!h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

// --- СТАБЫ, чтобы фронт не падал ---
app.get('/api/partner/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      { id: 101, name: 'Test Offer A', payout: 10, status: 'active' },
      { id: 102, name: 'Test Offer B', payout: 15, status: 'paused' },
    ],
  });
});

app.get('/api/partner/dashboard', requireAuth, (_req, res) => {
  res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0, cr: 0, epc: 0 });
});

app.get('/api/partner/finance/summary', requireAuth, (_req, res) => {
  res.json({ balance: 0, pending: 0, paid: 0, currency: 'USD' });
});

app.get('/api/notifications', requireAuth, (_req, res) => {
  res.json({ items: [] });
});

// --- статика SPA если вдруг положишь фронт внутрь образа ---
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
// @ts-nocheck
/* === DEV AUTH HELPERS (inline v3) === */
;(() => {
  const setup = async () => {
    try {
      try { app.use(require('express').json()); } catch(e) {}
      let jwt; try { jwt = require('jsonwebtoken'); } catch(e) { try { jwt = (await import('jsonwebtoken')).default; } catch(e2) { jwt = await import('jsonwebtoken'); } }
      if (process.env.ALLOW_SEED === '1') {
        app.post('/api/dev/dev-token', (req,res) => {
          const secret = process.env.JWT_SECRET;
          if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
          const token = jwt.sign({ sub:'dev-admin', role:'ADMIN', email: process.env.SEED_EMAIL || 'admin@example.com', username: process.env.SEED_USERNAME || 'admin' }, secret, { expiresIn: '7d' });
          res.json({ token });
        });
      }
      app.get('/api/me', (req,res) => {
        try {
          const h = req.headers.authorization || '';
          const token = h.split(' ')[1];
          if (!token) return res.status(401).json({ error:'no token' });
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          res.json({ id: payload.sub, role: payload.role, email: payload.email, username: payload.username });
        } catch(e) {
          res.status(401).json({ error:'invalid token' });
        }
      });
    } catch (e) { try { console.error('dev-auth inline error', e && e.message ? e.message : e); } catch(_) {} }
  };
  setup();
})();
/* === /DEV AUTH HELPERS === */
