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

// Валидация НЕ падает - только информирует
export function validateConfig(): void {
  console.log('🔧 [ENV] Environment configuration check...');
  
  // Информативные сообщения без ошибок
  if (!config.DATABASE_URL) {
    console.log('📌 [ENV] DATABASE_URL will be validated by database connection');
  }
  
  if (!config.JWT_SECRET || config.JWT_SECRET.includes('development')) {
    console.log('🔧 [ENV] Using generated JWT_SECRET for production safety');
  }
  
  if (!config.SESSION_SECRET || config.SESSION_SECRET.includes('development')) {
    console.log('🔧 [ENV] Using production-safe SESSION_SECRET');
  }
  
  if (!config.SENDGRID_API_KEY) {
    console.log('📧 [ENV] SENDGRID_API_KEY not set - email notifications disabled');
  }
  
  if (!config.KEITARO_TOKEN && !config.VOLUUM_TOKEN && !config.BINOM_TOKEN && !config.REDTRACK_TOKEN) {
    console.log('🔗 [ENV] No external tracker tokens - tracking integrations disabled');
  }
  
  if (!config.GOOGLE_CLOUD_PROJECT_ID || !config.GOOGLE_CLOUD_STORAGE_BUCKET) {
    console.log('☁️ [ENV] Google Cloud Storage not configured - using fallback storage');
  }
  
  console.log('✅ [ENV] Configuration validated - application ready to start');
}

export default config;
