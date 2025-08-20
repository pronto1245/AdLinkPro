import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно').max(50, 'Имя не может быть длиннее 50 символов'),
  lastName: z.string().min(1, 'Фамилия обязательна').max(50, 'Фамилия не может быть длиннее 50 символов'),
  email: z.string().email('Неверный формат email'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Название компании обязательно').max(100, 'Название компании не может быть длиннее 100 символов'),
  country: z.string().min(2, 'Выберите страну'),
  language: z.string().min(2, 'Выберите язык'),
  timezone: z.string().min(1, 'Выберите часовой пояс'),
  currency: z.string().min(3, 'Выберите валюту'),
  telegram: z.string().optional(),
  settings: z.object({
    brandName: z.string().max(100, 'Название бренда не может быть длиннее 100 символов').optional(),
    brandDescription: z.string().max(500, 'Описание бренда не может быть длиннее 500 символов').optional(),
    brandLogo: z.string().url('Неверный формат URL для логотипа').optional().or(z.literal('')),
    vertical: z.string().max(50, 'Вертикаль не может быть длиннее 50 символов').optional(),
    partnerRules: z.string().max(1000, 'Правила для партнеров не могут быть длиннее 1000 символов').optional(),
    notifications: z.object({
      email: z.boolean(),
      telegram: z.boolean(),
      sms: z.boolean()
    }).optional()
  }).optional()
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  current: z.string().min(1, 'Текущий пароль обязателен'),
  new: z.string().min(8, 'Новый пароль должен содержать не менее 8 символов'),
  confirm: z.string().min(1, 'Подтверждение пароля обязательно')
}).refine((data) => data.new === data.confirm, {
  message: 'Пароли не совпадают',
  path: ['confirm']
});

// Webhook settings validation schema  
export const webhookSchema = z.object({
  defaultUrl: z.string().url('Неверный формат URL').optional().or(z.literal('')),
  ipWhitelist: z.array(z.string().ip('Неверный формат IP-адреса')).optional(),
  enabled: z.boolean()
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
export type WebhookData = z.infer<typeof webhookSchema>;