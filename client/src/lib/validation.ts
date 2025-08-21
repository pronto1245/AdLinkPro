import { z } from 'zod';

// Password validation schema with security requirements
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать цифру')
  .regex(/[^A-Za-z0-9]/, 'Пароль должен содержать специальный символ');

// Email validation schema
export const emailSchema = z
  .string()
  .email('Неверный формат email')
  .max(255, 'Email слишком длинный')
  .refine(
    (email) => !email.includes('<') && !email.includes('>') && !email.includes('"'),
    'Email содержит недопустимые символы'
  );

// Telegram validation schema  
export const telegramSchema = z
  .string()
  .min(5, 'Telegram должен содержать минимум 5 символов')
  .max(32, 'Telegram слишком длинный')
  .regex(/^@?[a-zA-Z0-9_]{5,32}$/, 'Telegram должен начинаться с @ и содержать только буквы, цифры и подчеркивания')
  .transform((val) => val.startsWith('@') ? val : `@${val}`);

// Phone validation schema
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Неверный формат номера телефона')
  .optional();

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя слишком длинное')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s-']+$/, 'Имя может содержать только буквы, пробелы, дефисы и апострофы')
  .refine(
    (name) => name.trim().length >= 2,
    'Имя не может состоять только из пробелов'
  );

// Company name validation
export const companySchema = z
  .string()
  .min(2, 'Название компании должно содержать минимум 2 символа')
  .max(200, 'Название компании слишком длинное')
  .refine(
    (company) => company.trim().length >= 2,
    'Название компании не может состоять только из пробелов'
  );

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

// Registration form validation schema (base - without refinements)
const baseRegistrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  telegram: telegramSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  contactType: z.enum(['email', 'phone', 'telegram'], {
    errorMap: () => ({ message: 'Выберите тип контакта' })
  }).optional(),
  contact: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, 'Необходимо согласиться с условиями использования'),
  agreePrivacy: z.boolean().refine(val => val === true, 'Необходимо согласиться с политикой конфиденциальности'),
  agreeMarketing: z.boolean().optional(),
});

// Shared refinement functions
const passwordMatchRefinement = (data: any) => data.password === data.confirmPassword;
const contactRefinement = (data: any) => {
  if (data.contactType && !data.contact) {
    return false;
  }
  if (data.contact && !data.contactType) {
    return false;
  }
  return true;
};

// Advertiser registration schema (company required)
export const advertiserRegistrationSchema = baseRegistrationSchema.extend({
  company: companySchema,
}).refine(
  passwordMatchRefinement,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
).refine(
  contactRefinement,
  {
    message: 'Укажите тип контакта и контактные данные',
    path: ['contact'],
  }
);

// Partner registration schema (no company)
export const partnerRegistrationSchema = baseRegistrationSchema.extend({
  company: z.string().optional(),
}).refine(
  passwordMatchRefinement,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
).refine(
  contactRefinement,
  {
    message: 'Укажите тип контакта и контактные данные',
    path: ['contact'],
  }
);

// Generic registration schema for compatibility
export const registrationSchema = baseRegistrationSchema.extend({
  company: companySchema.optional(),
}).refine(
  passwordMatchRefinement,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
).refine(
  contactRefinement,
  {
    message: 'Укажите тип контакта и контактные данные',
    path: ['contact'],
  }
);

// 2FA code validation schema
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, '2FA код должен содержать 6 цифр')
    .regex(/^\d{6}$/, '2FA код должен содержать только цифры'),
  token: z.string().min(1, 'Временный токен отсутствует'),
});

// Password reset validation schema
export const resetPasswordSchema = z.object({
  email: emailSchema
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type AdvertiserRegistrationFormData = z.infer<typeof advertiserRegistrationSchema>;
export type PartnerRegistrationFormData = z.infer<typeof partnerRegistrationSchema>;
export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;