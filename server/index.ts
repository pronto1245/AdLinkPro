import authRouter from './routes/auth';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRouter from '../src/routes/auth';
// import { authV2Router } from './routes/auth-v2'; // TODO: Create this route or remove if not needed
import { authFixedRouter } from './routes/auth-fixed';
import { adminRoutes } from './routes/admin-routes';
import { invitationRoutes } from './routes/invitations';
import { registerRoutes } from './routes'; // Import the main routes that contain registration endpoints
import { requestLogger, errorLogger } from './middleware/logging';
import { setupSwagger } from './config/swagger';
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from './middleware/errorHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Setup global error handlers
setupGlobalErrorHandlers();

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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "wss:", "ws:"],
      "frame-ancestors": ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
app.use(compression());

// Enhanced rate limiting with different limits for different endpoints
import { rateLimiter, loginRateLimiter } from './middleware/security';

// General API rate limiting - 100 requests per minute as specified
app.use('/api', rateLimiter(60 * 1000, 100)); // 100 requests per minute

// Stricter rate limiting for authentication endpoints
app.use('/api/auth', rateLimiter(60 * 1000, 20)); // 20 login attempts per minute

// Very strict rate limiting for sensitive operations
app.use('/api/admin', rateLimiter(60 * 1000, 50)); // 50 requests per minute for admin

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging
app.use(requestLogger);

// Setup API documentation
setupSwagger(app);

// DB
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
  } catch (_error) {
    console.log('Database connection failed, continuing without database:', error.message);
  }
}
ensureUsersTable().catch(console.error);

// Mount authentication routes - ensure all auth endpoints are accessible
console.log('🔐 [SERVER] Mounting authentication routes...');
app.use(authRouter); // Original routes that define /api/auth/login (mount FIRST to avoid conflicts)
app.use('/api/auth/fixed', authFixedRouter); // Fixed auth routes at /api/auth/fixed/login
// app.use('/api/auth/v2', authV2Router); // V2 auth routes at /api/auth/v2/login - TODO: Create this route or remove
// app.use('/auth', authV2Router); // Mount V2 routes at /auth/login for compatibility - TODO: Create this route or remove

// Mount new enhanced routes
console.log('📊 [SERVER] Mounting enhanced API routes...');
app.use('/api/admin', adminRoutes);
app.use('/api', invitationRoutes);

// Registration endpoints are now handled in routes.ts through registerRoutes()
console.log('📝 [SERVER] Registration endpoints will be loaded from routes.ts...');

// Register main application routes (this includes the other registration endpoints)
registerRoutes(app).then(() => {
  console.log('✅ Main registration routes loaded');
}).catch(console.error);

// Serve static files from dist directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check endpoint
 *     description: Check if the server is running and healthy
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 where:
 *                   type: string
 *                   example: "server/index.ts"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
app.get('/api/health', (_req, res) => {
  res.json({ 
    ok: true, 
    where: 'server/index.ts',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * @swagger
 * /api/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get information about the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

// Add error handling middleware
app.use(errorLogger);

// Handle 404 routes
app.use('/api', notFoundHandler);

// Centralized error handling
app.use(errorHandler);

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
  console.log(`📊 Enhanced API endpoints available at /api/admin/*`);
  console.log(`👥 Team invitations available at /api/invitations/*`);
});
app.use('/api/auth', authRouter);
