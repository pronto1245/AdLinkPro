// 2FA Configuration - Centralized control for 2FA system
// Set to false to disable 2FA system-wide as requested by user

export const TFA_CONFIG = {
  // 2FA is disabled system-wide per user request
  // "интеграции 2FA не нужна. пока делаем без интеграции 2FA"
  ENABLED: false,

  // Allow enabling 2FA in development for testing
  ALLOW_DEV_ENABLE: false,

  // Skip 2FA verification even if user has it enabled
  SKIP_VERIFICATION: true,

  // Message to show when 2FA operations are attempted
  DISABLED_MESSAGE: '2FA временно отключена системно'
} as const;

/**
 * Check if 2FA is enabled system-wide
 */
export function is2FAEnabled(): boolean {
  return TFA_CONFIG.ENABLED && (!TFA_CONFIG.SKIP_VERIFICATION);
}

/**
 * Check if 2FA verification should be skipped
 */
export function should2FABeSkipped(): boolean {
  return !TFA_CONFIG.ENABLED || TFA_CONFIG.SKIP_VERIFICATION;
}

/**
 * Get 2FA disabled message
 */
export function get2FADisabledMessage(): string {
  return TFA_CONFIG.DISABLED_MESSAGE;
}
