import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 5000;

/** ----- CORS ----- */
const allowed = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsMw = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization',
});

app.use(corsMw);
app.options('*', corsMw);

/** ----- body parser ----- */
app.use(express.json());

/** ----- health ----- */
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

/** ----- API: auth ----- */
app.use('/api/auth', authRouter);

/** ----- API: analytics summary (заглушка, чтобы не было 404) ----- */
app.get('/api/analytics/summary', (_req, res) => {
  res.json({
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cr: 0,
    epc: 0,
  });
});

/** ----- (опционально) раздача статики из dist/public, если она есть ----- */
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
