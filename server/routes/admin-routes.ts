import { Router } from 'express';
import { authenticateToken, requireRole, requirePermission } from '../middleware/authorization';
import { FinanceController } from '../controllers/financeController';
import { AnalyticsController } from '../controllers/analyticsController';
import { AuthController } from '../controllers/authController';
import { FraudController } from '../controllers/fraudController';
import { TeamController } from '../controllers/teamController';
import { validate } from '../middleware/validation';

const router = Router();

// Apply authentication to all admin routes
router.use(authenticateToken);

// === Authentication Routes ===
router.get('/auth/me', AuthController.me);
router.put('/auth/profile', validate.updateProfile(), AuthController.updateProfile);
router.post('/auth/change-password', validate.changePassword(), AuthController.changePassword);

// === Financial Management Routes ===
// Require admin role for financial operations
router.get('/deposits', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageFinances'),
  validate.pagination(),
  FinanceController.getDeposits
);

router.get('/payouts', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageFinances'),
  validate.pagination(),
  FinanceController.getPayouts
);

router.patch('/transactions/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageFinances'),
  validate.uuid(),
  validate.updateTransaction(),
  FinanceController.updateTransactionStatus
);

router.post('/payouts/:id/:action', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageFinances'),
  validate.uuid(),
  validate.payoutAction(),
  FinanceController.processPayoutAction
);

router.post('/invoices', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageFinances'),
  validate.createInvoice(),
  FinanceController.createInvoice
);

router.post('/invoices/:id/mark-paid', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageFinances'),
  validate.uuid(),
  validate.markInvoicePaid(),
  FinanceController.markInvoicePaid
);

router.get('/financial-summary', 
  requireRole('super_admin', 'advertiser', 'staff'), 
  requirePermission('viewFinances'),
  FinanceController.getFinancialSummary
);

// === Analytics Routes ===
router.get('/commission-data', 
  requireRole('super_admin', 'advertiser', 'staff'), 
  requirePermission('viewAnalytics'),
  AnalyticsController.getCommissionData
);

router.get('/financial-chart/:period', 
  requireRole('super_admin', 'advertiser', 'staff'), 
  requirePermission('viewAnalytics'),
  AnalyticsController.getFinancialChart
);

router.get('/analytics-summary', 
  requireRole('super_admin', 'advertiser', 'staff'), 
  requirePermission('viewAnalytics'),
  AnalyticsController.getAnalyticsSummary
);

router.post('/analytics/clear-cache', 
  requireRole('super_admin'), 
  requirePermission('systemSettings'),
  AnalyticsController.clearCache
);

// === Anti-Fraud Management Routes ===
router.get('/fraud/alerts', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  validate.pagination(),
  FraudController.getFraudAlerts
);

router.post('/fraud/analyze/:type/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  validate.uuid(),
  FraudController.runFraudAnalysis
);

router.get('/fraud/stats', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  FraudController.getFraudStats
);

router.post('/fraud/block-ip', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  validate.blockIP(),
  FraudController.blockIP
);

router.post('/fraud/unblock-ip/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  validate.uuid(),
  FraudController.unblockIP
);

router.patch('/fraud/alerts/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  validate.uuid(),
  validate.updateFraudAlert(),
  FraudController.updateAlertStatus
);

router.get('/fraud/config', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageAntifraud'),
  FraudController.getFraudConfig
);

router.put('/fraud/config', 
  requireRole('super_admin'), 
  requirePermission('systemSettings'),
  validate.updateFraudConfig(),
  FraudController.updateFraudConfig
);

// === Team Management Routes ===
router.get('/team/members', 
  requireRole('super_admin', 'advertiser', 'staff'), 
  requirePermission('manageTeam'),
  validate.pagination(),
  TeamController.getTeamMembers
);

router.post('/team/members', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageTeam'),
  validate.createUser(),
  TeamController.createTeamMember
);

router.post('/team/invitations', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageTeam'),
  validate.teamInvitation(),
  TeamController.sendInvitation
);

router.get('/team/invitations', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageTeam'),
  TeamController.getPendingInvitations
);

router.delete('/team/invitations/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageTeam'),
  validate.uuid(),
  TeamController.cancelInvitation
);

router.put('/team/members/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageTeam'),
  validate.uuid(),
  validate.updateTeamMember(),
  TeamController.updateTeamMember
);

router.delete('/team/members/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageTeam'),
  validate.uuid(),
  TeamController.removeTeamMember
);

// === User Management Routes ===
// Get all users (with filtering and pagination)
router.get('/users', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageUsers'),
  validate.pagination(),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, role, status, search } = req.query;
      // Implementation would go here - using existing user management logic
      res.json({ 
        message: 'User management endpoint - implementation needed',
        query: req.query 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get specific user
router.get('/users/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageUsers'),
  validate.uuid(),
  async (req, res) => {
    try {
      // Implementation would go here - using existing user management logic
      res.json({ 
        message: 'Get user endpoint - implementation needed',
        userId: req.params.id 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update user
router.put('/users/:id', 
  requireRole('super_admin', 'advertiser'), 
  requirePermission('manageUsers'),
  validate.uuid(),
  async (req, res) => {
    try {
      // Implementation would go here - using existing user management logic
      res.json({ 
        message: 'Update user endpoint - implementation needed',
        userId: req.params.id 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { router as adminRoutes };