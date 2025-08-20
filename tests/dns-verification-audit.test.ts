import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Integration test to verify the complete DNS verification workflow
 * This test validates that all components are properly structured
 */
describe('DNS Verification Module - Architecture Audit', () => {
  describe('File Structure Analysis', () => {
    test('should have all required service files', () => {
      expect(fs.existsSync('./server/services/dnsVerification.ts')).toBe(true);
      expect(fs.existsSync('./server/services/customDomains.ts')).toBe(true);
    });

    test('should have DNS monitoring utilities', () => {
      expect(fs.existsSync('./check-dns-propagation.js')).toBe(true);
      expect(fs.existsSync('./DNS_STATUS_CHECK.md')).toBe(true);
    });

    test('should have frontend components', () => {
      expect(fs.existsSync('./client/src/components/advertiser/DomainVerification.tsx')).toBe(true);
      expect(fs.existsSync('./client/src/components/advertiser/CustomDomainManager.tsx')).toBe(true);
    });
  });

  describe('API Endpoints Validation', () => {
    test('should have expected API routes structure', () => {
      const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
      
      // Check for required API endpoints
      expect(routesContent).toContain('/api/advertiser/domains/verify');
      expect(routesContent).toContain('/api/advertiser/domains/:domainId/check');
      expect(routesContent).toContain('/api/advertiser/domains/:domainId/instructions');
      expect(routesContent).toContain('/api/advertiser/profile/domains');
      
      // Verify DNS service import
      expect(routesContent).toContain("import { DNSVerificationService }");
    });

    test('should use proper authentication middleware', () => {
      const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
      
      // Check that DNS verification endpoints require authentication
      const dnsEndpointRegex = /app\.(post|get|delete)\("\/api\/advertiser\/domains.*?authenticateToken/g;
      const matches = routesContent.match(dnsEndpointRegex);
      
      expect(matches).toBeTruthy();
      expect(matches!.length).toBeGreaterThan(0);
    });
  });

  describe('Frontend Integration Analysis', () => {
    test('should use proper API integration in frontend', () => {
      const domainVerificationContent = fs.readFileSync(
        './client/src/components/advertiser/DomainVerification.tsx', 
        'utf8'
      );
      
      // Check for proper API calls
      expect(domainVerificationContent).toContain('/api/advertiser/domains');
      expect(domainVerificationContent).toContain('useMutation');
      expect(domainVerificationContent).toContain('useQuery');
      
      // Check for proper state management
      expect(domainVerificationContent).toContain('useState');
      expect(domainVerificationContent).toContain('useToast');
    });

    test('should have proper TypeScript interfaces', () => {
      const domainVerificationContent = fs.readFileSync(
        './client/src/components/advertiser/DomainVerification.tsx', 
        'utf8'
      );
      
      // Check for proper interface definitions
      expect(domainVerificationContent).toContain('interface Domain');
      expect(domainVerificationContent).toContain('interface VerificationInstructions');
      expect(domainVerificationContent).toContain("status: 'pending' | 'verified' | 'failed'");
    });
  });

  describe('Service Implementation Validation', () => {
    test('should have proper service structure', () => {
      const dnsVerificationContent = fs.readFileSync('./server/services/dnsVerification.ts', 'utf8');
      
      // Check for required methods
      expect(dnsVerificationContent).toContain('generateVerificationCode');
      expect(dnsVerificationContent).toContain('verifyDNSTxtRecord');
      expect(dnsVerificationContent).toContain('verifyFileMethod');
      expect(dnsVerificationContent).toContain('verifyDomain');
      expect(dnsVerificationContent).toContain('isValidDomain');
      expect(dnsVerificationContent).toContain('getVerificationInstructions');
      
      // Check for proper error handling
      expect(dnsVerificationContent).toContain('catch (error: any)');
      expect(dnsVerificationContent).toContain('error?.message');
    });

    test('should have proper interface exports', () => {
      const dnsVerificationContent = fs.readFileSync('./server/services/dnsVerification.ts', 'utf8');
      
      expect(dnsVerificationContent).toContain('export interface DomainVerificationResult');
      expect(dnsVerificationContent).toContain('export class DNSVerificationService');
      expect(dnsVerificationContent).toContain("method: 'dns' | 'file'");
    });
  });

  describe('Configuration and Documentation', () => {
    test('should have comprehensive documentation', () => {
      const dnsStatusContent = fs.readFileSync('./DNS_STATUS_CHECK.md', 'utf8');
      
      // Check documentation completeness
      expect(dnsStatusContent).toContain('проверка готовности домена');
      expect(dnsStatusContent).toContain('DNS');
      expect(dnsStatusContent).toContain('ping');
      expect(dnsStatusContent).toContain('IP');
    });

    test('should have working DNS monitoring script', () => {
      const monitoringScript = fs.readFileSync('./check-dns-propagation.js', 'utf8');
      
      // Check script structure
      expect(monitoringScript).toContain('checkDNS');
      expect(monitoringScript).toContain('nslookup');
      expect(monitoringScript).toContain('TXT');
      expect(monitoringScript).toContain('platform-verify=');
      
      // Should use CommonJS (fixed import issue)
      expect(monitoringScript).toContain('require(');
      expect(monitoringScript).not.toContain('import {');
    });
  });

  describe('Security and Best Practices', () => {
    test('should use secure verification code generation', () => {
      const dnsVerificationContent = fs.readFileSync('./server/services/dnsVerification.ts', 'utf8');
      
      // Check for cryptographic randomness
      expect(dnsVerificationContent).toContain('randomBytes');
      expect(dnsVerificationContent).toContain('toString(\'hex\')');
      expect(dnsVerificationContent).toContain('verify=');
    });

    test('should have proper domain validation', () => {
      const dnsVerificationContent = fs.readFileSync('./server/services/dnsVerification.ts', 'utf8');
      
      // Check for domain regex validation
      expect(dnsVerificationContent).toContain('domainRegex');
      expect(dnsVerificationContent).toContain('[a-zA-Z0-9]');
      expect(dnsVerificationContent).toContain('[a-zA-Z]{2,}');
    });

    test('should have SSL certificate handling', () => {
      const customDomainsContent = fs.readFileSync('./server/services/customDomains.ts', 'utf8');
      
      // SSL handling exists but might need improvement
      expect(customDomainsContent).toContain('requestSSLCertificate');
      expect(customDomainsContent).toContain('checkSSL');
      expect(customDomainsContent).toContain('sslStatus');
    });
  });

  describe('Integration Assessment', () => {
    test('should have complete workflow coverage', () => {
      const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
      
      // End-to-end workflow should be covered
      expect(routesContent).toContain('DNSVerificationService.generateVerificationCode');
      expect(routesContent).toContain('DNSVerificationService.verifyDomain');
      expect(routesContent).toContain('DNSVerificationService.getVerificationInstructions');
      expect(routesContent).toContain('DNSVerificationService.isValidDomain');
    });

    test('should have proper error responses', () => {
      const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
      
      // API should handle errors properly
      expect(routesContent).toContain('res.status(400)');
      expect(routesContent).toContain('res.status(404)');
      expect(routesContent).toContain('Domain is required');
      expect(routesContent).toContain('Invalid domain format');
    });
  });
});