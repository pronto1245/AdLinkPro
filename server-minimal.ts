import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';

// For CommonJS compatibility - use process.cwd() instead of import.meta
const __dirname = path.join(process.cwd(), 'server');

const app = express();

// CORS и JSON — строго до роутов
const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = String(req.headers.origin || '');
  if (origin && (allowed.includes('*') || allowed.includes(origin) || allowed.includes('http://localhost:5173'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

// Безопасность и лимиты
app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// DB
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simplified auth router with fallback users (from the working auth.ts)
const authRouter = Router();

// In-memory store for registered users when database is unavailable
const inMemoryUsers = new Map<string, any>();

// Simple user service functions
const findUserByEmail = async (email: string) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.log('Database error:', error.message);
    throw error;
  }
};

const checkPassword = async (user: any, password: string) => {
  if (user.password_hash) {
    return await bcrypt.compare(password, user.password_hash);
  }
  // Fallback for plain text passwords in test data
  return user.password === password;
};

authRouter.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    console.log('🔐 [AUTH] Login attempt for:', email);

    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    let user = null;
    try {
      user = await findUserByEmail(email);
      console.log('✅ [AUTH] Database user lookup result:', !!user, user?.id);
    } catch (dbError) {
      console.log('⚠️ [AUTH] Database connection failed:', dbError.message);
      console.log('🔄 [AUTH] Falling back to hardcoded users...');
    }

    if (!user) {
      // Check in-memory registered users first
      console.log('🔍 [AUTH] Checking in-memory registered users for:', email);
      const inMemoryUser = inMemoryUsers.get(email.toLowerCase());
      
      if (inMemoryUser) {
        console.log('✅ [AUTH] Found user in memory, checking password');
        const passwordValid = await bcrypt.compare(password, inMemoryUser.passwordHash);
        
        if (passwordValid) {
          console.log('✅ [AUTH] In-memory user authentication successful:', inMemoryUser.email);
          
          const secret = process.env.JWT_SECRET;
          if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
          
          const token = jwt.sign(
            { sub: inMemoryUser.id, role: inMemoryUser.role, email: inMemoryUser.email, username: inMemoryUser.username },
            secret,
            { expiresIn: '7d' }
          );
          
          return res.json({ 
            token,
            user: {
              id: inMemoryUser.id,
              email: inMemoryUser.email,
              role: inMemoryUser.role,
              username: inMemoryUser.username
            }
          });
        }
      }

      // Fallback to hardcoded users for development/testing
      const hardcodedUsers = [
        { id: '1', email: '9791207@gmail.com', username: 'owner', password: 'Affilix123!', role: 'owner' },
        { id: '1', email: 'owner', username: 'owner', password: 'owner123', role: 'owner' },
        { id: '2', email: '12345@gmail.com', username: 'advertiser', password: 'adv123', role: 'advertiser' },
        { id: '2', email: 'advertiser', username: 'advertiser', password: 'adv123', role: 'advertiser' },
        { id: '3', email: '4321@gmail.com', username: 'partner', password: 'partner123', role: 'partner' },
        { id: '3', email: 'partner', username: 'partner', password: 'partner123', role: 'partner' },
        { id: '4', email: 'superadmin@gmail.com', username: 'superadmin', password: '77GeoDav=', role: 'super_admin' },
        { id: '5', email: 'pablota096@gmail.com', username: 'affiliate', password: '7787877As', role: 'affiliate' },
      ];

      user = hardcodedUsers.find(u => (u.email === email || u.username === email) && u.password === password);
      
      if (!user) {
        console.log('❌ [AUTH] No user found for:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log('🔄 [AUTH] Using hardcoded user for testing:', user.email, user.role);
    }

    // For hardcoded users, we already checked the password in the find, so skip the bcrypt check
    const ok = user.password_hash ? await checkPassword(user, password) : true;
    console.log('🔑 [AUTH] Password check result:', ok);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { sub: user.id, email: user.email, role: user.role, username: user.username } });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// Mount the auth router
app.use(authRouter);

// Serve static files from client dist directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ 
    ok: true, 
    where: 'server/minimal.ts',
    timestamp: new Date().toISOString(),
    version: '1.0.0-minimal'
  });
});

app.get('/api/me', (req, res) => {
  try {
    const h = String(req.headers['authorization'] || '');
    const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!raw) return res.status(401).json({ error: 'no token' });
    const p: any = jwt.verify(raw, process.env.JWT_SECRET || 'dev_secret');
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
  console.log(`✅ Minimal server started at http://localhost:${PORT}`);
  console.log(`🔐 Authentication endpoint available at /api/auth/login`);
  console.log(`📊 Health check available at /api/health`);
});