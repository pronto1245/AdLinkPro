import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import authRouter from './routes/auth';
import partnerRouter from './routes/partner';
import notificationsRouter from './routes/notifications';

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

// --- API ---
app.use('/api', authRouter);           // /api/auth/*
app.use('/api', partnerRouter);        // /api/partner/*
app.use('/api', notificationsRouter);  // /api/notifications

// --- (опционально) статика SPA, если когда-то кладёшь фронт внутрь образа ---
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
