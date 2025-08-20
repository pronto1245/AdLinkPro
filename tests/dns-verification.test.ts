import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DNSVerificationService, type DomainVerificationResult } from '../server/services/dnsVerification';

// Mock node-fetch for file verification tests
jest.mock('node-fetch', () => {
  const mockFetch = jest.fn();
  return { default: mockFetch };
});

// Mock DNS module for TXT record tests
jest.mock('dns', () => ({
  resolveTxt: jest.fn()
}));

const mockFetch = require('node-fetch').default as jest.MockedFunction<any>;
const mockDNS = require('dns') as { resolveTxt: jest.MockedFunction<any> };

describe('DNSVerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  describe('verifyDNSTxtRecord', () => {
    test('should successfully verify when TXT record contains verification code', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock DNS resolution to return records containing the verification code
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(null, [['some-other-record'], [verificationCode, 'another-record']]);
      });

      const result = await DNSVerificationService.verifyDNSTxtRecord(domain, verificationCode);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('dns');
      expect(result.error).toBeUndefined();
    });

    test('should fail when TXT record does not contain verification code', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock DNS resolution to return records without the verification code
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(null, [['some-other-record'], ['different-record']]);
      });

      const result = await DNSVerificationService.verifyDNSTxtRecord(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('dns');
      expect(result.error).toBe('Verification code not found in DNS TXT records');
    });

    test('should handle DNS lookup errors', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock DNS resolution to throw an error
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(new Error('NXDOMAIN'));
      });

      const result = await DNSVerificationService.verifyDNSTxtRecord(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('dns');
      expect(result.error).toBe('DNS lookup failed: NXDOMAIN');
    });
  });

  describe('verifyFileMethod', () => {
    test('should successfully verify when file contains verification code', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock successful HTTP response with verification code
      const mockText = jest.fn();
      mockText.mockResolvedValue(verificationCode);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: mockText
      });

      const result = await DNSVerificationService.verifyFileMethod(domain, verificationCode);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('file');
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://${domain}/trk-verification.txt`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'User-Agent': 'Affiliate-Platform-Verifier/1.0'
          }
        })
      );
    });

    test('should fail when file does not contain verification code', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock HTTP response with different content
      const mockText = jest.fn();
      mockText.mockResolvedValue('different content');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: mockText
      });

      const result = await DNSVerificationService.verifyFileMethod(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('file');
      expect(result.error).toBe('Verification code not found in file content');
    });

    test('should handle HTTP errors', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock HTTP 404 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await DNSVerificationService.verifyFileMethod(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('file');
      expect(result.error).toBe('HTTP 404: Not Found');
    });

    test('should handle network errors', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await DNSVerificationService.verifyFileMethod(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('file');
      expect(result.error).toBe('File verification failed: Network error');
    });

    test('should handle timeout', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock timeout scenario
      mockFetch.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          // Simulate controller.abort() being called
          setTimeout(() => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          }, 10);
        });
      });

      const result = await DNSVerificationService.verifyFileMethod(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('file');
      expect(result.error).toBe('File verification failed: The operation was aborted');
    });
  });

  describe('verifyDomain', () => {
    test('should try DNS first and return on success', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock successful DNS verification
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(null, [[verificationCode]]);
      });

      const result = await DNSVerificationService.verifyDomain(domain, verificationCode);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('dns');
      // Should not call fetch since DNS succeeded
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should fallback to file method if DNS fails', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock failed DNS verification
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(new Error('DNS lookup failed'));
      });
      
      // Mock successful file verification
      const mockText = jest.fn();
      mockText.mockResolvedValue(verificationCode);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: mockText
      });

      const result = await DNSVerificationService.verifyDomain(domain, verificationCode);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('file');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should fail if both methods fail', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock failed DNS verification
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(new Error('DNS lookup failed'));
      });
      
      // Mock failed file verification
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await DNSVerificationService.verifyDomain(domain, verificationCode);
      
      expect(result.success).toBe(false);
      expect(result.method).toBe('file'); // Should return result from last attempted method
      expect(result.error).toBe('File verification failed: Network error');
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

  describe('Integration scenarios', () => {
    test('should handle domain with special characters', async () => {
      const domain = 'test-domain.example.com';
      const verificationCode = DNSVerificationService.generateVerificationCode();
      
      expect(DNSVerificationService.isValidDomain(domain)).toBe(true);
      
      // Mock successful verification
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(null, [[verificationCode]]);
      });
      
      const result = await DNSVerificationService.verifyDomain(domain, verificationCode);
      expect(result.success).toBe(true);
    });

    test('should handle multiple TXT records correctly', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=correct123';
      
      // Mock DNS with multiple TXT records
      mockDNS.resolveTxt.mockImplementation((domain: string, callback: (err: any, records?: string[][]) => void) => {
        callback(null, [
          ['v=spf1 include:_spf.google.com ~all'],
          ['google-site-verification=different123'],
          [verificationCode, 'some other data'],
          ['another record']
        ]);
      });
      
      const result = await DNSVerificationService.verifyDNSTxtRecord(domain, verificationCode);
      expect(result.success).toBe(true);
    });

    test('should handle file with extra whitespace', async () => {
      const domain = 'test.com';
      const verificationCode = 'verify=abc123';
      
      // Mock file response with whitespace
      const mockText = jest.fn();
      mockText.mockResolvedValue(`\n\n  ${verificationCode}  \n\n`);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: mockText
      });

      const result = await DNSVerificationService.verifyFileMethod(domain, verificationCode);
      expect(result.success).toBe(true);
    });
  });
});