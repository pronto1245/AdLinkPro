/**
 * Registration Form Hook
 * Reusable logic for registration forms
 */

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuthError } from '@/hooks/useAuthError';
import { secureAuth } from '@/lib/secure-api';
import {
  partnerRegistrationSchema,
  advertiserRegistrationSchema,
  PartnerRegistrationFormData,
  AdvertiserRegistrationFormData
} from '@/lib/validation';
import {
  passwordStrength,
  RateLimitTracker,
  CSRFManager,
  sanitizeInput
} from '@/lib/security';

const rateLimitTracker = new RateLimitTracker();
const csrfManager = CSRFManager.getInstance();

export interface UseRegistrationFormOptions {
  role: 'PARTNER' | 'ADVERTISER';
  redirectTo?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

type FormData = PartnerRegistrationFormData | AdvertiserRegistrationFormData;

export function useRegistrationForm(options: UseRegistrationFormOptions) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { handleError, error, clearError, isRateLimited, retryAfter } = useAuthError();

  // Form and UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrengthInfo, setPasswordStrengthInfo] = useState<{
    score: number;
    feedback: string[]
  }>({ score: 0, feedback: [] });

  // Use appropriate schema based on role
  const schema = options.role === 'ADVERTISER' ? advertiserRegistrationSchema : partnerRegistrationSchema;
  const requiresCompany = options.role === 'ADVERTISER';

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      telegram: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company: requiresCompany ? '' : undefined,
      contactType: undefined,
      contact: '',
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    } as FormData,
  });

  // Generate CSRF token on component mount
  useEffect(() => {
    csrfManager.generateToken();
  }, []);

  // Password strength monitoring
  const watchedPassword = form.watch('password');
  useEffect(() => {
    if (watchedPassword) {
      const strength = passwordStrength.calculate(watchedPassword);
      setPasswordStrengthInfo(strength);
    } else {
      setPasswordStrengthInfo({ score: 0, feedback: [] });
    }
  }, [watchedPassword]);

  const handleSubmit = useCallback(async (data: FormData) => {
    const userIdentifier = data.email;

    console.log('[REGISTRATION_FORM] Starting registration for:', userIdentifier, 'Role:', options.role);

    // Check rate limiting
    if (rateLimitTracker.isRateLimited(userIdentifier)) {
      const remaining = rateLimitTracker.getRemainingTime(userIdentifier);
      const minutes = Math.ceil(remaining / 60);

      const errorMessage = `Превышен лимит попыток регистрации. Попробуйте через ${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'}.`;
      handleError(errorMessage, 'Registration rate limit');
      return;
    }

    clearError();
    setLoading(true);

    try {
      // Record the attempt for rate limiting
      rateLimitTracker.recordAttempt(userIdentifier);

      // Prepare registration data with proper sanitization
      const registrationData = {
        name: sanitizeInput.cleanString(data.name),
        email: sanitizeInput.cleanEmail(data.email),
        telegram: sanitizeInput.cleanTelegram(data.telegram),
        password: data.password, // Don't sanitize password
        phone: data.phone ? sanitizeInput.cleanPhone(data.phone) : undefined,
        company: requiresCompany && 'company' in data && data.company ?
          sanitizeInput.cleanString(String(data.company)) : undefined,
        contactType: data.contactType,
        contact: data.contact ? sanitizeInput.cleanString(data.contact) : undefined,
        role: options.role,
        agreeTerms: data.agreeTerms,
        agreePrivacy: data.agreePrivacy,
        agreeMarketing: data.agreeMarketing,
      };

      console.log('[REGISTRATION_FORM] Submitting registration data');
      const result = await secureAuth.register(registrationData, userIdentifier);

      // Reset rate limiting on successful registration
      rateLimitTracker.reset(userIdentifier);

      console.log('[REGISTRATION_FORM] Registration successful:', result);

      toast({
        title: 'Регистрация успешна!',
        description: result.message || 'Ваша заявка отправлена на рассмотрение',
      });

      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      // Handle redirection
      if (options.redirectTo) {
        navigate(options.redirectTo);
      } else {
        // Determine redirect path based on role and result
        const redirectPath = result.user?.role === 'affiliate' || options.role === 'PARTNER'
          ? '/dashboard/partner'
          : '/dashboard/advertiser';

        console.log('[REGISTRATION_FORM] Redirecting to:', redirectPath);

        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      }

    } catch (err) {
      console.error('[REGISTRATION_FORM] Registration error:', err);
      handleError(err, 'Registration');

      if (options.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [options, handleError, clearError, toast, navigate, requiresCompany]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const getPasswordStrengthLabel = useCallback(() => {
    return passwordStrength.getStrengthLabel(passwordStrengthInfo.score);
  }, [passwordStrengthInfo.score]);

  return {
    form,
    loading,
    showPassword,
    showConfirmPassword,
    error,
    isRateLimited,
    retryAfter,
    passwordStrengthInfo,
    handleSubmit: form.handleSubmit(handleSubmit),
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    getPasswordStrengthLabel,
    clearError,
  };
}
