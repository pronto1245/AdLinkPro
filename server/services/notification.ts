import { sendEmail } from './email';

export interface NotificationEvent {
  type: 'user_registration' | 'user_blocked' | 'new_device_login' | 'password_reset' | 'fraud_alert' | 'role_assigned';
  userId: string;
  data: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface NotificationSettings {
  email: boolean;
  telegram: boolean;
  webhook: boolean;
  channels: {
    user_registration: string[];
    user_blocked: string[];
    new_device_login: string[];
    fraud_alert: string[];
  };
}

class NotificationService {
  private settings: NotificationSettings = {
    email: true,
    telegram: false,
    webhook: false,
    channels: {
      user_registration: ['email'],
      user_blocked: ['email', 'telegram'],
      new_device_login: ['email'],
      fraud_alert: ['email', 'telegram']
    }
  };

  async sendNotification(event: NotificationEvent): Promise<void> {
    try {
      console.log(`Processing notification: ${event.type} for user ${event.userId}`);
      
      // Get notification channels for this event type
      const channels = this.settings.channels[event.type as keyof typeof this.settings.channels] || [];
      
      // Send email notifications
      if (channels.includes('email') && this.settings.email) {
        await this.sendEmailNotification(event);
      }
      
      // Send Telegram notifications
      if (channels.includes('telegram') && this.settings.telegram) {
        await this.sendTelegramNotification(event);
      }
      
      // Send webhook notifications
      if (channels.includes('webhook') && this.settings.webhook) {
        await this.sendWebhookNotification(event);
      }
      
      // Log the event
      await this.logEvent(event);
      
    } catch (error) {
      console.error('Notification service error:', error);
    }
  }

