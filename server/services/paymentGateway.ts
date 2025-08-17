import { z } from "zod";
import crypto from "crypto";

// Types
export interface PaymentGatewayConfig {
  gatewayType: 'stripe' | 'coinbase' | 'binance' | 'manual';
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  configuration?: Record<string, any>;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  walletAddress?: string;
  bankDetails?: Record<string, any>;
  recipient: {
    email: string;
    name: string;
  };
}

export interface PayoutResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  fee?: number;
  actualAmount?: number;
  status: 'pending' | 'completed' | 'failed';
}

// Base payment gateway interface
export abstract class PaymentGateway {
  protected config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  abstract validateConfig(): boolean;
  abstract processPayout(request: PayoutRequest): Promise<PayoutResult>;
  abstract getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed'>;
  abstract getSupportedCurrencies(): string[];
  abstract validateWalletAddress(address: string, currency: string): boolean;
}

// Stripe implementation for fiat payments
export class StripeGateway extends PaymentGateway {
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }

  async processPayout(request: PayoutRequest): Promise<PayoutResult> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid Stripe configuration");
      }

      // Simulate Stripe payout API call
      // In a real implementation, use the official Stripe SDK
      const mockResult = {
        success: true,
        transactionId: `stripe_${Date.now()}`,
        status: 'pending' as const,
        fee: request.amount * 0.025, // 2.5% fee
        actualAmount: request.amount - (request.amount * 0.025)
      };

      console.log(`Stripe payout initiated: ${request.amount} ${request.currency} to ${request.recipient.email}`);
      return mockResult;

    } catch (error) {
      console.error("Stripe payout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 'failed'
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed'> {
    // Simulate status check
    return 'completed';
  }

  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  }

  validateWalletAddress(address: string, currency: string): boolean {
    // For Stripe, we don't validate wallet addresses as it uses bank accounts/cards
    return true;
  }
}

// Coinbase implementation for crypto payments
export class CoinbaseGateway extends PaymentGateway {
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }

  async processPayout(request: PayoutRequest): Promise<PayoutResult> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid Coinbase configuration");
      }

      if (!request.walletAddress) {
        throw new Error("Wallet address required for crypto payout");
      }

      if (!this.validateWalletAddress(request.walletAddress, request.currency)) {
        throw new Error("Invalid wallet address");
      }

      // Simulate Coinbase Commerce API call
      const mockResult = {
        success: true,
        transactionId: `coinbase_${Date.now()}`,
        status: 'pending' as const,
        fee: this.calculateCryptoFee(request.amount, request.currency),
        actualAmount: request.amount - this.calculateCryptoFee(request.amount, request.currency)
      };

      console.log(`Coinbase payout initiated: ${request.amount} ${request.currency} to ${request.walletAddress}`);
      return mockResult;

    } catch (error) {
      console.error("Coinbase payout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 'failed'
      };
    }
  }

  private calculateCryptoFee(amount: number, currency: string): number {
    // Different fees for different crypto currencies
    switch (currency) {
      case 'BTC':
        return Math.max(0.0005, amount * 0.01); // Min 0.0005 BTC or 1%
      case 'ETH':
        return Math.max(0.005, amount * 0.015); // Min 0.005 ETH or 1.5%
      case 'USDT':
      case 'USDC':
        return Math.max(1, amount * 0.01); // Min $1 or 1%
      default:
        return amount * 0.02; // 2% default
    }
  }

  async getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed'> {
    // Simulate status check
    return 'completed';
  }

  getSupportedCurrencies(): string[] {
    return ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BCH'];
  }

  validateWalletAddress(address: string, currency: string): boolean {
    if (!address) return false;
    
    switch (currency) {
      case 'BTC':
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
      case 'ETH':
      case 'USDT':
      case 'USDC':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'LTC':
        return /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address);
      default:
        return true;
    }
  }
}

