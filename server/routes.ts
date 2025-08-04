import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertOfferSchema, insertTicketSchema, type User, offers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db, queryCache } from "./db";
import { z } from "zod";
import express from "express";

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

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
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
        return res.status(401).json({ error: "Invalid credentials" });
      }

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
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

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
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
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
        userData.ownerId = authUser.id || null;
      } else if (authUser.role === 'super_admin') {
        // Super admin can create anyone but set proper ownership
        if (userData.role === 'advertiser') {
          userData.ownerId = authUser.id || null; // Owner is super admin
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
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
            offers = offers.filter(offer => offerIds.includes(offer.id) || !offer.isPrivate);
          } else {
            offers = await storage.getOffers();
            offers = offers.filter(offer => !offer.isPrivate);
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
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
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

  // Enhanced user management routes
  
  // Create user
  app.post('/api/admin/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { username, email, password, role, firstName, lastName, country } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username) || await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userData = {
        id: randomUUID(),
        username,
        email,
        password: hashedPassword,
        role: role || 'affiliate',
        firstName,
        lastName,
        country,
        isActive: true,
        ownerId: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = await storage.createUser(userData as any);
      res.status(201).json(user);
    } catch (error: any) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

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

  // Bulk block users
  app.post('/api/admin/users/bulk-block', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, reason } = req.body;
      const blockedBy = getAuthenticatedUser(req).id;
      
      const result = await storage.bulkBlockUsers(userIds, reason, blockedBy);
      res.json(result);
    } catch (error: any) {
      console.error("Bulk block users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk unblock users
  app.post('/api/admin/users/bulk-unblock', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds } = req.body;
      
      const result = await storage.bulkUnblockUsers(userIds);
      res.json(result);
    } catch (error: any) {
      console.error("Bulk unblock users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bulk delete users
  app.post('/api/admin/users/bulk-delete', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userIds, hardDelete } = req.body;
      const deletedBy = getAuthenticatedUser(req).id;
      
      const result = await storage.bulkDeleteUsers(userIds, hardDelete, deletedBy);
      res.json(result);
    } catch (error: any) {
      console.error("Bulk delete users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
