import 'dotenv/config';
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
import authV2Router, { initPasswordResetService } from './routes/auth-v2';
import twoFARouter from './routes/2fa';

const app = express();
app.use(express.json());

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
  
  // Create password reset tokens table
  await pool.query(`
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE
  );`);
  
  // Create index for faster token lookups
  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
  ON password_reset_tokens (token) WHERE NOT used;`);
}
ensureUsersTable().catch(err=>console.error('ensureUsersTable error', err));

// Initialize password reset service with database pool
try {
  initPasswordResetService(pool);
  console.log('[PASSWORD_RESET] Service initialized with database connection');
} catch (error) {
  console.error('[PASSWORD_RESET] Failed to initialize service:', error);
}

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
app.post('/api/auth/login-db', async (req,res,next) => {
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
app.get('/api/me', (req,res) => {
  try {
    const h = String(req.headers['authorization'] || '');
    const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!raw) return res.status(401).json({ error: 'no token' });
    const p = jwt.verify(raw, process.env.JWT_SECRET);
    const role = String(p.role || '').toLowerCase();
    const map = { partner:'partner', advertiser:'advertiser', owner:'owner', super_admin:'super_admin', 'super admin':'super_admin' };
    const norm = map[role] || role;
    res.json({ id: p.sub || p.id || null, username: p.username || null, email: p.email || null, role: norm });
  } catch(e) {
    res.status(401).json({ error:'invalid token' });
  }
});
/* __AUTH_LOGIN_OVERRIDE_BEGIN__ */
app.post("/api/auth/login", require("express").json(), (req, res) => {
  try {
    const users = [
      { email: process.env.OWNER_EMAIL || "9791207@gmail.com",     password: process.env.OWNER_PASSWORD || "owner123",    role: "OWNER",      sub: "owner-1",    username: "owner" },
      { email: process.env.ADVERTISER_EMAIL || "12345@gmail.com",  password: process.env.ADVERTISER_PASSWORD || "adv123", role: "ADVERTISER", sub: "adv-1",      username: "advertiser" },
      { email: process.env.PARTNER_EMAIL || "4321@gmail.com",      password: process.env.PARTNER_PASSWORD || "partner123",role: "PARTNER",    sub: "partner-1",  username: "partner" },
      { email: process.env.SUPER_ADMIN_EMAIL || "superadmin@gmail.com", password: process.env.SUPER_ADMIN_PASSWORD || "77GeoDav=", role: "SUPER_ADMIN", sub: "super-admin-1", username: "super_admin" },
      { email: process.env.AFFILIATE_EMAIL || "pablota096@gmail.com", password: process.env.AFFILIATE_PASSWORD || "7787877As", role: "AFFILIATE", sub: "affiliate-1", username: "affiliate" },
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
    return res.json({ 
      token,
      user: {
        email: u.email,
        role: u.role,
        username: u.username,
        sub: u.sub
      }
    });
  } catch(e) {
    try { console.error("auth login override error:", e && e.message ? e.message : e); } catch(_){}
    return res.status(500).json({ error: "internal error" });
  }
});
/* __AUTH_LOGIN_OVERRIDE_END__ */
app.post('/api/auth/register', async (req, res) => {
  try {
    const b = req.body || {};
    const roleIn = String(b.role || "").toLowerCase();
    const role = roleIn === "advertiser" ? "ADVERTISER" : roleIn === "partner" ? "PARTNER" : roleIn === "owner" ? "OWNER" : "PARTNER";
    const email = String(b.email || "").toLowerCase().trim();
    const password = String(b.password || "");
    const passwordConfirm = String(b.passwordConfirm || "");
    const name = String(b.name || "").trim();
    const company = String(b.company || "").trim();
    const acceptTerms = !!b.acceptTerms;
    const acceptPrivacy = !!b.acceptPrivacy;

    if (!email || !password || !passwordConfirm || !name) return res.status(400).json({ error: "missing required fields" });
    if (password !== passwordConfirm) return res.status(400).json({ error: "passwords do not match" });
    if (role === "ADVERTISER") {
      if (!company) return res.status(400).json({ error: "company is required" });
      if (!acceptTerms || !acceptPrivacy) return res.status(400).json({ error: "agreements required" });
    }

    // For now, just return success message since we don't have DB connection
    return res.json({
      ok: true,
      message: "Ваша регистрация прошла успешно, с вами свяжется менеджер для активации аккаунта в течение 24 часов."
    });
  } catch (e) {
    console.error("register error", e);
    return res.status(500).json({ error: "register failed" });
  }
});
// mount dev login BEFORE other routers
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
// --- API: 2FA operations
app.use('/api/auth/2fa', twoFARouter);

// --- простая проверка токена для стабов ---
function requireAuth(req: any, res: any, next: any) {
  const h = String(req.headers.authorization || '');
  if (!h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

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
