import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Pool } from 'pg';
import { sendEmail, EmailParams } from './email';
import { generatePasswordResetEmailText, generatePasswordResetEmailHTML } from '../templates/password-reset';

export interface PasswordResetService {
  requestPasswordReset(email: string): Promise<{ success: boolean; message: string }>;
  validateResetToken(token: string): Promise<{ valid: boolean; email?: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }>;
}

export class DatabasePasswordResetService implements PasswordResetService {
  private pool: Pool;
  private readonly TOKEN_EXPIRY_HOURS = 2; // 2 hours
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  constructor(pool: Pool) {
    this.pool = pool;
    this.startCleanupTask();
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      // Check if user exists in database
      const userResult = await this.pool.query(
        'SELECT id, email, username FROM users WHERE email = $1 LIMIT 1',
        [normalizedEmail]
      );

      const userExists = userResult.rows.length > 0;
      
      // Always return success to prevent email enumeration
      const successMessage = "Если аккаунт с этим email существует, на него будет отправлено письмо с инструкциями по восстановлению пароля.";

      if (userExists) {
        const user = userResult.rows[0];
        
        // Generate secure reset token
        const resetToken = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

        // Clean up old tokens for this email
        await this.pool.query(
          'UPDATE password_reset_tokens SET used = TRUE WHERE email = $1 AND NOT used',
          [normalizedEmail]
        );

        // Store new reset token
        await this.pool.query(
          'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
          [normalizedEmail, resetToken, expiresAt]
        );

        // Send reset email
        const resetLink = this.generateResetLink(resetToken);
        const emailResult = await this.sendPasswordResetEmail(normalizedEmail, resetLink);

        if (emailResult.success && !emailResult.skipped) {
          console.log(`[PASSWORD_RESET] Email sent successfully to ${normalizedEmail}`);
        } else if (emailResult.skipped) {
          console.log(`[PASSWORD_RESET] Email service not configured - token generated for ${normalizedEmail}: ${resetToken}`);
        } else {
          console.error(`[PASSWORD_RESET] Failed to send email to ${normalizedEmail}`);
          // Still return success to prevent email enumeration
        }
      } else {
        console.log(`[PASSWORD_RESET] Password reset requested for non-existent email: ${normalizedEmail}`);
      }

      return { success: true, message: successMessage };

    } catch (error) {
      console.error('[PASSWORD_RESET] Error requesting password reset:', error);
      // Return success to prevent information leakage
      const successMessage = "Если аккаунт с этим email существует, на него будет отправлено письмо с инструкциями по восстановлению пароля.";
      return { success: true, message: successMessage };
    }
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const result = await this.pool.query(`
        SELECT email, expires_at 
        FROM password_reset_tokens 
        WHERE token = $1 AND NOT used AND expires_at > now()
        LIMIT 1
      `, [token]);

      if (result.rows.length === 0) {
        return { valid: false };
      }

