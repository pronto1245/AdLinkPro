import { Request, Response } from 'express';
import { db } from '../db';
import { users, payouts, deposits } from '@shared/schema';
import { eq, desc, and, or, gte, lte, sql, sum } from 'drizzle-orm';
import { auditLog } from '../middleware/security';
import { applyOwnerIdFilter } from '../middleware/authorization';

export class FinanceController {
  /**
   * Get deposits with filtering and pagination
   */
  static async getDeposits(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        page = 1,
        limit = 20,
        status,
        userId,
        fromDate,
        toDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build base query
      let query = db
        .select({
          id: deposits.id,
          userId: deposits.userId,
          amount: deposits.amount,
          currency: deposits.currency,
          status: deposits.status,
          method: deposits.method,
          transactionId: deposits.transactionId,
          notes: deposits.notes,
          processedAt: deposits.processedAt,
          processedBy: deposits.processedBy,
          createdAt: deposits.createdAt,
          // Join user info
          username: users.username,
          email: users.email
        })
        .from(deposits)
        .leftJoin(users, eq(deposits.userId, users.id));

      // Apply ownership filtering
      query = applyOwnerIdFilter(query, currentUser, deposits);

      // Apply filters
      const conditions = [];

      if (status) {
        conditions.push(eq(deposits.status, status as string));
      }

      if (userId) {
        conditions.push(eq(deposits.userId, userId as string));
      }

      if (fromDate) {
        conditions.push(gte(deposits.createdAt, new Date(fromDate as string)));
      }

      if (toDate) {
        conditions.push(lte(deposits.createdAt, new Date(toDate as string)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      const sortField = deposits[sortBy as keyof typeof deposits] || deposits.createdAt;
      query = query.orderBy(
        sortOrder === 'asc' ? sortField : desc(sortField)
      );

      // Apply pagination
      query = query.limit(Number(limit)).offset(offset);

      const results = await query;

      // Get total count for pagination
      const [countResult] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(deposits)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / Number(limit));

      auditLog(req, 'GET_DEPOSITS', 'deposits');

      res.json({
        deposits: results,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error) {
      console.error('Get deposits error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get payouts with filtering and pagination
   */
  static async getPayouts(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        page = 1,
        limit = 20,
        status,
        userId,
        fromDate,
        toDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build base query
      let query = db
        .select({
          id: payouts.id,
          userId: payouts.userId,
          amount: payouts.amount,
          currency: payouts.currency,
          status: payouts.status,
          method: payouts.method,
          walletAddress: payouts.walletAddress,
          transactionHash: payouts.transactionHash,
          notes: payouts.notes,
          rejectionReason: payouts.rejectionReason,
          processedAt: payouts.processedAt,
          processedBy: payouts.processedBy,
          createdAt: payouts.createdAt,
          // Join user info
          username: users.username,
          email: users.email
        })
        .from(payouts)
        .leftJoin(users, eq(payouts.userId, users.id));

      // Apply ownership filtering
      query = applyOwnerIdFilter(query, currentUser, payouts);

      // Apply filters
      const conditions = [];

      if (status) {
        conditions.push(eq(payouts.status, status as string));
      }

      if (userId) {
        conditions.push(eq(payouts.userId, userId as string));
      }

      if (fromDate) {
        conditions.push(gte(payouts.createdAt, new Date(fromDate as string)));
      }

      if (toDate) {
        conditions.push(lte(payouts.createdAt, new Date(toDate as string)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      const sortField = payouts[sortBy as keyof typeof payouts] || payouts.createdAt;
      query = query.orderBy(
        sortOrder === 'asc' ? sortField : desc(sortField)
      );

      // Apply pagination
      query = query.limit(Number(limit)).offset(offset);

      const results = await query;

      // Get total count for pagination
      const [countResult] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(payouts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / Number(limit));

      auditLog(req, 'GET_PAYOUTS', 'payouts');

      res.json({
        payouts: results,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error) {
      console.error('Get payouts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update transaction status (deposits/payouts)
   */
  static async updateTransactionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes, rejectionReason } = req.body;
      const currentUser = (req as any).user;
      const { transactionType } = req.query; // 'deposit' or 'payout'

      // Validate status transition
      const validStatusTransitions = {
        'pending': ['approved', 'rejected'],
        'approved': ['completed', 'rejected'],
        'rejected': [], // Final state
        'completed': [] // Final state
      };

      // Determine table and get current transaction
      const isDeposit = transactionType === 'deposit';
      const table = isDeposit ? deposits : payouts;

      const [currentTransaction] = await db
        .select()
        .from(table)
        .where(eq(table.id, id))
        .limit(1);

      if (!currentTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if status transition is valid
      const allowedStatuses = validStatusTransitions[currentTransaction.status] || [];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status transition from ${currentTransaction.status} to ${status}`,
          allowedStatuses
        });
      }

      // Update transaction
      const updateData: any = {
        status,
        processedAt: new Date(),
        processedBy: currentUser.id,
        updatedAt: new Date()
      };

      if (notes) {updateData.notes = notes;}
      if (rejectionReason && status === 'rejected') {
        updateData.rejectionReason = rejectionReason;
      }

      const [updatedTransaction] = await db
        .update(table)
        .set(updateData)
        .where(eq(table.id, id))
        .returning();

      // If deposit is approved, update user balance
      if (isDeposit && status === 'approved') {
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} + ${currentTransaction.amount}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, currentTransaction.userId));
      }

      // If payout is approved, deduct from user balance
      if (!isDeposit && status === 'approved') {
        // Check if user has sufficient balance
        const [user] = await db
          .select({ balance: users.balance })
          .from(users)
          .where(eq(users.id, currentTransaction.userId))
          .limit(1);

        if (!user || Number(user.balance) < Number(currentTransaction.amount)) {
          return res.status(400).json({ error: 'Insufficient user balance' });
        }

        await db
          .update(users)
          .set({
            balance: sql`${users.balance} - ${currentTransaction.amount}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, currentTransaction.userId));
      }

      auditLog(req, 'UPDATE_TRANSACTION', `${transactionType}s`, true, {
        transactionId: id,
        oldStatus: currentTransaction.status,
        newStatus: status
      });

      res.json({
        transaction: updatedTransaction,
        message: `${transactionType} ${status} successfully`
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Process payout action (approve/reject)
   */
  static async processPayoutAction(req: Request, res: Response) {
    try {
      const { id, action } = req.params;
      const { reason, notes } = req.body;
      const currentUser = (req as any).user;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Use approve or reject.' });
      }

      const [payout] = await db
        .select()
        .from(payouts)
        .where(eq(payouts.id, id))
        .limit(1);

      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      if (payout.status !== 'pending') {
        return res.status(400).json({
          error: `Cannot ${action} payout with status ${payout.status}`
        });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const updateData: any = {
        status: newStatus,
        processedAt: new Date(),
        processedBy: currentUser.id,
        updatedAt: new Date()
      };

      if (notes) {updateData.notes = notes;}
      if (reason && action === 'reject') {
        updateData.rejectionReason = reason;
      }

      // If approving, check user balance
      if (action === 'approve') {
        const [user] = await db
          .select({ balance: users.balance })
          .from(users)
          .where(eq(users.id, payout.userId))
          .limit(1);

        if (!user || Number(user.balance) < Number(payout.amount)) {
          return res.status(400).json({ error: 'User has insufficient balance' });
        }

        // Deduct from user balance
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} - ${payout.amount}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, payout.userId));
      }

      const [updatedPayout] = await db
        .update(payouts)
        .set(updateData)
        .where(eq(payouts.id, id))
        .returning();

      auditLog(req, 'PROCESS_PAYOUT', 'payouts', true, {
        payoutId: id,
        action,
        amount: payout.amount,
        userId: payout.userId
      });

      res.json({
        payout: updatedPayout,
        message: `Payout ${action}d successfully`
      });
    } catch (error) {
      console.error('Process payout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create invoice
   */
  static async createInvoice(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const {
        amount,
        currency = 'USD',
        description,
        dueDate,
        paymentMethod
      } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount required' });
      }

      // Create deposit record as invoice
      const [invoice] = await db
        .insert(deposits)
        .values({
          userId: currentUser.id,
          amount: amount.toString(),
          currency,
          status: 'pending',
          method: paymentMethod || 'manual',
          notes: description,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      auditLog(req, 'CREATE_INVOICE', 'deposits', true, {
        invoiceId: invoice.id,
        amount,
        currency
      });

      res.json({
        invoice,
        message: 'Invoice created successfully'
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Mark invoice as paid
   */
  static async markInvoicePaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { transactionId, notes } = req.body;
      const currentUser = (req as any).user;

      const [invoice] = await db
        .select()
        .from(deposits)
        .where(eq(deposits.id, id))
        .limit(1);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      if (invoice.status !== 'pending') {
        return res.status(400).json({
          error: `Cannot mark invoice with status ${invoice.status} as paid`
        });
      }

      // Update invoice to paid (completed)
      const [updatedInvoice] = await db
        .update(deposits)
        .set({
          status: 'completed',
          transactionId,
          notes,
          processedAt: new Date(),
          processedBy: currentUser.id,
          updatedAt: new Date()
        })
        .where(eq(deposits.id, id))
        .returning();

      // Add amount to user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${invoice.amount}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, invoice.userId));

      auditLog(req, 'MARK_INVOICE_PAID', 'deposits', true, {
        invoiceId: id,
        amount: invoice.amount
      });

      res.json({
        invoice: updatedInvoice,
        message: 'Invoice marked as paid successfully'
      });
    } catch (error) {
      console.error('Mark invoice paid error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get financial summary
   */
  static async getFinancialSummary(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { period = '30d' } = req.query;

      // Calculate date range
      const fromDate = new Date();
      switch (period) {
        case '7d':
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case '30d':
          fromDate.setDate(fromDate.getDate() - 30);
          break;
        case '90d':
          fromDate.setDate(fromDate.getDate() - 90);
          break;
        default:
          fromDate.setDate(fromDate.getDate() - 30);
      }

      // Get deposits summary
      let depositQuery = db
        .select({
          total: sum(deposits.amount).mapWith(Number),
          count: sql`count(*)`.mapWith(Number)
        })
        .from(deposits)
        .where(
          and(
            gte(deposits.createdAt, fromDate),
            eq(deposits.status, 'completed')
          )
        );

      depositQuery = applyOwnerIdFilter(depositQuery, currentUser, deposits);
      const [depositsSum] = await depositQuery;

      // Get payouts summary
      let payoutQuery = db
        .select({
          total: sum(payouts.amount).mapWith(Number),
          count: sql`count(*)`.mapWith(Number)
        })
        .from(payouts)
        .where(
          and(
            gte(payouts.createdAt, fromDate),
            eq(payouts.status, 'completed')
          )
        );

      payoutQuery = applyOwnerIdFilter(payoutQuery, currentUser, payouts);
      const [payoutsSum] = await payoutQuery;

      const summary = {
        period,
        deposits: {
          total: depositsSum?.total || 0,
          count: depositsSum?.count || 0
        },
        payouts: {
          total: payoutsSum?.total || 0,
          count: payoutsSum?.count || 0
        },
        netFlow: (depositsSum?.total || 0) - (payoutsSum?.total || 0)
      };

      auditLog(req, 'GET_FINANCIAL_SUMMARY', 'transactions');

      res.json({ summary });
    } catch (error) {
      console.error('Get financial summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
