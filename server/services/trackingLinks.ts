import { randomBytes } from 'crypto';
import { db } from '../db';
import { trackingLinks, offers, customDomains, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface GenerateTrackingLinkParams {
  partnerId: string;
  offerId: string;
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
}

export interface TrackingLinkResult {
  id: string;
  url: string;
  trackingCode: string;
  customDomain?: string;
  isCustomDomain: boolean;
}

export class TrackingLinkService {
  // Generate unique tracking code
  static generateTrackingCode(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    return `${timestamp}_${random}`;
  }

  // Generate click ID for tracking
  static generateClickId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(6).toString('hex');
    return `${timestamp}_${random}`;
  }

  // Get advertiser's verified custom domains
  static async getVerifiedCustomDomains(advertiserId: string): Promise<string[]> {
    const domains = await db
      .select({ domain: customDomains.domain })
      .from(customDomains)
      .where(and(
        eq(customDomains.advertiserId, advertiserId),
        eq(customDomains.status, 'verified')
      ));
    
    return domains.map(d => d.domain);
  }

  // Generate tracking link with custom domain support
  static async generateTrackingLink(params: GenerateTrackingLinkParams): Promise<TrackingLinkResult> {
    const { partnerId, offerId, ...subIds } = params;
    
    // Get offer details and advertiser info
    const [offer] = await db
      .select({
        id: offers.id,
        advertiserId: offers.advertiserId,
        url: offers.url,
        name: offers.name
      })
      .from(offers)
      .where(eq(offers.id, offerId));

    if (!offer) {
      throw new Error('Offer not found');
    }

    // Get advertiser's verified custom domains
    const verifiedDomains = await this.getVerifiedCustomDomains(offer.advertiserId);
    
    // Use first verified custom domain if available, otherwise use platform domain
    const customDomain = verifiedDomains.length > 0 ? verifiedDomains[0] : null;
    const baseDomain = customDomain || process.env.PLATFORM_DOMAIN || 'localhost:5000';
    const protocol = customDomain ? 'https' : 'http';

    // Generate tracking code and click ID
    const trackingCode = this.generateTrackingCode();
    const clickId = this.generateClickId();

    // Build tracking URL with parameters
    const trackingParams = new URLSearchParams({
      offer_id: offerId,
      partner_id: partnerId,
      clickid: clickId,
      ...Object.fromEntries(
        Object.entries(subIds).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const trackingUrl = `${protocol}://${baseDomain}/click?${trackingParams.toString()}`;

    // Save to database
    const [newLink] = await db
      .insert(trackingLinks)
      .values({
        partnerId,
        offerId,
        trackingCode,
        url: trackingUrl,
        customDomain,
        ...subIds
      })
      .returning();

    return {
      id: newLink.id,
      url: trackingUrl,
      trackingCode,
      customDomain: customDomain || undefined,
      isCustomDomain: !!customDomain
    };
  }

  // Get partner's tracking links
  static async getPartnerTrackingLinks(partnerId: string, offerId?: string) {
    let whereCondition = eq(trackingLinks.partnerId, partnerId);
    
    if (offerId) {
      whereCondition = and(
        eq(trackingLinks.partnerId, partnerId),
        eq(trackingLinks.offerId, offerId)
      );
    }

    return await db
      .select({
        id: trackingLinks.id,
        trackingCode: trackingLinks.trackingCode,
        url: trackingLinks.url,
        customDomain: trackingLinks.customDomain,
        clickCount: trackingLinks.clickCount,
        lastClickAt: trackingLinks.lastClickAt,
        createdAt: trackingLinks.createdAt,
        isActive: trackingLinks.isActive,
        subId1: trackingLinks.subId1,
        subId2: trackingLinks.subId2,
        subId3: trackingLinks.subId3,
        subId4: trackingLinks.subId4,
        subId5: trackingLinks.subId5,
        // Offer details
        offerName: offers.name,
        offerPayout: offers.payout
      })
      .from(trackingLinks)
      .innerJoin(offers, eq(trackingLinks.offerId, offers.id))
      .where(whereCondition);
  }

  // Get all tracking links for advertiser (for analytics)
  static async getAdvertiserTrackingLinks(advertiserId: string) {
    return await db
      .select({
        id: trackingLinks.id,
        trackingCode: trackingLinks.trackingCode,
        url: trackingLinks.url,
        customDomain: trackingLinks.customDomain,
        clickCount: trackingLinks.clickCount,
        lastClickAt: trackingLinks.lastClickAt,
        createdAt: trackingLinks.createdAt,
        isActive: trackingLinks.isActive,
        // Partner details
        partnerUsername: users.username,
        partnerEmail: users.email,
        // Offer details  
        offerName: offers.name,
        offerPayout: offers.payout
      })
      .from(trackingLinks)
      .innerJoin(offers, eq(trackingLinks.offerId, offers.id))
      .innerJoin(users, eq(trackingLinks.partnerId, users.id))
      .where(eq(offers.advertiserId, advertiserId));
  }

  // Update link click count
  static async incrementClickCount(trackingCode: string) {
    await db
      .update(trackingLinks)
      .set({
        clickCount: sql`click_count + 1`,
        lastClickAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(trackingLinks.trackingCode, trackingCode));
  }

  // Deactivate tracking link
  static async deactivateLink(linkId: string, partnerId: string) {
    const [result] = await db
      .update(trackingLinks)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(and(
        eq(trackingLinks.id, linkId),
        eq(trackingLinks.partnerId, partnerId)
      ))
      .returning();

    return result;
  }

  // Get tracking link by code (for click handling)
  static async getTrackingLinkByCode(trackingCode: string) {
    const [link] = await db
      .select({
        id: trackingLinks.id,
        partnerId: trackingLinks.partnerId,
        offerId: trackingLinks.offerId,
        url: trackingLinks.url,
        isActive: trackingLinks.isActive,
        // Offer details
        targetUrl: offers.url,
        offerName: offers.name,
        advertiserId: offers.advertiserId
      })
      .from(trackingLinks)
      .innerJoin(offers, eq(trackingLinks.offerId, offers.id))
      .where(eq(trackingLinks.trackingCode, trackingCode));

    return link;
  }
}