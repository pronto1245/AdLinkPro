import dns from 'dns';
import { promisify } from 'util';
import { config } from '../config/environment.js';
import { dnsCache } from './dnsCache.js';

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

/**
 * Enhanced DNS Service with caching, detailed error handling, and timeout support
 * 
 * Features:
 * - Automatic caching with configurable TTL
 * - Detailed error messages for different failure types
 * - Configurable timeouts to prevent hanging operations
 * - Support for various DNS record types
 */

export interface DNSError {
  code: string;
  type: 'TIMEOUT' | 'DNS_SERVER_UNAVAILABLE' | 'RECORD_NOT_FOUND' | 'INVALID_DOMAIN' | 'NETWORK_ERROR';
  message: string;
  domain: string;
  recordType: string;
}

export interface DNSVerificationResult {
  success: boolean;
  records?: string[];
  error?: DNSError;
  fromCache?: boolean;
}

class EnhancedDNSService {
  /**
   * Resolve TXT records with caching and enhanced error handling
   */
  async resolveTxt(domain: string): Promise<DNSVerificationResult> {
    return this.resolveWithCache(domain, 'TXT', async () => {
      const results = await resolveTxt(domain);
      return results.flat();
    });
  }

  /**
   * Resolve CNAME records with caching and enhanced error handling
   */
  async resolveCname(domain: string): Promise<DNSVerificationResult> {
    return this.resolveWithCache(domain, 'CNAME', async () => {
      return await resolveCname(domain);
    });
  }

  /**
   * Resolve A records with caching and enhanced error handling
   */
  async resolveA(domain: string): Promise<DNSVerificationResult> {
    return this.resolveWithCache(domain, 'A', async () => {
      return await resolve4(domain);
    });
  }

  /**
   * Generic DNS resolution with caching, timeout, and error handling
   */
  private async resolveWithCache(
    domain: string, 
    recordType: string, 
    resolveFunction: () => Promise<string[]>
  ): Promise<DNSVerificationResult> {
    // Check cache first
    const cached = dnsCache.get(domain, recordType);
    if (cached) {
      return {
        success: true,
        records: cached,
        fromCache: true
      };
    }

    try {
      // Set up timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(this.createDNSError('TIMEOUT', 'TIMEOUT', domain, recordType, 
            `DNS query timeout after ${config.DNS_TIMEOUT_MS}ms`));
        }, config.DNS_TIMEOUT_MS);
      });

      // Race between DNS resolution and timeout
      const records = await Promise.race([
        resolveFunction(),
        timeoutPromise
      ]);

      // Cache successful result
      dnsCache.set(domain, recordType, records);

      return {
        success: true,
        records,
        fromCache: false
      };

    } catch (error: any) {
      const dnsError = this.parseDNSError(error, domain, recordType);
      return {
        success: false,
        error: dnsError,
        fromCache: false
      };
    }
  }

  /**
   * Parse DNS errors into structured format with detailed messages
   */
  private parseDNSError(error: any, domain: string, recordType: string): DNSError {
    const code = error.code || 'UNKNOWN';
    
    switch (code) {
      case 'ENOTFOUND':
        return this.createDNSError(
          code, 
          'RECORD_NOT_FOUND', 
          domain, 
          recordType,
          `${recordType} record not found for domain ${domain}. Please verify the DNS record has been added and has propagated.`
        );
        
      case 'ENODATA':
        return this.createDNSError(
          code, 
          'RECORD_NOT_FOUND', 
          domain, 
          recordType,
          `No ${recordType} records found for domain ${domain}. The DNS record may not exist or hasn't propagated yet.`
        );
        
      case 'ETIMEOUT':
      case 'TIMEOUT':
        return this.createDNSError(
          code, 
          'TIMEOUT', 
          domain, 
          recordType,
          `DNS query timed out after ${config.DNS_TIMEOUT_MS}ms. The DNS server may be slow or unavailable.`
        );
        
      case 'ECONNREFUSED':
        return this.createDNSError(
          code, 
          'DNS_SERVER_UNAVAILABLE', 
          domain, 
          recordType,
          `DNS server connection refused. The DNS server may be temporarily unavailable.`
        );
        
      case 'ENETUNREACH':
      case 'EHOSTUNREACH':
        return this.createDNSError(
          code, 
          'NETWORK_ERROR', 
          domain, 
          recordType,
          `Network error while querying DNS for ${domain}. Please check your internet connection.`
        );
        
      case 'EINVAL':
        return this.createDNSError(
          code, 
          'INVALID_DOMAIN', 
          domain, 
          recordType,
          `Invalid domain name: ${domain}. Please check the domain format.`
        );
        
      default:
        return this.createDNSError(
          code, 
          'DNS_SERVER_UNAVAILABLE', 
          domain, 
          recordType,
          `DNS query failed for ${domain}: ${error.message || 'Unknown DNS error'}`
        );
    }
  }

  /**
   * Create structured DNS error object
   */
  private createDNSError(
    code: string, 
    type: DNSError['type'], 
    domain: string, 
    recordType: string, 
    message: string
  ): DNSError {
    return {
      code,
      type,
      domain,
      recordType,
      message
    };
  }

  /**
   * Clear cache for specific domain
   */
  clearCache(domain: string, recordType?: string): void {
    dnsCache.clear(domain, recordType);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return dnsCache.getStats();
  }
}

// Export singleton instance
export const enhancedDNS = new EnhancedDNSService();