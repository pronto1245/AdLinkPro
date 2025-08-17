import { randomBytes } from 'crypto';
import { db } from '../db.js';
import { customDomains, offers, trackingLinks, type CustomDomain, type InsertCustomDomain } from '@shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { config } from '../config/environment.js';
import { enhancedDNS, type DNSError } from './enhancedDNS.js';
import { SSLProviderService } from './sslProvider.js';

/**
 * Custom Domain Service
 * 
 * Manages custom domains for advertisers with features:
 * - Multiple domains per advertiser (configurable limit)
 * - DNS verification with detailed error handling
 * - SSL certificate management with multiple providers
 * - Batch operations for performance
 * - DNS caching for optimized repeated queries
 * 
 * @example
 * // Create a new custom domain
 * const domain = await CustomDomainService.createCustomDomain({
 *   advertiserId: 'user-123',
 *   domain: 'tracking.example.com',
 *   type: 'cname'
 * });
 * 
 * // Verify domain DNS configuration
 * const verification = await CustomDomainService.verifyDomain(domain.id);
 * if (verification.success) {
 *   console.log('Domain verified successfully');
 * } else {
 *   console.error('Verification failed:', verification.error);
 * }
 */
export class CustomDomainService {
  /**
   * Generate cryptographically secure verification value for domain ownership
   * @returns {string} Random verification token in format 'platform-verify=<hex>'
   */
  static generateVerificationValue(): string {
    return `platform-verify=${randomBytes(16).toString('hex')}`;
  }

