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
