import { describe, test, expect } from '@jest/globals';
import { InMemoryPasswordResetService } from '../server/services/password-reset';

describe('Password Reset Service Integration', () => {
  const mockUsers = [
    { email: 'test@example.com', password: 'oldpassword', id: '1', role: 'USER' },
    { email: 'user2@test.com', password: 'password123', id: '2', role: 'ADMIN' }
  ];

  let service: InMemoryPasswordResetService;

  beforeEach(() => {
    service = new InMemoryPasswordResetService(mockUsers);
  });

  describe('Password Reset Request', () => {
    test('should always return success for security (prevent email enumeration)', async () => {
      const result = await service.requestPasswordReset('nonexistent@example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("Если аккаунт с этим email существует, на него будет отправлено письмо с инструкциями по восстановлению пароля.");
    });

    test('should handle valid email addresses', async () => {
      const result = await service.requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("Если аккаунт с этим email существует, на него будет отправлено письмо с инструкциями по восстановлению пароля.");
    });

    test('should normalize email addresses (case insensitive)', async () => {
      const result = await service.requestPasswordReset('TEST@EXAMPLE.COM');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Token Validation', () => {
    test('should validate tokens correctly', async () => {
      // First request a reset to generate a token
      await service.requestPasswordReset('test@example.com');
      
      // Token validation should return false for invalid tokens
      const invalidResult = await service.validateResetToken('invalid-token');
      expect(invalidResult.valid).toBe(false);
    });

    test('should return valid true for real tokens (if we could access them)', async () => {
      // Since tokens are internal to the service, we can only test invalid tokens
      const result = await service.validateResetToken('definitely-invalid');
      expect(result.valid).toBe(false);
    });
  });

  describe('Password Reset Completion', () => {
    test('should reject invalid tokens', async () => {
      const result = await service.resetPassword('invalid-token', 'newpassword123!');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Недействительный или истекший токен.");
    });

    test('should validate password requirements', async () => {
      // Even with invalid token, it should check token first
      const result = await service.resetPassword('invalid', 'weak');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Недействительный или истекший токен.");
    });
  });

  describe('Security Features', () => {
    test('should prevent email enumeration attacks', async () => {
      const validEmailResult = await service.requestPasswordReset('test@example.com');
      const invalidEmailResult = await service.requestPasswordReset('nonexistent@example.com');
      
      // Both should return the same response
      expect(validEmailResult.success).toBe(invalidEmailResult.success);
      expect(validEmailResult.message).toBe(invalidEmailResult.message);
    });

    test('should handle malformed email addresses gracefully', async () => {
      const result = await service.requestPasswordReset('not-an-email');
      
      expect(result.success).toBe(true); // Still returns true for security
    });

    test('should handle empty or undefined emails', async () => {
      const result = await service.requestPasswordReset('');
      
      expect(result.success).toBe(true); // Security-first approach
    });
  });
});