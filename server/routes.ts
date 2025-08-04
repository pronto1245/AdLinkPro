import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertOfferSchema, insertTicketSchema, insertPostbackSchema, type User, offers, postbacks, postbackLogs, trackingClicks } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db, queryCache } from "./db";
import { z } from "zod";
import express from "express";
import { randomUUID } from "crypto";
import { notificationService } from "./services/notification";
import { auditLog, checkIPBlacklist, rateLimiter, loginRateLimiter, recordFailedLogin, trackDevice, detectFraud, getAuditLogs } from "./middleware/security";
import PostbackService from "./services/postback";

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

// Helper to assert user is authenticated
const getAuthenticatedUser = (req: Request): User => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
};

// Role-based access control with hierarchy
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};

// Check if user can access another user based on hierarchy
const canAccessUser = (currentUser: User, targetUserId: string): boolean => {
  // Super admin can access everyone
  if (currentUser.role === 'super_admin') {
    return true;
  }
  
  // User can always access themselves
  if (currentUser.id === targetUserId) {
    return true;
  }
  
  // Advertiser can access their staff and affiliates (users they own)
  if (currentUser.role === 'advertiser') {
    // This will be checked in storage layer
    return true; 
  }
  
  // Staff and affiliates cannot access other users
  return false;
};

