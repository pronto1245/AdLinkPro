import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

// --- routers ---
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import analyticsRouter from './routes/analytics';
import analyticsEnhancedRouter from './routes/analytics-enhanced';
import postbackRouter from './routes/postback';
import postbacksRouter from './routes/postbacks';
import conversionRouter from './routes/conversion';
import trackingRouter from './routes/tracking';
import telegramRouter from './routes/telegram';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// --- CORS (из переменных окружения) ---
const allowed = process.env.CORS_ORIGIN?.split(',').map(s => s.trim());
const corsMw = cors({
  origin: allowed || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization',
});
app.use(express.json());
app.use(corsMw);
app.options('*', corsMw);

// --- health ---
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// --- API: монтируем всё ---
// auth уже работает как /api/auth/login — оставляем
app.use('/api', authRouter);

// admin и прочие по /api/*
app.use('/api', adminRouter);
app.use('/api', postbackRouter);
app.use('/api', postbacksRouter);
app.use('/api', conversionRouter);
app.use('/api', trackingRouter);
app.use('/api', telegramRouter);

// analytics: ДВА маунта чтобы гарантировать путь /api/analytics/summary
// 1) если в роутере пути объявлены как '/analytics/...'
app.use('/api', analyticsRouter);
// 2) если в роутере пути объявлены как '/summary', '/events', и т.п.
app.use('/api/analytics', analyticsRouter);

// analytics-enhanced — аналогично
app.use('/api', analyticsEnhancedRouter);
app.use('/api/analytics-enhanced', analyticsEnhancedRouter);

// --- static SPA из dist/public (если фронт собран внутрь образа) ---
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
