import { db } from '../db';
import { userNotifications } from '@shared/schema';
import { randomUUID } from 'crypto';

// Типы уведомлений для различных событий платформы
export type NotificationType = 
  // Партнеры
  | 'partner_joined' | 'partner_approved' | 'partner_blocked' | 'partner_payout_requested'
  // Офферы
  | 'offer_created' | 'offer_updated' | 'offer_paused' | 'offer_activated' | 'offer_request_created' | 'offer_request_approved' | 'offer_request_rejected'
  // Антифрод
  | 'antifraud_alert' | 'suspicious_activity' | 'fraud_blocked' | 'high_risk_detected'
  // Финансы
  | 'payment_received' | 'payment_processed' | 'payout_completed' | 'balance_low' | 'commission_earned'
  // Система
  | 'maintenance_scheduled' | 'system_update' | 'api_limit_reached' | 'domain_verified' | 'ssl_renewed'
  // Конверсии и статистика
  | 'conversion_spike' | 'performance_alert' | 'goal_achieved' | 'new_lead'
  // Реферальная система
  | 'referral_joined' | 'referral_commission' | 'referral_goal_reached';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// Основная функция для создания уведомлений
export async function createNotification(data: NotificationData): Promise<void> {
  try {
    await db.insert(userNotifications).values({
      id: randomUUID(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Отправляем WebSocket уведомление для реального времени
    if (global.sendWebSocketNotification) {
      global.sendWebSocketNotification(data.userId, {
        type: 'notification',
        data: {
          type: data.priority === 'urgent' ? 'error' : data.priority === 'high' ? 'warning' : 'info',
          title: data.title,
          message: data.message,
          metadata: data.metadata
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Notification created: ${data.type} for user ${data.userId}`);
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
  }
}

// Специфические функции для различных событий платформы

// === ПАРТНЕРЫ ===
export async function notifyPartnerJoined(advertiserId: string, partnerData: any) {
  await createNotification({
    userId: advertiserId,
    type: 'partner_joined',
    title: '🤝 Новый партнер присоединился',
    message: `Партнер "${partnerData.username}" успешно зарегистрировался в вашей партнерской программе`,
    metadata: {
      partnerId: partnerData.id,
      partnerUsername: partnerData.username,
      partnerEmail: partnerData.email,
      country: partnerData.country
    },
    priority: 'medium'
  });
}

export async function notifyPartnerBlocked(advertiserId: string, partnerData: any, reason: string) {
  await createNotification({
    userId: advertiserId,
    type: 'partner_blocked',
    title: '🚫 Партнер заблокирован',
    message: `Партнер "${partnerData.username}" был заблокирован по причине: ${reason}`,
    metadata: {
      partnerId: partnerData.id,
      partnerUsername: partnerData.username,
      blockReason: reason
    },
    priority: 'high'
  });
}

// === ОФФЕРЫ ===
export async function notifyOfferCreated(advertiserId: string, offerData: any) {
  await createNotification({
    userId: advertiserId,
    type: 'offer_created',
    title: '🎯 Новый оффер создан',
    message: `Оффер "${offerData.name}" успешно создан и готов к работе`,
    metadata: {
      offerId: offerData.id,
      offerName: offerData.name,
      payout: offerData.payout,
      category: offerData.category
    },
    priority: 'medium'
  });
}

export async function notifyOfferRequestCreated(advertiserId: string, requestData: any) {
  await createNotification({
    userId: advertiserId,
    type: 'offer_request_created',
    title: '📋 Новая заявка на оффер',
    message: `Партнер "${requestData.partnerName}" запросил доступ к офферу "${requestData.offerName}"`,
    metadata: {
      requestId: requestData.id,
      partnerId: requestData.partnerId,
      partnerName: requestData.partnerName,
      offerId: requestData.offerId,
      offerName: requestData.offerName,
      requestMessage: requestData.message
    },
    priority: 'high'
  });
}

// === АНТИФРОД ===
export async function notifyAntifraudAlert(userId: string, alertData: any) {
  await createNotification({
    userId: userId,
    type: 'antifraud_alert',
    title: '⚠️ Антифрод предупреждение',
    message: `Обнаружена подозрительная активность: ${alertData.description}`,
    metadata: {
      alertId: alertData.id,
      riskLevel: alertData.riskLevel,
      type: alertData.type,
      ip: alertData.ip,
      details: alertData.details
    },
    priority: 'urgent'
  });
}

export async function notifyHighRiskDetected(userId: string, riskData: any) {
  await createNotification({
    userId: userId,
    type: 'high_risk_detected',
    title: '🔴 Высокий риск фрода',
    message: `Система обнаружила высокий риск фрода по офферу "${riskData.offerName}"`,
    metadata: {
      offerId: riskData.offerId,
      offerName: riskData.offerName,
      riskScore: riskData.riskScore,
      indicators: riskData.indicators
    },
    priority: 'urgent'
  });
}

// === ФИНАНСЫ ===
export async function notifyPaymentReceived(userId: string, paymentData: any) {
  await createNotification({
    userId: userId,
    type: 'payment_received',
    title: '💰 Платеж получен',
    message: `Поступил платеж на сумму ${paymentData.amount} ${paymentData.currency}`,
    metadata: {
      paymentId: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method
    },
    priority: 'medium'
  });
}

export async function notifyPayoutCompleted(userId: string, payoutData: any) {
  await createNotification({
    userId: userId,
    type: 'payout_completed',
    title: '✅ Выплата завершена',
    message: `Выплата в размере ${payoutData.amount} ${payoutData.currency} успешно обработана`,
    metadata: {
      payoutId: payoutData.id,
      amount: payoutData.amount,
      currency: payoutData.currency,
      method: payoutData.method,
      recipient: payoutData.recipient
    },
    priority: 'high'
  });
}

export async function notifyCommissionEarned(userId: string, commissionData: any) {
  await createNotification({
    userId: userId,
    type: 'commission_earned',
    title: '💎 Комиссия начислена',
    message: `Получена комиссия ${commissionData.amount} ${commissionData.currency} за конверсию`,
    metadata: {
      conversionId: commissionData.conversionId,
      amount: commissionData.amount,
      currency: commissionData.currency,
      offerName: commissionData.offerName
    },
    priority: 'medium'
  });
}

// === СИСТЕМА ===
export async function notifyMaintenanceScheduled(userId: string, maintenanceData: any) {
  await createNotification({
    userId: userId,
    type: 'maintenance_scheduled',
    title: '🔧 Плановое обслуживание',
    message: `Запланировано техническое обслуживание с ${maintenanceData.startTime} до ${maintenanceData.endTime}`,
    metadata: {
      startTime: maintenanceData.startTime,
      endTime: maintenanceData.endTime,
      description: maintenanceData.description
    },
    priority: 'medium'
  });
}

export async function notifyDomainVerified(userId: string, domainData: any) {
  await createNotification({
    userId: userId,
    type: 'domain_verified',
    title: '🌐 Домен подтвержден',
    message: `Домен "${domainData.domain}" успешно верифицирован и готов к использованию`,
    metadata: {
      domain: domainData.domain,
      sslStatus: domainData.sslStatus
    },
    priority: 'high'
  });
}

// === КОНВЕРСИИ ===
export async function notifyNewLead(userId: string, leadData: any) {
  await createNotification({
    userId: userId,
    type: 'new_lead',
    title: '🎯 Новый лид',
    message: `Получен новый лид по офферу "${leadData.offerName}" от партнера "${leadData.partnerName}"`,
    metadata: {
      leadId: leadData.id,
      offerId: leadData.offerId,
      offerName: leadData.offerName,
      partnerId: leadData.partnerId,
      partnerName: leadData.partnerName,
      payout: leadData.payout
    },
    priority: 'medium'
  });
}

export async function notifyConversionSpike(userId: string, spikeData: any) {
  await createNotification({
    userId: userId,
    type: 'conversion_spike',
    title: '📈 Всплеск конверсий',
    message: `Резкий рост конверсий по офферу "${spikeData.offerName}" - ${spikeData.increase}% за последний час`,
    metadata: {
      offerId: spikeData.offerId,
      offerName: spikeData.offerName,
      increase: spikeData.increase,
      currentRate: spikeData.currentRate
    },
    priority: 'high'
  });
}

// === РЕФЕРАЛЬНАЯ СИСТЕМА ===
export async function notifyReferralJoined(userId: string, referralData: any) {
  await createNotification({
    userId: userId,
    type: 'referral_joined',
    title: '👥 Новый реферал',
    message: `По вашей реферальной ссылке зарегистрировался новый партнер "${referralData.username}"`,
    metadata: {
      referralId: referralData.id,
      referralUsername: referralData.username,
      referralCode: referralData.referralCode
    },
    priority: 'medium'
  });
}

export async function notifyReferralCommission(userId: string, commissionData: any) {
  await createNotification({
    userId: userId,
    type: 'referral_commission',
    title: '💰 Реферальная комиссия',
    message: `Получена реферальная комиссия ${commissionData.amount} ${commissionData.currency} от активности вашего реферала`,
    metadata: {
      amount: commissionData.amount,
      currency: commissionData.currency,
      referralName: commissionData.referralName,
      source: commissionData.source
    },
    priority: 'high'
  });
}