// Middleware to check user hierarchy access
const requireUserAccess = async (req: Request, res: Response, next: NextFunction) => {
  const targetUserId = req.params.id || req.body.userId;
  
  if (!targetUserId) {
    return next(); // No specific user target
  }
  
  if (!canAccessUser(req.user!, targetUserId)) {
    // Additional check: see if target user is owned by current user
    const targetUser = targetUserId ? await storage.getUser(targetUserId) : null;
    if (!targetUser || (targetUser.ownerId !== req.user!.id && req.user!.role !== 'super_admin')) {
      return res.sendStatus(403);
    }
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());
  
  // Security middleware (relaxed limits for development)
  app.use(checkIPBlacklist);
  app.use(rateLimiter(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes for development
  
  // Add 2FA auth routes
  const authRoutes = await import('./routes/auth');
  app.use('/api/auth', authRoutes.default);

  // Auth routes
  app.post("/api/auth/login", loginRateLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username) || await storage.getUserByEmail(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        recordFailedLogin(req);
        auditLog(req, 'LOGIN_FAILED', undefined, false, { username });
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Track device and send notifications
      await trackDevice(req, user.id);
      auditLog(req, 'LOGIN_SUCCESS', undefined, true, { username, userId: user.id });

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          advertiserId: user.advertiserId 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      // lastLoginAt field removed from schema - skipping update

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          language: user.language,
          advertiserId: user.advertiserId
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username as string) || 
                          await storage.getUserByEmail(userData.email as string);
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password as string, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Send registration notification
      await notificationService.sendNotification({
        type: 'user_registration',
        userId: user.id,
        data: {
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          role: user.role
        },
        timestamp: new Date()
      });
      
      // Detect fraud patterns
      detectFraud(req, 'registration', { email: user.email, role: user.role });
      auditLog(req, 'USER_REGISTRATION', undefined, true, { userId: user.id, username: user.username });

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          advertiserId: user.advertiserId 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Protected routes
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const user = await storage.getUser(authUser.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard metrics (с кешированием)
  app.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const cacheKey = `dashboard_metrics_${authUser.id}`;
      
      // Проверяем кеш
      let metrics = queryCache.get(cacheKey);
      
      if (!metrics) {
        metrics = await storage.getDashboardMetrics(authUser.role, authUser.id);
        // Кешируем метрики на 1 минуту (частые обновления)
        queryCache.set(cacheKey, metrics, 60 * 1000);
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User management with hierarchy
  app.get("/api/users", authenticateToken, requireRole(['super_admin', 'advertiser']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const { role } = req.query;
      let users;
      
      if (authUser.role === 'super_admin') {
        // Super admin sees all users
        users = await storage.getUsers(role as string);
      } else if (authUser.role === 'advertiser') {
        // Advertiser sees only their owned users (staff and affiliates)
        users = await storage.getUsersByOwner(authUser.id, role as string);
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", authenticateToken, requireRole(['super_admin', 'advertiser']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username as string) || 
                          await storage.getUserByEmail(userData.email as string);
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Validate role creation permissions
      if (authUser.role === 'advertiser') {
        // Advertisers can only create staff and affiliates
        if (!['staff', 'affiliate'].includes(userData.role as string)) {
          return res.status(403).json({ error: "Advertisers can only create staff and affiliate users" });
        }
        // Set owner to current advertiser
        userData.ownerId = authUser.id;
      } else if (authUser.role === 'super_admin') {
        // Super admin can create anyone but set proper ownership
        if (userData.role === 'advertiser') {
          userData.ownerId = authUser.id; // Owner is super admin
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password as string, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Offer management with hierarchy (с кешированием)
  app.get("/api/admin/offers", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const cacheKey = `offers_${authUser.role}_${authUser.id}`;
      
      // Проверяем кеш
      let offers = queryCache.get(cacheKey);
      
      if (!offers) {
        if (authUser.role === 'super_admin') {
          // Super admin sees all offers
          offers = await storage.getOffers();
        } else if (authUser.role === 'advertiser') {
          // Advertiser sees only their own offers
          offers = await storage.getOffers(authUser.id);
        } else if (authUser.role === 'affiliate') {
          // Affiliate sees only offers they're approved for or public offers from their owner's advertisers
          const partnerOffers = await storage.getPartnerOffers(authUser.id);
          const offerIds = partnerOffers.map(po => po.offerId);
          
          if (offerIds.length > 0) {
            offers = await storage.getOffers();
            offers = offers.filter((offer: any) => offerIds.includes(offer.id) || !offer.isPrivate);
          } else {
            offers = await storage.getOffers();
            offers = offers.filter((offer: any) => !offer.isPrivate);
          }
        } else if (authUser.role === 'staff') {
          // Staff can see offers of their owner (the advertiser who created them)
          if (authUser.ownerId) {
            offers = await storage.getOffers(authUser.ownerId);
          } else {
            offers = [];
          }
        }
        
        // Кешируем на 2 минуты
        queryCache.set(cacheKey, offers, 2 * 60 * 1000);
      }
      
      res.json(offers);
    } catch (error) {
      console.error("Get offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Removed old POST route - replaced by working one below

  app.put("/api/admin/offers/:id", authenticateToken, requireRole(['super_admin', 'advertiser']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const { id } = req.params;
      const offerData = req.body;
      
      // Check if user owns this offer (for advertisers)
      if (authUser.role === 'advertiser') {
        const existingOffer = await storage.getOffer(id);
        if (!existingOffer || existingOffer.advertiserId !== authUser.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      
      const offer = await storage.updateOffer(id, offerData);
      res.json(offer);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/offers/:id", authenticateToken, requireRole(['super_admin', 'advertiser']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const { id } = req.params;
      
      // Check if user owns this offer (for advertisers)
      if (authUser.role === 'advertiser') {
        const existingOffer = await storage.getOffer(id);
        if (!existingOffer || existingOffer.advertiserId !== authUser.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      
      await storage.deleteOffer(id);
      res.json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
      console.error("Delete offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Import offers
  app.post("/api/admin/offers/import", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const { offers } = req.body;
      
      if (!Array.isArray(offers)) {
        return res.status(400).json({ error: "Offers должен быть массивом" });
      }

      const importedOffers = [];
      
      for (const offerData of offers) {
        try {
          // Удаляем поля, которые будут автоматически сгенерированы
          delete offerData.id;
          delete offerData.createdAt;
          delete offerData.updatedAt;
          
          // Устанавливаем создателя как текущего пользователя, если не указан advertiserId
          if (!offerData.advertiserId) {
            offerData.advertiserId = authUser.id;
          }
          
          // Создаем оффер с базовыми полями без строгой валидации
          const offer = await storage.createOffer({
            name: offerData.name || 'Импортированный оффер',
            category: offerData.category || 'other',
            description: offerData.description || '',
            logo: offerData.logo || '',
            status: offerData.status || 'draft',
            payoutType: offerData.payoutType || 'cpa',
            currency: offerData.currency || 'USD',
            landingPages: offerData.landingPages || [],
            kpiConditions: offerData.kpiConditions || '',
            trafficSources: offerData.allowedTrafficSources || offerData.trafficSources || [],
            allowedApps: offerData.allowedApps || [],
            dailyLimit: offerData.dailyLimit || null,
            monthlyLimit: offerData.monthlyLimit || null,
            restrictions: offerData.restrictions || '',
            geoPricing: offerData.geoPricing || [],
            kycRequired: offerData.kycRequired || false,
            isPrivate: offerData.isPrivate || false,
            smartlinkEnabled: offerData.smartlinkEnabled || false,
            advertiserId: offerData.advertiserId || authUser.id,
          });
          
          importedOffers.push(offer);
        } catch (offerError) {
          console.error("Ошибка импорта оффера:", offerError);
          // Продолжаем импорт остальных офферов
        }
      }
      
      res.json({ 
        success: true, 
        message: `Импортировано ${importedOffers.length} из ${offers.length} офферов`,
        imported: importedOffers.length,
        total: offers.length 
      });
    } catch (error) {
      console.error("Import offers error:", error);
      res.status(500).json({ error: "Ошибка импорта офферов" });
    }
  });

  // Tracking links
  app.get("/api/tracking-links", authenticateToken, requireRole(['affiliate']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const links = await storage.getTrackingLinks(authUser.id);
      res.json(links);
    } catch (error) {
      console.error("Get tracking links error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tracking-links", authenticateToken, requireRole(['affiliate']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const { offerId, subId1, subId2, subId3, subId4, subId5 } = req.body;
      
      // Check if affiliate has access to this offer
      const partnerOffers = await storage.getPartnerOffers(authUser.id, offerId);
      const offer = await storage.getOffer(offerId);
      
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      
      if (offer.isPrivate && partnerOffers.length === 0) {
        return res.status(403).json({ error: "Access denied to this offer" });
      }
      
      // Generate unique tracking code
      const trackingCode = `${authUser.id.slice(0, 8)}_${offerId.slice(0, 8)}_${Date.now().toString(36)}`;
      
      const link = await storage.createTrackingLink({
        partnerId: authUser.id,
        offerId,
        trackingCode,
        url: `${process.env.TRACKING_DOMAIN || 'http://localhost:5000'}/track/${trackingCode}`,
        subId1,
        subId2,
        subId3,
        subId4,
        subId5,
      });
      
      res.status(201).json(link);
    } catch (error) {
      console.error("Create tracking link error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics
  app.get("/api/statistics", authenticateToken, async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const { startDate, endDate, offerId } = req.query;
      
      const filters: any = {};
      
      if (authUser.role === 'affiliate') {
        filters.partnerId = authUser.id;
      } else if (authUser.role === 'advertiser') {
        // Get offers belonging to this advertiser
        const offers = await storage.getOffers(authUser.id);
        const offerIds = offers.map(offer => offer.id);
        if (offerIds.length === 0) {
          return res.json([]);
        }
        // Note: This would need to be implemented in storage to filter by multiple offer IDs
      }
      
      if (offerId) filters.offerId = offerId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const stats = await storage.getStatistics(filters);
      res.json(stats);
    } catch (error) {
      console.error("Get statistics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transactions
  app.get("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      let transactions;
      
      if (authUser.role === 'super_admin') {
        transactions = await storage.getTransactions();
      } else {
        transactions = await storage.getTransactions(authUser.id);
      }
      
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Support tickets
  app.get("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      let tickets;
      
      if (authUser.role === 'super_admin') {
        tickets = await storage.getTickets();
      } else {
        tickets = await storage.getTickets(authUser.id);
      }
      
      res.json(tickets);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        userId: getAuthenticatedUser(req).id,
      });
      
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fraud alerts
  app.get("/api/fraud-alerts", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const alerts = await storage.getFraudAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get fraud alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Postbacks
  app.get("/api/postbacks", authenticateToken, async (req, res) => {
    try {
      const postbacks = await storage.getPostbacks(getAuthenticatedUser(req).id);
      res.json(postbacks);
    } catch (error) {
      console.error("Get postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Partner offer management
  app.post("/api/partner-offers", authenticateToken, requireRole(['super_admin', 'advertiser']), async (req, res) => {
    try {
      const { partnerId, offerId, customPayout } = req.body;
      
      // Check if advertiser owns the offer
      const authUser = getAuthenticatedUser(req);
      if (authUser.role === 'advertiser') {
        const offer = await storage.getOffer(offerId);
        if (!offer || offer.advertiserId !== authUser.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      
      const partnerOffer = await storage.createPartnerOffer({
        partnerId,
        offerId,
        customPayout,
        isApproved: authUser.role === 'super_admin', // Super admin auto-approves
      });
      
      res.status(201).json(partnerOffer);
    } catch (error) {
      console.error("Create partner offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/partner-offers/:id", authenticateToken, requireRole(['super_admin', 'advertiser']), async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const partnerOffer = await storage.updatePartnerOffer(id, data);
      res.json(partnerOffer);
    } catch (error) {
      console.error("Update partner offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Super Admin Routes for Users Management
  app.get("/api/admin/users", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { 
        search, 
        role, 
        status, 
        userType, 
        country, 
        dateFrom, 
        dateTo, 
        lastActivityFrom, 
        lastActivityTo,
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const users = await storage.getUsersWithFilters({
        search: search as string,
        role: role as string,
        status: status as string,
        userType: userType as string,
        country: country as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        lastActivityFrom: lastActivityFrom as string,
        lastActivityTo: lastActivityTo as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
      
      // Remove passwords from response
      const safeUsers = users.data?.map(({ password, ...user }) => user) || [];
      
      res.json({
        data: safeUsers,
        total: users.total || 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil((users.total || 0) / parseInt(limit as string))
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username as string) || 
                          await storage.getUserByEmail(userData.email as string);
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password as string, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced user management endpoints
  app.put("/api/admin/users/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const user = await storage.updateUser(id, updateData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PATCH endpoint for partial user updates
  app.patch("/api/admin/users/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const user = await storage.updateUser(id, updateData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Toggle 2FA for user
  app.patch("/api/admin/users/:id/2fa", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { enabled } = req.body;
      
      const user = await storage.updateUser(id, { twoFactorEnabled: enabled });
      res.json({ success: true, twoFactorEnabled: enabled });
    } catch (error) {
      console.error("Update 2FA error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Set IP/GEO restrictions
  app.patch("/api/admin/users/:id/restrictions", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { ipRestrictions, geoRestrictions } = req.body;
      
      const updateData: any = {};
      if (ipRestrictions !== undefined) {
        updateData.ipRestrictions = ipRestrictions.split(',').map((ip: string) => ip.trim()).filter(Boolean);
      }
      if (geoRestrictions !== undefined) {
        updateData.geoRestrictions = geoRestrictions.split(',').map((geo: string) => geo.trim()).filter(Boolean);
      }
      
      const user = await storage.updateUser(id, updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Update restrictions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/:id/block", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const authUser = getAuthenticatedUser(req);
      
      const user = await storage.blockUser(id, reason, authUser.id);
      res.json({ success: true, message: "User blocked successfully" });
    } catch (error) {
      console.error("Block user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/:id/unblock", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.unblockUser(id);
      res.json({ success: true, message: "User unblocked successfully" });
    } catch (error) {
      console.error("Unblock user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/:id/force-logout", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.forceLogoutUser(id);
      res.json({ success: true, message: "User sessions terminated" });
    } catch (error) {
      console.error("Force logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const newPassword = await storage.resetUserPassword(id);
      res.json({ success: true, temporaryPassword: newPassword });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { deleteType = 'soft' } = req.body;
      
      if (deleteType === 'hard') {
        await storage.deleteUser(id);
        res.json({ success: true, type: 'hard', message: 'User permanently deleted' });
      } else {
        const authUser = getAuthenticatedUser(req);
        await storage.softDeleteUser(id, authUser.id);
        res.json({ success: true, type: 'soft', message: 'User moved to archive' });
      }
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User analytics endpoint
  app.get("/api/admin/users/analytics", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      const analytics = await storage.getUserAnalytics(period as string);
      res.json(analytics);
    } catch (error) {
      console.error("User analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Export users
  app.get("/api/admin/users/export", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { format = 'csv', ...filters } = req.query;
      const data = await storage.exportUsers(filters, format as string);
      
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
      res.send(data);
    } catch (error) {
      console.error("Export users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk operations
  app.post("/api/admin/users/bulk-block", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const authUser = getAuthenticatedUser(req);
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }

      let successCount = 0;
      let failedCount = 0;
      
      for (const userId of userIds) {
        try {
          await storage.blockUser(userId, reason, authUser.id);
          successCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to block user ${userId}:`, error);
        }
      }
      
      res.json({ 
        success: successCount,
        failed: failedCount,
        total: userIds.length
      });
    } catch (error) {
      console.error("Bulk block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/bulk-unblock", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }

      let successCount = 0;
      let failedCount = 0;
      
      for (const userId of userIds) {
        try {
          await storage.unblockUser(userId);
          successCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to unblock user ${userId}:`, error);
        }
      }
      
      res.json({ 
        success: successCount,
        failed: failedCount,
        total: userIds.length
      });
    } catch (error) {
      console.error("Bulk unblock error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/bulk-delete", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, deleteType = 'soft' } = req.body;
      const authUser = getAuthenticatedUser(req);
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }

      let successCount = 0;
      let failedCount = 0;
      
      for (const userId of userIds) {
        try {
          if (deleteType === 'hard') {
            await storage.deleteUser(userId);
          } else {
            await storage.softDeleteUser(userId, authUser.id);
          }
          successCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to delete user ${userId}:`, error);
        }
      }
      
      res.json({ 
        success: successCount,
        failed: failedCount,
        total: userIds.length,
        deleteType
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Role Management Endpoints
  app.get("/api/admin/roles", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { search, scope } = req.query;
      const roles = await storage.getCustomRoles({
        search: search as string,
        scope: scope as string
      });
      res.json(roles);
    } catch (error) {
      console.error("Get roles error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/roles", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const authUser = getAuthenticatedUser(req);
      const roleData = {
        ...req.body,
        createdBy: authUser.id
      };
      
      const role = await storage.createCustomRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Create role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/roles/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const role = await storage.getCustomRole(id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Get role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/roles/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const role = await storage.updateCustomRole(id, updateData);
      res.json(role);
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/roles/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomRole(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Role assignment endpoints
  app.post("/api/admin/roles/:roleId/assign", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { roleId } = req.params;
      const { userId, expiresAt } = req.body;
      const authUser = getAuthenticatedUser(req);
      
      const assignment = await storage.assignUserRole(userId, roleId, authUser.id, expiresAt);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Assign role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/roles/:roleId/unassign/:userId", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { roleId, userId } = req.params;
      await storage.unassignUserRole(userId, roleId);
      res.status(204).send();
    } catch (error) {
      console.error("Unassign role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk user operations
  app.post("/api/admin/users/bulk-block", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const authUser = getAuthenticatedUser(req);
      
      const results = await storage.bulkBlockUsers(userIds, reason, authUser.id);
      res.json(results);
    } catch (error) {
      console.error("Bulk block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/bulk-unblock", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds } = req.body;
      const results = await storage.bulkUnblockUsers(userIds);
      res.json(results);
    } catch (error) {
      console.error("Bulk unblock error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users/bulk-delete", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, hardDelete = false } = req.body;
      const authUser = getAuthenticatedUser(req);
      
      const results = await storage.bulkDeleteUsers(userIds, hardDelete, authUser.id);
      res.json(results);
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics endpoints
  app.get("/api/admin/analytics/users", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { period = '30d', role } = req.query;
      const analytics = await storage.getUserAnalyticsDetailed(period as string, role as string);
      res.json(analytics);
    } catch (error) {
      console.error("Get user analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/fraud", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      const analytics = await storage.getFraudAnalytics(period as string);
      res.json(analytics);
    } catch (error) {
      console.error("Get fraud analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/export", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { format = 'csv', period = '30d', role } = req.query;
      const data = await storage.exportAnalytics(format as string, period as string, role as string);
      
      const contentType = format === 'json' ? 'application/json' : 'text/csv';
      const filename = `analytics_${period}.${format}`;
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(data);
    } catch (error) {
      console.error("Export analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/offers", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const offers = await storage.getAllOffers();
      res.json(offers);
    } catch (error) {
      console.error("Get all offers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/offers", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const authUser = req.user!; // Middleware guarantees this exists
      console.log("Creating offer for user:", authUser.id, authUser.username);
      console.log("Request body data:", JSON.stringify(req.body, null, 2));
      
      // Insert directly into database bypassing all validation
      const [newOffer] = await db
        .insert(offers)
        .values({
          name: req.body.name || "Unnamed Offer",
          category: req.body.category || "other", 
          description: req.body.description || null,
          goals: req.body.goals || null,
          logo: req.body.logo || null,
          status: req.body.status || 'draft',
          payout: "0.00",
          payoutType: req.body.payoutType || 'cpa',
          currency: req.body.currency || 'USD',
          advertiserId: authUser.id,
          landingPages: req.body.landingPages || null,
          kpiConditions: req.body.kpiConditions || null,
          trafficSources: req.body.trafficSources || req.body.allowedTrafficSources || null,
          allowedApps: req.body.allowedApps || null,
          dailyLimit: req.body.dailyLimit || null,
          monthlyLimit: req.body.monthlyLimit || null,
          antifraudEnabled: req.body.antifraudEnabled !== false,
          autoApprovePartners: req.body.autoApprovePartners === true,
        })
        .returning();
      
      console.log("Created offer:", newOffer);      
      res.status(201).json(newOffer);
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(500).json({ error: "Failed to create offer", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/admin/offers/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const offer = await storage.updateOffer(id, { status });
      res.json(offer);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/offers/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating offer:", id);
      
      // Filter out system fields and undefined values
      const updateData: any = {};
      const allowedFields = [
        'name', 'description', 'logo', 'category', 'status', 'payoutType', 'currency',
        'kpiConditions', 'restrictions', 'moderationComment', 'antifraudEnabled',
        'autoApprovePartners', 'kycRequired', 'isPrivate', 'smartlinkEnabled',
        'dailyLimit', 'monthlyLimit', 'landingPages', 'allowedApps'
      ];
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Handle special field mapping
      if (req.body.allowedTrafficSources !== undefined) {
        updateData.trafficSources = req.body.allowedTrafficSources;
      }
      
      console.log("Updating fields:", Object.keys(updateData));
      
      const offer = await storage.updateOffer(id, updateData);
      
      if (!offer) {
        return res.status(404).json({ error: "Оффер не найден" });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Update offer error:", error);
      res.status(500).json({ error: "Не удалось обновить оффер", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/admin/offers/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOffer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete offer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk operations
  app.post("/api/admin/offers/bulk-activate", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { offerIds } = req.body;
      if (!Array.isArray(offerIds)) {
        return res.status(400).json({ error: "offerIds должен быть массивом" });
      }

      const updatedOffers = [];
      for (const offerId of offerIds) {
        try {
          const offer = await storage.updateOffer(offerId, { status: 'active' });
          updatedOffers.push(offer);
        } catch (error) {
          console.error(`Error activating offer ${offerId}:`, error);
        }
      }

      res.json({ 
        success: true, 
        message: `Активировано ${updatedOffers.length} из ${offerIds.length} офферов`,
        updated: updatedOffers.length,
        total: offerIds.length 
      });
    } catch (error) {
      console.error("Bulk activate error:", error);
      res.status(500).json({ error: "Ошибка массовой активации" });
    }
  });

  app.post("/api/admin/offers/bulk-pause", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { offerIds } = req.body;
      if (!Array.isArray(offerIds)) {
        return res.status(400).json({ error: "offerIds должен быть массивом" });
      }

      const updatedOffers = [];
      for (const offerId of offerIds) {
        try {
          const offer = await storage.updateOffer(offerId, { status: 'paused' });
          updatedOffers.push(offer);
        } catch (error) {
          console.error(`Error pausing offer ${offerId}:`, error);
        }
      }

      res.json({ 
        success: true, 
        message: `Остановлено ${updatedOffers.length} из ${offerIds.length} офферов`,
        updated: updatedOffers.length,
        total: offerIds.length 
      });
    } catch (error) {
      console.error("Bulk pause error:", error);
      res.status(500).json({ error: "Ошибка массовой остановки" });
    }
  });

  app.post("/api/admin/offers/bulk-delete", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { offerIds } = req.body;
      if (!Array.isArray(offerIds)) {
        return res.status(400).json({ error: "offerIds должен быть массивом" });
      }

      const deletedOffers = [];
      for (const offerId of offerIds) {
        try {
          await storage.deleteOffer(offerId);
          deletedOffers.push(offerId);
        } catch (error) {
          console.error(`Error deleting offer ${offerId}:`, error);
        }
      }

      res.json({ 
        success: true, 
        message: `Удалено ${deletedOffers.length} из ${offerIds.length} офферов`,
        deleted: deletedOffers.length,
        total: offerIds.length 
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Ошибка массового удаления" });
    }
  });

  // Moderate offer
  app.post("/api/admin/offers/:id/moderate", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { action, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const result = await storage.moderateOffer(id, action, userId, comment);
      if (result) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Failed to moderate offer' });
      }
    } catch (error) {
      console.error('Error moderating offer:', error);
      res.status(500).json({ error: 'Failed to moderate offer' });
    }
  });

  // Get offer logs
  app.get("/api/admin/offer-logs/:offerId", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { offerId } = req.params;
      const logs = await storage.getOfferLogs(offerId);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching offer logs:', error);
      res.status(500).json({ error: 'Failed to fetch offer logs' });
    }
  });

  // Get offer statistics
  app.get("/api/admin/offer-stats/:offerId", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { offerId } = req.params;
      const stats = await storage.getOfferStats(offerId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching offer stats:', error);
      res.status(500).json({ error: 'Failed to fetch offer stats' });
    }
  });

  // Analytics for admin dashboard
  app.get("/api/admin/analytics", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Get admin analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // KYC management
  app.get("/api/admin/kyc", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const kycDocuments = await storage.getKycDocuments();
      res.json(kycDocuments);
    } catch (error) {
      console.error("Get KYC documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/kyc/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const kycDocument = await storage.updateKycDocument(id, {
        status,
        notes,
        reviewedBy: getAuthenticatedUser(req).id,
        reviewedAt: new Date(),
      });
      res.json(kycDocument);
    } catch (error) {
      console.error("Update KYC document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fraud alerts management
  app.get("/api/admin/fraud-alerts", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const fraudAlerts = await storage.getFraudAlerts();
      res.json(fraudAlerts);
    } catch (error) {
      console.error("Get fraud alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/fraud-alerts/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { isResolved } = req.body;
      const fraudAlert = await storage.updateFraudAlert(id, { isResolved });
      res.json(fraudAlert);
    } catch (error) {
      console.error("Update fraud alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // === SYSTEM SETTINGS ROUTES ===
  
  // Get system settings
  app.get('/api/admin/system-settings', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error: any) {
      console.error("Get system settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create system setting
  app.post('/api/admin/system-settings', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const setting = await storage.createSystemSetting({
        ...req.body,
        updatedBy: getAuthenticatedUser(req).id
      });
      res.status(201).json(setting);
    } catch (error: any) {
      console.error("Create system setting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update system setting
  app.patch('/api/admin/system-settings/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const setting = await storage.updateSystemSetting(req.params.id, {
        ...req.body,
        updatedBy: getAuthenticatedUser(req).id
      });
      res.json(setting);
    } catch (error: any) {
      console.error("Update system setting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete system setting
  app.delete('/api/admin/system-settings/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      await storage.deleteSystemSetting(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete system setting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // === AUDIT LOGS ROUTES ===
  
  // Get audit logs
  app.get('/api/admin/audit-logs', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { search, action, resourceType, userId, startDate, endDate } = req.query;
      const logs = await storage.getAuditLogs({
        search: search as string,
        action: action as string,
        resourceType: resourceType as string,
        userId: userId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json(logs);
    } catch (error: any) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // === GLOBAL POSTBACKS ROUTES ===
  
  // Get global postbacks
  app.get('/api/admin/global-postbacks', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const postbacks = await storage.getGlobalPostbacks();
      res.json(postbacks);
    } catch (error: any) {
      console.error("Get global postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create global postback
  app.post('/api/admin/global-postbacks', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const postback = await storage.createGlobalPostback(req.body);
      res.status(201).json(postback);
    } catch (error: any) {
      console.error("Create global postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update global postback
  app.patch('/api/admin/global-postbacks/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const postback = await storage.updateGlobalPostback(req.params.id, req.body);
      res.json(postback);
    } catch (error: any) {
      console.error("Update global postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Test global postback
  app.post('/api/admin/global-postbacks/:id/test', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      await storage.testGlobalPostback(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Test global postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get postback logs
  app.get('/api/admin/postback-logs', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const logs = await storage.getPostbackLogs();
      res.json(logs);
    } catch (error: any) {
      console.error("Get postback logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // === BLACKLIST ROUTES ===
  
  // Get blacklist entries
  app.get('/api/admin/blacklist', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { search, type } = req.query;
      const entries = await storage.getBlacklistEntries({
        search: search as string,
        type: type as string,
      });
      res.json(entries);
    } catch (error: any) {
      console.error("Get blacklist entries error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add blacklist entry
  app.post('/api/admin/blacklist', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const entry = await storage.createBlacklistEntry({
        ...req.body,
        addedBy: getAuthenticatedUser(req).id
      });
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Create blacklist entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update blacklist entry
  app.patch('/api/admin/blacklist/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const entry = await storage.updateBlacklistEntry(req.params.id, req.body);
      res.json(entry);
    } catch (error: any) {
      console.error("Update blacklist entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete blacklist entry
  app.delete('/api/admin/blacklist/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      await storage.deleteBlacklistEntry(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete blacklist entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced user management routes (removed duplicate)

  // Update user
  app.patch('/api/admin/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { firstName, lastName, country, role, isActive } = req.body;
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (country !== undefined) updateData.country = country;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const user = await storage.updateUser(req.params.id, updateData);
      res.json(user);
    } catch (error: any) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get users with filters
  app.get('/api/admin/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
        userType: req.query.userType as string,
        country: req.query.country as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };
      
      const result = await storage.getUsersWithFilters(filters);
      res.json(result);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Block user
  app.post('/api/admin/users/:id/block', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { reason } = req.body;
      const blockedBy = getAuthenticatedUser(req).id;
      
      const user = await storage.blockUser(req.params.id, reason, blockedBy);
      res.json(user);
    } catch (error: any) {
      console.error("Block user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Unblock user
  app.post('/api/admin/users/:id/unblock', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const user = await storage.unblockUser(req.params.id);
      res.json(user);
    } catch (error: any) {
      console.error("Unblock user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Force logout user
  app.post('/api/admin/users/:id/force-logout', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      await storage.forceLogoutUser(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Force logout user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete user
  app.delete('/api/admin/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { hardDelete } = req.query;
      const deletedBy = getAuthenticatedUser(req).id;
      
      if (hardDelete === 'true') {
        await storage.deleteUser(req.params.id);
      } else {
        await storage.softDeleteUser(req.params.id, deletedBy);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reset user password
  app.post('/api/admin/users/:id/reset-password', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const newPassword = await storage.resetUserPassword(req.params.id);
      res.json({ newPassword });
    } catch (error: any) {
      console.error("Reset user password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user analytics
  app.get('/api/admin/users/analytics', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const period = req.query.period as string || '30d';
      const analytics = await storage.getUserAnalytics(period);
      res.json(analytics);
    } catch (error: any) {
      console.error("Get user analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Export users
  app.get('/api/admin/users/export', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const format = req.query.format as string || 'csv';
      const filters = {
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
        userType: req.query.userType as string,
        country: req.query.country as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string
      };
      
      const data = await storage.exportUsers(filters, format);
      
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
      res.send(data);
    } catch (error: any) {
      console.error("Export users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk block users
  app.post('/api/admin/users/bulk-block', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const blockedBy = getAuthenticatedUser(req).id;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "userIds array is required" });
      }
      
      const results = await storage.bulkBlockUsers(userIds, reason, blockedBy);
      res.json(results);
    } catch (error: any) {
      console.error("Bulk block users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk unblock users
  app.post('/api/admin/users/bulk-unblock', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "userIds array is required" });
      }
      
      const results = await storage.bulkUnblockUsers(userIds);
      res.json(results);
    } catch (error: any) {
      console.error("Bulk unblock users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk delete users
  app.post('/api/admin/users/bulk-delete', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, hardDelete = false } = req.body;
      const deletedBy = getAuthenticatedUser(req).id;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "userIds array is required" });
      }
      
      const results = await storage.bulkDeleteUsers(userIds, hardDelete, deletedBy);
      res.json(results);
    } catch (error: any) {
      console.error("Bulk delete users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Postback endpoints
  app.get('/api/postbacks', authenticateToken, async (req, res) => {
    try {
      const postbacksData = await db.select()
        .from(postbacks)
        .leftJoin(offers, eq(postbacks.offerId, offers.id))
        .where(eq(postbacks.userId, req.user.id));
      
      const formattedPostbacks = postbacksData.map(({ postbacks: pb, offers: offer }) => ({
        ...pb,
        offerName: offer?.name || null,
      }));
      
      res.json(formattedPostbacks);
    } catch (error) {
      console.error("Get postbacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post('/api/postbacks', authenticateToken, async (req, res) => {
    try {
      const postbackData = insertPostbackSchema.parse(req.body);
      const [newPostback] = await db.insert(postbacks).values({
        ...postbackData,
        userId: req.user.id,
      }).returning();
      
      auditLog(req, 'CREATE', 'postbacks', true, { postbackId: newPostback.id });
      res.json(newPostback);
    } catch (error) {
      console.error("Create postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put('/api/postbacks/:id', authenticateToken, async (req, res) => {
    try {
      const postbackData = insertPostbackSchema.parse(req.body);
      const [updatedPostback] = await db.update(postbacks)
        .set(postbackData)
        .where(and(eq(postbacks.id, req.params.id), eq(postbacks.userId, req.user.id)))
        .returning();
      
      if (!updatedPostback) {
        return res.status(404).json({ error: "Postback not found" });
      }
      
      auditLog(req, 'UPDATE', 'postbacks', true, { postbackId: updatedPostback.id });
      res.json(updatedPostback);
    } catch (error) {
      console.error("Update postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete('/api/postbacks/:id', authenticateToken, async (req, res) => {
    try {
      const [deletedPostback] = await db.delete(postbacks)
        .where(and(eq(postbacks.id, req.params.id), eq(postbacks.userId, req.user.id)))
        .returning();
      
      if (!deletedPostback) {
        return res.status(404).json({ error: "Postback not found" });
      }
      
      auditLog(req, 'DELETE', 'postbacks', true, { postbackId: deletedPostback.id });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post('/api/postbacks/:id/test', authenticateToken, async (req, res) => {
    try {
      const testMacros = {
        clickid: 'test_' + Date.now(),
        status: 'test',
        offer_id: 'test-offer',
        partner_id: req.user.id,
        payout: '10.00',
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };
      
      const result = await PostbackService.sendPostback(
        req.params.id,
        'test',
        testMacros
      );
      
      auditLog(req, 'TEST', 'postbacks', result.success, { postbackId: req.params.id });
      res.json(result);
    } catch (error) {
      console.error("Test postback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/api/postback-logs', authenticateToken, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const logs = await PostbackService.getPostbackLogs({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(logs);
    } catch (error) {
      console.error("Get postback logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // External conversion API endpoint for advertisers
  app.post('/api/conversion', async (req, res) => {
    try {
      const { clickid, status, amount, currency, txid, sub1, sub2, sub3, sub4, sub5 } = req.body;
      
      if (!clickid || !status) {
        return res.status(400).json({ error: "Missing required parameters: clickid and status" });
      }

      // Find the original click
      const [click] = await db.select()
        .from(trackingClicks)
        .where(eq(trackingClicks.clickId, clickid));

      if (!click) {
        return res.status(404).json({ error: "Click not found" });
      }

      // Trigger conversion postbacks
      await PostbackService.triggerPostbacks({
        type: status,
        clickId: clickid,
        data: {
          clickid,
          status,
          offer_id: click.offerId,
          partner_id: click.partnerId,
          amount: amount || '0.00',
          currency: currency || 'USD',
          txid: txid || '',
          sub1: sub1 || click.subId1 || '',
          sub2: sub2 || click.subId2 || '',
          sub3: sub3 || click.subId3 || '',
          sub4: sub4 || click.subId4 || '',
          sub5: sub5 || click.subId5 || '',
          geo: click.geo || '',
          device: click.device || '',
          timestamp: new Date().toISOString(),
        },
      });

      res.json({ success: true, message: "Conversion processed" });
    } catch (error) {
      console.error("Conversion processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Generate tracking URL for partners
  app.get('/api/tracking-url/:partnerId/:offerId', authenticateToken, async (req, res) => {
    try {
      const { partnerId, offerId } = req.params;
      const { sub1, sub2, sub3, sub4, sub5, landing_url } = req.query;
      
      // Verify access to offer
      const [offer] = await db.select()
        .from(offers)
        .where(eq(offers.id, offerId));
      
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const trackingUrl = `${baseUrl}/click?partner_id=${partnerId}&offer_id=${offerId}&clickid={clickid}${sub1 ? `&sub1=${sub1}` : ''}${sub2 ? `&sub2=${sub2}` : ''}${sub3 ? `&sub3=${sub3}` : ''}${sub4 ? `&sub4=${sub4}` : ''}${sub5 ? `&sub5=${sub5}` : ''}${landing_url ? `&landing_url=${encodeURIComponent(landing_url as string)}` : ''}`;

      res.json({ 
        trackingUrl,
        instructions: "Замените {clickid} на ваш уникальный идентификатор клика из трекера (Keitaro, Binom, Redtrack, Voluum и т.д.)"
      });
    } catch (error) {
      console.error("Tracking URL generation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Click tracking endpoint
  app.get('/click', async (req, res) => {
    try {
      const { partner_id, offer_id, clickid, sub1, sub2, sub3, sub4, sub5, landing_url } = req.query;
      
      if (!partner_id || !offer_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Store click
      const clickData = await PostbackService.storeClick({
        partnerId: partner_id as string,
        offerId: offer_id as string,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        subId1: sub1 as string,
        subId2: sub2 as string,
        subId3: sub3 as string,
        subId4: sub4 as string,
        subId5: sub5 as string,
        landingUrl: landing_url as string,
      });
      
      // Trigger click postbacks
      await PostbackService.triggerPostbacks({
        type: 'click',
        clickId: clickData.clickId,
        data: {
          clickid: clickData.clickId,
          partner_id: partner_id as string,
          offer_id: offer_id as string,
          sub1: sub1 as string,
          sub2: sub2 as string,
          sub3: sub3 as string,
          sub4: sub4 as string,
          sub5: sub5 as string,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Redirect to landing page
      const [offer] = await db.select()
        .from(offers)
        .where(eq(offers.id, offer_id as string));
      
      if (offer && offer.landingPages) {
        const landingPages = offer.landingPages as any[];
        const targetUrl = landingPages[0]?.url || landing_url || 'https://example.com';
        res.redirect(302, targetUrl);
      } else {
        res.redirect(302, landing_url as string || 'https://example.com');
      }
    } catch (error) {
      console.error("Click tracking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Security and monitoring endpoints
  app.get('/api/admin/audit-logs', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userId, action, fromDate, toDate, limit } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (fromDate) filters.fromDate = new Date(fromDate as string);
      if (toDate) filters.toDate = new Date(toDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      
      const logs = getAuditLogs(filters);
      auditLog(req, 'AUDIT_LOGS_VIEWED', undefined, true, { filtersApplied: Object.keys(filters) });
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/api/admin/notifications', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userId } = req.query;
      const notifications = notificationService.getNotifications(userId as string);
      auditLog(req, 'NOTIFICATIONS_VIEWED', undefined, true, { targetUserId: userId });
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete('/api/admin/notifications', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userId } = req.query;
      notificationService.clearNotifications(userId as string);
      auditLog(req, 'NOTIFICATIONS_CLEARED', undefined, true, { targetUserId: userId });
      res.json({ success: true });
    } catch (error) {
      console.error("Clear notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Crypto Wallet Management Routes
  app.get("/api/admin/crypto-wallets", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { currency, walletType, status } = req.query;
      const wallets = await storage.getCryptoWallets({
        currency: currency as string,
        walletType: walletType as string,
        status: status as string
      });
      res.json(wallets);
    } catch (error) {
      console.error("Get crypto wallets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/crypto-portfolio", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const portfolio = await storage.getCryptoPortfolio();
      res.json(portfolio);
    } catch (error) {
      console.error("Get crypto portfolio error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Crypto deposit
  app.post("/api/admin/crypto-deposit", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { currency, amount, fromAddress } = req.body;
      
      const depositData = {
        id: randomUUID(),
        currency,
        amount,
        fromAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // In real implementation, you would:
      // 1. Validate the blockchain transaction
      // 2. Update wallet balance in database
      // 3. Create transaction record
      
      res.json({ 
        success: true, 
        message: `Crypto deposit of ${amount} ${currency} created`,
        deposit: depositData 
      });
    } catch (error) {
      console.error("Crypto deposit error:", error);
      res.status(500).json({ error: "Failed to process crypto deposit" });
    }
  });

  // Crypto withdraw  
  app.post("/api/admin/crypto-withdraw", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { currency, amount, toAddress } = req.body;
      
      const withdrawalData = {
        id: randomUUID(),
        currency,
        amount,
        toAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // In real implementation, you would:
      // 1. Check wallet balance
      // 2. Create blockchain transaction
      // 3. Update wallet balance
      // 4. Create transaction record
      
      res.json({ 
        success: true, 
        message: `Crypto withdrawal of ${amount} ${currency} initiated`,
        withdrawal: withdrawalData 
      });
    } catch (error) {
      console.error("Crypto withdrawal error:", error);
      res.status(500).json({ error: "Failed to process crypto withdrawal" });
    }
  });

  // === FINANCIAL MANAGEMENT ROUTES ===
  
  // Update transaction status
  app.patch("/api/admin/transactions/:transactionId", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { status, note } = req.body;
      
      // Mock update - in real implementation, update database
      res.json({ 
        success: true, 
        message: `Transaction ${transactionId} updated to ${status}`,
        transactionId,
        status,
        note 
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  // Process payout (approve/reject/complete)
  app.post("/api/admin/payouts/:payoutId/:action", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { payoutId, action } = req.params;
      const { note } = req.body;
      
      if (!['approve', 'reject', 'complete'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      
      // Mock processing - in real implementation, update database and process payment
      res.json({ 
        success: true, 
        message: `Payout ${payoutId} ${action}d successfully`,
        payoutId,
        action,
        note 
      });
    } catch (error) {
      console.error("Process payout error:", error);
      res.status(500).json({ error: "Failed to process payout" });
    }
  });

  // Create invoice
  app.post("/api/admin/invoices", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const invoiceData = req.body;
      
      const invoice = {
        id: randomUUID(),
        ...invoiceData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Mock creation - in real implementation, save to database and send email
      res.json({ 
        success: true, 
        message: "Invoice created successfully",
        invoice 
      });
    } catch (error) {
      console.error("Create invoice error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Update fraud report status
  app.post('/api/admin/fraud-reports/update-status', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { reportId, status } = req.body;
      
      if (!reportId || !status) {
        return res.status(400).json({ error: 'Missing reportId or status' });
      }

      if (!['pending', 'reviewing', 'confirmed', 'rejected', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Here you would typically update the database
      // For demo purposes, we'll just return success
      res.json({ 
        success: true, 
        message: `Report ${reportId} status updated to ${status}`,
        reportId,
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating fraud report status:', error);
      res.status(500).json({ error: 'Failed to update report status' });
    }
  });

  // Fraud Detection Routes
  app.get("/api/admin/fraud-reports", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { type, severity, status, search, page = 1, limit = 50 } = req.query;
      const reports = await storage.getFraudReports({
        type: type as string,
        severity: severity as string,
        status: status as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      res.json(reports);
    } catch (error) {
      console.error("Get fraud reports error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/fraud-stats", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const stats = await storage.getFraudStats();
      res.json(stats);
    } catch (error) {
      console.error("Get fraud stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/ip-analysis", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { page = 1, limit = 50, riskScore } = req.query;
      const analysis = await storage.getIpAnalysis({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        riskScore: riskScore ? parseInt(riskScore as string) : undefined
      });
      res.json(analysis);
    } catch (error) {
      console.error("Get IP analysis error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/fraud-rules", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { type, scope, isActive } = req.query;
      const rules = await storage.getFraudRules({
        type: type as string,
        scope: scope as string,
        isActive: isActive ? isActive === 'true' : undefined
      });
      res.json(rules);
    } catch (error) {
      console.error("Get fraud rules error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/fraud-reports/review", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { reportId, status, notes, resolution } = req.body;
      const userId = (req as any).user.id;
      
      const updatedReport = await storage.reviewFraudReport(reportId, {
        status,
        reviewedBy: userId,
        reviewNotes: notes,
        resolution
      });
      
      auditLog(req, 'FRAUD_REPORT_REVIEWED', reportId, true, { status, notes });
      res.json(updatedReport);
    } catch (error) {
      console.error("Review fraud report error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Export fraud reports
  app.get('/api/admin/fraud-reports/export', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const reports = await storage.getFraudReports({}, 1, 10000); // Get all reports
      
      // Create CSV content
      const csvHeader = 'ID,Type,Severity,Status,IP Address,Country,Description,Created At\n';
      const csvRows = reports.map(report => 
        `${report.id},${report.type},${report.severity},${report.status},${report.ipAddress},${report.country},"${report.description}",${report.createdAt}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fraud-reports.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error('Export fraud reports error:', error);
      res.status(500).json({ error: 'Failed to export fraud reports' });
    }
  });

  // Block IP address
  app.post('/api/admin/block-ip', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { ipAddress, reason } = req.body;
      const userId = (req as any).user.id;
      
      if (!ipAddress) {
        return res.status(400).json({ error: 'IP address is required' });
      }

      // Create fraud block entry
      await storage.createFraudBlock({
        type: 'ip',
        targetId: ipAddress,
        reason: reason || 'Manual block',
        autoBlocked: false,
        isActive: true,
        blockedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      auditLog(req, 'IP_BLOCKED', blockId, true, { ipAddress, reason });
      res.json({ success: true, message: 'IP address blocked successfully' });
    } catch (error) {
      console.error('Block IP error:', error);
      res.status(500).json({ error: 'Failed to block IP address' });
    }
  });

  app.post("/api/admin/fraud-blocks", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { type, targetId, reason, reportId } = req.body;
      const userId = (req as any).user.id;
      
      const block = await storage.createFraudBlock({
        type,
        targetId,
        reason,
        reportId,
        blockedBy: userId
      });
      
      auditLog(req, 'FRAUD_BLOCK_CREATED', block.id, true, { type, targetId, reason });
      res.json(block);
    } catch (error) {
      console.error("Create fraud block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create fraud rule
  app.post("/api/admin/fraud-rules", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { name, type, scope, severity, autoBlock, conditions, actions, thresholds } = req.body;
      const userId = (req as any).user.id;
      
      const rule = await storage.createFraudRule({
        name,
        type,
        scope: scope || 'platform',
        severity,
        isActive: true,
        autoBlock: autoBlock || false,
        conditions: conditions || {},
        actions: actions || {},
        thresholds: thresholds || {},
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      auditLog(req, 'FRAUD_RULE_CREATED', ruleId, true, { name, type, severity });
      res.json(rule);
    } catch (error) {
      console.error("Create fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update fraud rule
  app.put("/api/admin/fraud-rules/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = (req as any).user.id;
      
      const rule = await storage.updateFraudRule(id, {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date().toISOString()
      });
      
      auditLog(req, 'FRAUD_RULE_UPDATED', id, true, updateData);
      res.json(rule);
    } catch (error) {
      console.error("Update fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete fraud rule
  app.delete("/api/admin/fraud-rules/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteFraudRule(id);
      
      auditLog(req, 'FRAUD_RULE_DELETED', id, true, {});
      res.json({ success: true });
    } catch (error) {
      console.error("Delete fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get fraud blocks
  app.get("/api/admin/fraud-blocks", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { type, isActive, page = 1, limit = 50 } = req.query;
      const blocks = await storage.getFraudBlocks({
        type: type as string,
        isActive: isActive ? isActive === 'true' : undefined
      });
      res.json(blocks);
    } catch (error) {
      console.error("Get fraud blocks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Remove fraud block
  app.delete("/api/admin/fraud-blocks/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.removeFraudBlock(id);
      
      auditLog(req, 'FRAUD_BLOCK_REMOVED', id, true, {});
      res.json({ success: true });
    } catch (error) {
      console.error("Remove fraud block error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/fraud-rules", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const ruleData = req.body;
      const userId = (req as any).user.id;
      
      const rule = await storage.createFraudRule({
        ...ruleData,
        createdBy: userId
      });
      
      auditLog(req, 'FRAUD_RULE_CREATED', rule.id, true, { name: rule.name, type: rule.type });
      res.json(rule);
    } catch (error) {
      console.error("Create fraud rule error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard API endpoints
  app.get('/api/admin/dashboard-metrics/:period', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const period = req.params.period; // 1d, 7d, 30d, 90d
      
      // Generate real-time metrics data
      const metrics = {
        activePartners: 1247,
        activeOffers: 89,
        todayClicks: 15420,
        yesterdayClicks: 14250,
        monthClicks: 425680,
        leads: 3850,
        conversions: 1205,
        platformRevenue: 45789.50,
        fraudRate: 2.3,
        cr: 3.13,
        epc: 2.97,
        roi: 167
      };
      
      res.json(metrics);
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  });

  app.get('/api/admin/dashboard-chart/:period', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const period = req.params.period;
      
      // Generate chart data for the period
      const chartData = [];
      const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        chartData.push({
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 2000) + 8000,
          leads: Math.floor(Math.random() * 300) + 200,
          conversions: Math.floor(Math.random() * 80) + 50,
          revenue: Math.floor(Math.random() * 3000) + 2000,
          fraud: Math.floor(Math.random() * 50) + 10
        });
      }
      
      res.json(chartData);
    } catch (error) {
      console.error('Dashboard chart error:', error);
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  });

  app.get('/api/admin/recent-activities', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const activities = [
        {
          id: '1',
          type: 'registration',
          title: 'Новая регистрация партнёра',
          description: 'Партнёр "AffiliateProMax" зарегистрировался в системе',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          priority: 'medium'
        },
        {
          id: '2',
          type: 'offer',
          title: 'Новый оффер активирован',
          description: 'Оффер "CasinoBonus2025" добавлен рекламодателем',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          priority: 'low'
        },
        {
          id: '3',
          type: 'fraud',
          title: 'Подозрительная активность',
          description: 'Обнаружен фрод-трафик от партнёра ID: 15234',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          priority: 'high'
        },
        {
          id: '4',
          type: 'ticket',
          title: 'Новый тикет в поддержку',
          description: 'Тикет #45892 от рекламодателя "GamingCorp"',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          priority: 'medium'
        },
        {
          id: '5',
          type: 'registration',
          title: 'Новый рекламодатель',
          description: 'Рекламодатель "TechSolutions" зарегистрировался',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          priority: 'low'
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error('Recent activities error:', error);
      res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
  });

  app.get('/api/admin/geo-distribution/:period', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const geoData = [
        { name: 'RU', value: 35 },
        { name: 'US', value: 25 },
        { name: 'DE', value: 15 },
        { name: 'UK', value: 12 },
        { name: 'FR', value: 8 },
        { name: 'CA', value: 5 }
      ];
      
      res.json(geoData);
    } catch (error) {
      console.error('Geo distribution error:', error);
      res.status(500).json({ error: 'Failed to fetch geo distribution' });
    }
  });

  // Fraud services integration endpoints
  app.get("/api/admin/fraud-services", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const services = [
        {
          id: "fs-1",
          serviceName: "FraudScore",
          apiKey: "fs_test_key_*****",
          isActive: true,
          endpoint: "https://api.fraudscore.com/v1/ip",
          rateLimit: 1000,
          lastSync: new Date().toISOString(),
          successRate: 98.5,
          averageResponseTime: 120
        },
        {
          id: "fq-1", 
          serviceName: "Forensiq",
          apiKey: "fq_test_key_*****",
          isActive: false,
          endpoint: "https://api.forensiq.com/v2/validate",
          rateLimit: 500,
          lastSync: new Date(Date.now() - 86400000).toISOString(),
          successRate: 97.2,
          averageResponseTime: 200
        },
        {
          id: "an-1",
          serviceName: "Anura", 
          apiKey: "an_test_key_*****",
          isActive: true,
          endpoint: "https://api.anura.io/v1/direct",
          rateLimit: 2000,
          lastSync: new Date().toISOString(),
          successRate: 99.1,
          averageResponseTime: 80
        },
        {
          id: "bb-1",
          serviceName: "Botbox",
          apiKey: "bb_test_key_*****", 
          isActive: false,
          endpoint: "https://api.botbox.io/v1/verify",
          rateLimit: 800,
          lastSync: new Date(Date.now() - 43200000).toISOString(),
          successRate: 96.8,
          averageResponseTime: 150
        }
      ];
      res.json(services);
    } catch (error) {
      console.error("Get fraud services error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Smart alerts endpoints
  app.get("/api/admin/smart-alerts", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const alerts = [
        {
          id: "alert-1",
          type: "fraud_spike",
          title: "Пик фрода",
          description: "Уведомление при резком увеличении фрод-трафика",
          severity: "high",
          triggeredAt: new Date(Date.now() - 7200000).toISOString(),
          threshold: { value: 20, period: 15, unit: "minutes" },
          currentValue: { fraudRate: 25.3, period: "last_15_min" },
          affectedMetrics: ["fraud_rate", "blocked_ips"],
          autoActions: ["block_suspicious_ips", "alert_admins"],
          isResolved: false
        },
        {
          id: "alert-2", 
          type: "cr_anomaly",
          title: "Аномалия CR",
          description: "Увеличение конверсии в 3-5 раз за короткое время",
          severity: "critical",
          triggeredAt: new Date(Date.now() - 1800000).toISOString(),
          threshold: { multiplier: 3, period: 30, unit: "minutes" },
          currentValue: { crIncrease: 4.2, baseline: 2.1, current: 8.8 },
          affectedMetrics: ["conversion_rate", "revenue"],
          autoActions: ["flag_traffic", "manual_review"],
          isResolved: false
        }
      ];
      res.json(alerts);
    } catch (error) {
      console.error("Get smart alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // In-memory storage for fraud services state
  const fraudServicesState = new Map([
    ["fs-1", {
      id: "fs-1",
      serviceName: "FraudScore", 
      apiKey: "fs_live_xxxxxxxxxxxxxxxx",
      isActive: true,
      endpoint: "https://api.fraudscore.io/v1",
      rateLimit: 1000,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      successRate: 99.2,
      averageResponseTime: 250
    }],
    ["fq-1", {
      id: "fq-1",
      serviceName: "Forensiq",
      apiKey: "fq_prod_xxxxxxxxxxxxxxxx", 
      isActive: false,
      endpoint: "https://api.forensiq.com/v2",
      rateLimit: 500,
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      successRate: 97.8,
      averageResponseTime: 180
    }],
    ["an-1", {
      id: "an-1",
      serviceName: "Anura",
      apiKey: "an_key_xxxxxxxxxxxxxxxx",
      isActive: true,
      endpoint: "https://api.anura.io/direct", 
      rateLimit: 2000,
      lastSync: new Date(Date.now() - 150000).toISOString(),
      successRate: 98.5,
      averageResponseTime: 320
    }],
    ["bb-1", {
      id: "bb-1",
      serviceName: "Botbox",
      apiKey: "bb_api_xxxxxxxxxxxxxxxx",
      isActive: false,
      endpoint: "https://api.botbox.io/v1",
      rateLimit: 800,
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      successRate: 96.1,
      averageResponseTime: 450
    }]
  ]);

  // Fraud services endpoints
  app.get("/api/admin/fraud-services", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const fraudServices = Array.from(fraudServicesState.values());
      res.json(fraudServices);
    } catch (error) {
      console.error("Get fraud services error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Test fraud service connection
  app.post("/api/admin/fraud-services/:id/test", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Simulate testing API connection
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo
      
      if (isSuccess) {
        res.json({
          success: true,
          responseTime: Math.floor(200 + Math.random() * 500),
          message: "Connection successful"
        });
        auditLog(req, 'FRAUD_SERVICE_TEST', id, true, { result: 'success' });
      } else {
        res.status(500).json({
          success: false,
          error: "Connection timeout or API key invalid"
        });
        auditLog(req, 'FRAUD_SERVICE_TEST', id, false, { result: 'failed' });
      }
    } catch (error) {
      console.error("Test fraud service error:", error);
      res.status(500).json({ error: "Test failed" });
    }
  });

  // Update fraud service status
  app.patch("/api/admin/fraud-services/:id", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // Update the service in our state
      const service = fraudServicesState.get(id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      // Update the service state
      const updatedService = {
        ...service,
        isActive: isActive,
        lastSync: new Date().toISOString()
      };
      fraudServicesState.set(id, updatedService);
      
      auditLog(req, 'FRAUD_SERVICE_UPDATED', id, true, { isActive });
      res.json(updatedService);
    } catch (error) {
      console.error("Update fraud service error:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
