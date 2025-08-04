import { 
  users, offers, partnerOffers, trackingLinks, statistics, transactions, 
  postbacks, tickets, fraudAlerts,
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
    const [offer] = await db
      .update(offers)
      .set({ ...data, updatedAt: new Date() })
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
      query = query.where(and(...conditions));
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
        .where(eq(users.role, role))
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
        ...offers,
        advertiserName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      })
      .from(offers)
      .leftJoin(users, eq(offers.advertiserId, users.id))
      .orderBy(desc(offers.createdAt));
    
    return offersWithAdvertisers.map(row => ({
      ...row,
      advertiserName: row.advertiserName || 'Unknown'
    }));
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
          updates.status = 'inactive';
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
}

export const storage = new DatabaseStorage();
