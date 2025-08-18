import bcryptjs from "bcryptjs";
import { Pool } from "pg";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { devLoginRouter } from "./dev.login";
import { authRouter } from "./auth.routes";
import { registerDevRoutes } from "./dev-routes";
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import authRouter from './routes/auth';
import authV2Router from './routes/auth-v2';

const app = express();

// == PG & Users table ==
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureUsersTable() {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER','ADVERTISER','PARTNER')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
}
ensureUsersTable().catch(err=>console.error('ensureUsersTable error', err));

// DEV сидирование (только если ALLOW_SEED=1)
if (process.env.ALLOW_SEED === '1') {
  app.post('/api/dev/seed-users', async (req,res) => {
    try {
      const users = [
        { email: process.env.OWNER_EMAIL || '9791207@gmail.com', username: 'owner',   role: 'OWNER',      pass: process.env.OWNER_PASSWORD || 'owner123' },
        { email: process.env.ADVERTISER_EMAIL || '12345@gmail.com', username: 'advertiser', role: 'ADVERTISER', pass: process.env.ADVERTISER_PASSWORD || 'adv123' },
        { email: process.env.PARTNER_EMAIL || '4321@gmail.com', username: 'partner', role: 'PARTNER',    pass: process.env.PARTNER_PASSWORD || 'partner123' },
      ];
      for (const u of users) {
        const hash = await bcryptjs.hash(u.pass, 10);
        await pool.query(
          `INSERT INTO users (email, username, role, password_hash)
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (email) DO UPDATE SET username=EXCLUDED.username, role=EXCLUDED.role, password_hash=EXCLUDED.password_hash, updated_at=now()`,
          [u.email, u.username, u.role, hash]
        );
      }
      res.json({ ok:true, seeded: true });
    } catch(e) {
      console.error('seed-users error', e);
      res.status(500).json({ error:'seed failed' });
    }
  });
}

// Обновленный боевой /api/auth/login: ищем в БД по email ИЛИ username
app.post('/api/auth/login', async (req,res,next) => {
  try {
    const { email, username, password } = req.body || {};
    if (!password || (!email && !username)) return res.status(400).json({ error:'email/username and password are required' });

    const q = email ? ['email', email] : ['username', username];
    const r = await pool.query(`SELECT id, email, username, role, password_hash FROM users WHERE ${q[0]} = $1 LIMIT 1`, [q[1]]);
    if (!r.rows.length) return res.status(401).json({ error:'invalid credentials' });

    const u = r.rows[0];
    const ok = await bcryptjs.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error:'invalid credentials' });

    const token = jwt.sign({ sub: String(u.id), role: u.role, email: u.email, username: u.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch(e) {
    console.error('auth/login error', e);
    return res.status(500).json({ error:'auth failed' });
  }
});

/* __HEALTH_ALIAS_BEGIN__ */
app.get('/api/health', (req,res) => res.json({ ok:true }));
/* __HEALTH_ALIAS_END__ */
/* __HARDENING_BEGIN__ */
app.set('trust proxy', (process.env.TRUST_PROXY === '1') ? 1 : 0);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({
  origin: (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*'),
  credentials: true
}));
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));
/* __HARDENING_END__ */
/* __AUTH_LOGIN_OVERRIDE_BEGIN__ */
app.post("/api/auth/login", require("express").json(), (req, res) => {
  try {
    const users = [
      { email: process.env.OWNER_EMAIL || "9791207@gmail.com",     password: process.env.OWNER_PASSWORD || "owner123",    role: "OWNER",      sub: "owner-1",    username: "owner" },
      { email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",  password: process.env.ADVERTISER_PASSWORD || "adv123", role: "ADVERTISER", sub: "adv-1",      username: "advertiser" },
      { email: process.env.PARTNER_EMAIL || "4321@gmail.com",      password: process.env.PARTNER_PASSWORD || "partner123",role: "PARTNER",    sub: "partner-1",  username: "partner" },
    ];
    const b = req.body || {};
    const ident = String((b.email || b.username || "")).toLowerCase();
    const pass = String(b.password || "");
    if (!ident || !pass) return res.status(400).json({ error: "email/username and password are required" });

    const u = users.find(x => x.email.toLowerCase() === ident || x.username.toLowerCase() === ident);
    if (!u || u.password !== pass) return res.status(401).json({ error: "invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

    const token = jwt.sign({ sub: u.sub, role: u.role, email: u.email, username: u.username }, secret, { expiresIn: "7d" });
    return res.json({ token });
  } catch(e) {
    try { console.error("auth login override error:", e && e.message ? e.message : e); } catch(_){}
    return res.status(500).json({ error: "internal error" });
  }
});
/* __AUTH_LOGIN_OVERRIDE_END__ */
// mount dev login BEFORE other routers
app.use("/api/dev", devLoginRouter);
app.use("/api/auth", devLoginRouter); // alias: /api/auth/login
app.use("/api/dev", devLoginRouter);
app.use("/api/auth", authRouter);
registerDevRoutes(app);
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

// --- API: логин
app.use('/api', authRouter);
// --- API: новая версия аутентификации с 2FA
app.use('/api/auth/v2', authV2Router);

import { requireAuth, requireRole, authenticateToken } from './middleware/auth';

// Import routes modules
import { registerRoutes } from './routes';

// --- СТАБЫ, чтобы фронт не падал ---
app.get('/api/partner/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      { id: 101, name: 'Test Offer A', payout: 10, status: 'active' },
      { id: 102, name: 'Test Offer B', payout: 15, status: 'paused' },
    ],
  });
});

