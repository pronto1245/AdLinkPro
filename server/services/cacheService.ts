import { createClient } from 'redis';
import { db } from '../db';
import { users, offers, trackingLinks } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Redis client for caching
let redisClient: any = null;

// Initialize Redis client
async function initRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err: any) => {
      console.error('Redis client error:', err);
    });

    try {
      await redisClient.connect();
      console.log('✅ Redis cache connected');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      redisClient = null;
    }
  }
  return redisClient;
}

// Cache configuration
const CACHE_CONFIG = {
  USER_TTL: 300,        // 5 minutes for user data
  OFFER_TTL: 600,       // 10 minutes for offers
  STATS_TTL: 180,       // 3 minutes for statistics
  SESSION_TTL: 3600,    // 1 hour for session data
  DEFAULT_TTL: 300,     // 5 minutes default
};

export class CacheService {
  private redis: any = null;

  constructor() {
    this.initCache();
  }

  private async initCache() {
    this.redis = await initRedisClient();
  }

  // Generic cache operations
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = CACHE_CONFIG.DEFAULT_TTL): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.flushDb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // User-specific caching
  async getUser(userId: string) {
    const cacheKey = `user:${userId}`;
    let user = await this.get(cacheKey);

    if (!user) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (dbUser) {
        // Don't cache sensitive information
        user = {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.username,
          role: dbUser.role,
          isActive: dbUser.isActive,
          isBlocked: dbUser.isBlocked,
        };
        await this.set(cacheKey, user, CACHE_CONFIG.USER_TTL);
      }
    }

    return user;
  }

  async invalidateUser(userId: string) {
    return this.del(`user:${userId}`);
  }

  // Offer caching
  async getActiveOffers(category?: string, limit: number = 50) {
    const cacheKey = `offers:active:${category || 'all'}:${limit}`;
    let offers = await this.get(cacheKey);

    if (!offers) {
      const query = db
        .select({
          id: offers.id,
          name: offers.name,
          category: offers.category,
          payout: offers.payout,
          payoutType: offers.payoutType,
          currency: offers.currency,
          countries: offers.countries,
          description: offers.description,
          logo: offers.logo,
          isActive: offers.isActive,
        })
        .from(offers)
        .where(eq(offers.isActive, true))
        .limit(limit);

      if (category) {
        query.where(eq(offers.category, category));
      }

      offers = await query;
      await this.set(cacheKey, offers, CACHE_CONFIG.OFFER_TTL);
    }

    return offers;
  }

  async getOffer(offerId: string) {
    const cacheKey = `offer:${offerId}`;
    let offer = await this.get(cacheKey);

    if (!offer) {
      const [dbOffer] = await db
        .select()
        .from(offers)
        .where(eq(offers.id, offerId))
        .limit(1);

      if (dbOffer) {
        offer = dbOffer;
        await this.set(cacheKey, offer, CACHE_CONFIG.OFFER_TTL);
      }
    }

    return offer;
  }

  async invalidateOffers() {
    if (!this.redis) return false;

    try {
      const keys = await this.redis.keys('offers:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Error invalidating offers cache:', error);
      return false;
    }
  }

  // Statistics caching
  async getStats(type: string, userId?: string, timeframe: string = '24h') {
    const cacheKey = `stats:${type}:${userId || 'global'}:${timeframe}`;
    return this.get(cacheKey);
  }

  async setStats(type: string, data: any, userId?: string, timeframe: string = '24h') {
    const cacheKey = `stats:${type}:${userId || 'global'}:${timeframe}`;
    return this.set(cacheKey, data, CACHE_CONFIG.STATS_TTL);
  }

  // Session caching
  async getSession(sessionId: string) {
    const cacheKey = `session:${sessionId}`;
    return this.get(cacheKey);
  }

  async setSession(sessionId: string, sessionData: any) {
    const cacheKey = `session:${sessionId}`;
    return this.set(cacheKey, sessionData, CACHE_CONFIG.SESSION_TTL);
  }

  async invalidateSession(sessionId: string) {
    return this.del(`session:${sessionId}`);
  }

  // Tracking link caching (for high-frequency access)
  async getTrackingLink(linkHash: string) {
    const cacheKey = `tracking:${linkHash}`;
    let trackingLink = await this.get(cacheKey);

    if (!trackingLink) {
      const [dbLink] = await db
        .select({
          id: trackingLinks.id,
          partnerId: trackingLinks.partnerId,
          offerId: trackingLinks.offerId,
          linkHash: trackingLinks.linkHash,
          isActive: trackingLinks.isActive,
        })
        .from(trackingLinks)
        .where(and(
          eq(trackingLinks.linkHash, linkHash),
          eq(trackingLinks.isActive, true)
        ))
        .limit(1);

      if (dbLink) {
        trackingLink = dbLink;
        await this.set(cacheKey, trackingLink, CACHE_CONFIG.DEFAULT_TTL);
      }
    }

    return trackingLink;
  }

  // Rate limiting cache
  async checkRateLimit(identifier: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    if (!this.redis) return true; // Allow if cache unavailable

    const key = `rate_limit:${identifier}`;
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      return current <= maxRequests;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
  }

  // Health check
  async healthCheck(): Promise<{ redis: boolean; latency: number }> {
    if (!this.redis) {
      return { redis: false, latency: -1 };
    }

    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return { redis: true, latency };
    } catch (error) {
      return { redis: false, latency: -1 };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Middleware for cache-aware responses
export function cacheMiddleware(ttlSeconds: number = CACHE_CONFIG.DEFAULT_TTL) {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `route:${req.method}:${req.originalUrl}`;
    
    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function(data: any) {
      cacheService.set(cacheKey, data, ttlSeconds);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}