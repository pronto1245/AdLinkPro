import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import authRouter from './routes/auth';
import analyticsRouter from './routes/analytics';
import affiliateRouter from './routes/affiliate';
import advertiserRouter from './routes/advertiser';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// CORS: разрешаем Netlify
const allowed = (process.env.CORS_ORIGIN || 'https://adlinkpro.netlify.app')
  .split(',')
  .map(s => s.trim());

const corsMw = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: false,
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization',
});

// ВАЖНО: порядок
app.use(express.json());
app.use(corsMw);
app.options('*', corsMw);

// health
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// API
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api/advertiser', advertiserRouter);

// опционально — статика, если когда-то положим фронт внутрь образа
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
