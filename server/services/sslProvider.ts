import { config } from '../config/environment.js';

/**
 * SSL Provider Service for managing SSL certificates from multiple providers
 * 
 * Supports:
 * - Let's Encrypt (default)
 * - Cloudflare SSL
 * - AWS Certificate Manager (ACM)
 * 
 * @example
 * const sslService = new SSLProviderService();
 * await sslService.issueCertificate('example.com', 'domain-123');
 */

export interface SSLCertificate {
  certificate: string;
  privateKey: string;
  chainCertificate?: string;
  validFrom: Date;
  validUntil: Date;
  issuer: string;
}

export interface SSLProviderConfig {
  provider: 'letsencrypt' | 'cloudflare' | 'aws-acm';
  credentials?: {
    [key: string]: string;
  };
}

export class SSLProviderService {
  private provider: SSLProviderConfig['provider'];
  private credentials: { [key: string]: string };

  constructor() {
    this.provider = config.SSL_PROVIDER as SSLProviderConfig['provider'];
    this.credentials = {
      cloudflareApiToken: config.CLOUDFLARE_API_TOKEN || '',
      awsRegion: config.AWS_ACM_REGION || 'us-east-1'
    };
  }

  /**
   * Issue SSL certificate for a domain using configured provider
   * 
   * @param domain Domain name for SSL certificate
   * @param domainId Database ID of the domain record
   * @returns Promise<SSLCertificate> SSL certificate details
   */
  async issueCertificate(domain: string, domainId: string): Promise<SSLCertificate> {
    console.log(`🔒 Issuing SSL certificate for ${domain} using ${this.provider}`);

    switch (this.provider) {
      case 'cloudflare':
        return this.issueCloudflareSSL(domain, domainId);
      case 'aws-acm':
        return this.issueAWSACMSSL(domain, domainId);
      case 'letsencrypt':
      default:
        return this.issueLetsEncryptSSL(domain, domainId);
    }
  }

  /**
   * Issue SSL certificate using Let's Encrypt
   */
  private async issueLetsEncryptSSL(domain: string, domainId: string): Promise<SSLCertificate> {
    try {
      // Import acme-client for Let's Encrypt integration
      const acme = await import('acme-client');
      
      // Create ACME client with production directory URL
      const client = new acme.Client({
        directoryUrl: config.NODE_ENV === 'production' 
          ? acme.directory.letsencrypt.production
          : acme.directory.letsencrypt.staging,
        accountKey: await acme.crypto.createPrivateKey()
      });

      // Create account
      const account = await client.createAccount({
        termsOfServiceAgreed: true,
        contact: [`mailto:admin@${domain}`]
      });

      // Create private key for certificate
      const [certificateKey] = await acme.crypto.createCsr({
        subject: { commonName: domain },
        altNames: [domain]
      });

      // Create certificate order
      const order = await client.createOrder({
        identifiers: [{ type: 'dns', value: domain }]
      });

      // Get authorization challenges
      const authorizations = await client.getAuthorizations(order);
      
      for (const authz of authorizations) {
        // Get HTTP-01 challenge
        const challenge = authz.challenges.find(c => c.type === 'http-01');
        if (!challenge) {
          throw new Error('No HTTP-01 challenge available');
        }

        // Create key authorization
        const keyAuthorization = await client.getChallengeKeyAuthorization(challenge);
        
        // Here you would need to create the challenge response file
        // This is a simplified version - in production you'd need proper challenge handling
        console.log(`Challenge token: ${challenge.token}`);
        console.log(`Key authorization: ${keyAuthorization}`);

        // Complete challenge
        await client.completeChallenge(challenge);
        
        // Wait for validation
        await client.waitForValidStatus(challenge);
      }

      // Finalize order and get certificate
      await client.finalizeOrder(order, certificateKey);
      const certificate = await client.getCertificate(order);

      return {
        certificate: certificate.toString(),
        privateKey: certificateKey.toString(),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        issuer: "Let's Encrypt"
      };

    } catch (error) {
      console.error('Let\'s Encrypt SSL error:', error);
      throw new Error(`Let's Encrypt SSL issuance failed: ${error.message}`);
    }
  }

