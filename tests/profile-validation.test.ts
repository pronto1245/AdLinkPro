import { profileSchema, passwordChangeSchema, webhookSchema } from '../client/src/schemas/profile-validation';
import { validateFormData } from '../client/src/utils/form-validation';

describe('Profile Validation Tests', () => {
  test('should validate correct profile data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Test Company',
      country: 'US',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      settings: {
        brandName: 'Test Brand'
      }
    };

    expect(() => profileSchema.parse(validData)).not.toThrow();
  });

  test('should reject invalid email format', () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      company: 'Test Company',
      country: 'US',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD'
    };

    expect(() => profileSchema.parse(invalidData)).toThrow();
  });

  test('should validate password change data', () => {
    const validPasswordData = {
      current: 'oldpassword',
      new: 'newpassword123',
      confirm: 'newpassword123'
    };

    expect(() => passwordChangeSchema.parse(validPasswordData)).not.toThrow();
  });

  test('should reject mismatched passwords', () => {
    const invalidPasswordData = {
      current: 'oldpassword',
      new: 'newpassword123',
      confirm: 'differentpassword'
    };

    expect(() => passwordChangeSchema.parse(invalidPasswordData)).toThrow();
  });

  test('should validate webhook settings', () => {
    const validWebhookData = {
      defaultUrl: 'https://example.com/webhook',
      ipWhitelist: ['192.168.1.1'],
      enabled: true
    };

    expect(() => webhookSchema.parse(validWebhookData)).not.toThrow();
  });

  test('validateFormData should return data on success', () => {
    const validData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', company: 'Test', country: 'US', language: 'en', timezone: 'UTC', currency: 'USD' };
    const mockOnError = jest.fn();
    
    const result = validateFormData(profileSchema, validData, mockOnError);
    
    expect(result).not.toBeNull();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  test('validateFormData should return null and call onError on validation failure', () => {
    const invalidData = { email: 'invalid' };
    const mockOnError = jest.fn();
    
    const result = validateFormData(profileSchema, invalidData, mockOnError);
    
    expect(result).toBeNull();
    expect(mockOnError).toHaveBeenCalled();
  });
});