// Binance implementation for crypto payments
export class BinanceGateway extends PaymentGateway {
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }

  async processPayout(request: PayoutRequest): Promise<PayoutResult> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid Binance configuration");
      }

      if (!request.walletAddress) {
        throw new Error("Wallet address required for crypto payout");
      }

      // Simulate Binance API call
      const mockResult = {
        success: true,
        transactionId: `binance_${Date.now()}`,
        status: 'pending' as const,
        fee: this.calculateBinanceFee(request.amount, request.currency),
        actualAmount: request.amount - this.calculateBinanceFee(request.amount, request.currency)
      };

      console.log(`Binance payout initiated: ${request.amount} ${request.currency} to ${request.walletAddress}`);
      return mockResult;

    } catch (error) {
      console.error("Binance payout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 'failed'
      };
    }
  }

  private calculateBinanceFee(amount: number, currency: string): number {
    // Binance withdrawal fees (simplified)
    switch (currency) {
      case 'BTC':
        return 0.0004;
      case 'ETH':
        return 0.003;
      case 'USDT':
        return 1; // USDT TRC20
      case 'USDC':
        return 0.8;
      default:
        return amount * 0.001; // 0.1% default
    }
  }

  async getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed'> {
    // Simulate status check
    return 'completed';
  }

  getSupportedCurrencies(): string[] {
    return ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'TRX'];
  }

  validateWalletAddress(address: string, currency: string): boolean {
    if (!address) return false;
    
    switch (currency) {
      case 'BTC':
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
      case 'ETH':
      case 'USDT':
      case 'USDC':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'TRX':
        return /^T[A-Za-z1-9]{33}$/.test(address);
      default:
        return true;
    }
  }
}

// Manual gateway for manual processing
export class ManualGateway extends PaymentGateway {
  validateConfig(): boolean {
    return true; // No specific config needed for manual processing
  }

  async processPayout(request: PayoutRequest): Promise<PayoutResult> {
    // Manual processing - always returns pending status
    return {
      success: true,
      transactionId: `manual_${Date.now()}`,
      status: 'pending',
      fee: 0,
      actualAmount: request.amount
    };
  }

  async getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed'> {
    // Manual transactions remain pending until manually updated
    return 'pending';
  }

  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'BTC', 'ETH', 'USDT', 'USDC', 'TRX', 'LTC', 'BCH'];
  }

  validateWalletAddress(address: string, currency: string): boolean {
    // Basic validation for manual processing
    return !!address && address.length > 10;
  }
}

// Gateway factory
export class PaymentGatewayFactory {
  static create(config: PaymentGatewayConfig): PaymentGateway {
    switch (config.gatewayType) {
      case 'stripe':
        return new StripeGateway(config);
      case 'coinbase':
        return new CoinbaseGateway(config);
      case 'binance':
        return new BinanceGateway(config);
      case 'manual':
        return new ManualGateway(config);
      default:
        throw new Error(`Unsupported gateway type: ${config.gatewayType}`);
    }
  }
}

// Encryption utility for sensitive data
export class EncryptionService {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly key = crypto.scryptSync(process.env.JWT_SECRET || 'default-key', 'salt', 32);

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Payout service orchestrator
export class PayoutService {
  static async processPayoutRequest(
    payoutRequestId: string,
    gatewayConfig: PaymentGatewayConfig,
    request: PayoutRequest
  ): Promise<PayoutResult> {
    try {
      const gateway = PaymentGatewayFactory.create(gatewayConfig);
      
      if (!gateway.validateConfig()) {
        throw new Error("Invalid gateway configuration");
      }

      // Check if currency is supported
      const supportedCurrencies = gateway.getSupportedCurrencies();
      if (!supportedCurrencies.includes(request.currency)) {
        throw new Error(`Currency ${request.currency} not supported by ${gatewayConfig.gatewayType}`);
      }

      // Validate wallet address for crypto payments
      if (request.walletAddress && request.currency !== 'USD') {
        if (!gateway.validateWalletAddress(request.walletAddress, request.currency)) {
          throw new Error("Invalid wallet address");
        }
      }

      return await gateway.processPayout(request);

    } catch (error) {
      console.error(`Payout processing error for request ${payoutRequestId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 'failed'
      };
    }
  }
}

export default PayoutService;