  /**
   * Issue SSL certificate using Cloudflare SSL
   */
  private async issueCloudflareSSL(domain: string, domainId: string): Promise<SSLCertificate> {
    if (!this.credentials.cloudflareApiToken) {
      throw new Error('Cloudflare API token not configured');
    }

    try {
      // Cloudflare SSL API integration
      const response = await fetch('https://api.cloudflare.com/client/v4/certificates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.cloudflareApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'origin-rsa',
          hostnames: [domain],
          requested_validity: 365
        })
      });

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Cloudflare SSL error: ${data.errors?.[0]?.message || 'Unknown error'}`);
      }

      const cert = data.result;
      return {
        certificate: cert.certificate,
        privateKey: cert.private_key,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        issuer: 'Cloudflare'
      };

    } catch (error) {
      console.error('Cloudflare SSL error:', error);
      throw new Error(`Cloudflare SSL issuance failed: ${error.message}`);
    }
  }

  /**
   * Issue SSL certificate using AWS Certificate Manager
   */
  private async issueAWSACMSSL(domain: string, domainId: string): Promise<SSLCertificate> {
    try {
      // Note: AWS ACM integration would require AWS SDK
      // This is a placeholder for the actual implementation
      console.log(`Requesting AWS ACM certificate for ${domain} in region ${this.credentials.awsRegion}`);
      
      // In a real implementation, you would:
      // 1. Import AWS SDK
      // 2. Create ACM client
      // 3. Request certificate with DNS validation
      // 4. Wait for validation
      // 5. Return certificate details
      
      throw new Error('AWS ACM integration not yet implemented. Please configure Let\'s Encrypt or Cloudflare.');

    } catch (error) {
      console.error('AWS ACM SSL error:', error);
      throw new Error(`AWS ACM SSL issuance failed: ${error.message}`);
    }
  }

  /**
   * Validate SSL certificate
   */
  async validateCertificate(domain: string): Promise<{
    valid: boolean;
    validUntil?: Date;
    issuer?: string;
    error?: string;
  }> {
    try {
      const https = await import('https');
      const options = {
        hostname: domain,
        port: 443,
        method: 'HEAD',
        timeout: 5000,
        rejectUnauthorized: false
      };

      return new Promise((resolve) => {
        const req = https.request(options, (res) => {
          const socket = res.socket as any;
          const cert = socket.getPeerCertificate();
          
          if (cert && cert.valid_to) {
            resolve({
              valid: true,
              validUntil: new Date(cert.valid_to),
              issuer: cert.issuer?.CN || 'Unknown'
            });
          } else {
            resolve({
              valid: false,
              error: 'No valid certificate found'
            });
          }
        });

        req.on('error', (error) => {
          resolve({
            valid: false,
            error: error.message
          });
        });

        req.on('timeout', () => {
          resolve({
            valid: false,
            error: 'Connection timeout'
          });
        });

        req.end();
      });

    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get provider-specific configuration instructions
   */
  getProviderInstructions(): {
    provider: string;
    requirements: string[];
    setupSteps: string[];
  } {
    switch (this.provider) {
      case 'cloudflare':
        return {
          provider: 'Cloudflare SSL',
          requirements: [
            'Cloudflare account',
            'Domain managed by Cloudflare DNS',
            'API Token with SSL and Certificates permissions'
          ],
          setupSteps: [
            'Set CLOUDFLARE_API_TOKEN environment variable',
            'Ensure domain is proxied through Cloudflare',
            'Verify DNS records are managed by Cloudflare'
          ]
        };
      
      case 'aws-acm':
        return {
          provider: 'AWS Certificate Manager',
          requirements: [
            'AWS account with ACM access',
            'Route53 hosted zone for domain',
            'Proper IAM permissions'
          ],
          setupSteps: [
            'Configure AWS credentials',
            'Set AWS_ACM_REGION environment variable',
            'Ensure domain is managed in Route53'
          ]
        };
      
      case 'letsencrypt':
      default:
        return {
          provider: "Let's Encrypt",
          requirements: [
            'HTTP server access for domain validation',
            'Port 80 accessible for challenge verification',
            'Valid domain pointing to server'
          ],
          setupSteps: [
            'Ensure domain resolves to this server',
            'Configure web server for challenge responses',
            'Verify port 80 is accessible'
          ]
        };
    }
  }
}