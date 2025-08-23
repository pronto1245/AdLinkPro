import { db } from "../db";
import { fraudBlocks } from "@shared/schema";
import { eq, and, or, like } from "drizzle-orm";

interface WhitelistEntry {
  id?: string;
  ip: string;
  cidr?: string; // For IP ranges like 192.168.1.0/24
  description: string;
  addedBy: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
}

export class IPWhitelistService {
  /**
   * Add IP or IP range to whitelist
   */
  static async addToWhitelist(entry: Omit<WhitelistEntry, 'id' | 'createdAt'>): Promise<WhitelistEntry> {
    try {
      const whitelistData = {
        type: 'whitelist',
        value: entry.ip,
        cidr: entry.cidr,
        reason: `Whitelisted: ${entry.description}`,
        riskScore: 0,
        isActive: entry.isActive,
        createdBy: entry.addedBy,
        expiresAt: entry.expiresAt || null,
        data: JSON.stringify({
          type: 'whitelist',
          description: entry.description,
          addedBy: entry.addedBy,
          addedAt: new Date().toISOString()
        })
      };
      
      const [result] = await db.insert(fraudBlocks).values(whitelistData).returning();
      
      console.log(`✅ Added IP to whitelist: ${entry.ip}`);
      return {
        id: result.id,
        ip: entry.ip,
        cidr: entry.cidr,
        description: entry.description,
        addedBy: entry.addedBy,
        expiresAt: entry.expiresAt,
        isActive: entry.isActive,
        createdAt: result.createdAt
      };
      
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      throw new Error('Failed to add IP to whitelist');
    }
  }
  
  /**
   * Remove IP from whitelist
   */
  static async removeFromWhitelist(ip: string): Promise<void> {
    try {
      await db
        .update(fraudBlocks)
        .set({ isActive: false })
        .where(and(
          eq(fraudBlocks.type, 'whitelist'),
          eq(fraudBlocks.value, ip)
        ));
      
      console.log(`✅ Removed IP from whitelist: ${ip}`);
      
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      throw new Error('Failed to remove IP from whitelist');
    }
  }
  
