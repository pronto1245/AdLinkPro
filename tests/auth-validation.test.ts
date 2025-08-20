import { describe, test, expect } from '@jest/globals';
import { 
  passwordSchema, 
  emailSchema, 
  nameSchema, 
  loginSchema, 
  registrationSchema,
  twoFactorSchema 
} from '../client/src/lib/validation';

describe('Security Validation Schemas', () => {
  describe('passwordSchema', () => {
    test('should accept strong passwords', () => {
      const strongPasswords = [
        'MyStr0ng!Password',
        'C0mpl3x#Pass123',
        'Secure$2024!',
      ];

      strongPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'weak',           // Too short
        'PASSWORD',       // No lowercase, digits, or special chars
        'password',       // No uppercase, digits, or special chars
        '12345678',       // No letters or special chars
        'Password123',    // No special chars
      ];

      weakPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    test('should enforce minimum length', () => {
      expect(() => passwordSchema.parse('Sh0rt!')).toThrow();
    });
  });

  describe('emailSchema', () => {
    test('should accept valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'name+tag@company.org',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    test('should reject malicious emails', () => {
      const maliciousEmails = [
        'user<script>@example.com',
        'user>evil@example.com',
        'user"quote@example.com',
      ];

      maliciousEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user..double@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('nameSchema', () => {
    test('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Mary O\'Connor',
        'Иван Петров',
        'Jean-Luc'
      ];

      validNames.forEach(name => {
        expect(() => nameSchema.parse(name)).not.toThrow();
      });
    });

    test('should reject invalid names', () => {
      const invalidNames = [
        '', // Empty
        'A', // Too short
        'John123', // Numbers not allowed
        'John@Doe', // Special chars not allowed
        'John<script>alert()</script>', // XSS attempt
        'A'.repeat(101), // Too long
      ];

      invalidNames.forEach(name => {
        expect(() => nameSchema.parse(name)).toThrow();
      });
    });

    test('should reject names with only whitespace', () => {
      const whitespaceNames = ['  ', '\t\t', '\n\n'];
      
      whitespaceNames.forEach(name => {
        expect(() => nameSchema.parse(name)).toThrow();
      });
    });
  });

  describe('loginSchema', () => {
    test('should accept valid login data', () => {
      const validLoginData = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
        rememberMe: true,
      };

      expect(() => loginSchema.parse(validLoginData)).not.toThrow();
    });

    test('should reject invalid login data', () => {
      const invalidLoginData = {
        email: 'invalid-email',
        password: '',
      };

      expect(() => loginSchema.parse(invalidLoginData)).toThrow();
    });
  });

  describe('registrationSchema', () => {
    test('should accept valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@company.com',
        telegram: '@johndoe',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '+1234567890',
        company: 'Test Company LLC',
        contactType: 'email' as const,
        contact: 'john@company.com',
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: false,
      };

      expect(() => registrationSchema.parse(validData)).not.toThrow();
    });

    test('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@company.com',
        telegram: '@johndoe',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass123!',
        agreeTerms: true,
        agreePrivacy: true,
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    test('should require terms agreement', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@company.com',
        telegram: '@johndoe',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        agreeTerms: false, // Required
        agreePrivacy: true,
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });
  });

  describe('twoFactorSchema', () => {
    test('should accept valid 2FA data', () => {
      const validData = {
        code: '123456',
        tempToken: 'temp-token-123',
      };

      expect(() => twoFactorSchema.parse(validData)).not.toThrow();
    });

    test('should reject invalid 2FA codes', () => {
      const invalidCodes = [
        '12345',    // Too short
        '1234567',  // Too long
        'abcdef',   // Not digits
        '12-34-56', // Invalid format
      ];

      invalidCodes.forEach(code => {
        const data = {
          code,
          tempToken: 'temp-token-123',
        };
        expect(() => twoFactorSchema.parse(data)).toThrow();
      });
    });
  });
});