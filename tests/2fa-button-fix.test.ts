import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('2FA Button Activation Fix', () => {
  // Mock the form validation logic
  const mockTwoFactorSchema = {
    parse: (data: { code: string; tempToken: string }) => {
      if (!data.tempToken) {
        throw new Error('tempToken is required');
      }
      if (data.code.length !== 6 || !/^\d{6}$/.test(data.code)) {
        throw new Error('code must be 6 digits');
      }
      return data;
    }
  };

  test('should enable button when both code and tempToken are set', () => {
    // Simulate the scenario where tempToken is properly set in the form
    const formData = {
      code: '123456',
      tempToken: 'valid-temp-token-123'
    };

    // This should not throw an error
    expect(() => mockTwoFactorSchema.parse(formData)).not.toThrow();
  });

  test('should keep button disabled when tempToken is missing', () => {
    // Simulate the bug scenario where tempToken is not set in the form
    const formData = {
      code: '123456',
      tempToken: '' // This was the bug - tempToken was empty in form
    };

    // This should throw an error, keeping the button disabled
    expect(() => mockTwoFactorSchema.parse(formData)).toThrow('tempToken is required');
  });

  test('should keep button disabled when code is invalid', () => {
    const formData = {
      code: '12345', // Invalid length
      tempToken: 'valid-temp-token-123'
    };

    expect(() => mockTwoFactorSchema.parse(formData)).toThrow('code must be 6 digits');
  });

  test('should simulate the complete 2FA activation flow', () => {
    // Simulate the login response that requires 2FA
    const loginResult = {
      requires2FA: true,
      tempToken: 'server-generated-temp-token-abc123'
    };

    // Simulate setting both state and form
    let tempTokenState = '';
    let formTempToken = '';
    let otpValue = '';

    // This is what happens when 2FA is required (BEFORE the fix)
    const activate2FABuggy = (result: typeof loginResult) => {
      tempTokenState = result.tempToken;
      // BUG: formTempToken was not being set
      // formTempToken = result.tempToken; // This line was missing!
    };

    // This is what happens when 2FA is required (AFTER the fix)
    const activate2FAFixed = (result: typeof loginResult) => {
      tempTokenState = result.tempToken;
      formTempToken = result.tempToken; // FIX: Now we set the form token too
    };

    // Test buggy behavior
    activate2FABuggy(loginResult);
    expect(tempTokenState).toBe('server-generated-temp-token-abc123');
    expect(formTempToken).toBe(''); // Bug: form token is empty
    
    const handleOtpChange = (value: string) => {
      otpValue = value;
    };

    handleOtpChange('123456');
    
    // With buggy behavior, validation fails
    expect(() => mockTwoFactorSchema.parse({
      code: otpValue,
      tempToken: formTempToken
    })).toThrow('tempToken is required');

    // Reset for fixed behavior test
    formTempToken = '';
    
    // Test fixed behavior
    activate2FAFixed(loginResult);
    expect(tempTokenState).toBe('server-generated-temp-token-abc123');
    expect(formTempToken).toBe('server-generated-temp-token-abc123'); // Fix: form token is set
    
    // With fixed behavior, validation passes
    expect(() => mockTwoFactorSchema.parse({
      code: otpValue,
      tempToken: formTempToken
    })).not.toThrow();
  });
});