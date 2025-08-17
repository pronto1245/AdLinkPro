import { Router } from 'express';
import { db } from '../db';
import { fraudRules, fraudBlocks, fraudPredictions, fraudModels } from '@shared/antifraud-schema';
import { trackingClicks } from '@shared/schema';
import { eq, and, or, desc, count, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// Validation schemas
const createRuleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['ip_block', 'country_block', 'user_agent_block', 'rate_limit', 'conversion_rate', 'device_fingerprint', 'behavioral']),
  conditions: z.array(z.object({
    id: z.string(),
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'regex', 'in_list']),
    value: z.string(),
    logic: z.enum(['AND', 'OR']).optional()
  })),
  actions: z.array(z.object({
    id: z.string(),
    type: z.enum(['block', 'flag', 'score', 'notify', 'redirect', 'track']),
    params: z.record(z.any())
  })),
  priority: z.number().min(1).max(100),
  isActive: z.boolean(),
  description: z.string().optional()
});

const testRuleSchema = z.object({
  rule: createRuleSchema,
  testCases: z.array(z.object({
    input: z.record(z.any()),
    expectedMatch: z.boolean(),
    description: z.string()
  }))
});

const conflictCheckSchema = z.object({
  rule: createRuleSchema,
  excludeRuleId: z.string().optional()
});

