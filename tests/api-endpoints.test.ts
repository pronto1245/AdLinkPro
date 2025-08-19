import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PostbackService, PostbackEvent, PostbackMacros } from '../server/services/postback';

describe('Postback System Tests', () => {

  describe('PostbackService Core Functionality', () => {
    it('should generate unique click IDs', () => {
      const id1 = PostbackService.generateClickId();
      const id2 = PostbackService.generateClickId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(8);
    });

    it('should replace macros in URLs correctly', () => {
      const template = 'https://tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}';
      const macros: PostbackMacros = {
        clickid: 'test_click_123',
        status: 'lead',
        revenue: '25.50'
      };

      const result = PostbackService.replaceMacros(template, macros);
      
      expect(result).toBe('https://tracker.com/postback?clickid=test_click_123&status=lead&revenue=25.50');
    });

    it('should handle empty or missing macros', () => {
      const template = 'https://tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}';
      const macros: PostbackMacros = {
        clickid: 'test_click_123',
        status: 'lead'
        // revenue is missing
      };

      const result = PostbackService.replaceMacros(template, macros);
      
      expect(result).toBe('https://tracker.com/postback?clickid=test_click_123&status=lead&revenue=');
    });

    it('should URL encode macro values', () => {
      const template = 'https://tracker.com/postback?ref={referer}&agent={user_agent}';
      const macros: PostbackMacros = {
        referer: 'https://google.com/search?q=test query',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      };

      const result = PostbackService.replaceMacros(template, macros);
      
      expect(result).toContain('ref=https%3A//google.com/search%3Fq%3Dtest%20query');
      expect(result).toContain('agent=Mozilla/5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)');
    });

    it('should build comprehensive macros from click data', () => {
      const clickData = {
        clickId: 'test_click_123',
        partnerId: 'partner_456',
        offerId: 'offer_789',
        ip: '192.168.1.1',
        country: 'US',
        device: 'mobile',
        subId1: 'campaign1',
        subId2: 'source_fb'
      };

      const event: PostbackEvent = {
        type: 'registration',
        clickId: 'test_click_123',
        data: {
          revenue: '25.50',
          currency: 'USD'
        },
        partnerId: 'partner_456',
        offerId: 'offer_789'
      };

      const macros = PostbackService.buildMacrosFromClick(clickData, event);
      
      expect(macros.clickid).toBe('test_click_123');
      expect(macros.status).toBe('registration');
      expect(macros.partner_id).toBe('partner_456');
      expect(macros.offer_id).toBe('offer_789');
      expect(macros.revenue).toBe('25.50');
      expect(macros.currency).toBe('USD');
      expect(macros.country).toBe('US');
      expect(macros.device).toBe('mobile');
      expect(macros.sub1).toBe('campaign1');
      expect(macros.sub2).toBe('source_fb');
      expect(macros.timestamp).toBeDefined();
      expect(macros.datetime).toBeDefined();
    });

    it('should validate IP whitelist correctly', () => {
      // Empty whitelist allows all
      expect(PostbackService.isIpWhitelisted('192.168.1.1', '')).toBe(true);
      expect(PostbackService.isIpWhitelisted('192.168.1.1', '   ')).toBe(true);
      
      // Wildcard allows all
      expect(PostbackService.isIpWhitelisted('192.168.1.1', '*')).toBe(true);
      
      // Specific IP match
      expect(PostbackService.isIpWhitelisted('192.168.1.1', '192.168.1.1')).toBe(true);
      expect(PostbackService.isIpWhitelisted('192.168.1.1', '192.168.1.2')).toBe(false);
      
      // Multiple IPs
      expect(PostbackService.isIpWhitelisted('192.168.1.1', '192.168.1.1,10.0.0.1')).toBe(true);
      expect(PostbackService.isIpWhitelisted('10.0.0.1', '192.168.1.1,10.0.0.1')).toBe(true);
      expect(PostbackService.isIpWhitelisted('127.0.0.1', '192.168.1.1,10.0.0.1')).toBe(false);
    });

    it('should generate HMAC signatures consistently', () => {
      const url = 'https://tracker.com/postback';
      const payload = { clickid: 'test123', status: 'lead' };
      const secret = 'test-secret';

      const signature1 = PostbackService.generateSignature(url, payload, secret);
      const signature2 = PostbackService.generateSignature(url, payload, secret);
      
      expect(signature1).toBe(signature2);
      expect(typeof signature1).toBe('string');
      expect(signature1.length).toBe(64); // SHA-256 hex length
    });
  });

  describe('Registration Postback Integration', () => {
    it('should support registration event type', () => {
      const event: PostbackEvent = {
        type: 'registration',
        clickId: 'test_click_123',
        data: {
          clickid: 'test_click_123',
          status: 'registration',
          user_id: 'user_456',
          username: 'testuser',
          email: 'test@example.com'
        }
      };

      expect(event.type).toBe('registration');
      expect(event.data.status).toBe('registration');
      expect(event.data.user_id).toBe('user_456');
    });

    it('should build registration macros with user data', () => {
      const clickData = {
        clickId: 'reg_click_789'
      };

      const event: PostbackEvent = {
        type: 'registration',
        clickId: 'reg_click_789', 
        data: {
          clickid: 'reg_click_789',
          status: 'registration',
          user_id: 'new_user_123',
          username: 'newuser',
          email: 'newuser@example.com',
          role: 'affiliate',
          referral_code: 'ABC123'
        }
      };

      const macros = PostbackService.buildMacrosFromClick(clickData, event);
      
      expect(macros.clickid).toBe('reg_click_789');
      expect(macros.status).toBe('registration');
      expect(macros.user_id).toBe('new_user_123');
      expect(macros.username).toBe('newuser');
      expect(macros.email).toBe('newuser@example.com');
      expect(macros.role).toBe('affiliate');
      expect(macros.referral_code).toBe('ABC123');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed URLs gracefully', () => {
      const template = 'not-a-valid-url-{clickid}';
      const macros: PostbackMacros = {
        clickid: 'test123'
      };

      // Should not throw error
      expect(() => PostbackService.replaceMacros(template, macros)).not.toThrow();
      
      const result = PostbackService.replaceMacros(template, macros);
      expect(result).toBe('not-a-valid-url-test123');
    });

    it('should handle circular macro references', () => {
      const template = 'https://example.com?a={b}&b={a}';
      const macros: PostbackMacros = {
        a: '{b}',
        b: '{a}'
      };

      // Should not get stuck in infinite loop
      const result = PostbackService.replaceMacros(template, macros);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Performance Tests', () => {
    it('should generate click IDs quickly', () => {
      const start = Date.now();
      const ids = [];
      
      for (let i = 0; i < 1000; i++) {
        ids.push(PostbackService.generateClickId());
      }
      
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
      expect(new Set(ids).size).toBe(1000); // All should be unique
    });

    it('should process macro replacements efficiently', () => {
      const template = 'https://example.com/postback?clickid={clickid}&status={status}&revenue={revenue}&partner={partner_id}&offer={offer_id}&sub1={sub1}&sub2={sub2}&sub3={sub3}&country={country}&device={device}';
      const macros: PostbackMacros = {
        clickid: 'test_click_123',
        status: 'lead',
        revenue: '25.50',
        partner_id: 'P123',
        offer_id: 'O456',
        sub1: 'campaign',
        sub2: 'source',
        sub3: 'creative',
        country: 'US',
        device: 'mobile'
      };

      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        PostbackService.replaceMacros(template, macros);
      }
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500); // Should complete 1000 replacements in under 0.5 seconds
    });
  });
});