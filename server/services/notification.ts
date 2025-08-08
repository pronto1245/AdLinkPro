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

// Import dependencies for additional notification functions
import { db } from '../db';
import { userNotifications } from '@shared/schema';
import type { User } from '@shared/schema';

// Уведомление рекламодателю о новом запросе доступа к офферу
export async function notifyOfferAccessRequest(
  advertiser: User, 
  partner: User, 
  offer: any, 
  requestMessage?: string
) {
  try {
    await db.insert(userNotifications).values({
      userId: advertiser.id,
      type: 'offer_access_request',
      title: 'Новый запрос доступа к офферу',
      message: `Партнёр ${partner.username} запросил доступ к офферу "${offer.name}"`,
      data: { 
        partnerId: partner.id, 
        partnerUsername: partner.username,
        offerId: offer.id, 
        offerName: offer.name,
        requestMessage 
      },
      channel: 'system',
      status: 'sent'
    });

    console.log(`Offer access request notification sent to advertiser ${advertiser.username}`);
  } catch (error) {
    console.error('Error sending offer access request notification:', error);
  }
}

// Уведомление партнёру об одобрении запроса доступа
export async function notifyOfferAccessApproved(
  partner: User, 
  advertiser: User, 
  offer: any, 
  responseMessage?: string
) {
  try {
    await db.insert(userNotifications).values({
      userId: partner.id,
      type: 'offer_access_approved',
      title: 'Запрос доступа одобрен',
      message: `Ваш запрос доступа к офферу "${offer.name}" одобрен`,
      data: { 
        advertiserId: advertiser.id,
        advertiserUsername: advertiser.username,
        offerId: offer.id, 
        offerName: offer.name,
        responseMessage 
      },
      channel: 'system',
      status: 'sent'
    });

    console.log(`Offer access approved notification sent to partner ${partner.username}`);
  } catch (error) {
    console.error('Error sending offer access approved notification:', error);
  }
}

// Уведомление партнёру об отклонении запроса доступа
export async function notifyOfferAccessRejected(
  partner: User, 
  advertiser: User, 
  offer: any, 
  responseMessage?: string
) {
  try {
    await db.insert(userNotifications).values({
      userId: partner.id,
      type: 'offer_access_rejected',
      title: 'Запрос доступа отклонён',
      message: `Ваш запрос доступа к офферу "${offer.name}" отклонён`,
      data: { 
        advertiserId: advertiser.id,
        advertiserUsername: advertiser.username,
        offerId: offer.id, 
        offerName: offer.name,
        responseMessage 
      },
      channel: 'system',
      status: 'sent'
    });

    console.log(`Offer access rejected notification sent to partner ${partner.username}`);
  } catch (error) {
    console.error('Error sending offer access rejected notification:', error);
  }
}