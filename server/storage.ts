import { 
  users, offers, partnerOffers, trackingLinks, statistics, transactions, 
  postbacks, tickets, fraudAlerts, customRoles, userRoleAssignments,
  type User, type InsertUser, type Offer, type InsertOffer,
  type PartnerOffer, type InsertPartnerOffer, type TrackingLink, type InsertTrackingLink,
  type Transaction, type InsertTransaction, type Postback, type InsertPostback,
  type Ticket, type InsertTicket, type FraudAlert, type InsertFraudAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  getUsers(role?: string): Promise<User[]>;
  getUsersByOwner(ownerId: string, role?: string): Promise<User[]>;
  
  // Enhanced user management
  getUsersWithFilters(filters: {
    search?: string;
    role?: string;
    status?: string;
    userType?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
    lastActivityFrom?: string;
    lastActivityTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: User[]; total: number }>;
  blockUser(id: string, reason: string, blockedBy: string): Promise<User>;
  unblockUser(id: string): Promise<User>;
  softDeleteUser(id: string, deletedBy: string): Promise<User>;
  forceLogoutUser(id: string): Promise<void>;
  resetUserPassword(id: string): Promise<string>;
  getUserAnalytics(period: string): Promise<any>;
  exportUsers(filters: any, format: string): Promise<string>;
  bulkBlockUsers(userIds: string[], reason: string, blockedBy: string): Promise<any>;
  bulkUnblockUsers(userIds: string[]): Promise<any>;
  bulkDeleteUsers(userIds: string[], hardDelete: boolean, deletedBy: string): Promise<any>;
  
  // Offer management
  getOffer(id: string): Promise<Offer | undefined>;
  getOffers(advertiserId?: string): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: string, data: Partial<InsertOffer>): Promise<Offer>;
  deleteOffer(id: string): Promise<void>;
  
  // Partner offer management
  getPartnerOffers(partnerId?: string, offerId?: string): Promise<PartnerOffer[]>;
  createPartnerOffer(partnerOffer: InsertPartnerOffer): Promise<PartnerOffer>;
  updatePartnerOffer(id: string, data: Partial<InsertPartnerOffer>): Promise<PartnerOffer>;
  
  // Tracking links
  getTrackingLinks(partnerId?: string): Promise<TrackingLink[]>;
  getTrackingLinkByCode(code: string): Promise<TrackingLink | undefined>;
  createTrackingLink(link: InsertTrackingLink): Promise<TrackingLink>;
  
  // Statistics
  getStatistics(filters: {
    partnerId?: string;
    offerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]>;
  createStatistic(data: any): Promise<void>;
  
  // Transactions
  getTransactions(userId?: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction>;
  
  // Postbacks
  getPostbacks(userId: string): Promise<Postback[]>;
  createPostback(postback: InsertPostback): Promise<Postback>;
  updatePostback(id: string, data: Partial<InsertPostback>): Promise<Postback>;
  
  // Support tickets
  getTickets(userId?: string): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<InsertTicket>): Promise<Ticket>;
  
  // Fraud alerts
  getFraudAlerts(): Promise<FraudAlert[]>;
  createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert>;
  updateFraudAlert(id: string, data: Partial<InsertFraudAlert>): Promise<FraudAlert>;
  
  // Admin functions
  getAllUsers(role?: string): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getAllOffers(): Promise<(Offer & { advertiserName?: string })[]>;
  getAdminAnalytics(): Promise<any>;
  
  // System Settings
  getSystemSettings(): Promise<any[]>;
  createSystemSetting(setting: any): Promise<any>;
  updateSystemSetting(id: string, data: any): Promise<any>;
  deleteSystemSetting(id: string): Promise<void>;
  
  // Audit Logs
  getAuditLogs(filters: {
    search?: string;
    action?: string;
    resourceType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]>;
  
  // Global Postbacks
  getGlobalPostbacks(): Promise<any[]>;
  createGlobalPostback(postback: any): Promise<any>;
  updateGlobalPostback(id: string, data: any): Promise<any>;
  testGlobalPostback(id: string): Promise<void>;
  getPostbackLogs(): Promise<any[]>;
  
  // Blacklist Management
  getBlacklistEntries(filters: {
    search?: string;
    type?: string;
  }): Promise<any[]>;
  createBlacklistEntry(entry: any): Promise<any>;
  updateBlacklistEntry(id: string, data: any): Promise<any>;
  deleteBlacklistEntry(id: string): Promise<void>;
  
  // Admin offer management
  moderateOffer(id: string, action: string, moderatedBy: string, comment?: string): Promise<boolean>;
  getOfferLogs(offerId: string): Promise<any[]>;
  getOfferStats(offerId: string): Promise<any>;
  logOfferAction(offerId: string, userId: string, action: string, comment?: string, fieldChanged?: string, oldValue?: string, newValue?: string): Promise<void>;
  
  // Categories and templates
  getOfferCategories(): Promise<any[]>;
  createOfferCategory(data: any): Promise<any>;
  getModerationTemplates(): Promise<any[]>;
  createModerationTemplate(data: any): Promise<any>;
  
  // KYC documents
  getKycDocuments(): Promise<any[]>;
  updateKycDocument(id: string, data: any): Promise<any>;
  
  // Dashboard analytics
  getDashboardMetrics(role: string, userId?: string): Promise<any>;
  
  // Role management
  getCustomRoles(filters: { search?: string; scope?: string }): Promise<any[]>;
  getCustomRole(id: string): Promise<any | null>;
  createCustomRole(data: any): Promise<any>;
  updateCustomRole(id: string, data: any): Promise<any>;
  deleteCustomRole(id: string): Promise<void>;
  assignUserRole(userId: string, roleId: string, assignedBy: string, expiresAt?: string): Promise<any>;
  unassignUserRole(userId: string, roleId: string): Promise<void>;
  
  // Enhanced analytics
  getUserAnalyticsDetailed(period: string, role?: string): Promise<any>;
  getFraudAnalytics(period: string): Promise<any>;
  exportAnalytics(format: string, period: string, role?: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Send notification for new user registration
    try {
      const { notifyUserRegistration } = await import('./services/notification');
      await notifyUserRegistration(user, { 
        ipAddress: insertUser.lastLoginIp || 'Unknown'
      });
    } catch (error) {
      console.error('Failed to send registration notification:', error);
    }
    
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return await db.select().from(users).where(eq(users.role, role as any));
    }
    return await db.select().from(users);
  }

  // Get users with hierarchy filtering
  async getUsersByOwner(ownerId: string, role?: string): Promise<User[]> {
    if (role) {
      return await db.select().from(users).where(
        and(eq(users.ownerId, ownerId), eq(users.role, role as any))
      );
    }
    return await db.select().from(users).where(eq(users.ownerId, ownerId));
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer || undefined;
  }

  async getOffers(advertiserId?: string): Promise<Offer[]> {
    if (advertiserId) {
      return await db.select().from(offers).where(eq(offers.advertiserId, advertiserId));
    }
    return await db.select().from(offers);
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db
      .insert(offers)
      .values(offer)
      .returning();
    return newOffer;
  }

  async updateOffer(id: string, data: Partial<InsertOffer>): Promise<Offer> {
    // Don't add updatedAt manually - let database handle it with default
    const updateData = { ...data };
    // Remove any timestamp fields that might cause issues
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const [offer] = await db
      .update(offers)
      .set(updateData)
      .where(eq(offers.id, id))
      .returning();
    return offer;
  }

  async deleteOffer(id: string): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }

  async getPartnerOffers(partnerId?: string, offerId?: string): Promise<PartnerOffer[]> {
    let query = db.select().from(partnerOffers);
    
    if (partnerId && offerId) {
      return await query.where(and(
        eq(partnerOffers.partnerId, partnerId),
        eq(partnerOffers.offerId, offerId)
      ));
    } else if (partnerId) {
      return await query.where(eq(partnerOffers.partnerId, partnerId));
    } else if (offerId) {
      return await query.where(eq(partnerOffers.offerId, offerId));
    }
    
    return await query;
  }

  async createPartnerOffer(partnerOffer: InsertPartnerOffer): Promise<PartnerOffer> {
    const [newPartnerOffer] = await db
      .insert(partnerOffers)
      .values(partnerOffer)
      .returning();
    return newPartnerOffer;
  }

  async updatePartnerOffer(id: string, data: Partial<InsertPartnerOffer>): Promise<PartnerOffer> {
    const [partnerOffer] = await db
      .update(partnerOffers)
      .set(data)
      .where(eq(partnerOffers.id, id))
      .returning();
    return partnerOffer;
  }

  async getTrackingLinks(partnerId?: string): Promise<TrackingLink[]> {
    if (partnerId) {
      return await db.select().from(trackingLinks).where(eq(trackingLinks.partnerId, partnerId));
    }
    return await db.select().from(trackingLinks);
  }

  async getTrackingLinkByCode(code: string): Promise<TrackingLink | undefined> {
    const [link] = await db.select().from(trackingLinks).where(eq(trackingLinks.trackingCode, code));
    return link || undefined;
  }

  async createTrackingLink(link: InsertTrackingLink): Promise<TrackingLink> {
    const trackingCode = randomUUID().substring(0, 8);
    const [newLink] = await db
      .insert(trackingLinks)
      .values({ ...link, trackingCode })
      .returning();
    return newLink;
  }

  async getStatistics(filters: {
    partnerId?: string;
    offerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    let query = db.select().from(statistics);
    const conditions = [];

    if (filters.partnerId) {
      conditions.push(eq(statistics.partnerId, filters.partnerId));
    }
    if (filters.offerId) {
      conditions.push(eq(statistics.offerId, filters.offerId));
    }
    if (filters.startDate) {
      conditions.push(gte(statistics.date, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(statistics.date, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(statistics.date));
  }

  async createStatistic(data: any): Promise<void> {
    await db.insert(statistics).values(data);
  }

  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (userId) {
      return await db.select().from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));
    }
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getPostbacks(userId: string): Promise<Postback[]> {
    return await db.select().from(postbacks).where(eq(postbacks.userId, userId));
  }

  async createPostback(postback: InsertPostback): Promise<Postback> {
    const [newPostback] = await db
      .insert(postbacks)
      .values(postback)
      .returning();
    return newPostback;
  }

  async updatePostback(id: string, data: Partial<InsertPostback>): Promise<Postback> {
    const [postback] = await db
      .update(postbacks)
      .set(data)
      .where(eq(postbacks.id, id))
      .returning();
    return postback;
  }

  async getTickets(userId?: string): Promise<Ticket[]> {
    if (userId) {
      return await db.select().from(tickets)
        .where(eq(tickets.userId, userId))
        .orderBy(desc(tickets.createdAt));
    }
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db
      .insert(tickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async updateTicket(id: string, data: Partial<InsertTicket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async getFraudAlerts(): Promise<FraudAlert[]> {
    return await db.select().from(fraudAlerts).orderBy(desc(fraudAlerts.createdAt));
  }

  async createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert> {
    const [newAlert] = await db
      .insert(fraudAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async updateFraudAlert(id: string, data: Partial<InsertFraudAlert>): Promise<FraudAlert> {
    const [alert] = await db
      .update(fraudAlerts)
      .set(data)
      .where(eq(fraudAlerts.id, id))
      .returning();
    return alert;
  }

  async getAllUsers(role?: string): Promise<User[]> {
    if (role) {
      return await db.select().from(users)
        .where(eq(users.role, role as any))
        .orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllOffers(): Promise<(Offer & { advertiserName?: string })[]> {
    const offersWithAdvertisers = await db
      .select({
        id: offers.id,
        number: offers.number,
        name: offers.name,
        description: offers.description,
        logo: offers.logo,
        category: offers.category,
        vertical: offers.vertical,
        goals: offers.goals,
        advertiserId: offers.advertiserId,
        payout: offers.payout,
        payoutType: offers.payoutType,
        currency: offers.currency,
        countries: offers.countries,
        geoTargeting: offers.geoTargeting,
        landingPages: offers.landingPages,
        geoPricing: offers.geoPricing,
        kpiConditions: offers.kpiConditions,
        trafficSources: offers.trafficSources,
        dailyLimit: offers.dailyLimit,
        monthlyLimit: offers.monthlyLimit,
        antifraudEnabled: offers.antifraudEnabled,
        autoApprovePartners: offers.autoApprovePartners,
        status: offers.status,
        moderationStatus: offers.moderationStatus,
        moderationComment: offers.moderationComment,
        trackingUrl: offers.trackingUrl,
        landingPageUrl: offers.landingPageUrl,
        previewUrl: offers.previewUrl,
        restrictions: offers.restrictions,
        fraudRestrictions: offers.fraudRestrictions,
        macros: offers.macros,
        kycRequired: offers.kycRequired,
        isPrivate: offers.isPrivate,
        smartlinkEnabled: offers.smartlinkEnabled,
        isBlocked: offers.isBlocked,
        blockedReason: offers.blockedReason,
        isArchived: offers.isArchived,
        regionVisibility: offers.regionVisibility,
        createdAt: offers.createdAt,
        updatedAt: offers.updatedAt,
        advertiserName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown')`,
        allowedApps: offers.allowedApps,
      })
      .from(offers)
      .leftJoin(users, eq(offers.advertiserId, users.id))
      .orderBy(offers.createdAt);
    
    return offersWithAdvertisers;
  }

  // Admin offer management methods
  async moderateOffer(id: string, action: string, moderatedBy: string, comment?: string): Promise<boolean> {
    try {
      let updates: Partial<Offer> = { updatedAt: new Date() };

      switch (action) {
        case 'approve':
          updates.moderationStatus = 'approved';
          updates.status = 'active';
          break;
        case 'reject':
          updates.moderationStatus = 'rejected';
          updates.status = 'paused';
          break;
        case 'needs_revision':
          updates.moderationStatus = 'needs_revision';
          break;
        case 'archive':
          updates.isArchived = true;
          break;
        case 'block':
          updates.isBlocked = true;
          break;
        case 'unblock':
          updates.isBlocked = false;
          break;
      }

      if (comment) {
        updates.moderationComment = comment;
      }

      await db.update(offers).set(updates).where(eq(offers.id, id));
      
      // Log the action
      await this.logOfferAction(id, moderatedBy, action, comment);
      
      return true;
    } catch (error) {
      console.error('Error moderating offer:', error);
      return false;
    }
  }

  async getOfferLogs(offerId: string): Promise<any[]> {
    // For now, return empty array - would need offerLogs table implementation
    return [];
  }

  async getOfferStats(offerId: string): Promise<any> {
    const stats = await db
      .select({
        clicks: sum(statistics.clicks),
        conversions: sum(statistics.conversions),
        revenue: sum(sql<number>`CAST(${statistics.revenue} AS DECIMAL)`),
      })
      .from(statistics)
      .where(eq(statistics.offerId, offerId));

    if (!stats[0] || stats[0].clicks === null) {
      return {
        clicks: 0,
        conversions: 0,
        cr: '0.00',
        epc: '0.00'
      };
    }

    const totalClicks = Number(stats[0].clicks) || 0;
    const totalConversions = Number(stats[0].conversions) || 0;
    const totalRevenue = Number(stats[0].revenue) || 0;
    
    const cr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';
    const epc = totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : '0.00';

    return {
      clicks: totalClicks,
      conversions: totalConversions,
      cr,
      epc
    };
  }

  async logOfferAction(offerId: string, userId: string, action: string, comment?: string, fieldChanged?: string, oldValue?: string, newValue?: string): Promise<void> {
    // For now, just log to console - would need offerLogs table implementation
    console.log(`Offer ${offerId} ${action} by ${userId}`, { comment, fieldChanged, oldValue, newValue });
  }

  // Categories and templates - placeholder implementations
  async getOfferCategories(): Promise<any[]> {
    return [
      { id: '1', name: 'Finance', isActive: true },
      { id: '2', name: 'Dating', isActive: true },
      { id: '3', name: 'Gaming', isActive: true },
      { id: '4', name: 'Health', isActive: true },
    ];
  }

  async createOfferCategory(data: any): Promise<any> {
    return { id: randomUUID(), ...data, isActive: true, createdAt: new Date() };
  }

  async getModerationTemplates(): Promise<any[]> {
    return [
      { id: '1', name: 'Incomplete Description', type: 'rejection', message: 'The offer description is incomplete.' },
      { id: '2', name: 'Missing Geo-targeting', type: 'rejection', message: 'Geo-targeting information is missing.' },
      { id: '3', name: 'Policy Violation', type: 'rejection', message: 'This offer violates our platform policies.' },
    ];
  }

  async createModerationTemplate(data: any): Promise<any> {
    return { id: randomUUID(), ...data, isActive: true, createdAt: new Date() };
  }

  async getAdminAnalytics(): Promise<any> {
    // Implement admin analytics logic
    return {
      totalUsers: 0,
      totalOffers: 0,
      totalRevenue: 0,
      pendingKyc: 0
    };
  }

  async getKycDocuments(): Promise<any[]> {
    // Mock implementation - would integrate with actual KYC system
    return [];
  }

  async updateKycDocument(id: string, data: any): Promise<any> {
    // Mock implementation - would integrate with actual KYC system
    return { id, ...data };
  }

  async getDashboardMetrics(role: string, userId?: string): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (role === 'super_admin') {
      const [totalRevenue] = await db
        .select({ value: sum(statistics.revenue) })
        .from(statistics)
        .where(gte(statistics.date, thirtyDaysAgo));

      const [activePartners] = await db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.role, 'affiliate'), eq(users.isActive, true)));

      const [totalClicks] = await db
        .select({ value: sum(statistics.clicks) })
        .from(statistics)
        .where(gte(statistics.date, thirtyDaysAgo));

      const [totalConversions] = await db
        .select({ value: sum(statistics.conversions) })
        .from(statistics)
        .where(gte(statistics.date, thirtyDaysAgo));

      const [fraudAlertsCount] = await db
        .select({ value: count() })
        .from(fraudAlerts)
        .where(and(
          gte(fraudAlerts.createdAt, thirtyDaysAgo),
          eq(fraudAlerts.isResolved, false)
        ));

      return {
        totalRevenue: totalRevenue?.value || '0',
        activePartners: activePartners?.value || 0,
        conversionRate: totalClicks?.value ? 
          ((Number(totalConversions?.value || 0) / Number(totalClicks.value)) * 100).toFixed(2) : '0',
        fraudRate: '0.12', // Placeholder calculation
        fraudAlerts: fraudAlertsCount?.value || 0
      };
    }

    return {};
  }

  // === SYSTEM SETTINGS METHODS ===
  
  async getSystemSettings(): Promise<any[]> {
    // Mock implementation - replace with actual database queries
    return [
      { id: '1', key: 'platform_name', value: 'AffiliateHub', category: 'general', updatedBy: 'superadmin', updatedAt: new Date() },
      { id: '2', key: 'default_currency', value: 'USD', category: 'financial', updatedBy: 'superadmin', updatedAt: new Date() },
      { id: '3', key: 'max_payout_delay', value: '7', category: 'financial', updatedBy: 'superadmin', updatedAt: new Date() },
      { id: '4', key: 'fraud_detection_enabled', value: 'true', category: 'security', updatedBy: 'superadmin', updatedAt: new Date() },
    ];
  }

  async createSystemSetting(setting: any): Promise<any> {
    const newSetting = {
      id: randomUUID(),
      ...setting,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newSetting;
  }

  async updateSystemSetting(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  }

  async deleteSystemSetting(id: string): Promise<void> {
    // Mock implementation - replace with actual database deletion
  }

  // === AUDIT LOGS METHODS ===
  
  async getAuditLogs(filters: {
    search?: string;
    action?: string;
    resourceType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    // Mock implementation - replace with actual database queries
    return [
      {
        id: '1',
        action: 'CREATE',
        resourceType: 'User',
        resourceId: '123',
        userId: 'superadmin',
        userName: 'Super Admin',
        details: { newValues: { username: 'testuser', role: 'affiliate' } },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date()
      },
      {
        id: '2',
        action: 'UPDATE',
        resourceType: 'Offer',
        resourceId: '456',
        userId: 'advertiser1',
        userName: 'John Advertiser',
        details: { oldValues: { status: 'draft' }, newValues: { status: 'active' } },
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 3600000)
      }
    ];
  }

  // === GLOBAL POSTBACKS METHODS ===
  
  async getGlobalPostbacks(): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'Global Conversion Tracker',
        url: 'https://tracker.example.com/postback',
        method: 'POST',
        parameters: {
          conversion_id: '{conversion_id}',
          offer_id: '{offer_id}',
          payout: '{payout}',
          affiliate_id: '{affiliate_id}'
        },
        isActive: true,
        retryCount: 3,
        timeout: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async createGlobalPostback(postback: any): Promise<any> {
    return {
      id: randomUUID(),
      ...postback,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateGlobalPostback(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  }

  async testGlobalPostback(id: string): Promise<void> {
    // Mock implementation - would send test postback
    console.log(`Testing postback with ID: ${id}`);
  }

  async getPostbackLogs(): Promise<any[]> {
    return [
      {
        id: '1',
        postbackId: '1',
        postbackName: 'Global Conversion Tracker',
        url: 'https://tracker.example.com/postback',
        status: 'SUCCESS',
        responseCode: 200,
        responseBody: 'OK',
        sentAt: new Date(),
        responseTime: 150,
        retryCount: 0
      },
      {
        id: '2',
        postbackId: '1',
        postbackName: 'Global Conversion Tracker',
        url: 'https://tracker.example.com/postback',
        status: 'FAILED',
        responseCode: 500,
        responseBody: 'Internal Server Error',
        sentAt: new Date(Date.now() - 1800000),
        responseTime: 5000,
        retryCount: 2
      }
    ];
  }

  // === BLACKLIST METHODS ===
  
  async getBlacklistEntries(filters: {
    search?: string;
    type?: string;
  }): Promise<any[]> {
    return [
      {
        id: '1',
        type: 'IP',
        value: '192.168.1.100',
        reason: 'Fraudulent activity detected',
        addedBy: 'superadmin',
        addedByName: 'Super Admin',
        addedAt: new Date(),
        isActive: true
      },
      {
        id: '2',
        type: 'EMAIL',
        value: 'spam@example.com',
        reason: 'Spam registration attempts',
        addedBy: 'superadmin',
        addedByName: 'Super Admin',
        addedAt: new Date(Date.now() - 86400000),
        isActive: true
      },
      {
        id: '3',
        type: 'DOMAIN',
        value: 'fraud-site.com',
        reason: 'Known fraud domain',
        addedBy: 'superadmin',
        addedByName: 'Super Admin',
        addedAt: new Date(Date.now() - 172800000),
        isActive: false
      }
    ];
  }

  async createBlacklistEntry(entry: any): Promise<any> {
    return {
      id: randomUUID(),
      ...entry,
      addedAt: new Date(),
      isActive: true
    };
  }

  async updateBlacklistEntry(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  }

  async deleteBlacklistEntry(id: string): Promise<void> {
    // Mock implementation - replace with actual database deletion
  }

  // Enhanced user management methods
  async getUsersWithFilters(filters: {
    search?: string;
    role?: string;
    status?: string;
    userType?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
    lastActivityFrom?: string;
    lastActivityTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: User[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];
    
    if (filters.search) {
      conditions.push(
        sql`(${users.username} ILIKE ${`%${filters.search}%`} OR 
            ${users.email} ILIKE ${`%${filters.search}%`} OR
            ${users.firstName} ILIKE ${`%${filters.search}%`} OR
            ${users.lastName} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (filters.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    
    if (filters.status) {
      if (filters.status === 'active') {
        conditions.push(and(eq(users.isActive, true)));
      } else if (filters.status === 'blocked') {
        // Use isActive as proxy for blocked until migration
        conditions.push(eq(users.isActive, false));
      } else if (filters.status === 'inactive') {
        conditions.push(eq(users.isActive, false));
      }
    }
    
    if (filters.country) {
      conditions.push(eq(users.country, filters.country));
    }
    
    if (filters.dateFrom) {
      conditions.push(gte(users.createdAt, new Date(filters.dateFrom)));
    }
    
    if (filters.dateTo) {
      conditions.push(lte(users.createdAt, new Date(filters.dateTo)));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get paginated data with advertiser join for linked advertiser info
    const sortField = users[filters.sortBy as keyof typeof users] || users.createdAt;
    const orderBy = filters.sortOrder === 'asc' ? sortField : desc(sortField);

    const data = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        company: users.company,
        phone: users.phone,
        telegram: users.telegram,
        role: users.role,
        userType: users.userType,
        country: users.country,
        status: users.status,
        kycStatus: users.kycStatus,
        isActive: users.isActive,
        isBlocked: users.isBlocked,
        blockReason: users.blockReason,
        lastLoginAt: users.lastLoginAt,
        lastIpAddress: users.lastIpAddress,
        registrationIp: users.registrationIp,
        advertiserId: users.advertiserId,
        createdAt: users.createdAt,
        advertiserName: sql`CASE 
          WHEN ${users.advertiserId} IS NOT NULL 
          THEN (SELECT username FROM ${users} advertiser WHERE advertiser.id = ${users.advertiserId})
          ELSE NULL
        END`.as('advertiserName')
      })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: totalResult.count
    };
  }

  async blockUser(id: string, reason: string, blockedBy: string): Promise<User> {
    // For now, use isActive as proxy for blocked until migration
    const [user] = await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    // Send notification for user blocking
    try {
      const { notifyUserBlocked } = await import('./services/notification');
      await notifyUserBlocked(user, reason, blockedBy);
    } catch (error) {
      console.error('Failed to send blocking notification:', error);
    }

    return user;
  }

  async unblockUser(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async softDeleteUser(id: string, deletedBy: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async forceLogoutUser(id: string): Promise<void> {
    // This would invalidate all user sessions
    // For now, we just mark as logged out
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async resetUserPassword(id: string): Promise<string> {
    const newPassword = randomUUID().substring(0, 8);
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    return newPassword;
  }

  async getUserAnalytics(period: string): Promise<any> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));
    const [inactiveUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, false));
    const [newUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate));

    return {
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      blockedUsers: inactiveUsers.count, // Using inactive as proxy for blocked
      newUsers: newUsers.count,
      period
    };
  }

  async exportUsers(filters: any, format: string): Promise<string> {
    const { data } = await this.getUsersWithFilters({ ...filters, limit: 10000 });
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // CSV export
    const headers = ['ID', 'Username', 'Email', 'Role', 'Status', 'Country', 'Created At'];
    const csvData = [
      headers.join(','),
      ...data.map(user => [
        user.id,
        user.username,
        user.email,
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        user.country || '',
        user.createdAt.toISOString()
      ].join(','))
    ];
    
    return csvData.join('\n');
  }

  async bulkBlockUsers(userIds: string[], reason: string, blockedBy: string): Promise<any> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    for (const userId of userIds) {
      try {
        await this.blockUser(userId, reason, blockedBy);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to block user ${userId}: ${error}`);
      }
    }
    
    return results;
  }

  async bulkUnblockUsers(userIds: string[]): Promise<any> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    for (const userId of userIds) {
      try {
        await this.unblockUser(userId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to unblock user ${userId}: ${error}`);
      }
    }
    
    return results;
  }

  async bulkDeleteUsers(userIds: string[], hardDelete: boolean, deletedBy: string): Promise<any> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    for (const userId of userIds) {
      try {
        if (hardDelete) {
          await this.deleteUser(userId);
        } else {
          await this.softDeleteUser(userId, deletedBy);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to delete user ${userId}: ${error}`);
      }
    }
    
    return results;
  }

  async getDashboardMetrics(role: string, userId?: string): Promise<any> {
    // Return mock data for now - implement real metrics based on role
    return {
      totalUsers: 1250,
      activeUsers: 1180,
      totalRevenue: 125000,
      conversions: 890,
      conversionRate: 12.5,
      topOffers: [],
      recentActivity: []
    };
  }

  // Role management methods
  async getCustomRoles(filters: { search?: string; scope?: string }): Promise<any[]> {
    try {
      let query = db.select({
        id: customRoles.id,
        name: customRoles.name,
        description: customRoles.description,
        permissions: customRoles.permissions,
        advertiserId: customRoles.advertiserId,
        ipRestrictions: customRoles.ipRestrictions,
        geoRestrictions: customRoles.geoRestrictions,
        timeRestrictions: customRoles.timeRestrictions,
        isActive: customRoles.isActive,
        createdBy: customRoles.createdBy,
        createdAt: customRoles.createdAt,
        updatedAt: customRoles.updatedAt,
        advertiserName: users.username
      })
      .from(customRoles)
      .leftJoin(users, eq(customRoles.advertiserId, users.id));

      const rolesList = await query;
      
      // Add assigned users count
      const rolesWithCounts = await Promise.all(rolesList.map(async (role) => {
        const [countResult] = await db
          .select({ count: count() })
          .from(userRoleAssignments)
          .where(and(eq(userRoleAssignments.customRoleId, role.id), eq(userRoleAssignments.isActive, true)));
        
        return {
          ...role,
          assignedUsers: countResult?.count || 0
        };
      }));
      
      return rolesWithCounts;
    } catch (error) {
      console.error('Error getting custom roles:', error);
      return [];
    }
  }

  async getCustomRole(id: string): Promise<any | null> {
    try {
      const [role] = await db.select()
        .from(customRoles)
        .where(eq(customRoles.id, id));
      return role || null;
    } catch (error) {
      console.error('Error getting custom role:', error);
      return null;
    }
  }

  async createCustomRole(data: any): Promise<any> {
    try {
      const roleData = {
        id: randomUUID(),
        name: data.name,
        description: data.description || null,
        permissions: data.permissions,
        advertiserId: data.advertiserId || null,
        ipRestrictions: data.ipRestrictions || null,
        geoRestrictions: data.geoRestrictions || null,
        timeRestrictions: data.timeRestrictions || null,
        isActive: true,
        createdBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [role] = await db.insert(customRoles).values(roleData).returning();
      return role;
    } catch (error) {
      console.error('Error creating custom role:', error);
      throw error;
    }
  }

  async updateCustomRole(id: string, data: any): Promise<any> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      const [role] = await db
        .update(customRoles)
        .set(updateData)
        .where(eq(customRoles.id, id))
        .returning();
      
      return role;
    } catch (error) {
      console.error('Error updating custom role:', error);
      throw error;
    }
  }

  async deleteCustomRole(id: string): Promise<void> {
    try {
      // First, deactivate all user role assignments
      await db
        .update(userRoleAssignments)
        .set({ isActive: false })
        .where(eq(userRoleAssignments.customRoleId, id));

      // Then delete the role
      await db.delete(customRoles).where(eq(customRoles.id, id));
    } catch (error) {
      console.error('Error deleting custom role:', error);
      throw error;
    }
  }

  async assignUserRole(userId: string, roleId: string, assignedBy: string, expiresAt?: string): Promise<any> {
    try {
      const assignmentData = {
        id: randomUUID(),
        userId,
        customRoleId: roleId,
        assignedBy,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdAt: new Date()
      };

      const [assignment] = await db.insert(userRoleAssignments).values(assignmentData).returning();
      return assignment;
    } catch (error) {
      console.error('Error assigning user role:', error);
      throw error;
    }
  }

  async unassignUserRole(userId: string, roleId: string): Promise<void> {
    try {
      await db
        .update(userRoleAssignments)
        .set({ isActive: false })
        .where(
          and(
            eq(userRoleAssignments.userId, userId),
            eq(userRoleAssignments.customRoleId, roleId)
          )
        );
    } catch (error) {
      console.error('Error unassigning user role:', error);
      throw error;
    }
  }

  // Enhanced analytics methods
  async getUserAnalyticsDetailed(period: string, role?: string): Promise<any> {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Base user counts
      let userQuery = db.select({ count: count() }).from(users);
      if (role && role !== 'all') {
        userQuery = userQuery.where(eq(users.role, role));
      }
      
      const [totalUsers] = await userQuery;
      const [activeUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(role && role !== 'all' ? 
          and(eq(users.isActive, true), eq(users.role, role)) : 
          eq(users.isActive, true)
        );
      
      const [newUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(role && role !== 'all' ? 
          and(gte(users.createdAt, startDate), eq(users.role, role)) : 
          gte(users.createdAt, startDate)
        );

      // Role distribution
      const roleDistribution = await db
        .select({
          name: users.role,
          count: count()
        })
        .from(users)
        .groupBy(users.role);

      // Activity trends (mock data for now)
      const activityTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          active24h: Math.floor(Math.random() * 100) + 50,
          active7d: Math.floor(Math.random() * 200) + 100
        };
      }).reverse();

      // Registration trend
      const registrationTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          registrations: Math.floor(Math.random() * 10) + 1
        };
      }).reverse();

      // Geographic distribution (mock data)
      const geoDistribution = [
        { country: 'Russia', users: 450 },
        { country: 'Ukraine', users: 320 },
        { country: 'Belarus', users: 180 },
        { country: 'Kazakhstan', users: 120 },
        { country: 'Other', users: 230 }
      ];

      // Recent activity (mock data)
      const recentActivity = [
        { user: 'user123', action: 'Вход в систему', timestamp: new Date() },
        { user: 'affiliate456', action: 'Создание трекинг-ссылки', timestamp: new Date(Date.now() - 30000) },
        { user: 'advertiser789', action: 'Обновление оффера', timestamp: new Date(Date.now() - 60000) }
      ];

      return {
        totalUsers: totalUsers.count,
        totalUsersChange: '+5.2%',
        active24h: Math.floor(totalUsers.count * 0.3),
        active24hChange: '+2.1%',
        newUsers: newUsers.count,
        newUsersChange: '+12.5%',
        roleDistribution,
        activityTrend,
        registrationTrend,
        geoDistribution,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting detailed user analytics:', error);
      throw error;
    }
  }

  async getFraudAnalytics(period: string): Promise<any> {
    try {
      // Mock fraud analytics data
      return {
        totalAlerts: 15,
        alertsChange: '-8.5%',
        blockedUsers: 8,
        suspiciousIPs: 12,
        fraudRate: 2.3,
        securityEvents: [
          {
            type: 'Suspicious Login',
            description: 'Множественные попытки входа с разных IP',
            severity: 'High',
            timestamp: new Date()
          },
          {
            type: 'Duplicate Conversion',
            description: 'Подозрение на дублирование конверсий',
            severity: 'Medium',
            timestamp: new Date(Date.now() - 60000)
          }
        ]
      };
    } catch (error) {
      console.error('Error getting fraud analytics:', error);
      throw error;
    }
  }

  async exportAnalytics(format: string, period: string, role?: string): Promise<string> {
    try {
      const analytics = await this.getUserAnalyticsDetailed(period, role);
      
      if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      } else {
        // CSV format
        const csvHeaders = 'Metric,Value,Change\n';
        const csvData = [
          `Total Users,${analytics.totalUsers},${analytics.totalUsersChange}`,
          `Active 24h,${analytics.active24h},${analytics.active24hChange}`,
          `New Users,${analytics.newUsers},${analytics.newUsersChange}`
        ].join('\n');
        
        return csvHeaders + csvData;
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
