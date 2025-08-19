import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all notifications for the user
router.get('/', requireAuth, (req, res) => {
  const mockNotifications = [
    {
      id: '1',
      title: 'New partner request',
      message: 'Partner ABC wants to access your offer',
      type: 'partner_request',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      title: 'Payment processed',
      message: 'Your payment of $500 has been processed',
      type: 'payment',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  
  res.json({
    items: mockNotifications,
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => !n.read).length
  });
});

// Get specific notification
router.get('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    title: 'Notification details',
    message: 'Notification content',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  });
});

// Mark notification as read
router.patch('/:id/read', requireAuth, (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    read: true,
    readAt: new Date().toISOString()
  });
});

// Mark all notifications as read
router.post('/mark-all-read', requireAuth, (req, res) => {
  res.json({
    message: 'All notifications marked as read',
    markedCount: 5,
    timestamp: new Date().toISOString()
  });
});

// Delete notification
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'Notification deleted',
    id
  });
});

export default router;