  /**
   * Check if IP is whitelisted
   */
  static async isWhitelisted(ip: string): Promise<boolean> {
    try {
      // Check exact IP match
      const [exactMatch] = await db
        .select()
        .from(fraudBlocks)
        .where(and(
          eq(fraudBlocks.type, 'whitelist'),
          eq(fraudBlocks.value, ip),
          eq(fraudBlocks.isActive, true)
        ))
        .limit(1);
      
      if (exactMatch) {
        // Check if not expired
        if (!exactMatch.expiresAt || exactMatch.expiresAt > new Date()) {
          return true;
        } else {
          // Auto-expire
          await this.expireWhitelistEntry(exactMatch.id);
          return false;
        }
      }
      
      // Check CIDR ranges (simplified implementation)
      const [cidrMatches] = await db
        .select()
        .from(fraudBlocks)
        .where(and(
          eq(fraudBlocks.type, 'whitelist'),
          eq(fraudBlocks.isActive, true)
        ));
      
      // In production, use proper CIDR matching library
      // For now, check basic subnet matches
      for (const entry of cidrMatches || []) {
        if (entry.cidr && this.isIPInCIDR(ip, entry.cidr)) {
          if (!entry.expiresAt || entry.expiresAt > new Date()) {
            return true;
          }
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Error checking whitelist:', error);
      return false;
    }
  }
  
  /**
   * Get all whitelisted IPs
   */
  static async getWhitelist(filters: {
    search?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: WhitelistEntry[]; total: number }> {
    try {
      let query = db
        .select()
        .from(fraudBlocks)
        .where(eq(fraudBlocks.type, 'whitelist'));
      
      // Apply filters
      if (filters.active !== undefined) {
        query = query.where(and(
          eq(fraudBlocks.type, 'whitelist'),
          eq(fraudBlocks.isActive, filters.active)
        ));
      }
      
      if (filters.search) {
        query = query.where(and(
          eq(fraudBlocks.type, 'whitelist'),
          or(
            like(fraudBlocks.value, `%${filters.search}%`),
            like(fraudBlocks.reason, `%${filters.search}%`)
          )
        ));
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;
      
      const results = await query.limit(limit).offset(offset);
      
      const whitelistEntries: WhitelistEntry[] = results.map(entry => {
        let data: any = {};
        try {
          data = JSON.parse(entry.data as string || '{}');
        } catch (e) {
          data = {};
        }
        
        return {
          id: entry.id,
          ip: entry.value,
          cidr: entry.cidr,
          description: data.description || entry.reason,
          addedBy: data.addedBy || entry.createdBy,
          expiresAt: entry.expiresAt,
          isActive: entry.isActive,
          createdAt: entry.createdAt
        };
      });
      
      // Get total count
      const [totalCount] = await db
        .select({ count: db.count() })
        .from(fraudBlocks)
        .where(eq(fraudBlocks.type, 'whitelist'));
      
      return {
        data: whitelistEntries,
        total: totalCount.count
      };
      
    } catch (error) {
      console.error('Error getting whitelist:', error);
      return { data: [], total: 0 };
    }
  }
  
  /**
   * Update whitelist entry
   */
  static async updateWhitelistEntry(id: string, updates: Partial<WhitelistEntry>): Promise<WhitelistEntry | null> {
    try {
      const updateData: any = {};
      
      if (updates.ip) {updateData.value = updates.ip;}
      if (updates.cidr) {updateData.cidr = updates.cidr;}
      if (updates.isActive !== undefined) {updateData.isActive = updates.isActive;}
      if (updates.expiresAt) {updateData.expiresAt = updates.expiresAt;}
      
      if (updates.description) {
        updateData.reason = `Whitelisted: ${updates.description}`;
        updateData.data = JSON.stringify({
          type: 'whitelist',
          description: updates.description,
          addedBy: updates.addedBy,
          updatedAt: new Date().toISOString()
        });
      }
      
      const [updated] = await db
        .update(fraudBlocks)
        .set(updateData)
        .where(eq(fraudBlocks.id, id))
        .returning();
      
      if (!updated) {return null;}
      
      let data: any = {};
      try {
        data = JSON.parse(updated.data as string || '{}');
      } catch (e) {
        data = {};
      }
      
      return {
        id: updated.id,
        ip: updated.value,
        cidr: updated.cidr,
        description: data.description || updated.reason,
        addedBy: data.addedBy || updated.createdBy,
        expiresAt: updated.expiresAt,
        isActive: updated.isActive,
        createdAt: updated.createdAt
      };
      
    } catch (error) {
      console.error('Error updating whitelist entry:', error);
      return null;
    }
  }
  
  /**
   * Expire whitelist entry
   */
  private static async expireWhitelistEntry(id: string): Promise<void> {
    try {
      await db
        .update(fraudBlocks)
        .set({ isActive: false })
        .where(eq(fraudBlocks.id, id));
      
      console.log(`⏰ Expired whitelist entry: ${id}`);
      
    } catch (error) {
      console.error('Error expiring whitelist entry:', error);
    }
  }
  
  /**
   * Simple CIDR matching (basic implementation)
   */
  private static isIPInCIDR(ip: string, cidr: string): boolean {
    try {
      const [network, prefixLength] = cidr.split('/');
      const prefix = parseInt(prefixLength, 10);
      
      if (prefix === 32) {
        return ip === network;
      }
      
      // Convert IPs to numbers for comparison
      const ipNum = this.ipToNumber(ip);
      const networkNum = this.ipToNumber(network);
      const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
      
      return (ipNum & mask) === (networkNum & mask);
      
    } catch (error) {
      console.error('Error in CIDR matching:', error);
      return false;
    }
  }
  
  /**
   * Convert IP address to number
   */
  private static ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
  }
  
  /**
   * Bulk whitelist operations
   */
  static async bulkAddToWhitelist(entries: Omit<WhitelistEntry, 'id' | 'createdAt'>[]): Promise<WhitelistEntry[]> {
    const results: WhitelistEntry[] = [];
    
    for (const entry of entries) {
      try {
        const result = await this.addToWhitelist(entry);
        results.push(result);
      } catch (error) {
        console.error(`Failed to whitelist ${entry.ip}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Auto-whitelist trusted sources
   */
  static async autoWhitelistTrustedSources(): Promise<void> {
    const trustedSources = [
      {
        ip: '127.0.0.1',
        description: 'Localhost',
        addedBy: 'system',
        isActive: true
      },
      {
        ip: '::1',
        description: 'IPv6 localhost',
        addedBy: 'system',
        isActive: true
      }
      // Add more trusted sources as needed
    ];
    
    for (const source of trustedSources) {
      const isAlreadyWhitelisted = await this.isWhitelisted(source.ip);
      if (!isAlreadyWhitelisted) {
        await this.addToWhitelist(source);
      }
    }
    
    console.log('✅ Auto-whitelisted trusted sources');
  }
}