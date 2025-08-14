import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRouter from './routes/auth';

const PORT = Number(process.env.PORT || 5000);
const app = express();

// --- CORS ---
const allowed = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim());

const corsMw = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl / сервер-сервер
    if (allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
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

// Статика SPA из dist/public (если когда-нибудь соберём фронт в образ)
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) =>
    res.sendFile(path.join(publicDir, 'index.html'))
  );
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