app.get('/api/partner/dashboard', requireAuth, (_req, res) => {
  res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0, cr: 0, epc: 0 });
});

app.get('/api/partner/finance/summary', requireAuth, (_req, res) => {
  res.json({ balance: 0, pending: 0, paid: 0, currency: 'USD' });
});

app.get('/api/notifications', requireAuth, (_req, res) => {
  res.json({ items: [] });
});

// --- ROLE-BASED TEST ENDPOINTS ---
app.get('/api/test/admin-only', authenticateToken, requireRole(['super_admin']), (req, res) => {
  res.json({ 
    message: 'Admin endpoint accessed successfully',
    user: req.user.username,
    role: req.user.role
  });
});

app.get('/api/test/advertiser-only', authenticateToken, requireRole(['advertiser']), (req, res) => {
  res.json({ 
    message: 'Advertiser endpoint accessed successfully',
    user: req.user.username,
    role: req.user.role
  });
});

app.get('/api/test/affiliate-only', authenticateToken, requireRole(['affiliate']), (req, res) => {
  res.json({ 
    message: 'Affiliate endpoint accessed successfully',
    user: req.user.username,
    role: req.user.role
  });
});

app.get('/api/test/multi-role', authenticateToken, requireRole(['advertiser', 'affiliate']), (req, res) => {
  res.json({ 
    message: 'Multi-role endpoint accessed successfully',
    user: req.user.username,
    role: req.user.role,
    allowedRoles: ['advertiser', 'affiliate']
  });
});

// --- статика SPA из client/dist ---
const clientDistDir = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDistDir, 'index.html')));
}

// --- статика SPA если вдруг положишь фронт внутрь образа ---
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
// @ts-nocheck
/* === DEV AUTH HELPERS (inline v3) === */
;(() => {
  const setup = async () => {
    try {
      try { app.use(require('express').json()); } catch(e) {}
      let jwt; try { jwt = require('jsonwebtoken'); } catch(e) { try { jwt = (await import('jsonwebtoken')).default; } catch(e2) { jwt = await import('jsonwebtoken'); } }
      if (process.env.ALLOW_SEED === '1') {
        app.post('/api/dev/dev-token', (req,res) => {
          const secret = process.env.JWT_SECRET;
          if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
          const token = jwt.sign({ sub:'dev-admin', role:'ADMIN', email: process.env.SEED_EMAIL || 'admin@example.com', username: process.env.SEED_USERNAME || 'admin' }, secret, { expiresIn: '7d' });
          res.json({ token });
        });
      }
      app.get('/api/me', (req,res) => {
        try {
          const h = req.headers.authorization || '';
          const token = h.split(' ')[1];
          if (!token) return res.status(401).json({ error:'no token' });
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          res.json({ id: payload.sub, role: payload.role, email: payload.email, username: payload.username });
        } catch(e) {
          res.status(401).json({ error:'invalid token' });
        }
      });
    } catch (e) { try { console.error('dev-auth inline error', e && e.message ? e.message : e); } catch(_) {} }
  };
  setup();
})();
/* === /DEV AUTH HELPERS === */
