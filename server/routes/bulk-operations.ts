import { Router } from 'express';
import { db } from '../db';
import { users, trackingClicks } from '@shared/schema';
import { webhookEndpoints, webhookEvents, fraudBlocks, fraudRules, fraudAlerts } from '@shared/antifraud-schema';
import { eq, inArray, and, or } from 'drizzle-orm';
import { enhancedNotificationService } from '../services/enhancedNotifications';
import { z } from 'zod';

const router = Router();

// Validation schemas
const bulkBlockIpsSchema = z.object({
  ipAddresses: z.array(z.string().ip()),
  reason: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  notify: z.boolean().default(true)
});

const bulkUnblockIpsSchema = z.object({
  ipAddresses: z.array(z.string().ip()),
  reason: z.string().min(1),
  notify: z.boolean().default(true)
});

const bulkCreateRulesSchema = z.object({
  rules: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['ip_block', 'country_block', 'user_agent_block', 'rate_limit']),
    conditions: z.record(z.any()),
    actions: z.array(z.string()),
    priority: z.number().min(1).max(100).default(50),
    isActive: z.boolean().default(true)
  })),
  skipDuplicates: z.boolean().default(true),
  notify: z.boolean().default(true)
});

const bulkDeleteRulesSchema = z.object({
  ruleIds: z.array(z.string()),
  reason: z.string().min(1),
  notify: z.boolean().default(true)
});

const bulkUpdateRulesSchema = z.object({
  ruleIds: z.array(z.string()),
  updates: z.object({
    isActive: z.boolean().optional(),
    priority: z.number().min(1).max(100).optional(),
    conditions: z.record(z.any()).optional(),
    actions: z.array(z.string()).optional()
  }),
  reason: z.string().min(1),
  notify: z.boolean().default(true)
});

const bulkProcessAlertsSchema = z.object({
  alertIds: z.array(z.string()),
  action: z.enum(['resolve', 'ignore', 'escalate']),
  reason: z.string().min(1),
  assignTo: z.string().optional(),
  notify: z.boolean().default(true)
});

