import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import fs from "fs";

const app = express();

import { config, validateConfig } from "./config/environment.js";
validateConfig();

// Компрессия
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// HTTPS редирект (оставляем, но не сработает локально)
app.use((req, res, next) => {
  if (req.path.startsWith('/.well-known/acme-challenge/')) return next();

  const host = req.get('host') || '';
  const isCustomDomain = !host.includes('localhost') && host !== '127.0.0.1';
  const isHttps = req.header('x-forwarded-proto') === 'https' || req.secure;

  if (isCustomDomain && !isHttps) {
    console.log(`🔒 HTTPS редирект для ${host}: ${req.url}`);
    return res.redirect(301, `https://${host}${req.url}`);
  }

  next();
});

// ACME challenge
app.get('/.well-known/acme-challenge/:token', (req, res) => {
  try {
    const token = req.params.token;
    const challengeFile = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge', token);
    if (fs.existsSync(challengeFile)) {
      const content = fs.readFileSync(challengeFile, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    } else {
      res.status(404).send('Challenge not found');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://localhost:3000'
  ];
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Статика: кешируем файлы
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});

// Rate-limit (в проде)
const rateLimitTracker = new Map();
if (process.env.NODE_ENV === 'production') {
  app.use('/api', (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 100;

    if (!rateLimitTracker.has(clientIp)) {
      rateLimitTracker.set(clientIp, { count: 1, resetTime: now + windowMs });
    } else {
      const tracker = rateLimitTracker.get(clientIp);
      if (now > tracker.resetTime) {
        tracker.count = 1;
        tracker.resetTime = now + windowMs;
      } else {
        tracker.count++;
        if (tracker.count > maxRequests) {
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((tracker.resetTime - now) / 1000)
          });
        }
      }
    }
    next();
  });
}

// Лог запросов API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const originalResJson = res.json;
  let capturedJsonResponse: any;

  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

// Роуты API
await registerRoutes(app);

// Фиксированный файл
app.get('/update-token.html', (req, res) => {
  res.sendFile('update-token.html', { root: '.' });
});

// Frontend: раздача client/dist
const clientPath = path.join(process.cwd(), 'client', 'dist');
app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Старт сервера
const port = parseInt(process.env.PORT || '8000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});
