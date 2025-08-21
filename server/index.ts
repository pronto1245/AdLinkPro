import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from '../src/routes/auth';
import { authV2Router } from './routes/auth-v2';
import { authFixedRouter } from './routes/auth-fixed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const origins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : '*', credentials: true }));
app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('OWNER','ADVERTISER','PARTNER')),
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        two_factor_enabled BOOLEAN NOT NULL DEFAULT false
      );
    `);
  } catch (error) {
    console.log('Database connection failed, continuing without database:', error.message);
  }
}
ensureUsersTable().catch(console.error);

// Mount authentication routes - ensure all auth endpoints are accessible
console.log('🔐 [SERVER] Mounting authentication routes...');
app.use('/api/auth/fixed', authFixedRouter); // Fixed auth routes at /api/auth/fixed/login
app.use('/api/auth/v2', authV2Router); // V2 auth routes at /api/auth/v2/login  
app.use('/api/auth', authV2Router); // Also mount V2 routes at /api/auth/login for compatibility
app.use('/auth', authV2Router); // Mount V2 routes at /auth/login for compatibility
app.use(authRouter); // Original routes that define /api/auth/login

// Serve static files from client dist directory
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, where: 'server/index.ts' });
});

app.get('/api/me', (req, res) => {
  try {
    const h = String(req.headers['authorization'] || '');
    const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!raw) return res.status(401).json({ error: 'no token' });
    const p: any = jwt.verify(raw, process.env.JWT_SECRET as string);
    const role = String(p.role || '').toLowerCase();
    res.json({ id: p.sub || null, username: p.username || null, email: p.email || null, role });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});
