import { Router } from 'express';
import { db } from '../db';
import { userNotifications, users } from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all notifications for authenticated user
router.get('/notifications', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 GET /notifications for user:', userId);
    
    const notifications = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId))
      .orderBy(desc(userNotifications.createdAt))
      .limit(100);

    // Transform for frontend compatibility
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: notification.isRead,
      created_at: notification.createdAt,
      metadata: notification.data || {}
    }));

    console.log(`📋 Found ${notifications.length} notifications for user ${userId}`);
    res.json(formattedNotifications);

  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark single notification as read
router.put('/notifications/:id/read', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    console.log('✅ PUT /notifications/:id/read for user:', userId, 'notification:', notificationId);
    
    // Verify notification belongs to user and mark as read
    const result = await db
      .update(userNotifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      console.log('❌ Notification not found or not owned by user');
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log('✅ Notification marked as read successfully');
    
    // Send WebSocket update to notify real-time UI changes
    if ((global as any).sendWebSocketNotification) {
      (global as any).sendWebSocketNotification(userId, {
        type: 'notification_read',
        data: { notificationId, status: 'read' },
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Notification marked as read' });

  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for user
router.put('/notifications/mark-all-read', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    console.log('✅ PUT /notifications/mark-all-read for user:', userId);
    
    const result = await db
      .update(userNotifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      ))
      .returning();

    console.log(`✅ Marked ${result.length} notifications as read for user ${userId}`);
    
    // Send WebSocket update to notify real-time UI changes
    if ((global as any).sendWebSocketNotification) {
      (global as any).sendWebSocketNotification(userId, {
        type: 'notifications_all_read',
        data: { count: result.length },
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      success: true, 
      message: `Marked ${result.length} notifications as read`,
      count: result.length 
    });

  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete single notification
router.delete('/notifications/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    console.log('🗑️ DELETE /notifications/:id for user:', userId, 'notification:', notificationId);
    
    // Verify notification belongs to user and delete
    const result = await db
      .delete(userNotifications)
      .where(and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      console.log('❌ Notification not found or not owned by user');
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log('🗑️ Notification deleted successfully');
    
    // Send WebSocket update to notify real-time UI changes
    if ((global as any).sendWebSocketNotification) {
      (global as any).sendWebSocketNotification(userId, {
        type: 'notification_deleted',
        data: { notificationId },
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Notification deleted' });

  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification counts and stats
router.get('/notifications/stats', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📊 GET /notifications/stats for user:', userId);
    
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));

    const [unreadCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userNotifications)
      .where(and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      ));

    const stats = {
      total: totalCount.count,
      unread: unreadCount.count,
      read: totalCount.count - unreadCount.count
    };

    console.log('📊 Notification stats:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

// Subscribe to push notifications
router.post('/notifications/push-subscribe', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;
    
    console.log('📱 POST /notifications/push-subscribe for user:', userId);
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Store push subscription in database (would need push_subscriptions table)
    // For now, we'll store it in the user settings
    await db
      .update(users)
      .set({
        settings: sql`
          CASE 
            WHEN settings IS NULL THEN jsonb_build_object('pushSubscription', ${JSON.stringify(subscription)})
            ELSE settings || jsonb_build_object('pushSubscription', ${JSON.stringify(subscription)})
          END
        `
      })
      .where(eq(users.id, userId));

    console.log('✅ Push subscription stored successfully');
    res.json({ success: true, message: 'Push subscription registered' });

  } catch (error) {
    console.error('❌ Store push subscription error:', error);
    res.status(500).json({ error: 'Failed to register push subscription' });
  }
});

// Unsubscribe from push notifications
router.post('/notifications/push-unsubscribe', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📱 POST /notifications/push-unsubscribe for user:', userId);
    
    // Remove push subscription from user settings
    await db
      .update(users)
      .set({
        settings: sql`
          CASE 
            WHEN settings IS NULL THEN NULL
            ELSE settings - 'pushSubscription'
          END
        `
      })
      .where(eq(users.id, userId));

    console.log('✅ Push subscription removed successfully');
    res.json({ success: true, message: 'Push subscription removed' });

  } catch (error) {
    console.error('❌ Remove push subscription error:', error);
    res.status(500).json({ error: 'Failed to remove push subscription' });
  }
});

export default router;
