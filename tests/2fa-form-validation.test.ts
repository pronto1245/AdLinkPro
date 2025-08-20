import { describe, test, expect, beforeEach } from '@jest/globals';
import { twoFactorSchema, TwoFactorFormData } from '../client/src/lib/validation';

describe('2FA Form Validation Integration Test', () => {
  test('should validate successfully when both code and tempToken are present', () => {
    const validData: TwoFactorFormData = {
      code: '123456',
      tempToken: 'valid-temp-token-from-server'
    };

    // This should not throw
    expect(() => twoFactorSchema.parse(validData)).not.toThrow();
    
    const result = twoFactorSchema.parse(validData);
    expect(result.code).toBe('123456');
    expect(result.tempToken).toBe('valid-temp-token-from-server');
  });

  test('should fail validation when tempToken is missing (the bug)', () => {
    const invalidData = {
      code: '123456',
      tempToken: '' // This was the bug - form tempToken was empty
    };

    expect(() => twoFactorSchema.parse(invalidData)).toThrow();
  });

  test('should fail validation when code is invalid', () => {
    const invalidData = {
      code: '12345', // Too short
      tempToken: 'valid-temp-token'
    };

    expect(() => twoFactorSchema.parse(invalidData)).toThrow();
  });

  test('should fail validation when code contains non-digits', () => {
    const invalidData = {
      code: '12345a',
      tempToken: 'valid-temp-token'
    };

    expect(() => twoFactorSchema.parse(invalidData)).toThrow();
  });

  test('should pass validation with various valid 6-digit codes', () => {
    const validCodes = ['000000', '123456', '999999', '007007', '100200'];
    const tempToken = 'server-temp-token-abc123';

    validCodes.forEach(code => {
      const data = { code, tempToken };
      expect(() => twoFactorSchema.parse(data)).not.toThrow();
      
      const result = twoFactorSchema.parse(data);
      expect(result.code).toBe(code);
      expect(result.tempToken).toBe(tempToken);
    });
  });

  test('should simulate the fixed 2FA activation flow', () => {
    // Simulate what happens in the component after the fix
    const serverResponse = {
      requires2FA: true,
      tempToken: 'server-generated-token-xyz789'
    };

    // Simulate the form state (after fix)
    let formData = {
      code: '',
      tempToken: '' // Initially empty
    };

    // Simulate 2FA activation (with the fix)
    formData.tempToken = serverResponse.tempToken; // This is the fix!

    // User enters code
    formData.code = '123456';

    // Validation should now pass
    expect(() => twoFactorSchema.parse(formData)).not.toThrow();
    
    const result = twoFactorSchema.parse(formData);
    expect(result.tempToken).toBe('server-generated-token-xyz789');
    expect(result.code).toBe('123456');
  });
});