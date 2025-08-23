import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { resolveTxt } from 'dns';
import fetch from 'node-fetch';

const resolveTxtAsync = promisify(resolveTxt);

export interface DomainVerificationResult {
  success: boolean;
  method: 'dns' | 'file';
  error?: string;
}

export class DNSVerificationService {
  // Generate unique verification code
  static generateVerificationCode(): string {
    return `verify=${randomBytes(16).toString('hex')}`;
  }

  // DNS TXT record verification
  static async verifyDNSTxtRecord(domain: string, expectedCode: string): Promise<DomainVerificationResult> {
    try {
      console.log(`Verifying DNS TXT record for domain: ${domain}`);
      console.log(`Expected verification code: ${expectedCode}`);
      
      const records = await resolveTxtAsync(domain);
      console.log(`DNS TXT records found:`, records);
      
      // Check if any TXT record contains our verification code
      const isVerified = records.some(recordArray => 
        recordArray.some(record => record.includes(expectedCode))
      );
      
      if (isVerified) {
        console.log(`✅ Domain ${domain} verified successfully via DNS TXT record`);
        return { success: true, method: 'dns' };
      } else {
        console.log(`❌ Verification code not found in DNS TXT records for ${domain}`);
        return { 
          success: false, 
          method: 'dns', 
          error: 'Verification code not found in DNS TXT records' 
        };
      }
    } catch (error: any) {
      console.error(`DNS verification error for ${domain}:`, _error);
      return { 
        success: false, 
        method: 'dns', 
        error: `DNS lookup failed: ${error?.message || 'Unknown error'}` 
      };
    }
  }

  // File-based verification (alternative method)
  static async verifyFileMethod(domain: string, expectedCode: string): Promise<DomainVerificationResult> {
    try {
      console.log(`Verifying file method for domain: ${domain}`);
      
      const verificationUrl = `https://${domain}/trk-verification.txt`;
      console.log(`Fetching verification file from: ${verificationUrl}`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const response = await fetch(verificationUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Affiliate-Platform-Verifier/1.0'
        }
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        return {
          success: false,
          method: 'file',
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const content = await response.text();
      console.log(`File content received:`, content);
      
      if (content.trim().includes(expectedCode)) {
        console.log(`✅ Domain ${domain} verified successfully via file method`);
        return { success: true, method: 'file' };
      } else {
        console.log(`❌ Verification code not found in file for ${domain}`);
        return {
          success: false,
          method: 'file',
          error: 'Verification code not found in file content'
        };
      }
    } catch (error: any) {
      console.error(`File verification error for ${domain}:`, _error);
      return {
        success: false,
        method: 'file',
        error: `File verification failed: ${error?.message || 'Unknown error'}`
      };
    }
  }

  // Try both verification methods
  static async verifyDomain(domain: string, expectedCode: string): Promise<DomainVerificationResult> {
    console.log(`Starting domain verification for: ${domain}`);
    
    // First try DNS TXT record method
    const dnsResult = await this.verifyDNSTxtRecord(domain, expectedCode);
    if (dnsResult.success) {
      return dnsResult;
    }
    
    // If DNS fails, try file method as fallback
    console.log(`DNS verification failed, trying file method...`);
    const fileResult = await this.verifyFileMethod(domain, expectedCode);
    
    return fileResult;
  }

  // Validate domain format
  static isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  // Generate verification instructions for user
  static getVerificationInstructions(domain: string, verificationCode: string) {
    return {
      dns: {
        title: 'DNS TXT Record Verification',
        description: 'Add the following TXT record to your domain\'s DNS settings:',
        record: {
          type: 'TXT',
          name: domain,
          value: verificationCode,
          ttl: '300 (optional)'
        },
        note: 'DNS changes may take up to 24 hours to propagate worldwide.'
      },
      file: {
        title: 'File Upload Verification (Alternative)',
        description: 'Upload a verification file to your domain root:',
        file: {
          path: `https://${domain}/trk-verification.txt`,
          content: verificationCode
        },
        note: 'Ensure the file is accessible via HTTPS and returns the exact verification code.'
      }
    };
  }
}