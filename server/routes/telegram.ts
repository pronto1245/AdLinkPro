import type { Express } from "express";
import { telegramBot } from "../services/telegramBot";
import { storage } from "../storage";

export function addTelegramRoutes(app: Express) {
  // Webhook для получения сообщений от Telegram
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      console.log('📥 Telegram webhook received:', JSON.stringify(req.body, null, 2));
      
      await telegramBot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('❌ Telegram webhook error:', error);
      res.status(200).json({ ok: true }); // Всегда отвечаем 200, чтобы Telegram не ретраил
    }
  });

  // Тестовый endpoint для отправки уведомлений
  app.post('/api/telegram/test', async (req, res) => {
    try {
      const { userId, type = 'conversion', data } = req.body;
      
      console.log('🧪 Testing Telegram notification:', { userId, type, data });

      if (type === 'conversion') {
        await telegramBot.notifyConversion({
          userId,
          offerName: data?.offerName || 'Test Offer',
          partnerName: data?.partnerName || 'Test Partner',
          amount: data?.amount || 100,
          currency: data?.currency || 'USD',
          country: data?.country || 'RU',
          source: data?.source || 'test'
        });
      } else if (type === 'fraud') {
        await telegramBot.notifyFraud({
          userId,
          type: data?.type || 'suspicious_activity',
          description: data?.description || 'Test fraud alert',
          severity: data?.severity || 'medium',
          ipAddress: data?.ipAddress || '127.0.0.1',
          country: data?.country || 'RU'
        });
      } else if (type === 'report') {
        await telegramBot.sendDailyReport(userId);
      }

      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      console.error('❌ Test notification error:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  });

  // Привязка Telegram Chat ID к пользователю
  app.patch('/api/telegram/link', async (req, res) => {
    try {
      const { userId, telegramChatId } = req.body;
      
      if (!userId || !telegramChatId) {
        return res.status(400).json({ error: 'userId and telegramChatId are required' });
      }

      console.log('🔗 Linking Telegram Chat ID:', { userId, telegramChatId });

      await storage.updateUser(userId, { telegramChatId: parseInt(telegramChatId) });
      
      // Отправляем приветственное сообщение
      await telegramBot.sendMessage(
        parseInt(telegramChatId),
        '✅ <b>Аккаунт успешно привязан!</b>\n\nТеперь вы будете получать уведомления о конверсиях, fraud алертах и других важных событиях.',
        'HTML'
      );

      res.json({ success: true, message: 'Telegram linked successfully' });
    } catch (error) {
      console.error('❌ Telegram link error:', error);
      res.status(500).json({ error: 'Failed to link Telegram' });
    }
  });

  // Отвязка Telegram
  app.delete('/api/telegram/unlink/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      console.log('🔗 Unlinking Telegram for user:', userId);

      await storage.updateUser(userId, { telegramChatId: null });
      
      res.json({ success: true, message: 'Telegram unlinked successfully' });
    } catch (error) {
      console.error('❌ Telegram unlink error:', error);
      res.status(500).json({ error: 'Failed to unlink Telegram' });
    }
  });

  console.log('✅ Telegram routes added successfully');
}