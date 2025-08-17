import { config } from '../config/environment.js';

/**
 * DNS Cache Service for optimizing repeated domain verifications
 * 
 * Features:
 * - In-memory caching with configurable TTL
 * - Automatic cleanup of expired entries
 * - Separate caching for different DNS record types
 */

interface DNSCacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class DNSCacheService {
  private cache: Map<string, DNSCacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate cache key for DNS query
   */
  private getCacheKey(domain: string, recordType: string): string {
    return `${domain}:${recordType.toUpperCase()}`;
  }

  /**
   * Get cached DNS result
   */
  get(domain: string, recordType: string): any | null {
    const key = this.getCacheKey(domain, recordType);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set DNS result in cache
   */
  set(domain: string, recordType: string, data: any, ttl?: number): void {
    const key = this.getCacheKey(domain, recordType);
    const cacheEntry: DNSCacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || config.DNS_CACHE_TTL_SECONDS
    };

    this.cache.set(key, cacheEntry);
  }

  /**
   * Clear specific domain from cache
   */
  clear(domain: string, recordType?: string): void {
    if (recordType) {
      const key = this.getCacheKey(domain, recordType);
      this.cache.delete(key);
    } else {
      // Clear all records for domain
      const domainPrefix = `${domain}:`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(domainPrefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate?: number;
    totalRequests?: number;
    cacheHits?: number;
  } {
    return {
      size: this.cache.size
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Export singleton instance
export const dnsCache = new DNSCacheService();