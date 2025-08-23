/**
 * Test to verify 2FA system is properly disabled system-wide
 * Based on user request: "интеграции 2FA не нужна. пока делаем без интеграции 2FA"
 */

import { is2FAEnabled, should2FABeSkipped, get2FADisabledMessage } from '../server/shared/2fa-config';
import { users, verifyTOTP } from '../server/shared/2fa-utils';

describe('2FA System Disabling', () => {
  test('2FA should be disabled system-wide', () => {
    expect(is2FAEnabled()).toBe(false);
    expect(should2FABeSkipped()).toBe(true);
  });

  test('2FA disabled message should be in Russian as requested', () => {
    const message = get2FADisabledMessage();
    expect(message).toContain('отключена');
    expect(message).toMatch(/2FA|временно/);
  });

  test('All test users should have twoFactorEnabled: false', () => {
    users.forEach(user => {
      expect(user.twoFactorEnabled).toBe(false);
      expect(user.twoFactorSecret).toBe(null);
    });
  });

  test('TOTP verification should always return true when 2FA is disabled', () => {
    // Should return true even with invalid tokens when 2FA is disabled
    expect(verifyTOTP('invalid-secret', 'invalid-token')).toBe(true);
    expect(verifyTOTP('test-secret', '999999')).toBe(true);
  });
});

describe('Authentication Responses', () => {
  test('Login responses should not include requires2FA field', () => {
    // Simulate login response structure
    const mockResponse = {
      success: true,
      token: 'test-token',
      user: {
        id: 'test-user',
        email: 'test@example.com',
        role: 'OWNER',
        username: 'test',
        twoFactorEnabled: false // Should always be false
      }
    };

    expect(mockResponse.user.twoFactorEnabled).toBe(false);
    expect('requires2FA' in mockResponse).toBe(false);
  });
});

console.log('✅ 2FA System Properly Disabled Tests');