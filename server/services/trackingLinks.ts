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

  // Transform landing page URL with custom domain and simplified tracking
  static async transformLandingUrl(params: {
    originalUrl: string;
    advertiserId: string;
    partnerId: string;
    offerId: string;
  }): Promise<string> {
    const { originalUrl, advertiserId, partnerId, offerId } = params;
    
    try {
      // Check if originalUrl is a valid URL
      if (!originalUrl || typeof originalUrl !== 'string' || originalUrl.length < 4) {
        console.warn('Invalid original URL provided:', originalUrl);
        // Return a default landing page URL with custom domain
        const verifiedDomains = await this.getVerifiedCustomDomains(advertiserId);
        const customDomain = verifiedDomains.length > 0 ? verifiedDomains[0] : 'track.example.com';
        const fallbackUrl = new URL(`https://${customDomain}/landing`);
        // Добавляем только clickid и partner_id
        fallbackUrl.searchParams.set('clickid', `${partnerId}_${offerId}_${Date.now()}`);
        fallbackUrl.searchParams.set('partner_id', partnerId);
        return fallbackUrl.toString();
      }

      // Get advertiser's verified custom domains
      const verifiedDomains = await this.getVerifiedCustomDomains(advertiserId);
      
      // Try to parse as URL, if fails, treat as path
      let url: URL;
      try {
        url = new URL(originalUrl);
      } catch {
        // If originalUrl is not a valid URL, create one with custom domain or example domain
        const customDomain = verifiedDomains.length > 0 ? verifiedDomains[0] : 'example.com';
        url = new URL(`https://${customDomain}${originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl}`);
      }
      
      if (verifiedDomains.length > 0) {
        // Use first verified custom domain
        const customDomain = verifiedDomains[0];
        url.hostname = customDomain;
        url.protocol = 'https:';
      }
      
      // Удаляем все лишние параметры из оригинальной ссылки
      url.search = '';
      
      // Добавляем только clickid и partner_id
      url.searchParams.set('clickid', `${partnerId}_${offerId}_${Date.now()}`);
      url.searchParams.set('partner_id', partnerId);
      
      return url.toString();
    } catch (error) {
      console.error('Error transforming landing URL:', error);
      // Return a safe fallback URL
      const customDomain = 'track.example.com'; // Safe fallback
      const fallbackUrl = `https://${customDomain}/landing?clickid=${partnerId}_${offerId}_${Date.now()}&partner_id=${partnerId}`;
      return fallbackUrl;
    }
  }

  // Generate automatic tracking link for partner (simplified)
  static async generatePartnerTrackingLink(offerId: string, partnerId: string): Promise<string> {
    try {
      // Get offer details and advertiser info
      const [offer] = await db
        .select({
          id: offers.id,
          advertiserId: offers.advertiserId,
          landingPages: offers.landingPages,
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
      const baseDomain = verifiedDomains.length > 0 
        ? `https://${verifiedDomains[0]}` 
        : 'https://trk.platform.com';

      // Generate the tracking link with partner's clickid
      const trackingLink = `${baseDomain}/click?offer=${offerId}&clickid=${partnerId}`;
      
      return trackingLink;
    } catch (error) {
      console.error('Error generating partner tracking link:', error);
      // Fallback to platform domain
      return `https://trk.platform.com/click?offer=${offerId}&clickid=${partnerId}`;
    }
  }

  // Generate tracking link with custom domain support
  static async generateTrackingLink(params: GenerateTrackingLinkParams): Promise<TrackingLinkResult> {
    const { partnerId, offerId, ...subIds } = params;
    
    // Get offer details and advertiser info
    const [offer] = await db
      .select({
        id: offers.id,
        advertiserId: offers.advertiserId,
        landingPages: offers.landingPages,
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
      ) as any;
    }

    return await db
      .select({
        id: trackingLinks.id,
        trackingCode: trackingLinks.trackingCode,
        url: trackingLinks.url,
        createdAt: trackingLinks.createdAt,
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
        createdAt: trackingLinks.createdAt,
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
        targetUrl: offers.landingPages,
        offerName: offers.name,
        advertiserId: offers.advertiserId
      })
      .from(trackingLinks)
      .innerJoin(offers, eq(trackingLinks.offerId, offers.id))
      .where(eq(trackingLinks.trackingCode, trackingCode));

    return link;
  }
}