import { Router } from 'express';
import { randomBytes } from 'crypto';
import { sendEmail } from '../services/email';

const router = Router();

// Store 2FA codes temporarily (in production, use Redis or database)
const twoFactorCodes = new Map<string, {
  code: string;
  userId: string;
  action: string;
  expiresAt: Date;
  attempts: number;
}>();

// Clean expired codes
setInterval(() => {
  const now = new Date();
  const entries = Array.from(twoFactorCodes.entries());
  for (const [key, value] of entries) {
    if (value.expiresAt < now) {
      twoFactorCodes.delete(key);
    }
  }
}, 60000); // Clean every minute

router.post('/send-2fa-code', async (req, res) => {
  try {
    const { action, method = 'email' } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeId = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store code
    twoFactorCodes.set(codeId, {
      code,
      userId,
      action,
      expiresAt,
      attempts: 0
    });

    // Get user email
    const user = (req as any).user;
    
    if (method === 'email' && user.email) {
      await sendEmail({
        to: user.email,
        from: process.env.FROM_EMAIL || 'noreply@platform.com',
        subject: 'Код безопасности для подтверждения операции',
        html: `
          <h2>Код безопасности</h2>
          <p>Ваш код для подтверждения операции: <strong>${code}</strong></p>
          <p>Операция: ${action}</p>
          <p>Код действителен 5 минут.</p>
          <p>Если вы не запрашивали этот код, проигнорируйте это сообщение.</p>
        `,
        text: `Ваш код безопасности: ${code}. Операция: ${action}. Код действителен 5 минут.`
      });
    }

    // Store code ID in session for verification
    (req as any).session.twoFactorCodeId = codeId;

    res.json({ 
      success: true, 
      method,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Send 2FA code error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

router.post('/verify-2fa-code', async (req, res) => {
  try {
    const { code, action } = req.body;
    const userId = (req as any).user?.id;
    const codeId = (req as any).session.twoFactorCodeId;

    if (!userId || !codeId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const storedCodeData = twoFactorCodes.get(codeId);

    if (!storedCodeData) {
      return res.status(400).json({ error: 'Код не найден или истек' });
    }

    // Check expiration
    if (storedCodeData.expiresAt < new Date()) {
      twoFactorCodes.delete(codeId);
      return res.status(400).json({ error: 'Код истек' });
    }

    // Check attempts
    if (storedCodeData.attempts >= 3) {
      twoFactorCodes.delete(codeId);
      return res.status(400).json({ error: 'Превышено количество попыток' });
    }

    // Verify code
    if (storedCodeData.code !== code) {
      storedCodeData.attempts++;
      return res.status(400).json({ error: 'Неверный код' });
    }

    // Verify user and action
    if (storedCodeData.userId !== userId || storedCodeData.action !== action) {
      twoFactorCodes.delete(codeId);
      return res.status(400).json({ error: 'Неверные параметры' });
    }

    // Success - remove code and clear session
    twoFactorCodes.delete(codeId);
    delete (req as any).session.twoFactorCodeId;

    res.json({ success: true });

  } catch (error) {
    console.error('Verify 2FA code error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

export default router;