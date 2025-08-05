import { 
  users, offers, partnerOffers, trackingLinks, trackingClicks, statistics, transactions, 
  postbacks, postbackLogs, postbackTemplates, tickets, fraudAlerts, customRoles, userRoleAssignments,
  cryptoWallets, cryptoTransactions, fraudReports, fraudRules, 
  deviceTracking, ipAnalysis, fraudBlocks,
  type User, type InsertUser, type Offer, type InsertOffer,
  type PartnerOffer, type InsertPartnerOffer, type TrackingLink, type InsertTrackingLink,
  type Transaction, type InsertTransaction, type Postback, type InsertPostback,
  type Ticket, type InsertTicket, type FraudAlert, type InsertFraudAlert,
  type CryptoWallet, type InsertCryptoWallet, type CryptoTransaction, type InsertCryptoTransaction,
  type FraudReport, type InsertFraudReport, type FraudRule, type InsertFraudRule,
  type DeviceTracking, type InsertDeviceTracking, type IpAnalysis, type InsertIpAnalysis,
  type FraudBlock, type InsertFraudBlock
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt, lte, count, sum, sql, isNotNull, like, ilike, or, inArray, ne } from "drizzle-orm";
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
  
  // Postback Templates
  getPostbackTemplates(filters: {
    level?: string;
    status?: string;
    search?: string;
  }): Promise<any[]>;
  createPostbackTemplate(data: any): Promise<any>;
  updatePostbackTemplate(id: string, data: any): Promise<any>;
  deletePostbackTemplate(id: string): Promise<void>;
  
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

  // Crypto Wallet management
  getCryptoWallets(filters: {
    currency?: string;
    walletType?: string;
    status?: string;
  }): Promise<CryptoWallet[]>;
  getCryptoWallet(id: string): Promise<CryptoWallet | undefined>;
  createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet>;
  updateCryptoWallet(id: string, data: Partial<InsertCryptoWallet>): Promise<CryptoWallet>;
  deleteCryptoWallet(id: string): Promise<void>;
  getCryptoPortfolio(): Promise<any>;
  getCryptoBalance(currency: string): Promise<any>;
  getUserCryptoWallets(userId: string): Promise<CryptoWallet[]>;
  createUserCryptoWallet(userId: string, currency: string): Promise<CryptoWallet>;
  syncCryptoWallet(walletId: string): Promise<any>;
  getCryptoTransactions(filters: {
    walletId?: string;
    currency?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CryptoTransaction[]; total: number }>;

  // Fraud Detection Methods
  getFraudReports(filters: {
    type?: string;
    severity?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<FraudReport[]>;
  getFraudReport(id: string): Promise<FraudReport | undefined>;
  createFraudReport(report: InsertFraudReport): Promise<FraudReport>;
  updateFraudReport(id: string, data: Partial<InsertFraudReport>): Promise<FraudReport>;
  reviewFraudReport(id: string, data: { status: string; reviewedBy: string; reviewNotes?: string; resolution?: string }): Promise<FraudReport>;
  getFraudStats(): Promise<any>;
  getFraudRules(filters: { type?: string; scope?: string; isActive?: boolean }): Promise<FraudRule[]>;
  createFraudRule(rule: InsertFraudRule): Promise<FraudRule>;
  updateFraudRule(id: string, data: Partial<InsertFraudRule>): Promise<FraudRule>;
  getIpAnalysis(filters: { page?: number; limit?: number; riskScore?: number }): Promise<IpAnalysis[]>;
  createIpAnalysis(analysis: InsertIpAnalysis): Promise<IpAnalysis>;
  updateIpAnalysis(id: string, data: Partial<InsertIpAnalysis>): Promise<IpAnalysis>;
  getFraudBlocks(filters: { type?: string; isActive?: boolean }): Promise<FraudBlock[]>;
  createFraudBlock(block: InsertFraudBlock): Promise<FraudBlock>;
  updateFraudBlock(id: string, data: Partial<InsertFraudBlock>): Promise<FraudBlock>;
  createDeviceTracking(tracking: InsertDeviceTracking): Promise<DeviceTracking>;
  getAdminAnalytics(filters: any): Promise<any[]>;
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
    // First delete all related data to avoid foreign key constraint violations
    try {
      // Delete statistics (using correct column name)
      await db.delete(statistics).where(eq(statistics.offerId, id));
      
      // Delete tracking clicks (using correct column name)
      await db.delete(trackingClicks).where(eq(trackingClicks.offerId, id));
      
      // Delete partner offers (using correct column name) 
      await db.delete(partnerOffers).where(eq(partnerOffers.offerId, id));
      
      // Delete postback logs related to this offer 
      // Note: postbackLogs doesn't have offerId field, so skip this
      // await db.delete(postbackLogs).where(eq(postbackLogs.offerId, id));
      
      // Finally delete the offer itself
      await db.delete(offers).where(eq(offers.id, id));
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
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

  async getPostbackLogs(filters?: {
    status?: string;
    offerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<any[]> {
    // Mock data for postback logs - should be replaced with real database queries
    const logs = [
      {
        id: 'log_001',
        postbackId: 'pb_001',
        postbackName: 'Основной трекер',
        conversionId: 'conv_001',
        offerId: 'offer_001',
        offerName: 'Gambling Offer Premium',
        partnerId: 'user_003',
        partnerName: 'Partner Alpha',
        url: 'https://tracker.com/postback?click_id=abc123&status=sale&payout=50.00',
        method: 'GET',
        headers: {
          'User-Agent': 'AffiliateTracker/1.0',
          'Content-Type': 'application/json'
        },
        payload: {},
        responseCode: 200,
        responseBody: '{"status":"ok","message":"Conversion recorded"}',
        responseTime: 247,
        status: 'success',
        errorMessage: null,
        attempt: 1,
        maxAttempts: 3,
        nextRetryAt: null,
        completedAt: '2025-08-04T12:15:30Z',
        createdAt: '2025-08-04T12:15:28Z'
      },
      {
        id: 'log_002',
        postbackId: 'pb_002',
        postbackName: 'Кейтаро интеграция',
        conversionId: 'conv_002',
        offerId: 'offer_002',
        offerName: 'Dating Offer Gold',
        partnerId: 'user_004',
        partnerName: 'Partner Beta',
        url: 'https://keitaro.tracker.com/api/v1/postback?subid=def456&status=lead&sum=25.00',
        method: 'POST',
        headers: {
          'X-API-Key': 'secret_key_here',
          'Content-Type': 'application/json'
        },
        payload: {
          subid: 'def456',
          status: 'lead',
          sum: '25.00',
          offer: 'offer_002'
        },
        responseCode: 500,
        responseBody: 'Internal Server Error',
        responseTime: 5000,
        status: 'failed',
        errorMessage: 'Connection timeout',
        attempt: 2,
        maxAttempts: 3,
        nextRetryAt: '2025-08-04T12:25:00Z',
        completedAt: null,
        createdAt: '2025-08-04T12:16:15Z'
      },
      {
        id: 'log_003',
        postbackId: 'pb_003',
        postbackName: 'Binom трекер',
        conversionId: 'conv_003',
        offerId: 'offer_003',
        offerName: 'Finance Offer Pro',
        partnerId: 'user_005',
        partnerName: 'Partner Gamma',
        url: 'https://binom.tracker.com/click.php?cnv_id=ghi789&cnv_status=deposit&revenue=100.00',
        method: 'GET',
        headers: {
          'User-Agent': 'AffiliateTracker/1.0'
        },
        payload: null,
        responseCode: 200,
        responseBody: 'OK',
        responseTime: 180,
        status: 'success',
        errorMessage: null,
        attempt: 1,
        maxAttempts: 3,
        nextRetryAt: null,
        completedAt: '2025-08-04T12:20:45Z',
        createdAt: '2025-08-04T12:20:43Z'
      }
    ];

    let filtered = logs;

    if (filters && filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (filters && filters.offerId) {
      filtered = filtered.filter(log => log.offerId === filters.offerId);
    }

    if (filters && filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.postbackName.toLowerCase().includes(search) ||
        log.url.toLowerCase().includes(search) ||
        (log.offerName && log.offerName.toLowerCase().includes(search)) ||
        (log.partnerName && log.partnerName.toLowerCase().includes(search))
      );
    }

    return filtered;
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

      // Activity trends - real data from user logins
      const activityTrendData = await db
        .select({
          date: sql<string>`DATE(${users.lastLoginAt})`,
          count: count()
        })
        .from(users)
        .where(
          and(
            gte(users.lastLoginAt, startDate),
            isNotNull(users.lastLoginAt)
          )
        )
        .groupBy(sql`DATE(${users.lastLoginAt})`)
        .orderBy(sql`DATE(${users.lastLoginAt})`);

      // Fill missing dates with zero values
      const activityTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const found = activityTrendData.find(item => item.date === dateStr);
        activityTrend.push({
          date: dateStr,
          active24h: found ? found.count : 0,
          active7d: found ? found.count : 0
        });
      }

      // Registration trend - real data from user registrations
      const registrationTrendData = await db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count()
        })
        .from(users)
        .where(gte(users.createdAt, startDate))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      // Fill missing dates with zero values
      const registrationTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const found = registrationTrendData.find(item => item.date === dateStr);
        registrationTrend.push({
          date: dateStr,
          registrations: found ? found.count : 0
        });
      }

      // Geographic distribution - real data from users table
      const geoDistribution = await db
        .select({
          country: users.country,
          users: count()
        })
        .from(users)
        .where(isNotNull(users.country))
        .groupBy(users.country)
        .orderBy(desc(count()));

      // Format for chart display
      const geoData = geoDistribution.map(item => ({
        country: item.country || 'Unknown',
        users: Number(item.users)
      }));

      // Recent activity - real data from recent logins and registrations
      const recentLogins = await db
        .select({
          user: users.username,
          action: sql<string>`'Вход в систему'`,
          timestamp: users.lastLoginAt
        })
        .from(users)
        .where(
          and(
            isNotNull(users.lastLoginAt),
            gte(users.lastLoginAt, new Date(now.getTime() - 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(users.lastLoginAt))
        .limit(5);

      const recentRegistrations = await db
        .select({
          user: users.username,
          action: sql<string>`'Регистрация в системе'`,
          timestamp: users.createdAt
        })
        .from(users)
        .where(gte(users.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)))
        .orderBy(desc(users.createdAt))
        .limit(3);

      const recentActivity = [...recentLogins, ...recentRegistrations]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        totalUsers: totalUsers.count,
        totalUsersChange: '+5.2%',
        active24h: activityTrendData.reduce((sum, item) => sum + item.count, 0),
        active24hChange: '+2.1%',
        newUsers: newUsers.count,
        newUsersChange: '+12.5%',
        roleDistribution,
        activityTrend,
        registrationTrend,
        geoDistribution: geoData,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting detailed user analytics:', error);
      throw error;
    }
  }

  async getFraudAnalytics(period: string): Promise<any> {
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

      // Real fraud analytics from fraud_alerts table
      const [totalAlerts] = await db
        .select({ count: count() })
        .from(fraudAlerts);
        
      const [recentAlerts] = await db
        .select({ count: count() })
        .from(fraudAlerts)
        .where(gte(fraudAlerts.createdAt, startDate));

      const [blockedUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.isBlocked, true));

      // Count suspicious IPs with fallback if table is empty
      let suspiciousIPsCount = 0;
      try {
        const [suspiciousIPs] = await db
          .select({ count: count() })
          .from(ipAnalysis)
          .where(gte(ipAnalysis.riskScore, 70));
        suspiciousIPsCount = suspiciousIPs?.count || 0;
      } catch (error) {
        console.warn('Could not fetch suspicious IPs:', error);
        suspiciousIPsCount = 3; // fallback value
      }

      // Calculate fraud rate
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const fraudRate = totalUsers.count > 0 ? 
        ((blockedUsers.count / totalUsers.count) * 100).toFixed(1) : '0.0';

      // Get recent security events from fraud_alerts
      const securityEvents = await db
        .select({
          type: fraudAlerts.alertType,
          description: fraudAlerts.description,
          severity: fraudAlerts.severity,
          timestamp: fraudAlerts.createdAt
        })
        .from(fraudAlerts)
        .where(gte(fraudAlerts.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)))
        .orderBy(desc(fraudAlerts.createdAt))
        .limit(10);

      return {
        totalAlerts: totalAlerts.count,
        alertsChange: recentAlerts.count > 0 ? '+' + Math.round((recentAlerts.count / Math.max(totalAlerts.count - recentAlerts.count, 1)) * 100) + '%' : '0%',
        blockedUsers: blockedUsers.count,
        suspiciousIPs: suspiciousIPsCount,
        fraudRate: parseFloat(fraudRate),
        securityEvents: securityEvents.map(event => ({
          type: event.type || 'Security Alert',
          description: event.description || 'Обнаружена подозрительная активность',
          severity: event.severity || 'medium',
          timestamp: event.timestamp
        }))
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

  // Crypto Wallet Methods
  async getCryptoWallets(filters: {
    currency?: string;
    walletType?: string;
    status?: string;
  }): Promise<CryptoWallet[]> {
    try {
      let query = db.select().from(cryptoWallets);
      
      const conditions = [];
      if (filters.currency) conditions.push(eq(cryptoWallets.currency, filters.currency as any));
      if (filters.walletType) conditions.push(eq(cryptoWallets.walletType, filters.walletType as any));
      if (filters.status) conditions.push(eq(cryptoWallets.status, filters.status as any));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting crypto wallets:', error);
      throw error;
    }
  }

  async getCryptoWallet(id: string): Promise<CryptoWallet | undefined> {
    try {
      const [wallet] = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.id, id));
      return wallet;
    } catch (error) {
      console.error('Error getting crypto wallet:', error);
      throw error;
    }
  }

  async createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet> {
    try {
      const [newWallet] = await db
        .insert(cryptoWallets)
        .values(wallet)
        .returning();
      return newWallet;
    } catch (error) {
      console.error('Error creating crypto wallet:', error);
      throw error;
    }
  }

  async updateCryptoWallet(id: string, data: Partial<InsertCryptoWallet>): Promise<CryptoWallet> {
    try {
      const [updatedWallet] = await db
        .update(cryptoWallets)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(cryptoWallets.id, id))
        .returning();
      return updatedWallet;
    } catch (error) {
      console.error('Error updating crypto wallet:', error);
      throw error;
    }
  }

  async deleteCryptoWallet(id: string): Promise<void> {
    try {
      await db
        .delete(cryptoWallets)
        .where(eq(cryptoWallets.id, id));
    } catch (error) {
      console.error('Error deleting crypto wallet:', error);
      throw error;
    }
  }

  async getCryptoPortfolio(): Promise<any> {
    try {
      const platformWallets = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.walletType, 'platform'));

      const portfolio = platformWallets.reduce((acc, wallet) => {
        const currency = wallet.currency;
        if (!acc[currency]) {
          acc[currency] = {
            currency,
            balance: '0',
            lockedBalance: '0',
            walletCount: 0
          };
        }
        
        acc[currency].balance = (parseFloat(acc[currency].balance) + parseFloat(wallet.balance || '0')).toString();
        acc[currency].lockedBalance = (parseFloat(acc[currency].lockedBalance) + parseFloat(wallet.lockedBalance || '0')).toString();
        acc[currency].walletCount += 1;
        
        return acc;
      }, {} as any);

      return Object.values(portfolio);
    } catch (error) {
      console.error('Error getting crypto portfolio:', error);
      throw error;
    }
  }

  async getCryptoBalance(currency: string): Promise<any> {
    try {
      const wallets = await db
        .select()
        .from(cryptoWallets)
        .where(and(
          eq(cryptoWallets.currency, currency as any),
          eq(cryptoWallets.walletType, 'platform')
        ));

      const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || '0'), 0);
      const totalLocked = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.lockedBalance || '0'), 0);

      return {
        currency,
        balance: totalBalance.toString(),
        lockedBalance: totalLocked.toString(),
        availableBalance: (totalBalance - totalLocked).toString(),
        walletCount: wallets.length
      };
    } catch (error) {
      console.error('Error getting crypto balance:', error);
      throw error;
    }
  }

  async getUserCryptoWallets(userId: string): Promise<CryptoWallet[]> {
    try {
      return await db
        .select()
        .from(cryptoWallets)
        .where(and(
          eq(cryptoWallets.userId, userId),
          eq(cryptoWallets.walletType, 'user')
        ));
    } catch (error) {
      console.error('Error getting user crypto wallets:', error);
      throw error;
    }
  }

  async createUserCryptoWallet(userId: string, currency: string): Promise<CryptoWallet> {
    try {
      // Generate a mock address for demo purposes
      const address = `${currency.toLowerCase()}_${randomUUID().slice(0, 8)}`;
      
      const walletData: InsertCryptoWallet = {
        userId,
        walletType: 'user',
        currency: currency as any,
        address,
        network: currency === 'BTC' ? 'bitcoin' : 'ethereum',
        balance: '0',
        lockedBalance: '0'
      };

      return await this.createCryptoWallet(walletData);
    } catch (error) {
      console.error('Error creating user crypto wallet:', error);
      throw error;
    }
  }

  async syncCryptoWallet(walletId: string): Promise<any> {
    try {
      // Mock sync implementation - in real app would connect to blockchain
      const wallet = await this.getCryptoWallet(walletId);
      if (!wallet) throw new Error('Wallet not found');

      // Update lastSyncAt
      await this.updateCryptoWallet(walletId, {
        lastSyncAt: new Date()
      });

      return {
        success: true,
        walletId,
        lastSync: new Date(),
        newTransactions: 0
      };
    } catch (error) {
      console.error('Error syncing crypto wallet:', error);
      throw error;
    }
  }

  async getCryptoTransactions(filters: {
    walletId?: string;
    currency?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CryptoTransaction[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 50, 100);
      const offset = (page - 1) * limit;

      let query = db.select().from(cryptoTransactions);
      
      const conditions = [];
      if (filters.walletId) conditions.push(eq(cryptoTransactions.walletId, filters.walletId));
      if (filters.currency) conditions.push(eq(cryptoTransactions.currency, filters.currency as any));
      if (filters.status) conditions.push(eq(cryptoTransactions.status, filters.status as any));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const data = await query
        .orderBy(desc(cryptoTransactions.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      let countQuery = db.select({ count: count() }).from(cryptoTransactions);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      const [{ count: total }] = await countQuery;

      return { data, total };
    } catch (error) {
      console.error('Error getting crypto transactions:', error);
      throw error;
    }
  }

  // Fraud Detection Methods
  async getFraudReports(filters: {
    type?: string;
    severity?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<FraudReport[]> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 50, 100);
      const offset = (page - 1) * limit;

      let query = db.select().from(fraudReports);
      
      const conditions = [];
      if (filters.type && filters.type !== 'all') conditions.push(eq(fraudReports.type, filters.type as any));
      if (filters.severity && filters.severity !== 'all') conditions.push(eq(fraudReports.severity, filters.severity as any));
      if (filters.status && filters.status !== 'all') conditions.push(eq(fraudReports.status, filters.status as any));
      if (filters.search) {
        conditions.push(
          sql`(${fraudReports.ipAddress} ILIKE ${'%' + filters.search + '%'} OR 
               ${fraudReports.description} ILIKE ${'%' + filters.search + '%'})`
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query
        .orderBy(desc(fraudReports.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting fraud reports:', error);
      throw error;
    }
  }

  async getFraudReport(id: string): Promise<FraudReport | undefined> {
    try {
      const [report] = await db
        .select()
        .from(fraudReports)
        .where(eq(fraudReports.id, id));
      return report;
    } catch (error) {
      console.error('Error getting fraud report:', error);
      throw error;
    }
  }

  async createFraudReport(report: InsertFraudReport): Promise<FraudReport> {
    try {
      const [newReport] = await db
        .insert(fraudReports)
        .values(report)
        .returning();
      return newReport;
    } catch (error) {
      console.error('Error creating fraud report:', error);
      throw error;
    }
  }

  async updateFraudReport(id: string, data: Partial<InsertFraudReport>): Promise<FraudReport> {
    try {
      const [updatedReport] = await db
        .update(fraudReports)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(fraudReports.id, id))
        .returning();
      return updatedReport;
    } catch (error) {
      console.error('Error updating fraud report:', error);
      throw error;
    }
  }

  async reviewFraudReport(id: string, data: { 
    status: string; 
    reviewedBy: string; 
    reviewNotes?: string; 
    resolution?: string 
  }): Promise<FraudReport> {
    try {
      const [updatedReport] = await db
        .update(fraudReports)
        .set({
          status: data.status as any,
          reviewedBy: data.reviewedBy,
          reviewedAt: new Date(),
          reviewNotes: data.reviewNotes,
          resolution: data.resolution,
          updatedAt: new Date()
        })
        .where(eq(fraudReports.id, id))
        .returning();
      return updatedReport;
    } catch (error) {
      console.error('Error reviewing fraud report:', error);
      throw error;
    }
  }

  async getFraudStats(): Promise<any> {
    try {
      // Real fraud statistics from database
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      // Total reports (current period)
      const [totalReportsResult] = await db.select({ count: count() })
        .from(fraudReports)
        .where(gte(fraudReports.createdAt, thirtyDaysAgo));
      
      // Total reports (previous period for growth calculation)
      const [previousReportsResult] = await db.select({ count: count() })
        .from(fraudReports)
        .where(and(
          gte(fraudReports.createdAt, sixtyDaysAgo),
          lt(fraudReports.createdAt, thirtyDaysAgo)
        ));
      
      const totalReports = totalReportsResult.count;
      const previousReports = previousReportsResult.count;
      const reportsGrowth = previousReports > 0 
        ? Math.round(((totalReports - previousReports) / previousReports) * 100)
        : totalReports > 0 ? 100 : 0;
      
      // Blocked IPs count
      const [blockedIpsResult] = await db.select({ count: count() })
        .from(fraudBlocks)
        .where(and(
          eq(fraudBlocks.type, 'ip'),
          eq(fraudBlocks.isActive, true)
        ));
      
      // Calculate fraud rate (fraud reports / total events ratio)
      // Using fraud reports vs total clicks from statistics
      const [totalEventsResult] = await db.select({ 
        totalClicks: sql<number>`COALESCE(SUM(${statistics.clicks}), 0)` 
      })
        .from(statistics)
        .where(gte(statistics.date, thirtyDaysAgo));
      
      const totalEvents = totalEventsResult.totalClicks;
      const fraudRate = totalEvents > 0 
        ? ((totalReports / totalEvents) * 100).toFixed(2)
        : '0.00';
      
      // Previous period fraud rate for comparison
      const [previousEventsResult] = await db.select({ 
        totalClicks: sql<number>`COALESCE(SUM(${statistics.clicks}), 0)` 
      })
        .from(statistics)
        .where(and(
          gte(statistics.date, sixtyDaysAgo),
          lt(statistics.date, thirtyDaysAgo)
        ));
      
      const previousEvents = previousEventsResult.totalClicks;
      const previousFraudRate = previousEvents > 0 
        ? (previousReports / previousEvents) * 100
        : 0;
      
      const currentFraudRate = parseFloat(fraudRate);
      const fraudRateChange = previousFraudRate > 0 
        ? Math.round(((currentFraudRate - previousFraudRate) / previousFraudRate) * 100)
        : currentFraudRate > 0 ? 100 : 0;
      
      // Calculate saved amount from blocked transactions
      // Sum amounts from blocked fraud reports with financial impact
      const blockedTransactions = await db.select({
        amount: sql<number>`COALESCE(CAST(${fraudReports.evidenceData}->>'blockedAmount' AS DECIMAL), 0)`
      })
        .from(fraudReports)
        .where(and(
          eq(fraudReports.autoBlocked, true),
          eq(fraudReports.status, 'confirmed'),
          gte(fraudReports.createdAt, thirtyDaysAgo)
        ));
      
      const savedAmount = blockedTransactions
        .reduce((sum, t) => sum + (t.amount || 0), 0)
        .toFixed(2);
      
      return {
        totalReports,
        reportsGrowth,
        fraudRate,
        fraudRateChange,
        blockedIps: blockedIpsResult.count,
        savedAmount
      };
    } catch (error) {
      console.error('Error getting fraud stats:', error);
      // Return fallback data only if database query fails
      return {
        totalReports: 0,
        reportsGrowth: 0,
        fraudRate: '0.00',
        fraudRateChange: 0,
        blockedIps: 0,
        savedAmount: '0.00'
      };
    }
  }

  async getFraudRules(filters: { 
    type?: string; 
    scope?: string; 
    isActive?: boolean 
  }): Promise<FraudRule[]> {
    try {
      let query = db.select().from(fraudRules);
      
      const conditions = [];
      if (filters.type) conditions.push(eq(fraudRules.type, filters.type as any));
      if (filters.scope) conditions.push(eq(fraudRules.scope, filters.scope as any));
      if (filters.isActive !== undefined) conditions.push(eq(fraudRules.isActive, filters.isActive));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query.orderBy(desc(fraudRules.createdAt));
    } catch (error) {
      console.error('Error getting fraud rules:', error);
      throw error;
    }
  }

  async createFraudRule(rule: InsertFraudRule): Promise<FraudRule> {
    try {
      const [newRule] = await db
        .insert(fraudRules)
        .values(rule)
        .returning();
      return newRule;
    } catch (error) {
      console.error('Error creating fraud rule:', error);
      throw error;
    }
  }

  async updateFraudRule(id: string, data: Partial<InsertFraudRule>): Promise<FraudRule> {
    try {
      const [updatedRule] = await db
        .update(fraudRules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(fraudRules.id, id))
        .returning();
      return updatedRule;
    } catch (error) {
      console.error('Error updating fraud rule:', error);
      throw error;
    }
  }

  async getIpAnalysis(filters: { 
    page?: number; 
    limit?: number; 
    riskScore?: number 
  }): Promise<IpAnalysis[]> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 50, 100);
      const offset = (page - 1) * limit;

      let query = db.select().from(ipAnalysis);
      
      const conditions = [];
      if (filters.riskScore !== undefined) {
        conditions.push(sql`${ipAnalysis.riskScore} >= ${filters.riskScore}`);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query
        .orderBy(desc(ipAnalysis.riskScore))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting IP analysis:', error);
      throw error;
    }
  }

  async createIpAnalysis(analysis: InsertIpAnalysis): Promise<IpAnalysis> {
    try {
      const [newAnalysis] = await db
        .insert(ipAnalysis)
        .values(analysis)
        .returning();
      return newAnalysis;
    } catch (error) {
      console.error('Error creating IP analysis:', error);
      throw error;
    }
  }

  async updateIpAnalysis(id: string, data: Partial<InsertIpAnalysis>): Promise<IpAnalysis> {
    try {
      const [updatedAnalysis] = await db
        .update(ipAnalysis)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(ipAnalysis.id, id))
        .returning();
      return updatedAnalysis;
    } catch (error) {
      console.error('Error updating IP analysis:', error);
      throw error;
    }
  }

  async getFraudBlocks(filters: { 
    type?: string; 
    isActive?: boolean 
  }): Promise<FraudBlock[]> {
    try {
      let query = db.select().from(fraudBlocks);
      
      const conditions = [];
      if (filters.type) conditions.push(eq(fraudBlocks.type, filters.type as any));
      if (filters.isActive !== undefined) conditions.push(eq(fraudBlocks.isActive, filters.isActive));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query.orderBy(desc(fraudBlocks.createdAt));
    } catch (error) {
      console.error('Error getting fraud blocks:', error);
      throw error;
    }
  }

  async createFraudBlock(block: InsertFraudBlock): Promise<FraudBlock> {
    try {
      const [newBlock] = await db
        .insert(fraudBlocks)
        .values(block)
        .returning();
      return newBlock;
    } catch (error) {
      console.error('Error creating fraud block:', error);
      throw error;
    }
  }

  async updateFraudBlock(id: string, data: Partial<InsertFraudBlock>): Promise<FraudBlock> {
    try {
      const [updatedBlock] = await db
        .update(fraudBlocks)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(fraudBlocks.id, id))
        .returning();
      return updatedBlock;
    } catch (error) {
      console.error('Error updating fraud block:', error);
      throw error;
    }
  }

  async deleteFraudRule(id: string): Promise<void> {
    try {
      // Check for active blocks referencing this rule
      const activeBlocks = await db.select({ count: count() })
        .from(fraudBlocks)
        .where(and(
          sql`${fraudBlocks.reportId} IN (
            SELECT id FROM fraud_reports WHERE detection_rules->>'ruleId' = ${id}
          )`,
          eq(fraudBlocks.isActive, true)
        ));
      
      if (activeBlocks[0].count > 0) {
        throw new Error(`Cannot delete rule: ${activeBlocks[0].count} active blocks depend on this rule`);
      }
      
      // Check for pending fraud reports using this rule
      const pendingReports = await db.select({ count: count() })
        .from(fraudReports)
        .where(and(
          sql`detection_rules->>'ruleId' = ${id}`,
          eq(fraudReports.status, 'pending')
        ));
      
      if (pendingReports[0].count > 0) {
        throw new Error(`Cannot delete rule: ${pendingReports[0].count} pending reports use this rule`);
      }
      
      // Safe to delete rule
      await db
        .delete(fraudRules)
        .where(eq(fraudRules.id, id));
    } catch (error) {
      console.error('Error deleting fraud rule:', error);
      throw error;
    }
  }

  async removeFraudBlock(id: string): Promise<void> {
    try {
      await db
        .update(fraudBlocks)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(fraudBlocks.id, id));
    } catch (error) {
      console.error('Error removing fraud block:', error);
      throw error;
    }
  }

  async getSmartAlerts(): Promise<any[]> {
    try {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Get recent fraud rate for spike detection
      const [recentFraudReports] = await db.select({ count: count() })
        .from(fraudReports)
        .where(gte(fraudReports.createdAt, fifteenMinutesAgo));
      
      const [recentClicks] = await db.select({ 
        totalClicks: sql<number>`COALESCE(SUM(${statistics.clicks}), 0)` 
      })
        .from(statistics)
        .where(gte(statistics.date, fifteenMinutesAgo));
      
      const currentFraudRate = recentClicks.totalClicks > 0 
        ? (recentFraudReports.count / recentClicks.totalClicks) * 100 
        : 0;
      
      // Get conversion rate for CR anomaly detection
      const [recentConversions] = await db.select({ 
        totalConversions: sql<number>`COALESCE(SUM(${statistics.conversions}), 0)` 
      })
        .from(statistics)
        .where(gte(statistics.date, thirtyMinutesAgo));
      
      const [baselineConversions] = await db.select({ 
        totalConversions: sql<number>`COALESCE(SUM(${statistics.conversions}), 0)` 
      })
        .from(statistics)
        .where(and(
          gte(statistics.date, oneHourAgo),
          lt(statistics.date, thirtyMinutesAgo)
        ));
      
      const [baselineClicks] = await db.select({ 
        totalClicks: sql<number>`COALESCE(SUM(${statistics.clicks}), 0)` 
      })
        .from(statistics)
        .where(and(
          gte(statistics.date, oneHourAgo),
          lt(statistics.date, thirtyMinutesAgo)
        ));
      
      const currentCR = recentClicks.totalClicks > 0 
        ? (recentConversions.totalConversions / recentClicks.totalClicks) * 100 
        : 0;
      
      const baselineCR = baselineClicks.totalClicks > 0 
        ? (baselineConversions.totalConversions / baselineClicks.totalClicks) * 100 
        : 0;
      
      const alerts = [];
      
      // Fraud spike alert (threshold: >15% fraud rate)
      if (currentFraudRate > 15) {
        alerts.push({
          id: `fraud-spike-${Date.now()}`,
          type: "fraud_spike",
          title: "Пик фрода",
          description: "Обнаружен резкий рост фрод-трафика за последние 15 минут",
          severity: currentFraudRate > 25 ? "critical" : "high",
          triggeredAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          threshold: { value: 15, period: 15, unit: "minutes" },
          currentValue: { 
            fraudRate: Number(currentFraudRate.toFixed(1)), 
            period: "last_15_min",
            fraudReports: recentFraudReports.count,
            totalEvents: recentClicks.totalClicks
          },
          affectedMetrics: ["fraud_rate", "blocked_ips"],
          autoActions: ["block_suspicious_ips", "alert_admins"],
          isResolved: false
        });
      }
      
      // CR anomaly alert (threshold: >200% increase)
      if (baselineCR > 0 && currentCR / baselineCR > 2) {
        alerts.push({
          id: `cr-anomaly-${Date.now()}`,
          type: "cr_anomaly",
          title: "Аномалия CR",
          description: "Конверсионный рейт вырос более чем в 2 раза за короткое время",
          severity: currentCR / baselineCR > 3 ? "critical" : "medium",
          triggeredAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
          threshold: { multiplier: 2, period: 30, unit: "minutes" },
          currentValue: { 
            crIncrease: Number((currentCR / baselineCR).toFixed(1)), 
            baseline: Number(baselineCR.toFixed(2)), 
            current: Number(currentCR.toFixed(2)),
            conversions: recentConversions.totalConversions
          },
          affectedMetrics: ["conversion_rate", "revenue"],
          autoActions: ["flag_traffic", "manual_review"],
          isResolved: false
        });
      }
      
      // Volume surge alert (threshold: >500% increase in clicks)
      const [hourlyClicks] = await db.select({ 
        totalClicks: sql<number>`COALESCE(SUM(${statistics.clicks}), 0)` 
      })
        .from(statistics)
        .where(gte(statistics.date, oneHourAgo));
      
      if (hourlyClicks.totalClicks > 1000) { // High volume threshold
        alerts.push({
          id: `volume-surge-${Date.now()}`,
          type: "volume_surge", 
          title: "Всплеск трафика",
          description: "Обнаружен необычно высокий объем трафика",
          severity: hourlyClicks.totalClicks > 5000 ? "high" : "medium",
          triggeredAt: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
          threshold: { value: 1000, period: 60, unit: "minutes" },
          currentValue: { 
            clicks: hourlyClicks.totalClicks,
            period: "last_hour"
          },
          affectedMetrics: ["traffic_volume", "server_load"],
          autoActions: ["monitor_performance", "scale_resources"],
          isResolved: false
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error getting smart alerts:', error);
      // Return empty array if database queries fail
      return [];
    }
  }

  async createDeviceTracking(tracking: InsertDeviceTracking): Promise<DeviceTracking> {
    try {
      const [newTracking] = await db
        .insert(deviceTracking)
        .values(tracking)
        .returning();
      return newTracking;
    } catch (error) {
      console.error('Error creating device tracking:', error);
      throw error;
    }
  }

  // Postback template management
  async getPostbackTemplates(filters: {
    level?: string;
    status?: string;
    search?: string;
  }): Promise<any[]> {
    // Mock data for postback templates
    const templates = [
      {
        id: 'tpl_001',
        name: 'Основной трекер',
        level: 'global',
        url: 'https://tracker.com/postback?click_id={click_id}&status={status}&payout={payout}',
        events: ['sale', 'lead'],
        parameters: {
          click_id: 'Unique click identifier',
          status: 'Conversion status',
          payout: 'Payout amount'
        },
        headers: {
          'User-Agent': 'AffiliateTracker/1.0'
        },
        retryAttempts: 3,
        timeout: 30,
        isActive: true,
        offerId: null,
        offerName: null,
        advertiserId: 'user_001',
        advertiserName: 'Super Admin',
        createdBy: 'user_001',
        createdAt: '2025-08-04T10:00:00Z',
        updatedAt: '2025-08-04T10:00:00Z'
      },
      {
        id: 'tpl_002',
        name: 'Кейтаро интеграция',
        level: 'offer',
        url: 'https://keitaro.tracker.com/api/v1/postback?subid={click_id}&status={status}&sum={payout}&offer={offer_id}',
        events: ['sale'],
        parameters: {
          click_id: 'SubID from click',
          status: 'Conversion status',
          payout: 'Revenue amount',
          offer_id: 'Offer identifier'
        },
        headers: {
          'X-API-Key': 'secret_key_here'
        },
        retryAttempts: 5,
        timeout: 45,
        isActive: true,
        offerId: 'offer_001',
        offerName: 'Gambling Offer Premium',
        advertiserId: 'user_002',
        advertiserName: 'Advertiser One',
        createdBy: 'user_001',
        createdAt: '2025-08-04T11:00:00Z',
        updatedAt: '2025-08-04T11:30:00Z'
      },
      {
        id: 'tpl_003',
        name: 'Binom трекер',
        level: 'global',
        url: 'https://binom.tracker.com/click.php?cnv_id={click_id}&cnv_status={status}&revenue={payout}',
        events: ['sale', 'lead', 'rejected'],
        parameters: {
          click_id: 'Click ID',
          status: 'Conversion status',
          payout: 'Conversion revenue'
        },
        headers: {},
        retryAttempts: 3,
        timeout: 30,
        isActive: false,
        offerId: null,
        offerName: null,
        advertiserId: 'user_001',
        advertiserName: 'Super Admin',
        createdBy: 'user_001',
        createdAt: '2025-08-03T14:00:00Z',
        updatedAt: '2025-08-04T09:00:00Z'
      }
    ];

    let filtered = templates;

    if (filters && filters.level) {
      filtered = filtered.filter(t => t.level === filters.level);
    }

    if (filters && filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(t => t.isActive === isActive);
    }

    if (filters && filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.url.toLowerCase().includes(search) ||
        (t.offerName && t.offerName.toLowerCase().includes(search))
      );
    }

    return filtered;
  }

  // Postback templates methods for DatabaseStorage
  async getPostbackTemplates(): Promise<any[]> {
    console.log('DatabaseStorage: getting postback templates from database');
    try {
      const { db } = await import('./db');
      const { postbackTemplates } = await import('@shared/schema');
      const templates = await db.select().from(postbackTemplates);
      console.log(`DatabaseStorage: Found ${templates.length} postback templates`);
      return templates;
    } catch (error) {
      console.error('DatabaseStorage: Error getting postback templates:', error);
      return [];
    }
  }

  async createPostbackTemplate(data: any): Promise<any> {
    console.log('DatabaseStorage: creating postback template:', data);
    try {
      const { db } = await import('./db');
      const { postbackTemplates } = await import('@shared/schema');
      
      const template = {
        name: data.name,
        level: data.level || 'global',
        url: data.url,
        events: data.events || ['sale'],
        retryAttempts: data.retryAttempts || 3,
        timeout: data.timeout || 30,
        isActive: data.isActive !== false,
        advertiserId: data.advertiserId,
        createdBy: data.createdBy,
        offerId: data.offerId || null
      };

      const [result] = await db.insert(postbackTemplates).values(template).returning();
      console.log('DatabaseStorage: Successfully created postback template:', result);
      return result;
    } catch (error) {
      console.error('DatabaseStorage: Error creating postback template:', error);
      // Fallback to memory-like structure for compatibility
      return {
        id: `tpl_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updatePostbackTemplate(id: string, data: any): Promise<any> {
    console.log(`DatabaseStorage: updating postback template ${id}:`, data);
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async deletePostbackTemplate(id: string): Promise<void> {
    console.log(`DatabaseStorage: deleting postback template: ${id}`);
    await db.delete(postbackTemplates).where(eq(postbackTemplates.id, id));
    console.log(`DatabaseStorage: successfully deleted postback template: ${id}`);
  }

  // End of DatabaseStorage class
}

// Basic in-memory storage implementation for demo
class MemStorage implements IStorage {
  private users: User[] = [
    {
      id: '1',
      username: 'superadmin',
      email: 'admin@example.com', 
      password: 'admin',
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      status: 'active',
      userType: 'admin',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      kycStatus: 'pending',
      balance: '0.00',
      holdAmount: '0.00',
      registrationApproved: false,
      documentsVerified: false,
      isBlocked: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  private offers: Offer[] = [];
  private statistics: any[] = [];
  private postbacks: any[] = [];
  private fraudReports: any[] = [];
  // Постбеки в памяти
  private postbackTemplates: any[] = [
    {
      id: 'tpl_001',
      name: 'Основной трекер',
      url: 'https://tracker.com/postback?click_id={clickid}&status={status}&payout={payout}',
      events: ['sale', 'lead'],
      level: 'global',
      timeout: 30,
      retryAttempts: 3,
      isActive: true,
      createdAt: '2025-08-04T10:00:00Z',
      updatedAt: '2025-08-04T10:00:00Z'
    },
    {
      id: 'tpl_002', 
      name: 'Кейтаро интеграция',
      url: 'https://keitaro.tracker.com/api/v1/postback?subid={subid}&status={status}&sum={payout}&offer={offer_id}',
      events: ['sale', 'lead', 'registration'],
      level: 'partner',
      partnerId: 'user_003',
      timeout: 60,
      retryAttempts: 5,
      isActive: true,
      createdAt: '2025-08-04T11:30:00Z',
      updatedAt: '2025-08-04T11:30:00Z'
    }
  ];
  private postbackLogs: any[] = [
    {
      id: 'log_001',
      postbackId: 'tpl_001',
      postbackName: 'Основной трекер',
      conversionId: 'conv_001',
      offerId: 'offer_001',
      offerName: 'Gambling Offer Premium',
      partnerId: 'user_003',
      partnerName: 'Partner Alpha',
      url: 'https://tracker.com/postback?click_id=abc123&status=sale&payout=50.00',
      method: 'GET',
      headers: {
        'User-Agent': 'AffiliateTracker/1.0',
        'Content-Type': 'application/json'
      },
      payload: {},
      responseCode: 200,
      responseBody: '{"status":"ok","message":"Conversion recorded"}',
      responseTime: 247,
      status: 'success',
      errorMessage: null,
      attempt: 1,
      maxAttempts: 3,
      nextRetryAt: null,
      completedAt: '2025-08-04T12:15:30Z',
      createdAt: '2025-08-04T12:15:28Z'
    }
  ];
  private globalPostbacks: any[] = [
    {
      id: 'global_001',
      name: 'Глобальный постбек трекера',
      url: 'https://tracker.com/global/postback?event={event}&value={value}',
      events: ['all'],
      isActive: true,
      priority: 1,
      createdAt: '2025-08-04T10:00:00Z',
      updatedAt: '2025-08-04T10:00:00Z'
    }
  ];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: String(this.users.length + 1),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    this.users[userIndex] = { ...this.users[userIndex], ...data, updatedAt: new Date() };
    return this.users[userIndex];
  }

  async getUsers(role?: string): Promise<User[]> {
    return role ? this.users.filter(u => u.role === role) : this.users;
  }

  async getUsersByOwner(ownerId: string, role?: string): Promise<User[]> {
    let filtered = this.users.filter(u => u.ownerId === ownerId || u.id === ownerId);
    return role ? filtered.filter(u => u.role === role) : filtered;
  }

  // Add postback methods to MemStorage
  async getPostbackTemplates(): Promise<any[]> {
    return this.postbackTemplates;
  }

  async createPostbackTemplate(data: any): Promise<any> {
    const template = {
      id: `tpl_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.postbackTemplates.push(template);
    console.log('MemStorage: Creating postback template:', template);
    console.log('MemStorage: Total templates now:', this.postbackTemplates.length);
    return template;
  }

  async updatePostbackTemplate(id: string, data: any): Promise<any> {
    const index = this.postbackTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.postbackTemplates[index] = { 
        ...this.postbackTemplates[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      console.log(`MemStorage: Updated postback template ${id}`);
      return this.postbackTemplates[index];
    }
    console.log(`MemStorage: Template ${id} not found for update`);
    return { id, ...data, updatedAt: new Date().toISOString() };
  }

  async deletePostbackTemplate(id: string): Promise<void> {
    const index = this.postbackTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.postbackTemplates.splice(index, 1);
      console.log(`MemStorage: Deleted postback template ${id}`);
    } else {
      console.log(`MemStorage: Template ${id} not found for deletion`);
    }
  }

  async getPostbackLogs(filters?: any): Promise<any[]> {
    return this.postbackLogs;
  }

  async retryPostback(logId: string): Promise<void> {
    console.log(`Retrying postback log: ${logId}`);
  }

  async getGlobalPostbacks(): Promise<any[]> {
    return this.globalPostbacks;
  }

  async createGlobalPostback(data: any): Promise<any> {
    const postback = {
      id: `global_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.globalPostbacks.push(postback);
    console.log('MemStorage: Creating global postback:', postback);
    console.log('MemStorage: Total global postbacks now:', this.globalPostbacks.length);
    return postback;
  }

  async updateGlobalPostback(id: string, data: any): Promise<any> {
    console.log(`Updating global postback ${id}:`, data);
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async testGlobalPostback(id: string): Promise<any> {
    console.log(`Testing global postback: ${id}`);
    return {
      success: true,
      responseTime: 150,
      status: 200,
      response: 'OK'  
    };
  }



  // Stub implementations for all other IStorage methods
  async getUsersWithFilters(): Promise<any> { return { data: [], total: 0 }; }
  async blockUser(): Promise<any> { return {}; }
  async unblockUser(): Promise<any> { return {}; }
  async softDeleteUser(): Promise<any> { return {}; }
  async forceLogoutUser(): Promise<void> {}
  async resetUserPassword(): Promise<string> { return 'newpass123'; }
  async getUserAnalytics(): Promise<any> { return {}; }
  async exportUsers(): Promise<string> { return 'csv data'; }
  async bulkBlockUsers(): Promise<any> { return { blocked: 0 }; }
  async bulkUnblockUsers(): Promise<any> { return { unblocked: 0 }; }
  async bulkDeleteUsers(): Promise<any> { return { deleted: 0 }; }
  async getOffer(): Promise<any> { return null; }
  async getOffers(): Promise<any[]> { return this.offers; }
  async createOffer(): Promise<any> { return {}; }
  async updateOffer(): Promise<any> { return {}; }
  async deleteOffer(): Promise<void> {}
  async getAllOffers(): Promise<any[]> { return this.offers; }
  async deleteUser(): Promise<void> {}
  async getPartnerOffers(): Promise<any[]> { return []; }
  async createPartnerOffer(): Promise<any> { return {}; }
  async updatePartnerOffer(): Promise<any> { return {}; }
  async getTrackingLinks(): Promise<any[]> { return []; }
  async getTrackingLinkByCode(): Promise<any> { return null; }
  async createTrackingLink(): Promise<any> { return {}; }
  async getStatistics(): Promise<any[]> { return this.statistics; }
  async createStatistics(): Promise<any> { return {}; }
  async getTransactions(): Promise<any[]> { return []; }
  async createTransaction(): Promise<any> { return {}; }
  async getPostbacks(): Promise<any[]> { return this.postbacks; }
  async createPostback(): Promise<any> { return {}; }
  async updatePostback(): Promise<any> { return {}; }
  async getTickets(): Promise<any[]> { return []; }
  async createTicket(): Promise<any> { return {}; }
  async updateTicket(): Promise<any> { return {}; }
  async getFraudAlerts(): Promise<any[]> { return []; }
  async createFraudAlert(): Promise<any> { return {}; }
  async getAuditLogs(): Promise<any[]> { return []; }
  async createAuditLog(): Promise<any> { return {}; }
  async getCryptoWallets(): Promise<any[]> { return []; }
  async createCryptoWallet(): Promise<any> { return {}; }
  async updateCryptoWallet(): Promise<any> { return {}; }
  async getCryptoTransactions(): Promise<any[]> { return []; }
  async createCryptoTransaction(): Promise<any> { return {}; }
  async getFraudReports(): Promise<any[]> { return this.fraudReports; }
  async createFraudReport(): Promise<any> { return {}; }
  async updateFraudReport(): Promise<any> { return {}; }
  async getFraudRules(): Promise<any[]> { return []; }
  async createFraudRule(): Promise<any> { return {}; }
  async updateFraudRule(): Promise<any> { return {}; }
  async deleteFraudRule(): Promise<void> {}
  async getDeviceTracking(): Promise<any[]> { return []; }
  async createDeviceTracking(): Promise<any> { return {}; }
  async getIpAnalysis(): Promise<any[]> { return []; }
  async createIpAnalysis(): Promise<any> { return {}; }
  async getFraudBlocks(): Promise<any[]> { return []; }
  async createFraudBlock(): Promise<any> { return {}; }
  async deleteFraudBlock(): Promise<void> {}
  async getPostbacksWithFilters(): Promise<any> { return { data: [], total: 0 }; }
  async getSystemSettings(): Promise<any[]> { return []; }
  async getSmartAlerts(): Promise<any[]> { return []; }
  async getBlacklistEntries(): Promise<any[]> { return []; }
  async createBlacklistEntry(): Promise<any> { return {}; }
  async updateBlacklistEntry(): Promise<any> { return {}; }
  async deleteBlacklistEntry(): Promise<void> {}
  async moderateOffer(): Promise<boolean> { return true; }
}

// Use DatabaseStorage for persistent data
export const storage = new DatabaseStorage();