  /**
   * Create a new custom domain for an advertiser
   * 
   * @param {Object} data - Domain creation parameters
   * @param {string} data.advertiserId - The advertiser's unique identifier
   * @param {string} data.domain - The domain name to add
   * @param {'a_record' | 'cname'} [data.type='cname'] - DNS record type for verification
   * @returns {Promise<CustomDomain>} The created domain object
   * @throws {Error} When domain limit is exceeded or validation fails
   * 
   * @example
   * const domain = await CustomDomainService.createCustomDomain({
   *   advertiserId: 'user-123',
   *   domain: 'track.mysite.com',
   *   type: 'cname'
   * });
   */
  static async createCustomDomain(data: {
    advertiserId: string;
    domain: string;
    type?: 'a_record' | 'cname';
  }): Promise<CustomDomain> {
    // Check domain limit for advertiser (configurable via environment)
    const existingDomains = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.advertiserId, data.advertiserId));

    const maxDomains = config.MAX_DOMAINS_PER_ADVERTISER;
    if (existingDomains.length >= maxDomains) {
      throw new Error(`Domain limit exceeded. Each advertiser can add up to ${maxDomains} custom domains.`);
    }

    const verificationValue = this.generateVerificationValue();
    const targetValue = data.type === 'cname' 
      ? 'affiliate-tracker.replit.app' 
      : '192.168.1.100'; // Пример IP для A записи

    const [customDomain] = await db
      .insert(customDomains)
      .values({
        advertiserId: data.advertiserId,
        domain: data.domain.toLowerCase(),
        type: data.type || 'cname',
        verificationValue,
        targetValue,
        status: 'pending',
        sslStatus: 'none',
        isActive: false
      })
      .returning();

    return customDomain;
  }

  /**
   * Get all domains for a specific advertiser
   * 
   * @param {string} advertiserId - The advertiser's unique identifier
   * @returns {Promise<CustomDomain[]>} Array of domains ordered by creation date (newest first)
   * 
   * @example
   * const domains = await CustomDomainService.getAdvertiserDomains('user-123');
   * console.log(`Advertiser has ${domains.length} domains`);
   */
  static async getAdvertiserDomains(advertiserId: string): Promise<CustomDomain[]> {
    return await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.advertiserId, advertiserId))
      .orderBy(desc(customDomains.createdAt));
  }

  /**
   * Verify domain ownership through DNS records
   * 
   * @param {string} domainId - The domain's unique identifier
   * @returns {Promise<Object>} Verification result with success status and detailed error info
   * 
   * @example
   * const result = await CustomDomainService.verifyDomain('domain-123');
   * if (result.success) {
   *   console.log('Domain verified successfully');
   * } else {
   *   console.error('Verification failed:', result.error);
   *   // result.error contains detailed information about the failure
   * }
   */
  static async verifyDomain(domainId: string): Promise<{
    success: boolean;
    status: 'verified' | 'error';
    error?: string;
    errorDetails?: DNSError;
  }> {
    console.log(`🔍 Starting domain verification for ID: ${domainId}`);
    
    const [domain] = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.id, domainId));

    if (!domain) {
      throw new Error('Domain not found');
    }

    console.log(`📋 Domain found: ${domain.domain} (${domain.type})`);

    try {
      // Update status to "verifying"
      await db
        .update(customDomains)
        .set({ 
          status: 'pending',
          lastChecked: new Date(),
          errorMessage: null 
        })
        .where(eq(customDomains.id, domainId));

      console.log(`⏳ Status updated to pending for ${domain.domain}`);

      // Perform DNS verification using enhanced DNS service
      let verificationResult;
      let isVerified = false;
      let errorMessage = '';
      let errorDetails: DNSError | undefined;

      if (domain.type === 'cname') {
        // Check CNAME record
        verificationResult = await enhancedDNS.resolveCname(domain.domain);
        if (verificationResult.success && verificationResult.records) {
          isVerified = verificationResult.records.some(record => 
            record.includes('arbiconnect.app') || record.includes('affiliate-tracker.replit.app')
          );
          console.log(`🔍 CNAME verification for ${domain.domain}: ${isVerified ? 'SUCCESS' : 'FAILED'}`);
          if (verificationResult.fromCache) {
            console.log(`📦 Used cached DNS result`);
          }
        } else {
          errorDetails = verificationResult.error;
          errorMessage = verificationResult.error?.message || 'CNAME record verification failed';
        }
      } else if (domain.type === 'a_record') {
        // Check A record
        verificationResult = await enhancedDNS.resolveA(domain.domain);
        if (verificationResult.success && verificationResult.records) {
          const expectedIp = process.env.SERVER_IP || '0.0.0.0';
          isVerified = verificationResult.records.includes(expectedIp);
          console.log(`🔍 A-record verification for ${domain.domain}: ${isVerified ? 'SUCCESS' : 'FAILED'}`);
          if (verificationResult.fromCache) {
            console.log(`📦 Used cached DNS result`);
          }
        } else {
          errorDetails = verificationResult.error;
          errorMessage = verificationResult.error?.message || 'A record verification failed';
        }
      }

      // Update domain status based on verification result
      const newStatus: 'verified' | 'error' = isVerified ? 'verified' : 'error';
      
      await db
        .update(customDomains)
        .set({ 
          status: newStatus,
          isActive: isVerified,
          lastChecked: new Date(),
          errorMessage: isVerified ? null : errorMessage
        })
        .where(eq(customDomains.id, domainId));

      console.log(`🎯 Final status: ${newStatus} for ${domain.domain}`);

      return {
        success: isVerified,
        status: newStatus,
        error: errorMessage || undefined,
        errorDetails
      };
    } catch (error: any) {
      console.error(`❌ Verification error for ${domain.domain}:`, error.message);
      
      // Update status to error
      await db
        .update(customDomains)
        .set({ 
          status: 'error',
          isActive: false,
          lastChecked: new Date(),
          errorMessage: error.message
        })
        .where(eq(customDomains.id, domainId));

      return {
        success: false,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Request SSL certificate for a verified domain using configured provider
   * 
   * @param {string} domain - Domain name for SSL certificate
   * @param {string} domainId - Database ID of the domain record
   * @returns {Promise<void>}
   * 
   * @example
   * await CustomDomainService.requestSSLCertificate('track.example.com', 'domain-123');
   */
  static async requestSSLCertificate(domain: string, domainId: string): Promise<void> {
    try {
      console.log(`🔒 Starting SSL certificate request for ${domain} using ${config.SSL_PROVIDER}`);
      
      // Update status to "pending"
      await db
        .update(customDomains)
        .set({
          sslStatus: 'pending',
          sslErrorMessage: null,
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));

      // Initialize SSL provider service
      const sslService = new SSLProviderService();
      
      try {
        // Request SSL certificate with timeout protection
        const certificatePromise = sslService.issueCertificate(domain, domainId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SSL certificate request timeout after 120 seconds')), 120000)
        );
        
        const certificate = await Promise.race([certificatePromise, timeoutPromise]) as any;
        
        // Update domain with SSL certificate details
        await db
          .update(customDomains)
          .set({
            sslStatus: 'issued',
            sslCertificate: certificate.certificate,
            sslPrivateKey: certificate.privateKey,
            sslValidUntil: certificate.validUntil,
            sslIssuer: certificate.issuer,
            sslErrorMessage: null,
            updatedAt: new Date()
          })
          .where(eq(customDomains.id, domainId));

        console.log(`✅ SSL certificate successfully issued for ${domain} by ${certificate.issuer}`);
        
      } catch (sslError) {
        console.error(`❌ SSL certificate issuance failed for ${domain}:`, sslError.message);
        
        // Update status to failed with detailed error message
        await db
          .update(customDomains)
          .set({
            sslStatus: 'failed',
            sslErrorMessage: this.formatSSLError(sslError.message, config.SSL_PROVIDER),
            updatedAt: new Date()
          })
          .where(eq(customDomains.id, domainId));
          
        throw sslError;
      }
      
    } catch (error: any) {
      console.error(`SSL certificate request failed for ${domain}:`, error);
      
      // Fallback error handling
      await db
        .update(customDomains)
        .set({
          sslStatus: 'failed',
          sslErrorMessage: error?.message || 'SSL certificate request failed',
          updatedAt: new Date()
        })
        .where(eq(customDomains.id, domainId));
    }
  }



  // Принудительная выдача SSL для уже верифицированного домена
  static async issueSSLForDomain(domainId: string, advertiserId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Проверяем что домен принадлежит рекламодателю и верифицирован
      const [domain] = await db
        .select()
        .from(customDomains)
        .where(and(
          eq(customDomains.id, domainId),
          eq(customDomains.advertiserId, advertiserId),
          eq(customDomains.status, 'verified')
        ));

      if (!domain) {
        return {
          success: false,
          message: 'Домен не найден или не верифицирован'
        };
      }

      if (domain.sslStatus === 'issued') {
        return {
          success: false,
          message: 'SSL сертификат уже выдан для этого домена'
        };
      }

      if (domain.sslStatus === 'pending') {
        return {
          success: false,
          message: 'SSL сертификат уже выдается для этого домена'
        };
      }

      // Запускаем выдачу SSL
      await this.requestSSLCertificate(domain.domain, domainId);

      return {
        success: true,
        message: 'SSL сертификат выдается. Проверьте статус через несколько минут.'
      };

    } catch (error) {
      return {
        success: false,
        message: `Ошибка выдачи SSL: ${(error as Error).message}`
      };
    }
  }

  // Удаляем домен
  static async deleteDomain(domainId: string, advertiserId: string): Promise<void> {
    await db
      .delete(customDomains)
      .where(and(
        eq(customDomains.id, domainId),
        eq(customDomains.advertiserId, advertiserId)
      ));
  }

  // Получаем активные верифицированные домены рекламодателя
  static async getVerifiedDomains(advertiserId: string): Promise<string[]> {
    const domains = await db
      .select({ domain: customDomains.domain })
      .from(customDomains)
      .where(and(
        eq(customDomains.advertiserId, advertiserId),
        eq(customDomains.status, 'verified'),
        eq(customDomains.isActive, true)
      ));

    return domains.map(d => d.domain);
  }

  // Выбираем лучший домен для трекинговой ссылки
  static async getBestDomain(advertiserId: string): Promise<string | null> {
    const [domain] = await db
      .select({ domain: customDomains.domain })
      .from(customDomains)
      .where(and(
        eq(customDomains.advertiserId, advertiserId),
        eq(customDomains.status, 'verified'),
        eq(customDomains.isActive, true)
      ))
      .orderBy(desc(customDomains.createdAt))
      .limit(1);

    return domain?.domain || null;
  }

  /**
   * Update tracking links to use custom domain with optimized batch operations
   * 
   * Instead of individual updates, this method uses efficient batch operations
   * to update all tracking links for an advertiser's offers at once.
   * 
   * @param {string} advertiserId - The advertiser's unique identifier
   * @param {string} domain - The custom domain to set for tracking links
   * @returns {Promise<void>}
   * 
   * @example
   * await CustomDomainService.updateTrackingLinksWithDomain('user-123', 'track.example.com');
   */
  static async updateTrackingLinksWithDomain(advertiserId: string, domain: string): Promise<void> {
    console.log(`🔄 Starting batch update of tracking links for advertiser ${advertiserId} to domain ${domain}`);
    
    // Get all offers for the advertiser
    const advertiserOffers = await db
      .select({ id: offers.id })
      .from(offers)
      .where(eq(offers.advertiserId, advertiserId));

    const offerIds = advertiserOffers.map(o => o.id);

    if (offerIds.length === 0) {
      console.log('ℹ️ No offers found for advertiser, skipping update');
      return;
    }

    console.log(`📊 Found ${offerIds.length} offers to update tracking links for`);

    // Use batch update with inArray for better performance
    // This replaces the individual loop with a single query
    const updateResult = await db
      .update(trackingLinks)
      .set({ 
        customDomain: domain,
        updatedAt: new Date()
      })
      .where(inArray(trackingLinks.offerId, offerIds));

    console.log(`✅ Batch update completed for ${offerIds.length} offers`);
  }

  static async checkSSL(domain: string): Promise<{
    hasSSL: boolean;
    validUntil?: Date;
    issuer?: string;
  }> {
    // Проверка SSL сертификата
    try {
      const https = await import('https');
      return new Promise((resolve) => {
        const options = {
          hostname: domain,
          port: 443,
          method: 'HEAD',
          rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
          const cert = (res.connection as any).getPeerCertificate();
          if (cert && cert.valid_to) {
            resolve({
              hasSSL: true,
              validUntil: new Date(cert.valid_to),
              issuer: cert.issuer?.CN
            });
          } else {
            resolve({ hasSSL: false });
          }
        });

        req.on('error', () => {
          resolve({ hasSSL: false });
        });

        req.end();
      });
    } catch (error: any) {
      console.error('SSL check failed:', error?.message);
      return { hasSSL: false };
    }
  }

  // Получаем инструкции для настройки DNS
  static getDNSInstructions(domain: CustomDomain): {
    type: string;
    record: string;
    value: string;
    instructions: string;
  } {
    if (domain.type === 'cname') {
      return {
        type: 'CNAME',
        record: domain.domain,
        value: 'platform-verify.com',
        instructions: `Добавьте CNAME запись в DNS настройках вашего домена:\n\nИмя: ${domain.domain}\nЗначение: platform-verify.com\n\nПосле добавления записи нажмите "Проверить домен".`
      };
    } else {
      return {
        type: 'TXT',
        record: domain.domain,
        value: domain.verificationValue,
        instructions: `Добавьте TXT запись в DNS настройках вашего домена:\n\nИмя: ${domain.domain}\nЗначение: ${domain.verificationValue}\n\nПосле добавления записи нажмите "Проверить домен".`
      };
    }
  }

  /**
   * Format SSL error message for better user understanding
   * 
   * @private
   * @param {string} errorMessage - Raw error message
   * @param {string} provider - SSL provider name
   * @returns {string} Formatted user-friendly error message
   */
  private static formatSSLError(errorMessage: string, provider: string): string {
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1).replace('-', ' ');
    
    if (errorMessage.includes('timeout')) {
      return `${providerName} SSL request timed out. This may be due to high server load. Please try again in a few minutes.`;
    }
    
    if (errorMessage.includes('validation')) {
      return `${providerName} domain validation failed. Ensure your domain is properly configured and accessible.`;
    }
    
    if (errorMessage.includes('rate limit')) {
      return `${providerName} rate limit exceeded. Please wait before requesting another certificate.`;
    }
    
    if (errorMessage.includes('not configured')) {
      return `${providerName} is not properly configured. Please check your environment variables and provider settings.`;
    }
    
    return `${providerName} SSL error: ${errorMessage}`;
  }

  /**
   * Get comprehensive domain statistics for advertiser
   * 
   * @param {string} advertiserId - The advertiser's unique identifier
   * @returns {Promise<Object>} Domain statistics including counts and status breakdown
   * 
   * @example
   * const stats = await CustomDomainService.getDomainStats('user-123');
   * console.log(`Total domains: ${stats.total}, Verified: ${stats.verified}`);
   */
  static async getDomainStats(advertiserId: string): Promise<{
    total: number;
    verified: number;
    pending: number;
    failed: number;
    withSSL: number;
    sslPending: number;
    sslFailed: number;
    remainingSlots: number;
  }> {
    const domains = await this.getAdvertiserDomains(advertiserId);
    
    const stats = {
      total: domains.length,
      verified: domains.filter(d => d.status === 'verified').length,
      pending: domains.filter(d => d.status === 'pending').length,
      failed: domains.filter(d => d.status === 'error' || d.status === 'failed').length,
      withSSL: domains.filter(d => d.sslStatus === 'issued').length,
      sslPending: domains.filter(d => d.sslStatus === 'pending').length,
      sslFailed: domains.filter(d => d.sslStatus === 'failed').length,
      remainingSlots: Math.max(0, config.MAX_DOMAINS_PER_ADVERTISER - domains.length)
    };
    
    return stats;
  }

  /**
   * Clear DNS cache for a specific domain
   * Useful for forcing re-verification after DNS changes
   * 
   * @param {string} domain - Domain name to clear cache for
   * @param {string} [recordType] - Specific record type to clear (optional)
   * 
   * @example
   * // Clear all DNS cache for domain
   * CustomDomainService.clearDNSCache('example.com');
   * 
   * // Clear specific record type
   * CustomDomainService.clearDNSCache('example.com', 'CNAME');
   */
  static clearDNSCache(domain: string, recordType?: string): void {
    enhancedDNS.clearCache(domain, recordType);
    console.log(`🗑️ Cleared DNS cache for ${domain}${recordType ? ` (${recordType})` : ''}`);
  }

  /**
   * Get DNS cache statistics
   * 
   * @returns {Object} Cache statistics including size and performance metrics
   */
  static getDNSCacheStats() {
    return enhancedDNS.getCacheStats();
  }
}