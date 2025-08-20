import { randomBytes } from 'crypto';

// Simplified DNS verification service for testing
export interface DomainVerificationResult {
  success: boolean;
  method: 'dns' | 'file';
  error?: string;
}

export class TestDNSVerificationService {
  // Generate unique verification code
  static generateVerificationCode(): string {
    return `verify=${randomBytes(16).toString('hex')}`;
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