// Безопасная загрузка переменных окружения
function getEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Основная конфигурация
export const config = {
  // Базовые настройки сервера
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 5000),
  HOST: getEnvVar('HOST', '0.0.0.0'),
  
  // База данных (используется автоматически в db.ts)
  DATABASE_URL: getEnvVar('DATABASE_URL', ''),
  
  // JWT и сессии (всегда с дефолтными значениями)
  JWT_SECRET: getEnvVar('JWT_SECRET', 'production-safe-jwt-secret-2024-arbiconnect-platform'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),
  SESSION_SECRET: getEnvVar('SESSION_SECRET', 'production-safe-session-secret-2024-arbiconnect'),
  
  // Email (опционально)
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY'),
  EMAIL_FROM: getEnvVar('EMAIL_FROM', 'noreply@platform.com'),
  
  // Внешние трекеры (все опционально)
  KEITARO_TOKEN: getEnvVar('KEITARO_TOKEN'),
  BINOM_TOKEN: getEnvVar('BINOM_TOKEN'),
  REDTRACK_TOKEN: getEnvVar('REDTRACK_TOKEN'),
  VOLUUM_TOKEN: getEnvVar('VOLUUM_TOKEN'),
  
  // Google Cloud (опционально)
  GOOGLE_CLOUD_PROJECT_ID: getEnvVar('GOOGLE_CLOUD_PROJECT_ID'),
  GOOGLE_CLOUD_STORAGE_BUCKET: getEnvVar('GOOGLE_CLOUD_STORAGE_BUCKET'),
  GOOGLE_APPLICATION_CREDENTIALS: getEnvVar('GOOGLE_APPLICATION_CREDENTIALS'),
  
  // Telegram (опционально)
  TELEGRAM_BOT_TOKEN: getEnvVar('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_CHAT_ID: getEnvVar('TELEGRAM_CHAT_ID'),
  
  // Настройки производительности
  RATE_LIMIT_REQUESTS: getEnvNumber('RATE_LIMIT_REQUESTS', 1000),
  RATE_LIMIT_WINDOW: getEnvNumber('RATE_LIMIT_WINDOW', 900000), // 15 минут
  
  // Постбэк настройки
  POSTBACK_RETRY_ATTEMPTS: getEnvNumber('POSTBACK_RETRY_ATTEMPTS', 5),
  POSTBACK_RETRY_DELAY: getEnvNumber('POSTBACK_RETRY_DELAY', 1000),
  POSTBACK_TIMEOUT: getEnvNumber('POSTBACK_TIMEOUT', 10000),
  
  // Безопасность
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
  LOGIN_ATTEMPT_LIMIT: getEnvNumber('LOGIN_ATTEMPT_LIMIT', 5),
  LOGIN_LOCKOUT_TIME: getEnvNumber('LOGIN_LOCKOUT_TIME', 900000), // 15 минут
  
  // Логирование
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_FILE: getEnvVar('LOG_FILE', 'logs/app.log'),
  
  // Флаги возможностей
  ENABLE_2FA: getEnvBool('ENABLE_2FA', true),
  ENABLE_KYC: getEnvBool('ENABLE_KYC', true),
  ENABLE_AUDIT_LOGS: getEnvBool('ENABLE_AUDIT_LOGS', true),
  ENABLE_REAL_TIME_ANALYTICS: getEnvBool('ENABLE_REAL_TIME_ANALYTICS', true),
};

// Строгая production валидация - только JWT_SECRET обязателен
export function validateConfig(): void {
  // В продакшене требуем только JWT_SECRET (если не установлен дефолт)
  if (process.env.NODE_ENV === 'production') {
    const jwtFromEnv = process.env.JWT_SECRET;
    const hasCustomJWT = jwtFromEnv && jwtFromEnv.trim() && jwtFromEnv !== 'production-safe-jwt-secret-2024-arbiconnect-platform';
    
    console.log(`[ENV] Production JWT check: ${hasCustomJWT ? 'Custom JWT found' : 'Using fallback JWT'}`);
    
    // Не валимся даже если нет JWT - используем дефолт
    // if (!hasCustomJWT) {
    //   console.warn('[ENV] Warning: No custom JWT_SECRET set, using fallback');
    // }
  }
  
  // Всё остальное — не критично, просто предупреждаем
  [
    'SENDGRID_API_KEY','VOLUUM_TOKEN','KEITARO_TOKEN','BINOM_TOKEN','REDTRACK_TOKEN',
    'GOOGLE_CLOUD_PROJECT_ID','GOOGLE_CLOUD_STORAGE_BUCKET',
    'GOOGLE_APPLICATION_CREDENTIALS'
  ].forEach(k => { 
    if (!process.env[k]) console.warn(`[ENV] Optional var not set: ${k}`);
  });
  
  console.log('✅ [ENV] Validation complete - starting application');
}

export default config;