// Rule engine for evaluation
class FraudRuleEngine {
  static evaluateCondition(condition: any, data: Record<string, any>): boolean {
    const fieldValue = data[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === targetValue;
      case 'not_equals':
        return fieldValue !== targetValue;
      case 'greater_than':
        return Number(fieldValue) > Number(targetValue);
      case 'less_than':
        return Number(fieldValue) < Number(targetValue);
      case 'contains':
        return String(fieldValue).includes(targetValue);
      case 'not_contains':
        return !String(fieldValue).includes(targetValue);
      case 'regex':
        try {
          const regex = new RegExp(targetValue);
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      case 'in_list':
        const list = targetValue.split(',').map(v => v.trim());
        return list.includes(String(fieldValue));
      default:
        return false;
    }
  }

  static evaluateRule(rule: any, data: Record<string, any>): boolean {
    if (rule.conditions.length === 0) return false;

    let result = this.evaluateCondition(rule.conditions[0], data);

    for (let i = 1; i < rule.conditions.length; i++) {
      const condition = rule.conditions[i];
      const conditionResult = this.evaluateCondition(condition, data);

      if (condition.logic === 'OR') {
        result = result || conditionResult;
      } else { // AND
        result = result && conditionResult;
      }
    }

    return result;
  }

  static async executeActions(rule: any, data: Record<string, any>, matchResult: boolean) {
    if (!matchResult) return [];

    const executedActions = [];

    for (const action of rule.actions) {
      try {
        let actionResult;

        switch (action.type) {
          case 'block':
            actionResult = await this.executeBlockAction(action, data);
            break;
          case 'flag':
            actionResult = await this.executeFlagAction(action, data);
            break;
          case 'score':
            actionResult = await this.executeScoreAction(action, data);
            break;
          case 'notify':
            actionResult = await this.executeNotifyAction(action, data);
            break;
          case 'redirect':
            actionResult = await this.executeRedirectAction(action, data);
            break;
          case 'track':
            actionResult = await this.executeTrackAction(action, data);
            break;
          default:
            actionResult = { type: action.type, success: false, error: 'Unknown action type' };
        }

        executedActions.push(actionResult);
      } catch (error) {
        executedActions.push({
          type: action.type,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return executedActions;
  }

  private static async executeBlockAction(action: any, data: Record<string, any>) {
    // Create fraud block entry
    const blockData = {
      type: 'rule_based',
      value: data.ip_address || 'unknown',
      reason: action.params.reason || 'Blocked by fraud rule',
      severity: action.params.severity || 'medium',
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(fraudBlocks).values(blockData);

    return {
      type: 'block',
      success: true,
      data: { blocked: blockData.value }
    };
  }

  private static async executeFlagAction(action: any, data: Record<string, any>) {
    // This would integrate with the fraud alerts system
    return {
      type: 'flag',
      success: true,
      data: { flagged: true, message: action.params.message }
    };
  }

  private static async executeScoreAction(action: any, data: Record<string, any>) {
    // Add risk score (would integrate with click tracking)
    const scoreToAdd = action.params.score || 10;
    
    return {
      type: 'score',
      success: true,
      data: { scoreAdded: scoreToAdd }
    };
  }

  private static async executeNotifyAction(action: any, data: Record<string, any>) {
    // This would integrate with the enhanced notification system
    return {
      type: 'notify',
      success: true,
      data: { 
        message: action.params.message,
        severity: action.params.severity 
      }
    };
  }

  private static async executeRedirectAction(action: any, data: Record<string, any>) {
    return {
      type: 'redirect',
      success: true,
      data: { redirectUrl: action.params.url }
    };
  }

  private static async executeTrackAction(action: any, data: Record<string, any>) {
    return {
      type: 'track',
      success: true,
      data: { enhancedTracking: true }
    };
  }
}

// Get all fraud rules
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      isActive, 
      priority_min, 
      priority_max, 
      search,
      limit = 50,
      offset = 0 
    } = req.query;

    let query = db.select().from(fraudRules);

    // Apply filters
    const conditions = [];
    
    if (type) {
      conditions.push(eq(fraudRules.type, type as string));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(fraudRules.isActive, isActive === 'true'));
    }
    
    if (priority_min) {
      conditions.push(sql`${fraudRules.priority} >= ${Number(priority_min)}`);
    }
    
    if (priority_max) {
      conditions.push(sql`${fraudRules.priority} <= ${Number(priority_max)}`);
    }

    if (search) {
      conditions.push(or(
        sql`${fraudRules.name} ILIKE ${`%${search}%`}`,
        sql`${fraudRules.description} ILIKE ${`%${search}%`}`
      ));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rules = await query
      .orderBy(desc(fraudRules.priority), desc(fraudRules.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: rules,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: rules.length
      }
    });
  } catch (error) {
    console.error('Error fetching fraud rules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single fraud rule
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rule] = await db.select()
      .from(fraudRules)
      .where(eq(fraudRules.id, id))
      .limit(1);

    if (!rule) {
      return res.status(404).json({
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Error fetching fraud rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new fraud rule
router.post('/', async (req, res) => {
  try {
    const validation = createRuleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const ruleData = validation.data;
    const userId = req.user?.id || 'system';

    // Check for conflicts
    const conflicts = await checkRuleConflicts(ruleData);
    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Rule conflicts detected',
        conflicts
      });
    }

    const newRule = {
      id: crypto.randomUUID(),
      ...ruleData,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [savedRule] = await db.insert(fraudRules)
      .values(newRule)
      .returning();

    res.status(201).json({
      success: true,
      data: savedRule
    });
  } catch (error) {
    console.error('Error creating fraud rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update fraud rule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = createRuleSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const ruleData = validation.data;
    const userId = req.user?.id || 'system';

    // Check if rule exists
    const [existingRule] = await db.select()
      .from(fraudRules)
      .where(eq(fraudRules.id, id))
      .limit(1);

    if (!existingRule) {
      return res.status(404).json({
        error: 'Rule not found'
      });
    }

    // Check for conflicts (excluding current rule)
    const conflicts = await checkRuleConflicts(ruleData, id);
    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Rule conflicts detected',
        conflicts
      });
    }

    const [updatedRule] = await db.update(fraudRules)
      .set({
        ...ruleData,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(fraudRules.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedRule
    });
  } catch (error) {
    console.error('Error updating fraud rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete fraud rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    // Check if rule exists
    const [existingRule] = await db.select()
      .from(fraudRules)
      .where(eq(fraudRules.id, id))
      .limit(1);

    if (!existingRule) {
      return res.status(404).json({
        error: 'Rule not found'
      });
    }

    // Soft delete (mark as inactive and add deletion info)
    const [deletedRule] = await db.update(fraudRules)
      .set({
        isActive: false,
        deletedBy: userId,
        deletedAt: new Date(),
        deletedReason: 'Manual deletion',
        updatedAt: new Date()
      })
      .where(eq(fraudRules.id, id))
      .returning();

    res.json({
      success: true,
      data: deletedRule
    });
  } catch (error) {
    console.error('Error deleting fraud rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test fraud rule
router.post('/test', async (req, res) => {
  try {
    const validation = testRuleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { rule, testCases } = validation.data;
    const results = [];

    for (const testCase of testCases) {
      const actualMatch = FraudRuleEngine.evaluateRule(rule, testCase.input);
      const success = actualMatch === testCase.expectedMatch;
      
      const actions = await FraudRuleEngine.executeActions(rule, testCase.input, actualMatch);

      results.push({
        description: testCase.description,
        input: testCase.input,
        expected: testCase.expectedMatch,
        actual: actualMatch,
        success,
        actions: actions.length > 0 ? actions : undefined
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error testing fraud rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check rule conflicts
router.post('/check-conflicts', async (req, res) => {
  try {
    const validation = conflictCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { rule, excludeRuleId } = validation.data;
    const conflicts = await checkRuleConflicts(rule, excludeRuleId);

    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts
      }
    });
  } catch (error) {
    console.error('Error checking rule conflicts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rule history/versions
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would require a rule_history table to track changes
    // For now, return empty history
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching rule history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply rule to existing data (bulk evaluation)
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { dryRun = true, limit = 100 } = req.body;

    // Get the rule
    const [rule] = await db.select()
      .from(fraudRules)
      .where(eq(fraudRules.id, id))
      .limit(1);

    if (!rule) {
      return res.status(404).json({
        error: 'Rule not found'
      });
    }

    // Get sample data to test against
    const clicks = await db.select()
      .from(trackingClicks)
      .limit(limit)
      .orderBy(desc(trackingClicks.createdAt));

    const results = [];
    let matchCount = 0;

    for (const click of clicks) {
      const testData = {
        ip_address: click.ipAddress,
        country: click.country,
        user_agent: click.userAgent,
        referer: click.referer,
        device_type: click.device,
        browser: click.browser
      };

      const matches = FraudRuleEngine.evaluateRule(rule, testData);
      
      if (matches) {
        matchCount++;
        
        if (!dryRun) {
          // Execute actions for real
          await FraudRuleEngine.executeActions(rule, testData, matches);
        }
      }

      results.push({
        clickId: click.clickId,
        matches,
        data: testData
      });
    }

    res.json({
      success: true,
      data: {
        totalEvaluated: clicks.length,
        totalMatches: matchCount,
        matchRate: (matchCount / clicks.length * 100).toFixed(2) + '%',
        dryRun,
        results: dryRun ? results.filter(r => r.matches) : []
      }
    });
  } catch (error) {
    console.error('Error applying fraud rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rule statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    // This would require tracking rule executions
    // For now, return mock statistics
    res.json({
      success: true,
      data: {
        executions: 1250,
        matches: 345,
        blocks: 280,
        flags: 65,
        falsePositives: 12,
        accuracy: 94.5,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching rule statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check rule conflicts
async function checkRuleConflicts(rule: any, excludeRuleId?: string): Promise<any[]> {
  const conflicts = [];

  try {
    // Get existing rules of the same type
    let query = db.select()
      .from(fraudRules)
      .where(and(
        eq(fraudRules.type, rule.type),
        eq(fraudRules.isActive, true)
      ));

    if (excludeRuleId) {
      query = query.where(sql`${fraudRules.id} != ${excludeRuleId}`);
    }

    const existingRules = await query;

    for (const existingRule of existingRules) {
      // Check for overlapping conditions
      const overlap = checkConditionOverlap(rule.conditions, existingRule.conditions);
      
      if (overlap.hasOverlap) {
        conflicts.push({
          ruleId: existingRule.id,
          ruleName: existingRule.name,
          type: 'condition_overlap',
          description: `Overlapping conditions with rule "${existingRule.name}"`,
          details: overlap.details,
          severity: existingRule.priority > rule.priority ? 'high' : 'medium'
        });
      }

      // Check for identical actions
      const actionConflict = checkActionConflict(rule.actions, existingRule.actions);
      
      if (actionConflict.hasConflict) {
        conflicts.push({
          ruleId: existingRule.id,
          ruleName: existingRule.name,
          type: 'action_conflict',
          description: `Conflicting actions with rule "${existingRule.name}"`,
          details: actionConflict.details,
          severity: 'medium'
        });
      }
    }
  } catch (error) {
    console.error('Error checking rule conflicts:', error);
  }

  return conflicts;
}

function checkConditionOverlap(conditions1: any[], conditions2: any[]): { hasOverlap: boolean; details: any } {
  // Simplified overlap detection
  for (const cond1 of conditions1) {
    for (const cond2 of conditions2) {
      if (cond1.field === cond2.field && cond1.operator === cond2.operator) {
        return {
          hasOverlap: true,
          details: {
            field: cond1.field,
            operator: cond1.operator,
            values: [cond1.value, cond2.value]
          }
        };
      }
    }
  }

  return { hasOverlap: false, details: null };
}

function checkActionConflict(actions1: any[], actions2: any[]): { hasConflict: boolean; details: any } {
  // Check for conflicting actions (e.g., block vs allow)
  const blockingActions = ['block', 'redirect'];
  const allowingActions = ['track', 'flag'];

  const hasBlocking1 = actions1.some(a => blockingActions.includes(a.type));
  const hasAllowing2 = actions2.some(a => allowingActions.includes(a.type));

  if (hasBlocking1 && hasAllowing2) {
    return {
      hasConflict: true,
      details: {
        type: 'blocking_vs_allowing',
        actions1: actions1.map(a => a.type),
        actions2: actions2.map(a => a.type)
      }
    };
  }

  return { hasConflict: false, details: null };
}

export default router;