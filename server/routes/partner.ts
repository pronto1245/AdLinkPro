import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  partnerProfileSchema,
  updatePartnerProfileSchema,
  changePasswordSchema,
  partnerOfferSchema,
  offerAccessRequestSchema,
  generateLinkSchema,
  partnerDashboardSchema,
  partnerFinanceSummarySchema,
  partnerReferralSchema,
  type PartnerProfile,
  type PartnerOffer,
  type PartnerDashboard,
  type PartnerFinanceSummary,
} from '@shared/partner-schema';

const router = Router();

// Dashboard data endpoint
router.get('/partner/dashboard', requireAuth, (_req, res) => {
  const dashboardData: PartnerDashboard = {
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cr: 0,
    epc: 0,
    recent: [],
  };
  
  res.json(dashboardData);
});

// Available offers endpoint
router.get('/partner/offers', requireAuth, (_req, res) => {
  const offers: PartnerOffer[] = [
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
  ];
  
  res.json({ offers });
});

// Partner profile endpoint
router.get('/partner/profile', requireAuth, (req, res) => {
  const user = (req as any).user;
  const profile: PartnerProfile = {
    id: user?.sub || user?.id,
    username: user?.username || 'partner1',
    email: user?.email || 'partner@example.com',
    role: user?.role === 'affiliate' ? 'affiliate' : 'partner',
    firstName: 'Partner',
    lastName: 'User',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    balance: 0,
    total_earnings: 0
  };
  
  res.json(profile);
});

// Update partner profile endpoint
router.put('/partner/profile', requireAuth, (req, res) => {
  try {
    const validatedData = updatePartnerProfileSchema.parse(req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: validatedData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid profile data',
      details: error instanceof Error ? error.message : 'Validation failed'
    });
  }
});

// Change password endpoint
router.post('/partner/profile/change-password', requireAuth, (req, res) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid password data',
      details: error instanceof Error ? error.message : 'Validation failed'
    });
  }
});

// Offer access request endpoint
router.post('/partner/offer-access-request', requireAuth, (req, res) => {
  try {
    const validatedData = offerAccessRequestSchema.parse(req.body);
    const user = (req as any).user;
    
    res.json({
      success: true,
      message: 'Access request submitted successfully',
      data: {
        id: Date.now().toString(),
        offerId: validatedData.offerId,
        partnerId: user?.sub || user?.id,
        message: validatedData.message || '',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: error instanceof Error ? error.message : 'Validation failed'
    });
  }
});

// Finance summary endpoint  
router.get('/partner/finance/summary', requireAuth, (_req, res) => {
  const summary: PartnerFinanceSummary = {
    balance: 0,
    pending: 0,
    paid: 0,
    currency: 'USD',
    last_payment: null,
    next_payment: null
  };
  
  res.json(summary);
});

// Generate partner link endpoint
router.post('/partner/generate-link', requireAuth, (req, res) => {
  try {
    const validatedData = generateLinkSchema.parse(req.body);
    const user = (req as any).user;
    
    const clickId = `${user?.sub || user?.id}_${validatedData.offerId}_${Date.now()}${validatedData.subId ? `_${validatedData.subId}` : ''}`;
    const trackingUrl = `https://track.example.com/click/${clickId}`;
    
    res.json({
      success: true,
      data: {
        tracking_url: trackingUrl,
        click_id: clickId,
        offer_id: validatedData.offerId,
        sub_id: validatedData.subId || null
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid link generation data',
      details: error instanceof Error ? error.message : 'Validation failed'
    });
  }
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
  
  if (!name || !url) {
    return res.status(400).json({
      success: false,
      error: 'Name and URL are required'
    });
  }
  
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
  const referralData = partnerReferralSchema.parse({
    total_referrals: 0,
    active_referrals: 0,
    referral_earnings: 0,
    referrals: []
  });
  
  res.json(referralData);
});

export default router;
