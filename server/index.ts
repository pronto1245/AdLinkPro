import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// CORS (разрешаем Netlify-домен)
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

// Порядок посредников критичен
app.use(express.json());
app.use(corsMw);
app.options('*', corsMw);

// health
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// API
app.use('/api/auth', authRouter);

// (опционально) статика, если когда-то положим фронт в образ Docker
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