  private async sendEmailNotification(event: NotificationEvent): Promise<void> {
    try {
      const emailContent = this.generateEmailContent(event);
      
      // Send to admin emails
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@example.com'];
      
      for (const email of adminEmails) {
        await sendEmail({
          to: email.trim(),
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
      }
      
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  private async sendTelegramNotification(event: NotificationEvent): Promise<void> {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (!botToken || !chatId) {
        console.log('Telegram credentials not configured');
        return;
      }
      
      const message = this.generateTelegramMessage(event);
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Telegram notification error:', error);
    }
  }

  private async sendWebhookNotification(event: NotificationEvent): Promise<void> {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.log('Webhook URL not configured');
        return;
      }
      
      const payload = {
        event: event.type,
        userId: event.userId,
        data: event.data,
        metadata: event.metadata,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Webhook notification error:', error);
    }
  }

  private generateEmailContent(event: NotificationEvent): { subject: string; html: string; text: string } {
    const { type, data, metadata } = event;
    
    switch (type) {
      case 'user_registration':
        return {
          subject: `Новая регистрация: ${data.username}`,
          html: `
            <h2>Новый пользователь зарегистрировался</h2>
            <p><strong>Имя пользователя:</strong> ${data.username}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Роль:</strong> ${data.role}</p>
            <p><strong>IP адрес:</strong> ${metadata?.ipAddress || 'Неизвестно'}</p>
            <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
          `,
          text: `Новый пользователь зарегистрировался: ${data.username} (${data.email})`
        };
        
      case 'user_blocked':
        return {
          subject: `Пользователь заблокирован: ${data.username}`,
          html: `
            <h2>Пользователь заблокирован</h2>
            <p><strong>Имя пользователя:</strong> ${data.username}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Причина:</strong> ${data.reason}</p>
            <p><strong>Заблокирован:</strong> ${data.blockedBy}</p>
            <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
          `,
          text: `Пользователь заблокирован: ${data.username}. Причина: ${data.reason}`
        };
        
      case 'new_device_login':
        return {
          subject: `Вход с нового устройства: ${data.username}`,
          html: `
            <h2>Вход с нового устройства</h2>
            <p><strong>Пользователь:</strong> ${data.username}</p>
            <p><strong>IP адрес:</strong> ${metadata?.ipAddress || 'Неизвестно'}</p>
            <p><strong>User Agent:</strong> ${metadata?.userAgent || 'Неизвестно'}</p>
            <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
          `,
          text: `Вход с нового устройства: ${data.username} с IP ${metadata?.ipAddress}`
        };
        
      case 'fraud_alert':
        return {
          subject: `🚨 Фрод-алерт: ${data.type}`,
          html: `
            <h2 style="color: red;">Обнаружена подозрительная активность</h2>
            <p><strong>Тип алерта:</strong> ${data.type}</p>
            <p><strong>Пользователь:</strong> ${data.username}</p>
            <p><strong>Серьезность:</strong> ${data.severity}</p>
            <p><strong>Описание:</strong> ${data.description}</p>
            <p><strong>IP адрес:</strong> ${metadata?.ipAddress || 'Неизвестно'}</p>
            <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
          `,
          text: `Фрод-алерт: ${data.type} для пользователя ${data.username}`
        };
        
      default:
        return {
          subject: `Системное уведомление: ${type}`,
          html: `<p>Системное событие: ${type}</p><pre>${JSON.stringify(data, null, 2)}</pre>`,
          text: `Системное событие: ${type}`
        };
    }
  }

  private generateTelegramMessage(event: NotificationEvent): string {
    const { type, data, metadata } = event;
    
    switch (type) {
      case 'user_registration':
        return `
🆕 <b>Новая регистрация</b>
👤 Пользователь: ${data.username}
📧 Email: ${data.email}
🎭 Роль: ${data.role}
🌐 IP: ${metadata?.ipAddress || 'Неизвестно'}
⏰ ${new Date().toLocaleString()}
        `.trim();
        
      case 'user_blocked':
        return `
🚫 <b>Пользователь заблокирован</b>
👤 Пользователь: ${data.username}
📧 Email: ${data.email}
⚠️ Причина: ${data.reason}
👮 Заблокирован: ${data.blockedBy}
⏰ ${new Date().toLocaleString()}
        `.trim();
        
      case 'new_device_login':
        return `
🔐 <b>Вход с нового устройства</b>
👤 Пользователь: ${data.username}
🌐 IP: ${metadata?.ipAddress || 'Неизвестно'}
💻 Устройство: ${metadata?.userAgent || 'Неизвестно'}
⏰ ${new Date().toLocaleString()}
        `.trim();
        
      case 'fraud_alert':
        return `
🚨 <b>ФРОД-АЛЕРТ</b>
⚠️ Тип: ${data.type}
👤 Пользователь: ${data.username}
🔥 Серьезность: ${data.severity}
📝 ${data.description}
🌐 IP: ${metadata?.ipAddress || 'Неизвестно'}
⏰ ${new Date().toLocaleString()}
        `.trim();
        
      default:
        return `📊 Системное событие: ${type}`;
    }
  }

  private async logEvent(event: NotificationEvent): Promise<void> {
    try {
      // Log to console for now - in production, save to database
      console.log('Event logged:', {
        type: event.type,
        userId: event.userId,
        timestamp: new Date().toISOString(),
        data: event.data
      });
    } catch (error) {
      console.error('Event logging error:', error);
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): NotificationSettings {
    return this.settings;
  }
}

export const notificationService = new NotificationService();

// Helper functions for common notifications
export const notifyUserRegistration = (userData: any, metadata?: any) => {
  return notificationService.sendNotification({
    type: 'user_registration',
    userId: userData.id,
    data: userData,
    metadata
  });
};

export const notifyUserBlocked = (userData: any, reason: string, blockedBy: string, metadata?: any) => {
  return notificationService.sendNotification({
    type: 'user_blocked',
    userId: userData.id,
    data: { ...userData, reason, blockedBy },
    metadata
  });
};

export const notifyNewDeviceLogin = (userData: any, metadata?: any) => {
  return notificationService.sendNotification({
    type: 'new_device_login',
    userId: userData.id,
    data: userData,
    metadata
  });
};

export const notifyFraudAlert = (alertData: any, metadata?: any) => {
  return notificationService.sendNotification({
    type: 'fraud_alert',
    userId: alertData.userId,
    data: alertData,
    metadata
  });
};