      return { 
        valid: true, 
        email: result.rows[0].email 
      };

    } catch (error) {
      console.error('[PASSWORD_RESET] Error validating reset token:', error);
      return { valid: false };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate token and get email
      const tokenValidation = await this.validateResetToken(token);
      
      if (!tokenValidation.valid || !tokenValidation.email) {
        return { 
          success: false, 
          message: "Недействительный или истекший токен для восстановления пароля." 
        };
      }

      const email = tokenValidation.email;

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcryptjs.hash(newPassword, saltRounds);

      // Update password in users table
      const updateResult = await this.pool.query(
        'UPDATE users SET password_hash = $1, updated_at = now() WHERE email = $2',
        [passwordHash, email]
      );

      if (updateResult.rowCount === 0) {
        console.error(`[PASSWORD_RESET] User not found for email: ${email}`);
        return { 
          success: false, 
          message: "Пользователь не найден." 
        };
      }

      // Mark token as used
      await this.pool.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
        [token]
      );

      console.log(`[PASSWORD_RESET] Password successfully reset for user: ${email}`);
      
      return { 
        success: true, 
        message: "Пароль успешно изменен." 
      };

    } catch (error) {
      console.error('[PASSWORD_RESET] Error resetting password:', error);
      return { 
        success: false, 
        message: "Произошла ошибка при сбросе пароля." 
      };
    }
  }

  private generateSecureToken(): string {
    // Generate 32 bytes of random data and encode as base64url
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateResetLink(token: string): string {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/auth/reset-password?token=${token}`;
  }

  private async sendPasswordResetEmail(email: string, resetLink: string): Promise<{ success: boolean; skipped?: boolean }> {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@adlinkpro.com';
    
    const emailData = {
      email: email,
      resetLink: resetLink,
      expirationHours: this.TOKEN_EXPIRY_HOURS
    };

    const emailParams: EmailParams = {
      to: email,
      from: fromEmail,
      subject: 'Восстановление пароля - AdLinkPro',
      text: generatePasswordResetEmailText(emailData),
      html: generatePasswordResetEmailHTML(emailData)
    };

    const result = await sendEmail(emailParams);
    return { 
      success: result.ok,
      skipped: result.skipped 
    };
  }

  private startCleanupTask(): void {
    setInterval(async () => {
      try {
        const result = await this.pool.query(
          'DELETE FROM password_reset_tokens WHERE expires_at < now()'
        );
        if (result.rowCount && result.rowCount > 0) {
          console.log(`[PASSWORD_RESET] Cleaned up ${result.rowCount} expired tokens`);
        }
      } catch (error) {
        console.error('[PASSWORD_RESET] Error during token cleanup:', error);
      }
    }, this.CLEANUP_INTERVAL_MS);
  }
}

// In-memory implementation for fallback
export class InMemoryPasswordResetService implements PasswordResetService {
  private tokens = new Map<string, { email: string; expiresAt: number }>();
  private readonly TOKEN_EXPIRY_HOURS = 2;
  
  constructor(private users: Array<{ email: string; password: string; [key: string]: any }>) {
    this.startCleanupTask();
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const successMessage = "Если аккаунт с этим email существует, на него будет отправлено письмо с инструкциями по восстановлению пароля.";
    
    const userExists = this.users.some(u => u.email.toLowerCase() === normalizedEmail);
    
    if (userExists) {
      const resetToken = this.generateSecureToken();
      const expiresAt = Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
      
      this.tokens.set(resetToken, { email: normalizedEmail, expiresAt });
      
      const resetLink = this.generateResetLink(resetToken);
      console.log(`[PASSWORD_RESET] In-memory token generated for ${normalizedEmail}: ${resetToken}`);
      console.log(`[PASSWORD_RESET] Reset link: ${resetLink}`);
    }
    
    return { success: true, message: successMessage };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return { valid: false };
    }
    
    return { valid: true, email: tokenData.email };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const tokenValidation = await this.validateResetToken(token);
    
    if (!tokenValidation.valid || !tokenValidation.email) {
      return { success: false, message: "Недействительный или истекший токен." };
    }
    
    const user = this.users.find(u => u.email.toLowerCase() === tokenValidation.email);
    if (!user) {
      return { success: false, message: "Пользователь не найден." };
    }
    
    user.password = newPassword;
    this.tokens.delete(token);
    
    console.log(`[PASSWORD_RESET] In-memory password reset completed for: ${tokenValidation.email}`);
    
    return { success: true, message: "Пароль успешно изменен." };
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateResetLink(token: string): string {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/auth/reset-password?token=${token}`;
  }

  private startCleanupTask(): void {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [token, data] of this.tokens.entries()) {
        if (data.expiresAt < now) {
          this.tokens.delete(token);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`[PASSWORD_RESET] Cleaned up ${cleanedCount} expired in-memory tokens`);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}