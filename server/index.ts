// server/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
<<<<<<< HEAD
import path from 'node:path';
import fs from 'node:fs';
import authRouter from './routes/auth';
import authV2Router, { initPasswordResetService } from './routes/auth-v2';
import twoFARouter from './routes/2fa';
=======
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// ваши роуты авторизации (именно их и используем, а не override-блоки)
import authRouter from '../src/routes/auth';
// если у вас есть v2-роутер, подключите. Если файла нет — удалите импорт и app.use ниже.
// import authV2Router from '../src/routes/auth-v2';
>>>>>>> d97b953 (auth: working login via pg users, disable 2FA, env & CORS)

const app = express();
app.use(express.json());

// -------------------- CORS --------------------
// В .env укажи: CORS_ORIGIN=http://localhost:5173,https://affilix.click
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, cb) => {
    // Разрешаем Postman/CLI (origin === undefined) и известные домены
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('CORS: origin not allowed'), false);
  },
  credentials: true,
}));

// Безопасность/сжатие/лимит
app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// -------------------- PG --------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // если локальная БД без SSL — раскомментируй:
//   ssl: { rejectUnauthorized: false },
});

async function ensureUsersTable() {
  // Базовая таблица (как у тебя в БД)
  await pool.query(`
<<<<<<< HEAD
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
=======
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('OWNER','ADVERTISER','PARTNER')),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Колонка 2FA — добавляем, если нет
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;`);
  // Если когда-то понадобится секрет 2FA — добавишь так:
  // await pool.query(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;\`);
>>>>>>> d97b953 (auth: working login via pg users, disable 2FA, env & CORS)
}

ensureUsersTable().catch((err) => {
  console.error('ensureUsersTable error:', err);
  process.exit(1);
});

// -------------------- DEV SEED (по желанию) --------------------
// Включается переменной ALLOW_SEED=1, после первичной инициализации можешь удалить/выключить
app.post('/api/dev/seed-users', async (req, res) => {
  try {
    if (process.env.ALLOW_SEED !== '1') {
      return res.status(403).json({ error: 'Seeding disabled. Set ALLOW_SEED=1' });
    }
    const users = [
      {
        email: process.env.OWNER_EMAIL || 'admin@affilix.click',
        username: 'owner',
        role: 'OWNER' as const,
        pass: process.env.OWNER_PASS || 'admin123',
      },
      {
        email: process.env.ADVERTISER_EMAIL || 'new_user@example.com',
        username: 'newusername',
        role: 'ADVERTISER' as const,
        pass: process.env.ADVERTISER_PASS || 'adv123',
      },
      {
        email: process.env.PARTNER_EMAIL || 'partner@affilix.click',
        username: 'partner',
        role: 'PARTNER' as const,
        pass: process.env.PARTNER_PASS || 'partner123',
      },
    ];
    for (const u of users) {
      const hash = await bcrypt.hash(u.pass, 10);
      await pool.query(
        `
        INSERT INTO users (email, username, role, password_hash, two_factor_enabled, created_at, updated_at)
        VALUES ($1,$2,$3,$4,false,now(),now())
        ON CONFLICT (email)
        DO UPDATE SET
          username = EXCLUDED.username,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          updated_at = now();
        `,
        [u.email, u.username, u.role, hash]
      );
    }
    const all = await pool.query(`SELECT id, email, username, role, two_factor_enabled FROM users ORDER BY id`);
    res.json({ ok: true, users: all.rows });
  } catch (e: any) {
    console.error('seed error:', e?.message || e);
    res.status(500).json({ error: 'seed failed' });
  }
});

// -------------------- РОУТЫ --------------------
// вместо __AUTH_LOGIN_OVERRIDE__ используем НОРМАЛЬНЫЙ роутер:
app.use(authRouter);
// если есть v2:
// app.use(authV2Router);

// /api/me — проверка токена
app.get('/api/me', (req, res) => {
  try {
    const h = String(req.headers['authorization'] || '');
    const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!raw) return res.status(401).json({ error: 'no token' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

    const p = jwt.verify(raw, secret) as any;

    const role = String(p.role || '').toLowerCase();
    const map: Record<string, string> = {
      partner: 'partner',
      advertiser: 'advertiser',
      owner: 'owner',
      super_admin: 'super_admin',
      'super admin': 'super_admin',
    };
    const norm = map[role] || role;

    res.json({
      id: p.sub ?? p.id ?? null,
      username: p.username ?? null,
      email: p.email ?? null,
      role: norm,
    });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

<<<<<<< HEAD
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
=======
// health-check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, where: 'server/index.ts' });
>>>>>>> d97b953 (auth: working login via pg users, disable 2FA, env & CORS)
});

// -------------------- СТАРТ --------------------
const PORT = Number(process.env.PORT) || 5050; // 5000 на macOS часто занят ControlCenter
app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});

