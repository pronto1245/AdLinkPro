import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5000);
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
}).on('error', (e) => {
  console.error('PG pool error:', e);
});

// ---- CORS ----
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
const CREDENTIALS = String(process.env.CORS_CREDENTIALS || '').toLowerCase() === 'true';

const corsMw = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes('*')) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: Origin not allowed'));
  },
  credentials: CREDENTIALS,
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization',
});

app.use(express.json());
app.use(corsMw);
app.options('*', corsMw);

// health
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// API
app.use('/api', authRouter);

// static SPA из dist/public (если фронт собран внутрь образа)
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
