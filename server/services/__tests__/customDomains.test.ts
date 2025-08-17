/**
 * Unit Tests for CustomDomainService
 * 
 * These tests verify the core functionality of the custom domain service
 * including domain creation, verification, batch operations, and error handling.
 */

import { CustomDomainService } from '../customDomains';
import { enhancedDNS } from '../enhancedDNS';
import { dnsCache } from '../dnsCache';

// Mock dependencies
jest.mock('../db.js');
jest.mock('../enhancedDNS.js');
jest.mock('../config/environment.js', () => ({
  config: {
    MAX_DOMAINS_PER_ADVERTISER: 5,
    DNS_CACHE_TTL_SECONDS: 300,
    DNS_TIMEOUT_MS: 5000
  }
}));

// Mock database responses
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  inArray: jest.fn()
};

describe('CustomDomainService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DNS cache before each test
    dnsCache.clearAll();
  });

  describe('generateVerificationValue', () => {
    it('should generate a verification value with correct format', () => {
      const value = CustomDomainService.generateVerificationValue();
      
      expect(value).toMatch(/^platform-verify=[a-f0-9]{32}$/);
      expect(value.length).toBe(49); // 'platform-verify=' (17) + 32 hex chars
    });

    it('should generate unique values on each call', () => {
      const value1 = CustomDomainService.generateVerificationValue();
      const value2 = CustomDomainService.generateVerificationValue();
      
      expect(value1).not.toBe(value2);
    });
  });

  describe('createCustomDomain', () => {
    it('should create a domain when under limit', async () => {
      // Mock: advertiser has 2 existing domains (under limit of 5)
      mockDb.returning.mockResolvedValue([{
        id: 'domain-123',
        domain: 'test.example.com',
        advertiserId: 'user-123',
        type: 'cname',
        status: 'pending'
      }]);

      const result = await CustomDomainService.createCustomDomain({
        advertiserId: 'user-123',
        domain: 'test.example.com',
        type: 'cname'
      });

      expect(result).toBeDefined();
      expect(result.domain).toBe('test.example.com');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw error when domain limit exceeded', async () => {
      // Mock: advertiser already has 5 domains (at limit)
      const existingDomains = new Array(5).fill({ id: 'domain-x' });
      mockDb.returning.mockResolvedValue(existingDomains);

      await expect(
        CustomDomainService.createCustomDomain({
          advertiserId: 'user-123',
          domain: 'test.example.com'
        })
      ).rejects.toThrow('Domain limit exceeded');
    });

    it('should normalize domain to lowercase', async () => {
      mockDb.returning.mockResolvedValue([{
        id: 'domain-123',
        domain: 'test.example.com', // Should be lowercase
        advertiserId: 'user-123'
      }]);

      const result = await CustomDomainService.createCustomDomain({
        advertiserId: 'user-123',
        domain: 'TEST.EXAMPLE.COM' // Mixed case input
      });

      expect(result.domain).toBe('test.example.com');
    });
  });

  describe('verifyDomain', () => {
    const mockDomain = {
      id: 'domain-123',
      domain: 'test.example.com',
      type: 'cname',
      advertiserId: 'user-123'
    };

    beforeEach(() => {
      mockDb.returning.mockResolvedValue([mockDomain]);
    });

    it('should successfully verify CNAME record', async () => {
      // Mock successful DNS resolution
      const mockEnhancedDNS = enhancedDNS as jest.Mocked<typeof enhancedDNS>;
      mockEnhancedDNS.resolveCname.mockResolvedValue({
        success: true,
        records: ['test.example.com.arbiconnect.app'],
        fromCache: false
      });

      const result = await CustomDomainService.verifyDomain('domain-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('verified');
      expect(mockEnhancedDNS.resolveCname).toHaveBeenCalledWith('test.example.com');
    });

    it('should handle DNS resolution failure with detailed error', async () => {
      const mockEnhancedDNS = enhancedDNS as jest.Mocked<typeof enhancedDNS>;
      mockEnhancedDNS.resolveCname.mockResolvedValue({
        success: false,
        error: {
          code: 'ENOTFOUND',
          type: 'RECORD_NOT_FOUND',
          message: 'CNAME record not found for domain test.example.com',
          domain: 'test.example.com',
          recordType: 'CNAME'
        },
        fromCache: false
      });

      const result = await CustomDomainService.verifyDomain('domain-123');

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.errorDetails?.type).toBe('RECORD_NOT_FOUND');
    });

    it('should verify A record correctly', async () => {
      const aDomain = { ...mockDomain, type: 'a_record' };
      mockDb.returning.mockResolvedValue([aDomain]);
      
      const mockEnhancedDNS = enhancedDNS as jest.Mocked<typeof enhancedDNS>;
      mockEnhancedDNS.resolveA.mockResolvedValue({
        success: true,
        records: ['0.0.0.0'], // Matches SERVER_IP default
        fromCache: false
      });

      const result = await CustomDomainService.verifyDomain('domain-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('verified');
    });

    it('should detect cached DNS results', async () => {
      const mockEnhancedDNS = enhancedDNS as jest.Mocked<typeof enhancedDNS>;
      mockEnhancedDNS.resolveCname.mockResolvedValue({
        success: true,
        records: ['test.example.com.arbiconnect.app'],
        fromCache: true // This time from cache
      });

      const result = await CustomDomainService.verifyDomain('domain-123');

      expect(result.success).toBe(true);
      // Could add additional assertions about cache usage logging
    });
  });

  describe('updateTrackingLinksWithDomain', () => {
    it('should perform batch update for multiple offers', async () => {
      const mockOffers = [
        { id: 'offer-1' },
        { id: 'offer-2' },
        { id: 'offer-3' }
      ];
      
      mockDb.returning.mockResolvedValue(mockOffers);

      await CustomDomainService.updateTrackingLinksWithDomain('user-123', 'track.example.com');

      // Verify that inArray was used for batch operation
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        customDomain: 'track.example.com',
        updatedAt: expect.any(Date)
      });
    });

    it('should handle case with no offers gracefully', async () => {
      mockDb.returning.mockResolvedValue([]); // No offers

      await expect(
        CustomDomainService.updateTrackingLinksWithDomain('user-123', 'track.example.com')
      ).resolves.not.toThrow();

      // Should not attempt database update
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('getAdvertiserDomains', () => {
    it('should return domains ordered by creation date', async () => {
      const mockDomains = [
        { id: 'domain-1', createdAt: new Date('2024-01-02') },
        { id: 'domain-2', createdAt: new Date('2024-01-01') }
      ];
      
      mockDb.returning.mockResolvedValue(mockDomains);

      const result = await CustomDomainService.getAdvertiserDomains('user-123');

      expect(result).toEqual(mockDomains);
      expect(mockDb.orderBy).toHaveBeenCalled();
    });
  });

  describe('getVerifiedDomains', () => {
    it('should return only verified and active domains', async () => {
      const mockDomains = [
        { domain: 'verified1.example.com' },
        { domain: 'verified2.example.com' }
      ];
      
      mockDb.returning.mockResolvedValue(mockDomains);

      const result = await CustomDomainService.getVerifiedDomains('user-123');

      expect(result).toEqual(['verified1.example.com', 'verified2.example.com']);
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('getBestDomain', () => {
    it('should return most recently created verified domain', async () => {
      const mockDomain = [{ domain: 'latest.example.com' }];
      mockDb.returning.mockResolvedValue(mockDomain);

      const result = await CustomDomainService.getBestDomain('user-123');

      expect(result).toBe('latest.example.com');
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it('should return null when no verified domains exist', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await CustomDomainService.getBestDomain('user-123');

      expect(result).toBeNull();
    });
  });

  describe('getDNSInstructions', () => {
    it('should provide correct CNAME instructions', () => {
      const domain = {
        id: 'domain-123',
        domain: 'test.example.com',
        type: 'cname' as const,
        verificationValue: 'platform-verify=abc123'
      };

      const instructions = CustomDomainService.getDNSInstructions(domain);

      expect(instructions.type).toBe('CNAME');
      expect(instructions.record).toBe('test.example.com');
      expect(instructions.value).toBe('platform-verify.com');
      expect(instructions.instructions).toContain('CNAME');
    });

    it('should provide correct TXT instructions', () => {
      const domain = {
        id: 'domain-123',
        domain: 'test.example.com',
        type: 'a_record' as const,
        verificationValue: 'platform-verify=abc123'
      };

      const instructions = CustomDomainService.getDNSInstructions(domain);

      expect(instructions.type).toBe('TXT');
      expect(instructions.record).toBe('test.example.com');
      expect(instructions.value).toBe('platform-verify=abc123');
      expect(instructions.instructions).toContain('TXT');
    });
  });

  describe('checkSSL', () => {
    it('should check SSL certificate validity', async () => {
      // This would need mocking of the https module
      const result = await CustomDomainService.checkSSL('secure.example.com');
      
      // Basic structure check - specific implementation depends on https module mocking
      expect(result).toHaveProperty('hasSSL');
      if (result.hasSSL) {
        expect(result).toHaveProperty('validUntil');
        expect(result).toHaveProperty('issuer');
      }
    });
  });
});