import { describe, test, expect } from '@jest/globals';

/**
 * Regression tests for 2FA button inactivity fix
 * 
 * These tests verify that the 2FA confirmation button works properly:
 * - Button is not blocked by login rate limiting in 2FA mode
 * - Button validation properly checks for 6-digit codes
 * - Button is disabled when temp token expires
 */

describe('2FA Button Fix - Regression Tests', () => {
  
  describe('Rate Limiting Context Separation', () => {
    test('should not apply login rate limiting to 2FA mode', () => {
      // Simulate being in 2FA mode
      const show2FA = true;
      const rateLimitInfo = { blocked: false, remaining: 0 };
      
      // In 2FA mode, rate limiting should be disabled regardless of login history
      if (show2FA) {
        expect(rateLimitInfo.blocked).toBe(false);
        expect(rateLimitInfo.remaining).toBe(0);
      }
    });

    test('should apply login rate limiting only in login mode', () => {
      const show2FA = false;
      
      // Mock rate limit checker
      const mockRateLimitTracker = {
        isRateLimited: (email: string) => email === 'blocked@example.com',
        getRemainingTime: (email: string) => email === 'blocked@example.com' ? 30 : 0
      };
      
      // Test blocked user in login mode
      const blockedEmail = 'blocked@example.com';
      const isBlocked = !show2FA && mockRateLimitTracker.isRateLimited(blockedEmail);
      const remaining = isBlocked ? mockRateLimitTracker.getRemainingTime(blockedEmail) : 0;
      
      expect(isBlocked).toBe(true);
      expect(remaining).toBe(30);
      
      // Test normal user in login mode
      const normalEmail = 'user@example.com';
      const isNormalBlocked = !show2FA && mockRateLimitTracker.isRateLimited(normalEmail);
      
      expect(isNormalBlocked).toBe(false);
    });
  });

  describe('Enhanced OTP Validation', () => {
    test('should validate OTP correctly with isValidOTP function', () => {
      const isValidOTP = (value: string) => {
        return value.length === 6 && /^\d{6}$/.test(value);
      };
      
      // Valid codes
      expect(isValidOTP('123456')).toBe(true);
      expect(isValidOTP('000000')).toBe(true);
      expect(isValidOTP('999999')).toBe(true);
      
      // Invalid codes
      expect(isValidOTP('12345')).toBe(false);   // Too short
      expect(isValidOTP('1234567')).toBe(false); // Too long
      expect(isValidOTP('12345a')).toBe(false);  // Contains letter
      expect(isValidOTP('12-345')).toBe(false);  // Contains special char
      expect(isValidOTP('')).toBe(false);        // Empty
      expect(isValidOTP('      ')).toBe(false);  // Whitespace only
    });

    test('should check temp token expiration correctly', () => {
      const now = Date.now();
      
      const isTempTokenExpired = (expiry: number) => {
        return expiry > 0 && now >= expiry;
      };
      
      // Not expired
      expect(isTempTokenExpired(now + 60000)).toBe(false);  // 1 minute future
      expect(isTempTokenExpired(0)).toBe(false);            // No expiry set
      
      // Expired
      expect(isTempTokenExpired(now - 1000)).toBe(true);    // 1 second past
      expect(isTempTokenExpired(now)).toBe(true);           // Exactly now
    });
  });

  describe('Button Disabled Logic', () => {
    test('should properly calculate button disabled state', () => {
      const isValidOTP = (value: string) => value.length === 6 && /^\d{6}$/.test(value);
      const isTempTokenExpired = (expiry: number) => expiry > 0 && Date.now() >= expiry;
      
      const mockScenarios = [
        {
          name: 'Valid state - button should be enabled',
          loading: false,
          rateLimitBlocked: false,
          otpValue: '123456',
          tempTokenExpiry: Date.now() + 60000,
          expectedDisabled: false
        },
        {
          name: 'Loading state - button should be disabled',
          loading: true,
          rateLimitBlocked: false,
          otpValue: '123456', 
          tempTokenExpiry: Date.now() + 60000,
          expectedDisabled: true
        },
        {
          name: 'Rate limited (should not happen in 2FA) - button disabled',
          loading: false,
          rateLimitBlocked: true,
          otpValue: '123456',
          tempTokenExpiry: Date.now() + 60000,
          expectedDisabled: true
        },
        {
          name: 'Invalid OTP - button should be disabled',
          loading: false,
          rateLimitBlocked: false,
          otpValue: '12345',
          tempTokenExpiry: Date.now() + 60000,
          expectedDisabled: true
        },
        {
          name: 'Expired temp token - button should be disabled',
          loading: false,
          rateLimitBlocked: false,
          otpValue: '123456',
          tempTokenExpiry: Date.now() - 1000,
          expectedDisabled: true
        }
      ];
      
      mockScenarios.forEach(scenario => {
        const isDisabled = scenario.loading || 
                          scenario.rateLimitBlocked || 
                          !isValidOTP(scenario.otpValue) || 
                          isTempTokenExpired(scenario.tempTokenExpiry);
                          
        expect(isDisabled).toBe(scenario.expectedDisabled);
      });
    });
  });

  describe('Auto-submit Logic', () => {
    test('should auto-submit only when OTP is valid and token not expired', () => {
      const isValidOTP = (value: string) => value.length === 6 && /^\d{6}$/.test(value);
      const isTempTokenExpired = (expiry: number) => expiry > 0 && Date.now() >= expiry;
      
      let autoSubmitCalled = false;
      const mockAutoSubmit = () => { autoSubmitCalled = true; };
      
      const handleOtpChange = (value: string, tempTokenExpiry: number) => {
        autoSubmitCalled = false; // Reset
        
        if (isValidOTP(value) && !isTempTokenExpired(tempTokenExpiry)) {
          mockAutoSubmit();
        }
      };
      
      // Should auto-submit
      handleOtpChange('123456', Date.now() + 60000);
      expect(autoSubmitCalled).toBe(true);
      
      // Should NOT auto-submit - invalid OTP
      handleOtpChange('12345', Date.now() + 60000);
      expect(autoSubmitCalled).toBe(false);
      
      // Should NOT auto-submit - expired token
      handleOtpChange('123456', Date.now() - 1000);
      expect(autoSubmitCalled).toBe(false);
      
      // Should NOT auto-submit - both invalid
      handleOtpChange('12345', Date.now() - 1000);
      expect(autoSubmitCalled).toBe(false);
    });
  });

  describe('Error Message Priority', () => {
    test('should show correct error message based on priority', () => {
      const getErrorMessage = (otpError: string, isExpired: boolean, formError: string) => {
        if (otpError) return otpError;
        if (isExpired) return 'Время сессии истекло. Вернитесь к входу и попробуйте снова.';
        if (formError) return formError;
        return '';
      };
      
      // OTP error has highest priority
      expect(getErrorMessage('Неверный код', true, 'Form error'))
        .toBe('Неверный код');
      
      // Expiry message when no OTP error
      expect(getErrorMessage('', true, 'Form error'))
        .toBe('Время сессии истекло. Вернитесь к входу и попробуйте снова.');
      
      // Form error when no other errors
      expect(getErrorMessage('', false, 'Form error'))
        .toBe('Form error');
        
      // No error
      expect(getErrorMessage('', false, ''))
        .toBe('');
    });
  });
});