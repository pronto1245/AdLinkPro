import { sendEmail } from './email';

export interface NotificationEvent {
  type: 'user_registration' | 'user_blocked' | 'new_device_login' | 'fraud_detected' | 'payment_received' | 'new_referral' | 'referral_earning';
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
          subject: 'Регистрация прошла успешно',
          html: `
            <h2>Регистрация прошла успешно</h2>
            <p>Здравствуйте, ${data.firstName || data.username}!</p>
            <p>Регистрация прошла успешно. С вами свяжется наш менеджер для активации аккаунта в течение 24 часов.</p>
            <p>Данные для входа:</p>
            <ul>
              <li>Email: ${data.email}</li>
              <li>Роль: ${data.role}</li>
            </ul>
          `,
          text: `Регистрация прошла успешно. С вами свяжется наш менеджер для активации аккаунта в течение 24 часов.`
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

      case 'new_referral':
        return {
          to: data.email,
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: '🎉 У вас новый реферал!',
          html: `
            <h2>Поздравляем! У вас новый реферал!</h2>
            <p>Пользователь <strong>${data.referredUser}</strong> зарегистрировался по вашей реферальной ссылке.</p>
            <p>Теперь вы будете получать ${data.commissionRate}% с его доходов!</p>
            <p><strong>Детали:</strong></p>
            <ul>
              <li>Имя пользователя: ${data.referredUser}</li>
              <li>Email: ${data.referredEmail}</li>
              <li>Дата регистрации: ${new Date().toLocaleDateString('ru-RU')}</li>
              <li>Ваша комиссия: ${data.commissionRate}%</li>
            </ul>
            <p>Продолжайте приглашать новых партнеров и увеличивайте свой доход!</p>
          `,
          text: `У вас новый реферал: ${data.referredUser}. Ваша комиссия: ${data.commissionRate}%`
        };

      case 'referral_earning':
        return {
          to: data.email,
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: '💰 Вы получили реферальную комиссию!',
          html: `
            <h2>Реферальная комиссия начислена!</h2>
            <p>Ваш реферал <strong>${data.referredUser}</strong> получил выплату, и вам начислена комиссия!</p>
            <p><strong>Детали начисления:</strong></p>
            <ul>
              <li>Сумма комиссии: <strong>$${data.commissionAmount}</strong></li>
              <li>Оригинальная выплата: $${data.originalAmount}</li>
              <li>Реферал: ${data.referredUser}</li>
              <li>Дата: ${new Date().toLocaleDateString('ru-RU')}</li>
            </ul>
            <p>Комиссия будет добавлена к вашему следующему платежу.</p>
            <p>Приглашайте больше партнеров для увеличения дохода!</p>
          `,
          text: `Реферальная комиссия: $${data.commissionAmount} от ${data.referredUser}`
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
}

// Функции для реферальных уведомлений
export async function notifyNewReferral(referrer: any, referredUser: any): Promise<void> {
  try {
    console.log('🔗 Sending new referral notification to:', referrer.username);
    
    const { db } = await import('../db');
    const { notifications } = await import('@shared/schema');
    
    // Сохраняем уведомление в базу данных
    await db.insert(notifications).values({
      userId: referrer.id,
      type: 'info',
      title: '🎉 Новый реферал!',
      message: `Пользователь ${referredUser.username} зарегистрировался по вашей ссылке. Комиссия: 5%`,
      data: {
        referredUser: referredUser.username,
        referredEmail: referredUser.email,
        commissionRate: '5'
      },
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Referral notification saved to database');
    
    // Отправляем email уведомление (если настроен SendGrid)
    const notificationService = NotificationService.getInstance();
    await notificationService.sendNotification({
      type: 'new_referral',
      userId: referrer.id,
      data: {
        email: referrer.email,
        referredUser: referredUser.username,
        referredEmail: referredUser.email,
        commissionRate: '5'
      },
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error sending referral notification:', error);
  }
}

export async function notifyReferralEarning(referrer: any, earningData: any): Promise<void> {
  try {
    console.log('💰 Sending referral earning notification to:', referrer.username);
    
    const { db } = await import('../db');
    const { notifications } = await import('@shared/schema');
    
    // Сохраняем уведомление в базу данных
    await db.insert(notifications).values({
      userId: referrer.id,
      type: 'success',
      title: '💰 Реферальная комиссия!',
      message: `Вы получили $${earningData.commissionAmount} комиссии от ${earningData.referredUser}`,
      data: {
        commissionAmount: earningData.commissionAmount,
        referredUser: earningData.referredUser,
        originalAmount: earningData.originalAmount
      },
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Earning notification saved to database');
    
    // Отправляем email уведомление
    const notificationService = NotificationService.getInstance();
    await notificationService.sendNotification({
      type: 'referral_earning',
      userId: referrer.id,
      data: {
        email: referrer.email,
        commissionAmount: earningData.commissionAmount,
        referredUser: earningData.referredUser,
        originalAmount: earningData.originalAmount
      },
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error sending earning notification:', error);
  }
}

// Эспорт экземпляра сервиса для использования в других модулях
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

    // Отправляем WebSocket уведомление
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(advertiser.id, {
        type: 'offer_access_request',
        data: {
          partnerUsername: partner.username,
          offerName: offer.name,
          requestMessage
        },
        timestamp: new Date().toISOString()
      });
    }

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

    // Отправляем WebSocket уведомление
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(partner.id, {
        type: 'offer_access_response',
        data: {
          status: 'approved',
          offerName: offer.name,
          advertiserUsername: advertiser.username,
          responseMessage
        },
        timestamp: new Date().toISOString()
      });
    }

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

    // Отправляем WebSocket уведомление
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(partner.id, {
        type: 'offer_access_response',
        data: {
          status: 'rejected',
          offerName: offer.name,
          advertiserUsername: advertiser.username,
          responseMessage
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Offer access rejected notification sent to partner ${partner.username}`);
  } catch (error) {
    console.error('Error sending offer access rejected notification:', error);
  }
}