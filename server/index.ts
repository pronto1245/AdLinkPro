import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import authRouter from './routes/auth'; // логин уже работает

const app = express();
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

// --- ПРОСТЕЙШАЯ ПРОВЕРКА ТОКЕНА ДЛЯ СТАБОВ ---
function requireAuth(req: any, res: any, next: any) {
  const h = String(req.headers.authorization || '');
  if (!h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

// --- СТАБЫ ДЛЯ ПАРТНЁРА / УВЕДОМЛЕНИЙ (чтобы не было 404) ---
app.get('/api/partner/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      { id: 101, name: 'Test Offer A', payout: 10, status: 'active' },
      { id: 102, name: 'Test Offer B', payout: 15, status: 'paused' },
    ],
  });
});

app.get('/api/partner/dashboard', requireAuth, (_req, res) => {
  res.json({
    clicks: 0, conversions: 0, revenue: 0,
    ctr: 0, cr: 0, epc: 0,
  });
});

app.get('/api/partner/finance/summary', requireAuth, (_req, res) => {
  res.json({ balance: 0, pending: 0, paid: 0, currency: 'USD' });
});

app.get('/api/notifications', requireAuth, (_req, res) => {
  res.json({ items: [] });
});

// --- (опционально) статика SPA если когда-то положишь фронт в образ ---
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
