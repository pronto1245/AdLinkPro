import { storage } from "../storage";
import { notificationService } from "./notification";

interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: TelegramUser;
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

export class TelegramBotService {
  private token: string;
  private baseUrl: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    
    if (!this.token) {
      console.error('⚠️ TELEGRAM_BOT_TOKEN not provided');
    } else {
      console.log('✅ Telegram Bot service initialized');
      this.setupWebhook();
    }
  }

  private async setupWebhook() {
    try {
      // Получаем информацию о боте
      const botInfo = await this.getBotInfo();
      console.log('🤖 Bot Info:', botInfo);
      
      // Устанавливаем webhook для получения сообщений
      const webhookUrl = `${process.env.REPLIT_EXTERNAL_URL || 'https://setbet-arbit.ru'}/api/telegram/webhook`;
      await this.setWebhook(webhookUrl);
      console.log('🔗 Webhook установлен:', webhookUrl);
      
    } catch (error) {
      console.error('❌ Ошибка настройки webhook:', error);
    }
  }

  private async getBotInfo() {
    const response = await fetch(`${this.baseUrl}/getMe`);
    const data = await response.json();
    return data.result;
  }

  private async setWebhook(url: string) {
    const response = await fetch(`${this.baseUrl}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  }

  async sendMessage(chatId: number, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    try {
      const payload: TelegramMessage = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true
      };

      console.log('📤 Отправка Telegram сообщения:', { chatId, messageLength: message.length });

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Telegram сообщение отправлено успешно');
        return true;
      } else {
        console.error('❌ Ошибка отправки Telegram сообщения:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Telegram API ошибка:', error);
      return false;
    }
  }

  // Уведомление о новой конверсии
  async notifyConversion(data: {
    userId: string;
    offerName: string;
    partnerName: string;
    amount: number;
    currency: string;
    country?: string;
    source?: string;
  }) {
    const user = await storage.getUserById(data.userId);
    if (!user?.telegramChatId) return;

    const message = `
🎉 <b>НОВАЯ КОНВЕРСИЯ!</b>

💰 <b>Сумма:</b> ${data.amount} ${data.currency}
🎯 <b>Оффер:</b> ${data.offerName}
👤 <b>Партнер:</b> ${data.partnerName}
🌍 <b>Страна:</b> ${data.country || 'Не указана'}
📱 <b>Источник:</b> ${data.source || 'Не указан'}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;

    await this.sendMessage(user.telegramChatId, message);
  }

  // Уведомление о фроде
  async notifyFraud(data: {
    userId: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    ipAddress?: string;
    country?: string;
  }) {
    const user = await storage.getUserById(data.userId);
    if (!user?.telegramChatId) return;

    const severityEmoji = {
      low: '🟡',
      medium: '🟠', 
      high: '🔴'
    };

    const message = `
${severityEmoji[data.severity]} <b>FRAUD ALERT!</b>

⚠️ <b>Тип:</b> ${data.type}
📝 <b>Описание:</b> ${data.description}
📊 <b>Уровень:</b> ${data.severity.toUpperCase()}
🌐 <b>IP:</b> ${data.ipAddress || 'Неизвестен'}
🌍 <b>Страна:</b> ${data.country || 'Неизвестна'}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;

    await this.sendMessage(user.telegramChatId, message);
  }

  // Ежедневная статистика
  async sendDailyReport(userId: string) {
    const user = await storage.getUserById(userId);
    if (!user?.telegramChatId) return;

    // Получаем статистику за сегодня
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Здесь должна быть реальная статистика из базы данных
    const stats = {
      conversions: 12,
      clicks: 1847,
      revenue: 2340.50,
      currency: 'USD',
      cr: 0.65,
      epc: 1.27
    };

    const message = `
📊 <b>ДНЕВНОЙ ОТЧЕТ</b>

💰 <b>Доход:</b> ${stats.revenue} ${stats.currency}
🎯 <b>Конверсии:</b> ${stats.conversions}
👆 <b>Клики:</b> ${stats.clicks}
📈 <b>CR:</b> ${stats.cr}%
💵 <b>EPC:</b> $${stats.epc}

📅 <b>Дата:</b> ${today.toLocaleDateString('ru-RU')}
    `;

    await this.sendMessage(user.telegramChatId, message);
  }

  // Обработка входящих сообщений
  async handleUpdate(update: TelegramUpdate) {
    if (!update.message?.text) return;

    const chatId = update.message.chat.id;
    const text = update.message.text;
    const userId = update.message.from.id;

    console.log('📥 Получено Telegram сообщение:', { chatId, text, userId });

    // Команды бота
    switch (text) {
      case '/start':
        await this.handleStartCommand(chatId, update.message.from);
        break;
      
      case '/help':
        await this.handleHelpCommand(chatId);
        break;
        
      case '/stats':
        await this.handleStatsCommand(chatId, userId);
        break;
        
      case '/report':
        await this.handleReportCommand(chatId, userId);
        break;

      case '/settings':
        await this.handleSettingsCommand(chatId, userId);
        break;

      default:
        await this.handleUnknownCommand(chatId);
    }
  }

  private async handleStartCommand(chatId: number, from: TelegramUser) {
    const message = `
👋 Привет, <b>${from.first_name}</b>!

Я бот ArbiConnect для уведомлений о конверсиях и статистике.

🔗 <b>Чтобы привязать аккаунт:</b>
1. Войдите в ваш кабинет ArbiConnect
2. Перейдите в Профиль → Уведомления  
3. Введите ваш Chat ID: <code>${chatId}</code>
4. Включите Telegram уведомления

📋 <b>Доступные команды:</b>
/stats - Текущая статистика
/report - Дневной отчет
/settings - Настройки уведомлений
/help - Помощь
    `;

    await this.sendMessage(chatId, message);
  }

  private async handleHelpCommand(chatId: number) {
    const message = `
🆘 <b>ПОМОЩЬ</b>

📋 <b>Команды:</b>
/start - Начало работы
/stats - Показать статистику 
/report - Дневной отчет
/settings - Настройки

🔔 <b>Уведомления:</b>
• Новые конверсии
• Fraud алерты  
• Ежедневные отчеты
• Важные события

⚙️ <b>Настройка:</b>
Используйте Chat ID: <code>${chatId}</code> в настройках профиля

💬 <b>Поддержка:</b> @support
    `;

    await this.sendMessage(chatId, message);
  }

  private async handleStatsCommand(chatId: number, telegramUserId: number) {
    // Попробуем найти пользователя по Telegram Chat ID
    const user = await storage.getUserByTelegramChatId(chatId);
    
    if (!user) {
      await this.sendMessage(chatId, 
        '❌ Аккаунт не привязан. Используйте /start для инструкций.'
      );
      return;
    }

    const message = `
📊 <b>ТЕКУЩАЯ СТАТИСТИКА</b>

👤 <b>Аккаунт:</b> ${user.username}
💰 <b>Баланс:</b> ${user.balance} USD
📈 <b>Всего офферов:</b> Загрузка...
🎯 <b>Активных:</b> Загрузка...
👥 <b>Партнеров:</b> Загрузка...

⏰ Обновлено: ${new Date().toLocaleString('ru-RU')}
    `;

    await this.sendMessage(chatId, message);
  }

  private async handleReportCommand(chatId: number, telegramUserId: number) {
    const user = await storage.getUserByTelegramChatId(chatId);
    
    if (!user) {
      await this.sendMessage(chatId, 
        '❌ Аккаунт не привязан. Используйте /start для инструкций.'
      );
      return;
    }

    await this.sendDailyReport(user.id);
  }

  private async handleSettingsCommand(chatId: number, telegramUserId: number) {
    const message = `
⚙️ <b>НАСТРОЙКИ УВЕДОМЛЕНИЙ</b>

🔔 <b>Включить/выключить:</b>
• Конверсии - Включено ✅
• Fraud алерты - Включено ✅  
• Дневные отчеты - Включено ✅

⏰ <b>Время отчетов:</b> 09:00 UTC

📱 <b>Chat ID:</b> <code>${chatId}</code>

Настройки можно изменить в веб-интерфейсе ArbiConnect
    `;

    await this.sendMessage(chatId, message);
  }

  private async handleUnknownCommand(chatId: number) {
    await this.sendMessage(chatId, 
      '❓ Неизвестная команда. Используйте /help для списка команд.'
    );
  }
}

export const telegramBot = new TelegramBotService();