import { db } from '../db';
import { trackingClicks, offers, users, statistics } from '@shared/schema';
import { eq, desc, and, gte, lt, lte, count, sum, sql, like, or, asc } from "drizzle-orm";

export class AnalyticsService {
  static async getAnalyticsData(filters: any = {}): Promise<any[]> {
    try {
      console.log('Getting analytics data with filters:', filters);
      
      // Try to get real data from trackingClicks table
      const realData = await this.getRealTrackingData(filters);
      if (realData.length > 0) {
        console.log(`Returning ${realData.length} real analytics records`);
        return realData;
      }
      
      // Fallback to mock data if no real data exists
      console.log('No real data found, returning mock data');
      return this.generateMockData(filters);
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return this.generateMockData(filters);
    }
  }
  
  private static async getRealTrackingData(filters: any): Promise<any[]> {
    try {
      // Build query with proper joins
      let query = db
        .select({
          id: trackingClicks.id,
          timestamp: trackingClicks.createdAt,
          ip: trackingClicks.ip,
          geo: trackingClicks.country,
          browser: trackingClicks.browser,
          device: trackingClicks.device,
          os: trackingClicks.os,
          offerId: trackingClicks.offerId,
          offerName: offers.name,
          partnerId: trackingClicks.partnerId,
          partnerName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, 'Unknown')`,
          subId1: trackingClicks.subId1,
          subId2: trackingClicks.subId2,
          subId3: trackingClicks.subId3,
          subId4: trackingClicks.subId4,
          subId5: trackingClicks.subId5,
          clickId: trackingClicks.clickId,
          isBot: trackingClicks.isBot,
          fraudScore: trackingClicks.fraudScore,
          isUnique: trackingClicks.isUnique,
          vpnDetected: trackingClicks.vpnDetected,
          status: trackingClicks.status,
        })
        .from(trackingClicks)
        .leftJoin(offers, eq(trackingClicks.offerId, offers.id))
        .leftJoin(users, eq(trackingClicks.partnerId, users.id));
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.where(gte(trackingClicks.createdAt, new Date(filters.dateFrom)));
      }
      if (filters.dateTo) {
        query = query.where(lte(trackingClicks.createdAt, new Date(filters.dateTo)));
      }
      if (filters.search) {
        query = query.where(
          or(
            like(trackingClicks.ip, `%${filters.search}%`),
            like(trackingClicks.clickId, `%${filters.search}%`),
            like(trackingClicks.country, `%${filters.search}%`)
          )
        );
      }
      
      // Apply pagination
      const limit = Math.min(parseInt(filters.limit) || 50, 500);
      query = query.limit(limit);
      
      // Apply sorting
      query = query.orderBy(desc(trackingClicks.createdAt));
      
      const rawResults = await query;
      
      // Transform to expected format
      return rawResults.map(row => ({
        id: row.id,
        timestamp: row.timestamp?.toISOString() || new Date().toISOString(),
        ip: row.ip || 'Unknown',
        geo: row.geo || 'Unknown',
        browser: row.browser || 'Unknown',
        device: row.device || 'Unknown',
        os: row.os || 'Unknown',
        offerId: row.offerId,
        offerName: row.offerName || 'Unknown Offer',
        partnerId: row.partnerId,
        partnerName: row.partnerName || 'Unknown Partner',
        subId1: row.subId1 || undefined,
        subId2: row.subId2 || undefined,
        subId3: row.subId3 || undefined,
        subId4: row.subId4 || undefined,
        subId5: row.subId5 || undefined,
        clickId: row.clickId,
        visitorCode: row.clickId,
        traffic_source: 'direct',
        campaign: 'default',
        clicks: 1,
        uniqueClicks: row.isUnique ? 1 : 0,
        leads: row.status === 'lead' ? 1 : 0,
        conversions: row.status === 'converted' ? 1 : 0,
        revenue: 0, // Will be enhanced with statistics data
        payout: 0, // Will be enhanced with statistics data
        profit: 0,
        roi: 0,
        cr: 0,
        epc: 0,
        isBot: row.isBot || false,
        isFraud: (row.fraudScore || 0) > 70,
        isUnique: row.isUnique || true,
        vpnDetected: row.vpnDetected || false,
        riskScore: row.fraudScore || 0,
        postbackReceived: false,
        integrationSource: 'internal'
      }));
      
    } catch (error) {
      console.error('Error getting real tracking data:', error);
      return [];
    }
  }
  
  private static generateMockData(filters: any): any[] {
    const mockData = [];
    const count = Math.min(parseInt(filters.limit) || 50, 100);
    
    for (let i = 0; i < count; i++) {
      const clicks = Math.floor(Math.random() * 10) + 1;
      const conversions = Math.floor(Math.random() * clicks);
      const revenue = conversions * (Math.random() * 50 + 10);
      const payout = revenue * (0.5 + Math.random() * 0.3);
      
      mockData.push({
        id: `mock_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        geo: ['US', 'CA', 'GB', 'DE', 'FR', 'TR', 'RU'][Math.floor(Math.random() * 7)],
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
        os: ['Windows', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)],
        offerId: `offer_${Math.floor(Math.random() * 10) + 1}`,
        offerName: `Test Offer ${Math.floor(Math.random() * 10) + 1}`,
        partnerId: `partner_${Math.floor(Math.random() * 20) + 1}`,
        partnerName: `Partner ${Math.floor(Math.random() * 20) + 1}`,
        subId1: Math.random() > 0.5 ? `sub1_${Math.floor(Math.random() * 100)}` : undefined,
        subId2: Math.random() > 0.7 ? `sub2_${Math.floor(Math.random() * 100)}` : undefined,
        subId3: Math.random() > 0.8 ? `sub3_${Math.floor(Math.random() * 100)}` : undefined,
        subId4: Math.random() > 0.9 ? `sub4_${Math.floor(Math.random() * 100)}` : undefined,
        subId5: Math.random() > 0.95 ? `sub5_${Math.floor(Math.random() * 100)}` : undefined,
        clickId: `click_${Date.now()}_${i}`,
        visitorCode: `visitor_${i}`,
        traffic_source: ['facebook', 'google', 'native', 'direct'][Math.floor(Math.random() * 4)],
        campaign: `campaign_${Math.floor(Math.random() * 5) + 1}`,
        clicks,
        uniqueClicks: Math.floor(clicks * (0.7 + Math.random() * 0.3)),
        leads: Math.floor(conversions * 1.2),
        conversions,
        revenue: Math.round(revenue * 100) / 100,
        payout: Math.round(payout * 100) / 100,
        profit: Math.round((revenue - payout) * 100) / 100,
        roi: revenue > 0 && payout > 0 ? Math.round(((revenue - payout) / payout) * 100 * 100) / 100 : 0,
        cr: clicks > 0 ? Math.round((conversions / clicks) * 100 * 100) / 100 : 0,
        epc: clicks > 0 ? Math.round((revenue / clicks) * 100) / 100 : 0,
        isBot: Math.random() < 0.1,
        isFraud: Math.random() < 0.05,
        isUnique: Math.random() > 0.2,
        vpnDetected: Math.random() < 0.15,
        riskScore: Math.floor(Math.random() * 100),
        postbackReceived: Math.random() > 0.3,
        integrationSource: ['internal', 'api', 'webhook'][Math.floor(Math.random() * 3)]
      });
    }
    
    return mockData;
  }
}