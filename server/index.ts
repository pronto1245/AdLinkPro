import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// ---------- ENV ----------
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DATABASE_URL = process.env.DATABASE_URL;

// CORS: список доменов через запятую или "*"
const ORIGIN_RAW = process.env.CORS_ORIGIN || '*';
const ALLOWED_ORIGINS = ORIGIN_RAW.split(',').map(s => s.trim());
const CORS_CREDENTIALS = String(process.env.CORS_CREDENTIALS || '').toLowerCase() === 'true';

// ---------- MIDDLEWARE ----------
app.use(express.json());

const corsMw = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes('*')) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: Origin not allowed'));
  },
  credentials: CORS_CREDENTIALS,
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization',
});

app.use(corsMw);
// ВАЖНО: явно разрешаем preflight для всех путей
app.options('*', corsMw);

// ---------- DB ----------
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon использует SSL
});

// ---------- HEALTH ----------
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// ---------- AUTH (реальный) ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = (req.body || {}) as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const q = `SELECT id, username, password_hash, role FROM users WHERE username = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [username]);

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0] as { id: number; username: string; password_hash: string; role: string };
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// ---------- STATIC FRONT (dist/public) ----------
const __filename = typeof __dirname === 'undefined' ? fileURLToPath(import.meta.url) : __filename;
// @ts-ignore
const __dirnameLocal = typeof __dirname === 'undefined' ? path.dirname(__filename) : __dirname;

const publicDir = path.join(__dirnameLocal, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

// ---------- SAFETY ----------
process.on('unhandledRejection', (r) => console.error('unhandledRejection:', r));
process.on('uncaughtException', (e) => {
  console.error('uncaughtException:', e);
  process.exit(1);
});
