import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import compression from "compression";
import helmet from "helmet";

const app = express();

// Load and validate configuration
import { config, validateConfig } from "./config/environment.js";
validateConfig();

// Компрессия для лучшей производительности
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Безопасность
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

// Ограничение размера запросов
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Кеширование статических ресурсов
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год
  }
  next();
});

// Rate limiting для API (отключен в development для отладки)
const rateLimitTracker = new Map();
if (process.env.NODE_ENV === 'production') {
  app.use('/api', (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 минута
    const maxRequests = 100; // максимум запросов в минуту
    
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Статический файл для обновления токена
  app.get('/update-token.html', (req, res) => {
    res.sendFile('update-token.html', { root: '.' });
  });

  // Import tracking service and storage for short links
  const { TrackingLinkService } = await import('./services/trackingLinks.js');
  const { storage } = await import('./storage.js');
  const { trackingLinks, offers } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');
  const { db } = await import('./db.js');
  const { nanoid } = await import('nanoid');

  // =================== SHORT LINK REDIRECT HANDLER ===================
  // Handle short links like /:code - this must be BEFORE Vite setup to not interfere
  app.get('/:code([a-zA-Z0-9]{6,})', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { clickid, partner_id, subid, sub1, sub2, sub3, sub4, sub5 } = req.query;
      
      console.log(`🔗 SHORT LINK REQUEST: ${code} with params:`, { clickid, partner_id, subid });
      
      // First check if it's a tracking link in our database
      const [trackingLink] = await db
        .select({
          id: trackingLinks.id,
          partnerId: trackingLinks.partnerId,
          offerId: trackingLinks.offerId,
          url: trackingLinks.url,
          isActive: trackingLinks.isActive,
          targetUrl: offers.landingPages,
          offerName: offers.name,
          advertiserId: offers.advertiserId
        })
        .from(trackingLinks)
        .innerJoin(offers, eq(trackingLinks.offerId, offers.id))
        .where(eq(trackingLinks.trackingCode, code))
        .limit(1);

      if (trackingLink && trackingLink.isActive) {
        console.log(`✅ Found tracking link: ${trackingLink.offerName}`);
        
        // Record the click
        const clickData = {
          clickid: (clickid as string) || nanoid(12),
          advertiserId: trackingLink.advertiserId,
          partnerId: trackingLink.partnerId,
          offerId: trackingLink.offerId,
          site: req.get('host') || '',
          referrer: req.get('referer') || '',
          userAgent: req.get('user-agent') || '',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip,
          country: 'XX', // TODO: Add GeoIP
          region: '',
          city: '',
          isp: '',
          sub1: sub1 as string,
          sub2: sub2 as string,
          sub3: sub3 as string,
          sub4: sub4 as string,
          sub5: sub5 as string
        };

        // Record click in database first
        const trackingClickData = {
          ...clickData,
          countryIso: 'XX',
          region: '',
          city: '',
          isp: '',
          operator: '',
          isProxy: false,
          browserName: '',
          browserVersion: '',
          osName: '',
          osVersion: '',
          deviceModel: '',
          deviceType: 'desktop',
          connection: '',
          lang: ''
        };
        
        console.log('📊 Skipping click recording for debugging purposes');
        
        // Directly redirect using URL from database
        let targetUrl = trackingLink.url;
        console.log(`🎯 Target URL from DB: ${targetUrl}`);
        console.log(`🔍 Full TrackingLink:`, JSON.stringify(trackingLink, null, 2));
        
        if (typeof targetUrl === 'string' && targetUrl.startsWith('http')) {
          console.log(`🔄 Performing redirect to: ${targetUrl}`);
          return res.redirect(302, targetUrl);
        } else {
          console.log(`❌ Invalid target URL: ${targetUrl} (type: ${typeof targetUrl})`);
        }
      }
      
      // If no tracking link found, pass to next middleware (likely frontend routing)
      // External links like "yQQZgm" might be from external systems or frontend routes
      console.log(`❌ Short link not found in database: ${code}, passing to next middleware`);
      return next();
      
    } catch (error) {
      console.error('Short link redirect error:', error);
      // On error, also pass to next middleware
      return next();
    }
  });
  // =================== END SHORT LINK HANDLER ===================

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