// Bulk IP blocking/unblocking
router.post('/block-ips', async (req, res) => {
  try {
    const validation = bulkBlockIpsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { ipAddresses, reason, expiresAt, severity, notify } = validation.data;
    const userId = req.user?.id || 'system';
    const timestamp = new Date();

    console.log(`🚫 Bulk blocking ${ipAddresses.length} IP addresses`);

    // Check for existing blocks
    const existingBlocks = await db.select()
      .from(fraudBlocks)
      .where(and(
        inArray(fraudBlocks.value, ipAddresses),
        eq(fraudBlocks.type, 'ip'),
        eq(fraudBlocks.isActive, true)
      ));

    const existingIps = existingBlocks.map(block => block.value);
    const newIps = ipAddresses.filter(ip => !existingIps.includes(ip));

    // Create new blocks
    const blocksToCreate = newIps.map(ip => ({
      type: 'ip' as const,
      value: ip,
      reason,
      severity,
      isActive: true,
      createdBy: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: timestamp,
      updatedAt: timestamp
    }));

    let createdBlocks = [];
    if (blocksToCreate.length > 0) {
      createdBlocks = await db.insert(fraudBlocks)
        .values(blocksToCreate)
        .returning();
    }

    // Send notification
    if (notify && createdBlocks.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk IP blocking: ${createdBlocks.length} new IPs blocked`,
        component: 'fraud-protection',
        severity: severity as any
      });
    }

    res.json({
      success: true,
      data: {
        blocked: createdBlocks.length,
        existing: existingIps.length,
        total: ipAddresses.length,
        blocks: createdBlocks
      }
    });
  } catch (error) {
    console.error('Bulk IP blocking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unblock-ips', async (req, res) => {
  try {
    const validation = bulkUnblockIpsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { ipAddresses, reason, notify } = validation.data;
    const userId = req.user?.id || 'system';

    console.log(`✅ Bulk unblocking ${ipAddresses.length} IP addresses`);

    // Update existing blocks
    const result = await db.update(fraudBlocks)
      .set({
        isActive: false,
        unblockReason: reason,
        unblockedBy: userId,
        unblockedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        inArray(fraudBlocks.value, ipAddresses),
        eq(fraudBlocks.type, 'ip'),
        eq(fraudBlocks.isActive, true)
      ))
      .returning();

    // Send notification
    if (notify && result.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk IP unblocking: ${result.length} IPs unblocked`,
        component: 'fraud-protection',
        severity: 'low'
      });
    }

    res.json({
      success: true,
      data: {
        unblocked: result.length,
        blocks: result
      }
    });
  } catch (error) {
    console.error('Bulk IP unblocking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk rule management
router.post('/create-rules', async (req, res) => {
  try {
    const validation = bulkCreateRulesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { rules, skipDuplicates, notify } = validation.data;
    const userId = req.user?.id || 'system';
    const timestamp = new Date();

    console.log(`📝 Bulk creating ${rules.length} fraud rules`);

    // Check for duplicates if skipDuplicates is true
    let rulesToCreate = rules;
    if (skipDuplicates) {
      const existingRules = await db.select()
        .from(fraudRules)
        .where(inArray(fraudRules.name, rules.map(r => r.name)));
      
      const existingNames = existingRules.map(r => r.name);
      rulesToCreate = rules.filter(r => !existingNames.includes(r.name));
    }

    // Create new rules
    const rulesWithMetadata = rulesToCreate.map(rule => ({
      ...rule,
      id: crypto.randomUUID(),
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp
    }));

    let createdRules = [];
    if (rulesWithMetadata.length > 0) {
      createdRules = await db.insert(fraudRules)
        .values(rulesWithMetadata)
        .returning();
    }

    // Send notification
    if (notify && createdRules.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk rule creation: ${createdRules.length} new rules created`,
        component: 'fraud-rules',
        severity: 'medium'
      });
    }

    res.json({
      success: true,
      data: {
        created: createdRules.length,
        skipped: rules.length - rulesToCreate.length,
        total: rules.length,
        rules: createdRules
      }
    });
  } catch (error) {
    console.error('Bulk rule creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/delete-rules', async (req, res) => {
  try {
    const validation = bulkDeleteRulesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { ruleIds, reason, notify } = validation.data;
    const userId = req.user?.id || 'system';

    console.log(`🗑️ Bulk deleting ${ruleIds.length} fraud rules`);

    // Check dependencies (if rules are being used)
    const dependencyCheck = await checkRuleDependencies(ruleIds);
    if (dependencyCheck.hasBlocked) {
      return res.status(400).json({
        error: 'Cannot delete rules with active dependencies',
        details: dependencyCheck.details
      });
    }

    // Soft delete rules (mark as inactive)
    const result = await db.update(fraudRules)
      .set({
        isActive: false,
        deletedReason: reason,
        deletedBy: userId,
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(inArray(fraudRules.id, ruleIds))
      .returning();

    // Send notification
    if (notify && result.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk rule deletion: ${result.length} rules deactivated`,
        component: 'fraud-rules',
        severity: 'medium'
      });
    }

    res.json({
      success: true,
      data: {
        deleted: result.length,
        rules: result
      }
    });
  } catch (error) {
    console.error('Bulk rule deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update-rules', async (req, res) => {
  try {
    const validation = bulkUpdateRulesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { ruleIds, updates, reason, notify } = validation.data;
    const userId = req.user?.id || 'system';

    console.log(`📝 Bulk updating ${ruleIds.length} fraud rules`);

    // Apply updates
    const result = await db.update(fraudRules)
      .set({
        ...updates,
        updatedBy: userId,
        updateReason: reason,
        updatedAt: new Date()
      })
      .where(inArray(fraudRules.id, ruleIds))
      .returning();

    // Send notification
    if (notify && result.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk rule update: ${result.length} rules updated`,
        component: 'fraud-rules',
        severity: 'medium'
      });
    }

    res.json({
      success: true,
      data: {
        updated: result.length,
        rules: result
      }
    });
  } catch (error) {
    console.error('Bulk rule update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk alert processing
router.post('/process-alerts', async (req, res) => {
  try {
    const validation = bulkProcessAlertsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { alertIds, action, reason, assignTo, notify } = validation.data;
    const userId = req.user?.id || 'system';

    console.log(`⚡ Bulk processing ${alertIds.length} fraud alerts: ${action}`);

    // Update alerts based on action
    let updateData: any = {
      processedBy: userId,
      processedAt: new Date(),
      processReason: reason,
      updatedAt: new Date()
    };

    switch (action) {
      case 'resolve':
        updateData.status = 'resolved';
        updateData.resolvedAt = new Date();
        break;
      case 'ignore':
        updateData.status = 'ignored';
        updateData.ignoredAt = new Date();
        break;
      case 'escalate':
        updateData.status = 'escalated';
        updateData.escalatedAt = new Date();
        if (assignTo) {
          updateData.assignedTo = assignTo;
        }
        break;
    }

    const result = await db.update(fraudAlerts)
      .set(updateData)
      .where(inArray(fraudAlerts.id, alertIds))
      .returning();

    // Send notification
    if (notify && result.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk alert processing: ${result.length} alerts ${action}d`,
        component: 'fraud-alerts',
        severity: action === 'escalate' ? 'high' : 'medium'
      });
    }

    res.json({
      success: true,
      data: {
        processed: result.length,
        action,
        alerts: result
      }
    });
  } catch (error) {
    console.error('Bulk alert processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk user management
router.post('/block-users', async (req, res) => {
  try {
    const { userIds, reason, notify = true } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'userIds must be a non-empty array'
      });
    }

    const adminId = req.user?.id || 'system';

    console.log(`🚫 Bulk blocking ${userIds.length} users`);

    // Update users
    const result = await db.update(users)
      .set({
        isBlocked: true,
        blockedReason: reason,
        blockedBy: adminId,
        blockedAt: new Date(),
        updatedAt: new Date()
      })
      .where(inArray(users.id, userIds))
      .returning();

    // Send notifications
    for (const user of result) {
      if (notify) {
        await enhancedNotificationService.notifyUserBlocked({
          username: user.username,
          reason,
          adminId
        });
      }
    }

    res.json({
      success: true,
      data: {
        blocked: result.length,
        users: result
      }
    });
  } catch (error) {
    console.error('Bulk user blocking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unblock-users', async (req, res) => {
  try {
    const { userIds, reason, notify = true } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'userIds must be a non-empty array'
      });
    }

    const adminId = req.user?.id || 'system';

    console.log(`✅ Bulk unblocking ${userIds.length} users`);

    // Update users
    const result = await db.update(users)
      .set({
        isBlocked: false,
        unblockReason: reason,
        unblockedBy: adminId,
        unblockedAt: new Date(),
        updatedAt: new Date()
      })
      .where(inArray(users.id, userIds))
      .returning();

    // Send notification
    if (notify && result.length > 0) {
      await enhancedNotificationService.notifySystemAlert({
        message: `Bulk user unblocking: ${result.length} users unblocked`,
        component: 'user-management',
        severity: 'medium'
      });
    }

    res.json({
      success: true,
      data: {
        unblocked: result.length,
        users: result
      }
    });
  } catch (error) {
    console.error('Bulk user unblocking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk data export
router.post('/export', async (req, res) => {
  try {
    const { type, filters, format = 'json' } = req.body;
    
    console.log(`📊 Bulk export: ${type} (${format})`);
    
    let data;
    switch (type) {
      case 'fraud_blocks':
        data = await exportFraudBlocks(filters);
        break;
      case 'fraud_rules':
        data = await exportFraudRules(filters);
        break;
      case 'fraud_alerts':
        data = await exportFraudAlerts(filters);
        break;
      case 'blocked_users':
        data = await exportBlockedUsers(filters);
        break;
      default:
        return res.status(400).json({
          error: 'Invalid export type'
        });
    }

    // Format data
    let responseData;
    if (format === 'csv') {
      responseData = await convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
    } else {
      responseData = data;
      res.setHeader('Content-Type', 'application/json');
    }

    res.json({
      success: true,
      count: data.length,
      data: responseData
    });
  } catch (error) {
    console.error('Bulk export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
async function checkRuleDependencies(ruleIds: string[]) {
  // Check if rules are referenced by active blocks or alerts
  const dependencies = await db.select()
    .from(fraudBlocks)
    .where(and(
      inArray(fraudBlocks.sourceRuleId, ruleIds),
      eq(fraudBlocks.isActive, true)
    ));

  return {
    hasBlocked: dependencies.length > 0,
    details: dependencies
  };
}

async function exportFraudBlocks(filters: any = {}) {
  let query = db.select().from(fraudBlocks);
  
  if (filters.isActive !== undefined) {
    query = query.where(eq(fraudBlocks.isActive, filters.isActive));
  }
  
  return await query.limit(filters.limit || 1000);
}

async function exportFraudRules(filters: any = {}) {
  let query = db.select().from(fraudRules);
  
  if (filters.isActive !== undefined) {
    query = query.where(eq(fraudRules.isActive, filters.isActive));
  }
  
  return await query.limit(filters.limit || 1000);
}

async function exportFraudAlerts(filters: any = {}) {
  let query = db.select().from(fraudAlerts);
  
  if (filters.status) {
    query = query.where(eq(fraudAlerts.status, filters.status));
  }
  
  return await query.limit(filters.limit || 1000);
}

async function exportBlockedUsers(filters: any = {}) {
  let query = db.select().from(users);
  
  query = query.where(eq(users.isBlocked, true));
  
  return await query.limit(filters.limit || 1000);
}

async function convertToCSV(data: any[]): Promise<string> {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

export default router;