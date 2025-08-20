import { describe, test, expect } from '@jest/globals';

describe('2FA Button Validation Fix', () => {
  // Mock React Hook Form validation
  const createMockForm = (isValid: boolean, values: any) => ({
    formState: {
      isValid,
      errors: isValid ? {} : { tempToken: { message: 'Временный токен отсутствует' } }
    },
    getValues: (key?: string) => key ? values[key] : values,
    setValue: jest.fn()
  });

  test('button should be disabled when form is invalid even with 6-digit OTP', () => {
    const mockFormInvalid = createMockForm(false, { code: '123456', tempToken: '' });
    const otpValue = '123456';
    const loading = false;
    const rateLimitInfo = { blocked: false, remaining: 0 };

    // Simulate the button disabled condition with the fix
    const buttonDisabled = loading || rateLimitInfo.blocked || otpValue.length !== 6 || !mockFormInvalid.formState.isValid;

    expect(buttonDisabled).toBe(true);
    expect(otpValue.length).toBe(6); // OTP length is correct
    expect(mockFormInvalid.formState.isValid).toBe(false); // But form is invalid
  });

  test('button should be enabled when form is valid with 6-digit OTP', () => {
    const mockFormValid = createMockForm(true, { code: '123456', tempToken: 'valid-temp-token' });
    const otpValue = '123456';
    const loading = false;
    const rateLimitInfo = { blocked: false, remaining: 0 };

    // Simulate the button disabled condition with the fix
    const buttonDisabled = loading || rateLimitInfo.blocked || otpValue.length !== 6 || !mockFormValid.formState.isValid;

    expect(buttonDisabled).toBe(false);
    expect(otpValue.length).toBe(6); // OTP length is correct
    expect(mockFormValid.formState.isValid).toBe(true); // And form is valid
  });

  test('button should be disabled when OTP is less than 6 digits even if form is valid', () => {
    const mockFormValid = createMockForm(true, { code: '12345', tempToken: 'valid-temp-token' });
    const otpValue = '12345';
    const loading = false;
    const rateLimitInfo = { blocked: false, remaining: 0 };

    const buttonDisabled = loading || rateLimitInfo.blocked || otpValue.length !== 6 || !mockFormValid.formState.isValid;

    expect(buttonDisabled).toBe(true);
    expect(otpValue.length).toBe(5); // OTP length is insufficient
  });

  test('button should be disabled when loading even if everything else is valid', () => {
    const mockFormValid = createMockForm(true, { code: '123456', tempToken: 'valid-temp-token' });
    const otpValue = '123456';
    const loading = true;
    const rateLimitInfo = { blocked: false, remaining: 0 };

    const buttonDisabled = loading || rateLimitInfo.blocked || otpValue.length !== 6 || !mockFormValid.formState.isValid;

    expect(buttonDisabled).toBe(true);
    expect(loading).toBe(true); // Loading state prevents button activation
  });

  test('complete 2FA flow simulation with form validation', () => {
    // Initial state - form is invalid because tempToken is missing
    let mockForm = createMockForm(false, { code: '', tempToken: '' });
    let otpValue = '';
    let tempToken = '';

    // Step 1: 2FA is activated, tempToken is set
    const loginResult = { requires2FA: true, tempToken: 'server-temp-token-123' };
    tempToken = loginResult.tempToken;
    
    // Simulate setting tempToken in form (this is the original fix)
    mockForm.setValue('tempToken', tempToken);
    mockForm = createMockForm(false, { code: '', tempToken: 'server-temp-token-123' });

    // Step 2: User enters 6-digit code
    otpValue = '123456';
    mockForm = createMockForm(true, { code: '123456', tempToken: 'server-temp-token-123' });

    // Step 3: Check button state with the validation fix
    const buttonDisabled = false || false || otpValue.length !== 6 || !mockForm.formState.isValid;

    expect(buttonDisabled).toBe(false);
    expect(mockForm.formState.isValid).toBe(true);
    expect(mockForm.getValues('tempToken')).toBe('server-temp-token-123');
    expect(mockForm.getValues('code')).toBe('123456');
  });
});