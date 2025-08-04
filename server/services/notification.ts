import { sendEmail } from './email';

export interface NotificationEvent {
  type: 'user_registration' | 'user_blocked' | 'new_device_login' | 'fraud_detected' | 'payment_received';
  userId: string;
  data: any;
  timestamp: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationEvent[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendNotification(event: NotificationEvent): Promise<void> {
    try {
      // Store notification
      this.notifications.push(event);

      // Send email notification based on event type
      await this.sendEmailNotification(event);

      // Log notification
      console.log(`Notification sent: ${event.type} for user ${event.userId}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  private async sendEmailNotification(event: NotificationEvent): Promise<void> {
    const emailConfig = this.getEmailConfig(event);
    
    if (emailConfig) {
      await sendEmail(emailConfig);
    }
  }

  private getEmailConfig(event: NotificationEvent): any {
    const { type, data } = event;

    switch (type) {
      case 'user_registration':
        return {
          to: data.email,
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: 'Добро пожаловать в платформу!',
          html: `
            <h2>Регистрация завершена</h2>
            <p>Здравствуйте, ${data.firstName || data.username}!</p>
            <p>Ваш аккаунт успешно создан. Добро пожаловать в нашу платформу!</p>
            <p>Данные для входа:</p>
            <ul>
              <li>Email: ${data.email}</li>
              <li>Роль: ${data.role}</li>
            </ul>
          `,
          text: `Регистрация завершена. Добро пожаловать, ${data.firstName || data.username}!`
        };

      case 'user_blocked':
        return {
          to: data.email,
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: 'Ваш аккаунт заблокирован',
          html: `
            <h2>Аккаунт заблокирован</h2>
            <p>Ваш аккаунт был заблокирован администратором.</p>
            <p>Причина: ${data.reason || 'Не указана'}</p>
            <p>Для получения дополнительной информации обратитесь в службу поддержки.</p>
          `,
          text: `Ваш аккаунт заблокирован. Причина: ${data.reason || 'Не указана'}`
        };

      case 'new_device_login':
        return {
          to: data.email,
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: 'Вход с нового устройства',
          html: `
            <h2>Обнаружен вход с нового устройства</h2>
            <p>Зафиксирован вход в ваш аккаунт с нового устройства:</p>
            <ul>
              <li>IP адрес: ${data.ip}</li>
              <li>Время: ${new Date().toLocaleString('ru-RU')}</li>
              <li>User Agent: ${data.userAgent || 'Неизвестно'}</li>
            </ul>
            <p>Если это были не вы, немедленно обратитесь в службу поддержки.</p>
          `,
          text: `Вход с нового устройства. IP: ${data.ip}, Время: ${new Date().toLocaleString('ru-RU')}`
        };

      case 'fraud_detected':
        return {
          to: process.env.ADMIN_EMAIL || 'admin@platform.com',
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: 'Обнаружена подозрительная активность',
          html: `
            <h2>Fraud Alert</h2>
            <p>Обнаружена подозрительная активность:</p>
            <ul>
              <li>Пользователь: ${data.userId}</li>
              <li>Тип: ${data.fraudType}</li>
              <li>Описание: ${data.description}</li>
              <li>IP: ${data.ip}</li>
              <li>Время: ${new Date().toLocaleString('ru-RU')}</li>
            </ul>
          `,
          text: `Fraud Alert: ${data.fraudType} от пользователя ${data.userId}`
        };

      default:
        return null;
    }
  }

  getNotifications(userId?: string): NotificationEvent[] {
    if (userId) {
      return this.notifications.filter(n => n.userId === userId);
    }
    return this.notifications;
  }

  clearNotifications(userId?: string): void {
    if (userId) {
      this.notifications = this.notifications.filter(n => n.userId !== userId);
    } else {
      this.notifications = [];
    }
  }
}

export const notificationService = NotificationService.getInstance();