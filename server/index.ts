import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import partnerRouter from './routes/partner';
import affiliateRouter from './routes/affiliate';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());

const origins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : '*', credentials: true }));
app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Register the enhanced partner and affiliate routes
app.use('/api', partnerRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, where: 'server/index.ts' });
});

app.get('/api/me', (req, res) => {
  try {
    const h = String(req.headers['authorization'] || '');
    const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!raw) return res.status(401).json({ error: 'no token' });
    const p: any = jwt.verify(raw, process.env.JWT_SECRET || 'dev-secret');
    const role = String(p.role || '').toLowerCase();
    res.json({ id: p.sub || null, username: p.username || null, email: p.email || null, role });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

const PORT = Number(process.env.PORT) || 5050;

app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
  console.log(`📡 Enhanced partner/affiliate API endpoints available`);
});
