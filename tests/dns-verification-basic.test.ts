import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Simple tests for DNS verification service without complex mocking
describe('DNSVerificationService Basic Tests', () => {
  let DNSVerificationService: any;

  beforeEach(async () => {
    // Import the service dynamically to avoid module import issues
    const module = await import('../server/services/dnsVerification');
    DNSVerificationService = module.DNSVerificationService;
  });

  describe('generateVerificationCode', () => {
    test('should generate unique verification codes', () => {
      const code1 = DNSVerificationService.generateVerificationCode();
      const code2 = DNSVerificationService.generateVerificationCode();
      
      expect(code1).toMatch(/^verify=[a-f0-9]{32}$/);
      expect(code2).toMatch(/^verify=[a-f0-9]{32}$/);
      expect(code1).not.toBe(code2);
    });

    test('should have correct format', () => {
      const code = DNSVerificationService.generateVerificationCode();
      expect(code.startsWith('verify=')).toBe(true);
      expect(code.length).toBe(39); // 'verify=' + 32 hex characters
    });
  });

  describe('isValidDomain', () => {
    test('should validate correct domains', () => {
      const validDomains = [
        'example.com',
        'subdomain.example.com',
        'test-domain.org',
        'my123.test.co.uk',
        '123domain.net'
      ];

      validDomains.forEach(domain => {
        expect(DNSVerificationService.isValidDomain(domain)).toBe(true);
      });
    });

    test('should reject invalid domains', () => {
      const invalidDomains = [
        'invalid',
        '.invalid.com',
        'invalid..com',
        'invalid-.com',
        '-invalid.com',
        'invalid.c',
        'inv@lid.com',
        'invalid space.com',
        ''
      ];

      invalidDomains.forEach(domain => {
        expect(DNSVerificationService.isValidDomain(domain)).toBe(false);
      });
    });
  });

  describe('getVerificationInstructions', () => {
    test('should return properly formatted instructions', () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      const instructions = DNSVerificationService.getVerificationInstructions(domain, verificationCode);
      
      expect(instructions).toHaveProperty('dns');
      expect(instructions).toHaveProperty('file');
      
      // Check DNS instructions
      expect(instructions.dns.title).toBe('DNS TXT Record Verification');
      expect(instructions.dns.record.type).toBe('TXT');
      expect(instructions.dns.record.name).toBe(domain);
      expect(instructions.dns.record.value).toBe(verificationCode);
      expect(instructions.dns.record.ttl).toBe('300 (optional)');
      
      // Check file instructions
      expect(instructions.file.title).toBe('File Upload Verification (Alternative)');
      expect(instructions.file.file.path).toBe(`https://${domain}/trk-verification.txt`);
      expect(instructions.file.file.content).toBe(verificationCode);
    });

    test('should include helpful notes', () => {
      const domain = 'example.com';
      const verificationCode = 'verify=def456';
      
      const instructions = DNSVerificationService.getVerificationInstructions(domain, verificationCode);
      
      expect(instructions.dns.note).toContain('DNS changes may take up to 24 hours');
      expect(instructions.file.note).toContain('Ensure the file is accessible via HTTPS');
    });
  });

  describe('Domain validation edge cases', () => {
    test('should handle domain with special characters', () => {
      const domain = 'test-domain.example.com';
      expect(DNSVerificationService.isValidDomain(domain)).toBe(true);
    });

    test('should reject domain with invalid characters', () => {
      const domain = 'test_domain.example.com'; // underscore not allowed in domain names
      expect(DNSVerificationService.isValidDomain(domain)).toBe(false);
    });

    test('should handle internationalized domains correctly', () => {
      // Most basic ASCII domains should work
      expect(DNSVerificationService.isValidDomain('xn--example.com')).toBe(true);
    });
  });

  describe('Verification code security', () => {
    test('should generate cryptographically strong codes', () => {
      const codes = new Set();
      
      // Generate 100 codes and ensure they are all unique
      for (let i = 0; i < 100; i++) {
        const code = DNSVerificationService.generateVerificationCode();
        expect(codes.has(code)).toBe(false);
        codes.add(code);
      }
      
      expect(codes.size).toBe(100);
    });

    test('should use proper format for verification', () => {
      const code = DNSVerificationService.generateVerificationCode();
      const [prefix, hash] = code.split('=');
      
      expect(prefix).toBe('verify');
      expect(hash).toMatch(/^[a-f0-9]{32}$/);
      expect(hash.length).toBe(32);
    });
  });
});