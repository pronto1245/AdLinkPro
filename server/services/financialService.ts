import { db } from "../db";
import { financialTransactions, payoutRequests, users } from "@shared/schema";
import { eq, and, gte, lte, sum, count, desc, or, ilike, sql } from "drizzle-orm";

export class FinancialService {
  /**
   * Calculate comprehensive financial metrics for a given period
   */
  static async getFinancialMetrics(startDate: Date, endDate: Date) {
    try {
      const [metrics] = await db
        .select({ 
          totalRevenue: sum(sql`CASE WHEN type IN ('commission', 'bonus') AND status = 'completed' THEN amount ELSE 0 END`),
          totalPayouts: sum(sql`CASE WHEN type = 'payout' AND status = 'completed' THEN amount ELSE 0 END`),
          pendingPayouts: sum(sql`CASE WHEN type = 'payout' AND status = 'pending' THEN amount ELSE 0 END`),
          advertiserRevenue: sum(sql`CASE WHEN type = 'commission' AND status = 'completed' THEN amount ELSE 0 END`),
          partnerPayouts: sum(sql`CASE WHEN type = 'payout' AND status = 'completed' THEN amount ELSE 0 END`),
          platformCommission: sum(sql`CASE WHEN type IN ('commission', 'bonus') AND status = 'completed' THEN amount ELSE 0 END`) - 
                               sum(sql`CASE WHEN type = 'payout' AND status = 'completed' THEN amount ELSE 0 END`)
        })
        .from(financialTransactions)
        .where(
          and(
            gte(financialTransactions.createdAt, startDate),
            lte(financialTransactions.createdAt, endDate)
          )
        );

      return {
        totalRevenue: Number(metrics?.totalRevenue || 0),
        totalPayouts: Number(metrics?.totalPayouts || 0),
        pendingPayouts: Number(metrics?.pendingPayouts || 0),
        advertiserRevenue: Number(metrics?.advertiserRevenue || 0),
        partnerPayouts: Number(metrics?.partnerPayouts || 0),
        platformCommission: Number(metrics?.platformCommission || 0),
        platformBalance: Number(metrics?.totalRevenue || 0) - Number(metrics?.totalPayouts || 0)
      };
    } catch (error) {
      console.error("Error calculating financial metrics:", error);
      throw error;
    }
  }

  /**
   * Get currency distribution for financial transactions
   */
  static async getCurrencyDistribution(startDate: Date, endDate: Date) {
    try {
      const distribution = await db
        .select({
          name: financialTransactions.currency,
          value: sum(sql`CASE WHEN status = 'completed' THEN amount ELSE 0 END`)
        })
        .from(financialTransactions)
        .where(
          and(
            gte(financialTransactions.createdAt, startDate),
            lte(financialTransactions.createdAt, endDate),
            eq(financialTransactions.status, 'completed')
          )
        )
        .groupBy(financialTransactions.currency);

      return distribution.map(d => ({
        name: d.name || 'USD',
        value: Number(d.value || 0)
      }));
    } catch (error) {
      console.error("Error getting currency distribution:", error);
      return [];
    }
  }

  /**
   * Get payment methods statistics
   */
  static async getPaymentMethodsStats(startDate: Date, endDate: Date) {
    try {
      const methods = await db
        .select({
          name: financialTransactions.paymentMethod,
          amount: sum(sql`CASE WHEN status = 'completed' THEN amount ELSE 0 END`),
          count: count(financialTransactions.id)
        })
        .from(financialTransactions)
        .where(
          and(
            gte(financialTransactions.createdAt, startDate),
            lte(financialTransactions.createdAt, endDate),
            eq(financialTransactions.status, 'completed')
          )
        )
        .groupBy(financialTransactions.paymentMethod);

      return methods.map(m => ({
        name: m.name || 'Unknown',
        amount: Number(m.amount || 0),
        count: Number(m.count || 0)
      }));
    } catch (error) {
      console.error("Error getting payment methods stats:", error);
      return [];
    }
  }

  /**
   * Get financial transactions with filters
   */
  static async getTransactions(filters: {
    status?: string;
    type?: string;
    currency?: string;
    method?: string;
    search?: string;
    limit?: number;
  }) {
    try {
      const conditions = [];
      
      if (filters.status && filters.status !== 'all') {
        conditions.push(eq(financialTransactions.status, filters.status));
      }
      
      if (filters.type && filters.type !== 'all') {
        conditions.push(eq(financialTransactions.type, filters.type));
      }
      
      if (filters.currency && filters.currency !== 'all') {
        conditions.push(eq(financialTransactions.currency, filters.currency));
      }
      
      if (filters.method && filters.method !== 'all') {
        conditions.push(eq(financialTransactions.paymentMethod, filters.method));
      }
      
      if (filters.search) {
        conditions.push(
          or(
            ilike(users.username, `%${filters.search}%`),
            ilike(users.email, `%${filters.search}%`),
            ilike(financialTransactions.id, `%${filters.search}%`),
            ilike(financialTransactions.comment, `%${filters.search}%`)
          )
        );
      }

      const transactions = await db
        .select({
          id: financialTransactions.id,
          amount: financialTransactions.amount,
          currency: financialTransactions.currency,
          type: financialTransactions.type,
          status: financialTransactions.status,
          description: financialTransactions.comment,
          paymentMethod: financialTransactions.paymentMethod,
          createdAt: financialTransactions.createdAt,
          processedAt: financialTransactions.processedAt,
          txHash: financialTransactions.txHash,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role
          }
        })
        .from(financialTransactions)
        .leftJoin(users, eq(financialTransactions.partnerId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(financialTransactions.createdAt))
        .limit(filters.limit || 1000);

      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(transactionId: string, status: string, userId: string, note?: string) {
    try {
      await db
        .update(financialTransactions)
        .set({
          status: status as any,
          processedBy: userId,
          processedAt: new Date(),
          comment: note || financialTransactions.comment
        })
        .where(eq(financialTransactions.id, transactionId));

      return { success: true };
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
  }

  /**
   * Get payout requests with filters
   */
  static async getPayoutRequests(filters: {
    status?: string;
    currency?: string;
    method?: string;
    search?: string;
  }) {
    try {
      const conditions = [];
      
      if (filters.status && filters.status !== 'all') {
        conditions.push(eq(payoutRequests.status, filters.status));
      }
      
      if (filters.currency && filters.currency !== 'all') {
        conditions.push(eq(payoutRequests.currency, filters.currency));
      }
      
      if (filters.method && filters.method !== 'all') {
        conditions.push(eq(payoutRequests.paymentMethod, filters.method));
      }

      const payouts = await db
        .select({
          id: payoutRequests.id,
          amount: payoutRequests.amount,
          currency: payoutRequests.currency,
          status: payoutRequests.status,
          paymentMethod: payoutRequests.paymentMethod,
          requestedAt: payoutRequests.createdAt,
          processedAt: payoutRequests.processedAt,
          note: payoutRequests.comment,
          walletAddress: sql`COALESCE(${payoutRequests.paymentDetails}->>'wallet', ${payoutRequests.paymentDetails}->>'address', 'N/A')`,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName
          }
        })
        .from(payoutRequests)
        .leftJoin(users, eq(payoutRequests.partnerId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(payoutRequests.createdAt));

      return payouts;
    } catch (error) {
      console.error("Error getting payout requests:", error);
      throw error;
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get transaction status badge configuration
   */
  static getStatusConfig(status: string) {
    const configs = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', label: 'Cancelled' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Rejected' }
    };

    return configs[status as keyof typeof configs] || configs.pending;
  }
}