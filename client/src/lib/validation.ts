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

// Username validation schema  
export const usernameSchema = z
  .string()
  .min(3, 'Имя пользователя должно содержать минимум 3 символа')
  .max(30, 'Имя пользователя слишком длинное')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания')
  .refine(
    (username) => !['admin', 'root', 'system', 'api', 'www'].includes(username.toLowerCase()),
    'Это имя пользователя зарезервировано'
  );

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
  )
  .optional();

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

// Registration form validation schema
export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  username: usernameSchema.optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  company: companySchema,
  contactType: z.enum(['email', 'phone', 'telegram'], {
    errorMap: () => ({ message: 'Выберите тип контакта' })
  }).optional(),
  contact: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, 'Необходимо согласиться с условиями использования'),
  agreePrivacy: z.boolean().refine(val => val === true, 'Необходимо согласиться с политикой конфиденциальности'),
  agreeMarketing: z.boolean().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
).refine(
  (data) => {
    if (data.contactType && !data.contact) {
      return false;
    }
    if (data.contact && !data.contactType) {
      return false;
    }
    return true;
  },
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
  tempToken: z.string().min(1, 'Временный токен отсутствует'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;