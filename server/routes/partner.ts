import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Dashboard data endpoint
router.get('/partner/dashboard', requireAuth, (_req, res) => {
  res.json({
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cr: 0,
    epc: 0,
    recent: [],
  });
});

// Available offers endpoint
router.get('/partner/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      { 
        id: 101, 
        name: 'Test Offer A', 
        payout: 10, 
        status: 'active',
        category: 'Finance',
        description: 'Test offer for development',
        currency: 'USD'
      },
      { 
        id: 102, 
        name: 'Test Offer B', 
        payout: 15, 
        status: 'paused',
        category: 'Health',
        description: 'Another test offer',
        currency: 'USD'
      },
    ],
  });
});

// Partner profile endpoint
router.get('/partner/profile', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user?.sub || user?.id,
    username: user?.username || 'partner1',
    email: user?.email || 'partner@example.com',
    role: user?.role || 'affiliate',
    firstName: 'Partner',
    lastName: 'User',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    balance: 0,
    total_earnings: 0
  });
});

// Update partner profile endpoint
router.put('/partner/profile', requireAuth, (req, res) => {
  // In a real app, this would update the database
  const { firstName, lastName, email } = req.body;
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      firstName,
      lastName, 
      email
    }
  });
});

// Change password endpoint
router.post('/partner/profile/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }
  
  // In a real app, this would verify current password and update the hash
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Offer access request endpoint
router.post('/partner/offer-access-request', requireAuth, (req, res) => {
  const { offerId, message } = req.body;
  const user = (req as any).user;
  
  if (!offerId) {
    return res.status(400).json({
      success: false,
      error: 'Offer ID is required'
    });
  }
  
  res.json({
    success: true,
    message: 'Access request submitted successfully',
    data: {
      id: Date.now().toString(),
      offerId,
      partnerId: user?.sub || user?.id,
      message: message || '',
      status: 'pending',
      created_at: new Date().toISOString()
    }
  });
});

// Finance summary endpoint  
router.get('/partner/finance/summary', requireAuth, (_req, res) => {
  res.json({
    balance: 0,
    pending: 0,
    paid: 0,
    currency: 'USD',
    last_payment: null,
    next_payment: null
  });
});

// Generate partner link endpoint
router.post('/partner/generate-link', requireAuth, (req, res) => {
  const { offerId, subId } = req.body;
  const user = (req as any).user;
  
  if (!offerId) {
    return res.status(400).json({
      success: false,
      error: 'Offer ID is required'
    });
  }
  
  const clickId = `${user?.sub || user?.id}_${offerId}_${Date.now()}${subId ? `_${subId}` : ''}`;
  const trackingUrl = `https://track.example.com/click/${clickId}`;
  
  res.json({
    success: true,
    data: {
      tracking_url: trackingUrl,
      click_id: clickId,
      offer_id: offerId,
      sub_id: subId || null
    }
  });
});

// Postback profiles endpoint
router.get('/partner/postbacks', requireAuth, (_req, res) => {
  res.json({
    profiles: [
      {
        id: 1,
        name: 'Default Profile',
        url: 'https://example.com/postback',
        status: 'active',
        events: ['conversion', 'click']
      }
    ]
  });
});

// Create postback profile
router.post('/partner/postbacks', requireAuth, (req, res) => {
  const { name, url, events } = req.body;
  
  res.json({
    success: true,
    data: {
      id: Date.now(),
      name,
      url,
      events: events || ['conversion'],
      status: 'active',
      created_at: new Date().toISOString()
    }
  });
});

// Referrals endpoint
router.get('/partner/referrals', requireAuth, (_req, res) => {
  res.json({
    total_referrals: 0,
    active_referrals: 0,
    referral_earnings: 0,
    referrals: []
  });
});

export default router;
