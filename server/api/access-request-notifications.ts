import { Express } from 'express';
import { authenticateToken, requireRole, getAuthenticatedUser } from '../middleware/auth';
import { storage } from '../storage';
import { notificationService } from '../services/notification';

export function setupAccessRequestNotifications(app: Express) {
  
  // Webhook для обработки изменений статуса запросов доступа
  app.post('/api/access-requests/:requestId/notify', authenticateToken, async (req, res) => {
    try {
      const { requestId } = req.params;
      const { action, userId, metadata } = req.body;
      
      // Получаем детали запроса
      const request = await storage.getOfferAccessRequestById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Получаем детали оффера и пользователей
      const offer = await storage.getOffer(request.offerId);
      const partner = await storage.getUser(request.partnerId);
      const advertiser = await storage.getUser(request.advertiserId);
      
      // Отправляем уведомления в зависимости от действия
      switch (action) {
        case 'request_created':
          // Уведомляем рекламодателя о новом запросе
          await notificationService.sendNotification({
            userId: advertiser.id,
            type: 'access_request',
            title: 'Новый запрос доступа',
            message: `Партнер ${partner.username} запрашивает доступ к офферу "${offer.name}"`,
            data: {
              requestId,
              offerId: offer.id,
              partnerId: partner.id,
              action: 'view_request'
            }
          });
          break;
          
        case 'request_approved':
          // Уведомляем партнера об одобрении
          await notificationService.sendNotification({
            userId: partner.id,
            type: 'access_approved',
            title: 'Запрос одобрен! 🎉',
            message: `Ваш запрос на доступ к офферу "${offer.name}" был одобрен`,
            data: {
              requestId,
              offerId: offer.id,
              action: 'get_offer_link'
            }
          });
          
          // Отправляем email уведомление
          await notificationService.sendEmail({
            to: partner.email,
            subject: `Запрос доступа одобрен - ${offer.name}`,
            template: 'access_request_approved',
            data: {
              partnerName: partner.firstName || partner.username,
              offerName: offer.name,
              advertiserCompany: advertiser.company || advertiser.username,
              loginUrl: `${process.env.APP_URL}/affiliate/offers`
            }
          });
          break;
          
        case 'request_rejected':
          // Уведомляем партнера об отклонении
          await notificationService.sendNotification({
            userId: partner.id,
            type: 'access_rejected',
            title: 'Запрос отклонен',
            message: `Ваш запрос на доступ к офферу "${offer.name}" был отклонен`,
            data: {
              requestId,
              offerId: offer.id,
              reason: metadata?.reason || 'Не указано'
            }
          });
          break;
          
        case 'access_revoked':
          // Уведомляем партнера об отзыве доступа
          await notificationService.sendNotification({
            userId: partner.id,
            type: 'access_revoked',
            title: 'Доступ отозван',
            message: `Доступ к офферу "${offer.name}" был отозван`,
            data: {
              requestId,
              offerId: offer.id,
              reason: metadata?.reason || 'Не указано'
            }
          });
          break;
      }
      
      res.json({ success: true });
      
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });
  
  // Получение уведомлений пользователя связанных с запросами доступа
  app.get('/api/access-requests/notifications', authenticateToken, async (req, res) => {
    try {
      const userId = getAuthenticatedUser(req).id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const notifications = await notificationService.getUserNotifications({
        userId,
        types: ['access_request', 'access_approved', 'access_rejected', 'access_revoked'],
        page: Number(page),
        limit: Number(limit),
        unreadOnly: unreadOnly === 'true'
      });
      
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  });
  
  // Отметить уведомление как прочитанное
  app.patch('/api/access-requests/notifications/:notificationId/read', authenticateToken, async (req, res) => {
    try {
      const userId = getAuthenticatedUser(req).id;
      const { notificationId } = req.params;
      
      await notificationService.markAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });
}

// Вспомогательная функция для отправки уведомления при изменении статуса
export async function notifyAccessRequestStatusChange(
  requestId: string, 
  action: string, 
  metadata?: any
) {
  try {
    // Отправляем внутренний запрос для обработки уведомлений
    const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/access-requests/${requestId}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || 'internal'}`
      },
      body: JSON.stringify({
        action,
        metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log(`Notification sent for request ${requestId}, action: ${action}`);
  } catch (error) {
    console.error('Failed to send access request notification:', error);
  }
}