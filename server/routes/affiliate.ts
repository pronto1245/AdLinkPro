import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  affiliateSummarySchema,
  affiliateProfileSchema,
  affiliatePostbackSchema,
  createPostbackSchema,
  postbackLogSchema,
  affiliateOfferSchema,
  type AffiliateSummary,
  type AffiliateProfile,
  type AffiliatePostback,
  type PostbackLog,
  type AffiliateOffer,
} from '@shared/affiliate-schema';

const router = Router();

// Summary endpoint
router.get('/summary', requireAuth, (_req, res) => {
  const summary: AffiliateSummary = { 
    offers: 2, 
    clicks: 150, 
    conversions: 12, 
    revenue: 240.50 
  };
  
  res.json(summary);
});

// Profile endpoint
router.get('/profile', requireAuth, (req, res) => {
  const user = (req as any).user;
  const profile: AffiliateProfile = {
    id: user?.sub || user?.id,
    username: user?.username || 'affiliate1',
    email: user?.email || 'affiliate@example.com',
    role: 'affiliate',
    firstName: 'Affiliate',
    lastName: 'User',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  };
  
  res.json(profile);
});

// Offers endpoint  
router.get('/offers', requireAuth, (_req, res) => {
  const offers: AffiliateOffer[] = [
    {
      id: 101,
      name: 'Financial App Offer',
      advertiser_name: 'FinanceCorpAdvanced',
      payout: 25.00,
      currency: 'USD',
      category: 'Finance',
      status: 'active',
      description: 'Promote our financial app',
      countries: ['US', 'CA', 'UK'],
      tracking_url: 'https://track.example.com/click/101'
    },
    {
      id: 102,
      name: 'Health Supplement Offer', 
      advertiser_name: 'HealthPlus Inc.',
      payout: 18.50,
      currency: 'USD',
      category: 'Health',
      status: 'active',
      description: 'Premium health supplements',
      countries: ['US', 'AU', 'DE'],
      tracking_url: 'https://track.example.com/click/102'
    }
  ];
  
  res.json({ offers });
});

// Postback management endpoints
router.get('/postbacks', requireAuth, (_req, res) => {
  const postbacks: AffiliatePostback[] = [
    {
      id: 1,
      name: 'Default Postback',
      url: 'https://example.com/postback?offer={offer_id}&click={click_id}&payout={payout}',
      status: 'active',
      events: ['conversion'],
      created_at: '2024-01-01T00:00:00Z'
    }
  ];
  
  res.json({ postbacks });
});

router.post('/postbacks', requireAuth, (req, res) => {
  try {
    const validatedData = createPostbackSchema.parse(req.body);
    
    const newPostback: AffiliatePostback = {
      id: Date.now(),
      name: validatedData.name,
      url: validatedData.url,
      events: validatedData.events,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: newPostback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid postback data',
      details: error instanceof Error ? error.message : 'Validation failed'
    });
  }
});

// Postback logs endpoint
router.get('/postbacks/logs', requireAuth, (req, res) => {
  const { limit = '50', offset = '0' } = req.query;
  
  const logs: PostbackLog[] = [
    {
      id: 1,
      postback_id: 1,
      click_id: 'test_click_123',
      offer_id: 101,
      status: 'sent',
      response_code: 200,
      sent_at: '2024-01-15T10:30:00Z',
      response_time: 120
    },
    {
      id: 2,
      postback_id: 1,
      click_id: 'test_click_124',
      offer_id: 102,
      status: 'failed',
      response_code: 404,
      sent_at: '2024-01-15T11:15:00Z',
      response_time: 5000,
      error: 'Endpoint not found'
    }
  ];
  
  res.json({
    logs,
    total: logs.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
});

export default router;
