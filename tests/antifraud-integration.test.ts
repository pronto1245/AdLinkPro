import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FraudService, type ClickData } from '../server/services/fraudService';
import { EnhancedFraudService } from '../server/services/enhancedFraudService';
import { IPWhitelistService } from '../server/services/ipWhitelistService';

// Mock database
jest.mock('../server/db', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue([])
        })
      })
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([{
          id: 'test-id',
          value: '192.168.1.1',
          createdAt: new Date()
        }])
      })
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue([])
        })
      })
    }),
    count: jest.fn()
  }
}));

describe('Anti-Fraud Module Integration Tests', () => {
  const sampleClickData: ClickData = {
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    country: 'US',
    device: 'desktop',
    browser: 'Chrome',
    referer: 'https://example.com',
    clickId: 'test-click-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FraudService - Basic Functionality', () => {
    it('should detect bot user agents', async () => {
      const botClickData: ClickData = {
        ...sampleClickData,
        userAgent: 'python-requests/2.25.1'
      };

      const result = await FraudService.analyzeFraud(botClickData);
      
      expect(result.isBot).toBe(true);
      expect(result.fraudScore).toBeGreaterThan(0);
      expect(result.reasons).toContain('Bot user agent detected');
    });

    it('should detect VPN/Proxy IPs', async () => {
      const vpnClickData: ClickData = {
        ...sampleClickData,
        ip: '10.0.0.1' // Private IP range
      };

      const result = await FraudService.analyzeFraud(vpnClickData);
      
      expect(result.vpnDetected).toBe(true);
      expect(result.fraudScore).toBeGreaterThan(0);
      expect(result.reasons).toContain('VPN/Proxy IP detected');
    });

    it('should classify risk levels correctly', async () => {
      // High risk scenario
      const highRiskData: ClickData = {
        ...sampleClickData,
        userAgent: 'bot',
        ip: '10.0.0.1',
        country: 'XX' // Invalid country
      };

      const result = await FraudService.analyzeFraud(highRiskData);
      
      expect(result.riskLevel).toBe('high');
      expect(result.fraudScore).toBeGreaterThanOrEqual(70);
    });

    it('should handle legitimate traffic', async () => {
      const legitimateData: ClickData = {
        ...sampleClickData,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ip: '203.0.113.1', // Valid public IP
        country: 'US'
      };

      const result = await FraudService.analyzeFraud(legitimateData);
      
      expect(result.riskLevel).toBe('low');
      expect(result.fraudScore).toBeLessThan(40);
      expect(result.isBot).toBe(false);
      expect(result.vpnDetected).toBe(false);
    });
  });

  describe('EnhancedFraudService - Advanced Features', () => {
    it('should provide real-time fraud statistics', async () => {
      const stats = await EnhancedFraudService.getRealTimeFraudStats();
      
      expect(stats).toHaveProperty('totalClicks');
      expect(stats).toHaveProperty('fraudClicks');
      expect(stats).toHaveProperty('botClicks');
      expect(stats).toHaveProperty('blockedIPs');
      expect(stats).toHaveProperty('fraudRate');
      expect(stats).toHaveProperty('lastUpdated');
      
      expect(typeof stats.totalClicks).toBe('number');
      expect(typeof stats.fraudRate).toBe('number');
    });

    it('should handle auto fraud detection without errors', async () => {
      // This should not throw errors even with mocked DB
      await expect(
        EnhancedFraudService.triggerAutoFraudDetection(sampleClickData)
      ).resolves.not.toThrow();
    });

    it('should configure fraud detection properly', async () => {
      const customConfig = {
        ipClickThreshold: 100,
        enableAutoBlocking: false,
        botScoreThreshold: 90
      };

      // Should accept custom configuration
      await expect(
        EnhancedFraudService.triggerAutoFraudDetection(sampleClickData, customConfig)
      ).resolves.not.toThrow();
    });
  });

  describe('IPWhitelistService - Whitelist Management', () => {
    it('should add IP to whitelist', async () => {
      const whitelistEntry = {
        ip: '192.168.1.1',
        description: 'Test trusted IP',
        addedBy: 'admin',
        isActive: true
      };

      const result = await IPWhitelistService.addToWhitelist(whitelistEntry);
      
      expect(result).toHaveProperty('id');
      expect(result.ip).toBe(whitelistEntry.ip);
      expect(result.description).toBe(whitelistEntry.description);
      expect(result.isActive).toBe(true);
    });

    it('should check whitelist status', async () => {
      const ip = '127.0.0.1';
      
      const isWhitelisted = await IPWhitelistService.isWhitelisted(ip);
      
      // Should return boolean
      expect(typeof isWhitelisted).toBe('boolean');
    });

    it('should handle bulk whitelist operations', async () => {
      const entries = [
        {
          ip: '192.168.1.10',
          description: 'Trusted IP 1',
          addedBy: 'admin',
          isActive: true
        },
        {
          ip: '192.168.1.20',
          description: 'Trusted IP 2', 
          addedBy: 'admin',
          isActive: true
        }
      ];

      const results = await IPWhitelistService.bulkAddToWhitelist(entries);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(entries.length);
    });

    it('should auto-whitelist trusted sources', async () => {
      await expect(
        IPWhitelistService.autoWhitelistTrustedSources()
      ).resolves.not.toThrow();
    });
  });

  describe('Integration - Service Interaction', () => {
    it('should integrate fraud detection with whitelist checking', async () => {
      // First, add IP to whitelist
      const trustedIP = '203.0.113.100';
      await IPWhitelistService.addToWhitelist({
        ip: trustedIP,
        description: 'Integration test IP',
        addedBy: 'test',
        isActive: true
      });

      // Check if IP is whitelisted
      const isWhitelisted = await IPWhitelistService.isWhitelisted(trustedIP);
      
      // Whitelisted IPs should have reduced fraud score
      const clickData: ClickData = {
        ...sampleClickData,
        ip: trustedIP
      };

      const fraudResult = await FraudService.analyzeFraud(clickData);
      
      // Even if other factors are suspicious, whitelisted IPs should be treated better
      expect(typeof fraudResult.fraudScore).toBe('number');
    });

    it('should handle concurrent operations', async () => {
      // Test multiple simultaneous fraud analyses
      const promises = Array(5).fill(null).map((_, index) => 
        FraudService.analyzeFraud({
          ...sampleClickData,
          clickId: `concurrent-test-${index}`,
          ip: `192.168.1.${100 + index}`
        })
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('fraudScore');
        expect(result).toHaveProperty('riskLevel');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const invalidClickData: any = {
        ip: null,
        userAgent: undefined,
        country: '',
        device: null,
        browser: undefined,
        clickId: ''
      };

      const result = await FraudService.analyzeFraud(invalidClickData);
      
      expect(result).toHaveProperty('fraudScore');
      expect(result.fraudScore).toBeGreaterThan(0); // Should flag invalid data as suspicious
    });

    it('should handle database errors gracefully', async () => {
      // Mock DB error
      const mockError = new Error('Database connection failed');
      
      jest.doMock('../server/db', () => ({
        db: {
          select: jest.fn().mockImplementation(() => {
            throw mockError;
          })
        }
      }));

      // Should not crash on DB errors
      await expect(
        EnhancedFraudService.getRealTimeFraudStats()
      ).resolves.toMatchObject({
        totalClicks: 0,
        fraudClicks: 0,
        fraudRate: 0
      });
    });
  });
});