import { sendEmail } from './email';
import { db } from '../db';
import { userNotifications, type User } from '../../shared/schema';

export interface NotificationEvent {
  type: 'user_registration' | 'user_blocked' | 'new_device_login' | 'fraud_detected' | 'payment_received' | 'new_referral' | 'referral_earning' | 'postback_failed' | 'postback_success_rate_low' | 'postback_high_error_rate';
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

      case 'postback_failed':
        return {
          to: process.env.ADMIN_EMAIL || 'admin@platform.com',
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: '🚨 Postback Failed Alert',
          html: `
            <h2>Postback Delivery Failed</h2>
            <p>A postback failed to deliver. Details:</p>
            <ul>
              <li>Template ID: ${data.templateId}</li>
              <li>Click ID: ${data.clickId}</li>
              <li>Partner: ${data.partnerName || data.partnerId}</li>
              <li>URL: ${data.url}</li>
              <li>Error: ${data.error}</li>
              <li>Retry Attempt: ${data.retryAttempt}/${data.maxRetries}</li>
              <li>Time: ${new Date(data.timestamp).toLocaleString('ru-RU')}</li>
            </ul>
            <p>Please check the postback configuration and partner tracker availability.</p>
          `,
          text: `Postback failed: ${data.error}. Template: ${data.templateId}, Click: ${data.clickId}`
        };

      case 'postback_success_rate_low':
        return {
          to: process.env.ADMIN_EMAIL || 'admin@platform.com',
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: '⚠️ Postback Success Rate Low Alert',
          html: `
            <h2>Low Postback Success Rate Detected</h2>
            <p>The postback success rate has dropped below the threshold:</p>
            <ul>
              <li>Current Success Rate: ${data.successRate}%</li>
              <li>Threshold: ${data.threshold}%</li>
              <li>Time Period: Last ${data.periodHours} hours</li>
              <li>Total Postbacks: ${data.totalPostbacks}</li>
              <li>Failed Postbacks: ${data.failedPostbacks}</li>
              <li>Most Common Error: ${data.mostCommonError}</li>
            </ul>
            <p>Investigate tracker connectivity and postback configurations.</p>
            <a href="${process.env.BASE_URL}/admin/postbacks/analytics">View Analytics Dashboard</a>
          `,
          text: `Postback success rate low: ${data.successRate}% (threshold: ${data.threshold}%)`
        };

      case 'postback_high_error_rate':
        return {
          to: process.env.ADMIN_EMAIL || 'admin@platform.com',
          from: process.env.FROM_EMAIL || 'noreply@platform.com',
          subject: '🚨 High Postback Error Rate Alert',
          html: `
            <h2>High Postback Error Rate Alert</h2>
            <p>Excessive postback errors detected:</p>
            <ul>
              <li>Error Rate: ${data.errorRate}%</li>
              <li>Error Count: ${data.errorCount}</li>
              <li>Time Period: Last ${data.periodMinutes} minutes</li>
              <li>Primary Error Type: ${data.primaryErrorType}</li>
              <li>Affected Partners: ${data.affectedPartners}</li>
              <li>Affected Templates: ${data.affectedTemplates}</li>
            </ul>
            <p>Immediate attention required. Check server connectivity and partner tracker status.</p>
            <a href="${process.env.BASE_URL}/admin/postbacks/logs">View Error Logs</a>
          `,
          text: `High postback error rate: ${data.errorRate}%. ${data.errorCount} errors in ${data.periodMinutes} minutes.`
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

    // Сохраняем уведомление в базу данных
    await db.insert(userNotifications).values({
      userId: referrer.id,
      type: 'referral_joined',
      title: '🎉 Новый реферал!',
      message: `Пользователь ${referredUser.username} зарегистрировался по вашей ссылке. Комиссия: 5%`, _data: {
        referredUser: referredUser.username,
        referredEmail: referredUser.email,
        commissionRate: '5'
      },
      channel: 'system',
      status: 'sent',
      isRead: false
    });

    console.log('✅ Referral notification saved to database');

    // Отправляем email уведомление (если настроен SendGrid)
    const notificationService = NotificationService.getInstance();
    await notificationService.sendNotification({
      type: 'new_referral',
      userId: referrer.id, _data: {
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

    // Сохраняем уведомление в базу данных
    await db.insert(userNotifications).values({
      userId: referrer.id,
      type: 'referral_commission',
      title: '💰 Реферальная комиссия!',
      message: `Вы получили $${earningData.commissionAmount} комиссии от ${earningData.referredUser}`, _data: {
        commissionAmount: earningData.commissionAmount,
        referredUser: earningData.referredUser,
        originalAmount: earningData.originalAmount
      },
      channel: 'system',
      status: 'sent',
      isRead: false
    });

    console.log('✅ Earning notification saved to database');

    // Отправляем email уведомление
    const notificationService = NotificationService.getInstance();
    await notificationService.sendNotification({
      type: 'referral_earning',
      userId: referrer.id, _data: {
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
      message: `Партнёр ${partner.username} запросил доступ к офферу "${offer.name}"`, _data: {
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
    if ((globalThis as any).sendWebSocketNotification) {
      (globalThis as any).sendWebSocketNotification(advertiser.id, {
        type: 'offer_access_request', _data: {
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
      message: `Ваш запрос доступа к офферу "${offer.name}" одобрен`, _data: {
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
    if ((globalThis as any).sendWebSocketNotification) {
      (globalThis as any).sendWebSocketNotification(partner.id, {
        type: 'offer_access_response', _data: {
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
      message: `Ваш запрос доступа к офферу "${offer.name}" отклонён`, _data: {
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
    if ((globalThis as any).sendWebSocketNotification) {
      (globalThis as any).sendWebSocketNotification(partner.id, {
        type: 'offer_access_response', _data: {
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
