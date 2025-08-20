import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock @sendgrid/mail module
const mockSend = jest.fn() as jest.MockedFunction<any>;
const mockSetApiKey = jest.fn();

jest.mock('@sendgrid/mail', () => ({
  setApiKey: mockSetApiKey,
  send: mockSend,
}));

import { sendEmail } from '../src/services/email';

describe('Email Service', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    
    // Reset mocks
    jest.clearAllMocks();
    mockSend.mockReset();
    mockSetApiKey.mockReset();
    
    // Reset SendGrid initialization state by re-importing
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    it('should skip sending and return skipped=true when SENDGRID_API_KEY is not set', async () => {
      // Ensure no API key is set
      delete process.env.SENDGRID_API_KEY;
      
      // Re-import module to reset initialization state
      const { sendEmail: freshSendEmail } = await import('../src/services/email');
      
      const result = await freshSendEmail(
        'test@example.com',
        'Test Subject',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: true, skipped: true });
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should proceed with sending when SENDGRID_API_KEY is set', async () => {
      // Set API key
      process.env.SENDGRID_API_KEY = 'test-api-key';
      
      // Mock successful send
      mockSend.mockResolvedValueOnce([] as any);

      // Re-import module to reset initialization state
      const { sendEmail: freshSendEmail } = await import('../src/services/email');

      const result = await freshSendEmail(
        'test@example.com',
        'Test Subject',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: true });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('Parameter Validation', () => {
    beforeEach(() => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      mockSend.mockResolvedValue([] as any);
    });

    it('should return ok=false when to parameter is missing', async () => {
      const { sendEmail: freshSendEmail } = await import('../src/services/email');
      
      const result = await freshSendEmail(
        '',
        'Test Subject',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: false });
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should return ok=false when subject parameter is missing', async () => {
      const { sendEmail: freshSendEmail } = await import('../src/services/email');
      
      const result = await freshSendEmail(
        'test@example.com',
        '',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: false });
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should return ok=false when html parameter is missing', async () => {
      const { sendEmail: freshSendEmail } = await import('../src/services/email');
      
      const result = await freshSendEmail(
        'test@example.com',
        'Test Subject',
        ''
      );

      expect(result).toEqual({ ok: false });
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe('Email Sending', () => {
    beforeEach(() => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
    });

    it('should send email with correct parameters', async () => {
      mockSend.mockResolvedValueOnce([] as any);
      
      const { sendEmail: freshSendEmail } = await import('../src/services/email');

      const result = await freshSendEmail(
        'test@example.com',
        'Test Subject',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: true });
      expect(mockSend).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'noreply@platform.com', // default value
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
      });
    });

    it('should use FROM_EMAIL environment variable when set', async () => {
      process.env.FROM_EMAIL = 'custom@example.com';
      mockSend.mockResolvedValueOnce([] as any);
      
      const { sendEmail: freshSendEmail } = await import('../src/services/email');

      const result = await freshSendEmail(
        'test@example.com',
        'Test Subject',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: true });
      expect(mockSend).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'custom@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
      });
    });

    it('should return ok=false when SendGrid throws an error', async () => {
      mockSend.mockRejectedValueOnce(new Error('SendGrid API Error') as any);
      
      const { sendEmail: freshSendEmail } = await import('../src/services/email');

      const result = await freshSendEmail(
        'test@example.com',
        'Test Subject',
        '<h1>Test HTML</h1>'
      );

      expect(result).toEqual({ ok: false });
    });
  });

  describe('Initialization', () => {
    it('should initialize SendGrid only once', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      mockSend.mockResolvedValue([] as any);
      
      const { sendEmail: freshSendEmail } = await import('../src/services/email');

      // Send multiple emails
      await freshSendEmail('test1@example.com', 'Subject 1', '<h1>HTML 1</h1>');
      await freshSendEmail('test2@example.com', 'Subject 2', '<h1>HTML 2</h1>');

      // SendGrid should be initialized only once
      expect(mockSetApiKey).toHaveBeenCalledTimes(1);
      expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
      
      // But send should be called twice
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });
});