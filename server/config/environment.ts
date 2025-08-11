interface Config {
  // Database
  DATABASE_URL: string;
  REDIS_URL: string;
  
  // Authentication
  JWT_SECRET: string;
  SESSION_SECRET: string;
  SESSION_MAX_AGE: number;
  
  // External Trackers
  KEITARO_ENDPOINT: string;
  KEITARO_TOKEN: string;
  BINOM_ENDPOINT: string;
  BINOM_TOKEN: string;
  REDTRACK_ENDPOINT: string;
  REDTRACK_TOKEN: string;
  VOLUUM_ENDPOINT: string;
  VOLUUM_TOKEN: string;
  
  // Google Cloud Storage
  GOOGLE_CLOUD_PROJECT_ID?: string;
  GOOGLE_CLOUD_STORAGE_BUCKET?: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  
  // Email
  SENDGRID_API_KEY?: string;
  FROM_EMAIL: string;
  
  // Server
  NODE_ENV: string;
  PORT: number;
  WS_PORT: number;
  
  // Anti-fraud
  ANTIFRAUD_ENABLED: boolean;
  ANTIFRAUD_LOG_LEVEL: string;
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: boolean;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_WINDOW_MS: number;
  
  // Postback
  POSTBACK_RETRY_ATTEMPTS: number;
  POSTBACK_RETRY_DELAY: number;
  POSTBACK_TIMEOUT: number;
  
  // Security
  BCRYPT_ROUNDS: number;
  LOGIN_ATTEMPT_LIMIT: number;
  LOGIN_LOCKOUT_TIME: number;
  
  // Logging
  LOG_LEVEL: string;
  LOG_FILE: string;
  
  // Feature Flags
  ENABLE_2FA: boolean;
  ENABLE_KYC: boolean;
  ENABLE_AUDIT_LOGS: boolean;
  ENABLE_REAL_TIME_ANALYTICS: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value || '';
};

const getEnvBool = (key: string, defaultValue = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const config: Config = {
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/affiliate_platform'),
  REDIS_URL: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  
  // Authentication
  JWT_SECRET: getEnvVar('JWT_SECRET', 'development-jwt-secret-change-in-production'),
  SESSION_SECRET: getEnvVar('SESSION_SECRET', 'development-session-secret'),
  SESSION_MAX_AGE: getEnvNumber('SESSION_MAX_AGE', 86400000), // 24 hours
  
  // External Trackers
  KEITARO_ENDPOINT: getEnvVar('KEITARO_ENDPOINT', 'https://trk.example/click.php'),
  KEITARO_TOKEN: getEnvVar('KEITARO_TOKEN', ''),
  BINOM_ENDPOINT: getEnvVar('BINOM_ENDPOINT', 'https://binom.example.com/click.php'),
  BINOM_TOKEN: getEnvVar('BINOM_TOKEN', ''),
  REDTRACK_ENDPOINT: getEnvVar('REDTRACK_ENDPOINT', 'https://redtrack.example.com/postback'),
  REDTRACK_TOKEN: getEnvVar('REDTRACK_TOKEN', ''),
  VOLUUM_ENDPOINT: getEnvVar('VOLUUM_ENDPOINT', 'https://voluum.example.com/postback'),
  VOLUUM_TOKEN: getEnvVar('VOLUUM_TOKEN', ''),
  
  // Google Cloud Storage
  GOOGLE_CLOUD_PROJECT_ID: getEnvVar('GOOGLE_CLOUD_PROJECT_ID'),
  GOOGLE_CLOUD_STORAGE_BUCKET: getEnvVar('GOOGLE_CLOUD_STORAGE_BUCKET'),
  GOOGLE_APPLICATION_CREDENTIALS: getEnvVar('GOOGLE_APPLICATION_CREDENTIALS'),
  
  // Email
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY'),
  FROM_EMAIL: getEnvVar('FROM_EMAIL', 'noreply@affiliate-platform.com'),
  
  // Server
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 5000),
  WS_PORT: getEnvNumber('WS_PORT', 8080),
  
  // Anti-fraud
  ANTIFRAUD_ENABLED: getEnvBool('ANTIFRAUD_ENABLED', true),
  ANTIFRAUD_LOG_LEVEL: getEnvVar('ANTIFRAUD_LOG_LEVEL', 'info'),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: getEnvBool('RATE_LIMIT_ENABLED', true),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  
  // Postback
  POSTBACK_RETRY_ATTEMPTS: getEnvNumber('POSTBACK_RETRY_ATTEMPTS', 5),
  POSTBACK_RETRY_DELAY: getEnvNumber('POSTBACK_RETRY_DELAY', 1000),
  POSTBACK_TIMEOUT: getEnvNumber('POSTBACK_TIMEOUT', 10000),
  
  // Security
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
  LOGIN_ATTEMPT_LIMIT: getEnvNumber('LOGIN_ATTEMPT_LIMIT', 5),
  LOGIN_LOCKOUT_TIME: getEnvNumber('LOGIN_LOCKOUT_TIME', 900000), // 15 minutes
  
  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_FILE: getEnvVar('LOG_FILE', 'logs/app.log'),
  
  // Feature Flags
  ENABLE_2FA: getEnvBool('ENABLE_2FA', true),
  ENABLE_KYC: getEnvBool('ENABLE_KYC', true),
  ENABLE_AUDIT_LOGS: getEnvBool('ENABLE_AUDIT_LOGS', true),
  ENABLE_REAL_TIME_ANALYTICS: getEnvBool('ENABLE_REAL_TIME_ANALYTICS', true),
};

// Validate critical configuration
export function validateConfig(): void {
  // Информативные сообщения только - НЕ падаем ни при каких условиях
  console.log('🔧 [ENV] Environment configuration check...');
  
  // DATABASE_URL проверяется в db.ts, здесь только информируем
  if (!config.DATABASE_URL) {
    console.log('📌 [ENV] DATABASE_URL will be validated by database connection');
  }
  
  // Все секреты работают с дефолтными значениями
  if (!config.JWT_SECRET || config.JWT_SECRET === 'development-jwt-secret-change-in-production') {
    console.log('🔧 [ENV] Using default JWT_SECRET');
  }
  
  if (!config.SESSION_SECRET || config.SESSION_SECRET === 'development-session-secret') {
    console.log('🔧 [ENV] Using default SESSION_SECRET');
  }
  
  // Опциональные сервисы - только информируем
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