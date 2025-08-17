import express from "express";
import { z } from "zod";
import { eq, and, desc, asc, sql, count, sum, inArray } from "drizzle-orm";
import { db } from "../db";
import { 
  payoutRequests, 
  invoices, 
  paymentGatewayConfigs, 
  users, 
  financialTransactions,
  type PayoutRequest,
  type InsertPaymentGatewayConfig
} from "@shared/schema";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = express.Router();

// Validation schemas
const updatePayoutStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "processing", "completed", "failed", "cancelled"]),
  adminNotes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(500).optional(),
});

const bulkPayoutActionSchema = z.object({
  requestIds: z.array(z.string()).min(1, "At least one request ID is required"),
  action: z.enum(["approve", "reject", "process"]),
  adminNotes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(500).optional(),
});

const gatewayConfigSchema = z.object({
  gatewayType: z.enum(["stripe", "coinbase", "binance", "manual"]),
  isActive: z.boolean(),
  isDefault: z.boolean().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookSecret: z.string().optional(),
  supportedCurrencies: z.array(z.string()),
  minimumAmount: z.number().min(0).optional(),
  maximumAmount: z.number().min(0).optional(),
  feePercentage: z.number().min(0).max(100).optional(),
  fixedFee: z.number().min(0).optional(),
  processingTime: z.string().optional(),
  configuration: z.record(z.any()).optional(),
});

// Advertiser routes

// Get all payout requests for advertiser
router.get("/api/advertiser/payout-requests", authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const partnerId = req.query.partnerId as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: payoutRequests.id,
        partnerId: payoutRequests.partnerId,
        partnerUsername: users.username,
        partnerEmail: users.email,
        amount: payoutRequests.amount,
        currency: payoutRequests.currency,
        paymentMethod: payoutRequests.paymentMethod,
        walletAddress: payoutRequests.walletAddress,
        walletNetwork: payoutRequests.walletNetwork,
        status: payoutRequests.status,
        partnerNote: payoutRequests.partnerNote,
        adminNotes: payoutRequests.adminNotes,
        rejectionReason: payoutRequests.rejectionReason,
        invoiceId: payoutRequests.invoiceId,
        gatewayType: payoutRequests.gatewayType,
        gatewayTransactionId: payoutRequests.gatewayTransactionId,
        processedAmount: payoutRequests.processedAmount,
        gatewayFee: payoutRequests.gatewayFee,
        createdAt: payoutRequests.createdAt,
        updatedAt: payoutRequests.updatedAt,
        approvedAt: payoutRequests.approvedAt,
        processedAt: payoutRequests.processedAt,
        rejectedAt: payoutRequests.rejectedAt,
      })
      .from(payoutRequests)
      .leftJoin(users, eq(payoutRequests.partnerId, users.id))
      .where(eq(payoutRequests.advertiserId, advertiserId));

    // Apply filters
    if (status) {
      query = query.where(and(
        eq(payoutRequests.advertiserId, advertiserId),
        eq(payoutRequests.status, status as any)
      ));
    }

    if (partnerId) {
      query = query.where(and(
        eq(payoutRequests.advertiserId, advertiserId),
        eq(payoutRequests.partnerId, partnerId)
      ));
    }

    // Apply sorting
    const sortColumn = sortBy === 'amount' ? payoutRequests.amount : 
                      sortBy === 'status' ? payoutRequests.status : 
                      payoutRequests.createdAt;
    const sortDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const requests = await query
      .orderBy(sortDirection)
      .limit(limit)
      .offset(offset);

    // Get summary statistics
    const summaryQuery = db
      .select({
        totalCount: count(),
        totalAmount: sum(payoutRequests.amount),
        avgAmount: sql<number>`AVG(${payoutRequests.amount})`,
      })
      .from(payoutRequests)
      .where(eq(payoutRequests.advertiserId, advertiserId));

    const [summary] = await summaryQuery;

    // Get status counts
    const statusCounts = await db
      .select({
        status: payoutRequests.status,
        count: count(),
        totalAmount: sum(payoutRequests.amount),
      })
      .from(payoutRequests)
      .where(eq(payoutRequests.advertiserId, advertiserId))
      .groupBy(payoutRequests.status);

    res.json({
      requests: requests,
      pagination: {
        page,
        limit,
        total: summary.totalCount,
        pages: Math.ceil(summary.totalCount / limit)
      },
      summary: {
        totalRequests: summary.totalCount,
        totalAmount: parseFloat(summary.totalAmount?.toString() || "0"),
        averageAmount: parseFloat(summary.avgAmount?.toString() || "0"),
      },
      statusBreakdown: statusCounts.map(sc => ({
        status: sc.status,
        count: sc.count,
        totalAmount: parseFloat(sc.totalAmount?.toString() || "0")
      }))
    });

  } catch (error) {
    console.error("Error fetching payout requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update payout request status
router.patch("/api/advertiser/payout-requests/:id", authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const requestId = req.params.id;
    const advertiserId = req.user.id;
    const data = updatePayoutStatusSchema.parse(req.body);

    // Verify ownership
    const existingRequest = await db
      .select({ 
        id: payoutRequests.id, 
        status: payoutRequests.status,
        partnerId: payoutRequests.partnerId,
        amount: payoutRequests.amount
      })
      .from(payoutRequests)
      .where(and(
        eq(payoutRequests.id, requestId),
        eq(payoutRequests.advertiserId, advertiserId)
      ))
      .limit(1);

    if (existingRequest.length === 0) {
      return res.status(404).json({ error: "Payout request not found" });
    }

    const currentStatus = existingRequest[0].status;

    // Validate status transition
    if (currentStatus === 'completed') {
      return res.status(400).json({ error: "Cannot modify completed payout request" });
    }

    if (currentStatus === 'cancelled') {
      return res.status(400).json({ error: "Cannot modify cancelled payout request" });
    }

    // Update request
    const updateData: any = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.adminNotes) {
      updateData.adminNotes = data.adminNotes;
    }

    if (data.status === 'approved') {
      updateData.approvedBy = advertiserId;
      updateData.approvedAt = new Date();
    } else if (data.status === 'rejected') {
      updateData.rejectedBy = advertiserId;
      updateData.rejectedAt = new Date();
      if (data.rejectionReason) {
        updateData.rejectionReason = data.rejectionReason;
      }
    } else if (data.status === 'processing') {
      updateData.processedBy = advertiserId;
    } else if (data.status === 'completed') {
      updateData.processedAt = new Date();
    }

    await db
      .update(payoutRequests)
      .set(updateData)
      .where(eq(payoutRequests.id, requestId));

    // Update invoice status if exists
    if (data.status === 'approved' || data.status === 'completed') {
      await db
        .update(invoices)
        .set({ 
          status: data.status === 'completed' ? 'paid' : 'sent',
          updatedAt: new Date(),
          paidAt: data.status === 'completed' ? new Date() : undefined
        })
        .where(eq(invoices.payoutRequestId, requestId));
    }

    res.json({ success: true, message: `Payout request ${data.status}` });

  } catch (error) {
    console.error("Error updating payout request:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bulk payout actions
router.post("/api/advertiser/payout-requests/bulk", authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = req.user.id;
    const data = bulkPayoutActionSchema.parse(req.body);

    // Verify all requests belong to this advertiser
    const requests = await db
      .select({ id: payoutRequests.id, status: payoutRequests.status })
      .from(payoutRequests)
      .where(and(
        inArray(payoutRequests.id, data.requestIds),
        eq(payoutRequests.advertiserId, advertiserId)
      ));

    if (requests.length !== data.requestIds.length) {
      return res.status(400).json({ error: "Some payout requests not found or not owned by advertiser" });
    }

    // Check if any requests are already processed
    const invalidRequests = requests.filter(r => 
      r.status === 'completed' || r.status === 'cancelled'
    );

    if (invalidRequests.length > 0) {
      return res.status(400).json({ error: "Cannot modify completed or cancelled requests" });
    }

    // Prepare update data
    let status: any;
    let updateData: any = { updatedAt: new Date() };

    switch (data.action) {
      case 'approve':
        status = 'approved';
        updateData.approvedBy = advertiserId;
        updateData.approvedAt = new Date();
        break;
      case 'reject':
        status = 'rejected';
        updateData.rejectedBy = advertiserId;
        updateData.rejectedAt = new Date();
        if (data.rejectionReason) {
          updateData.rejectionReason = data.rejectionReason;
        }
        break;
      case 'process':
        status = 'processing';
        updateData.processedBy = advertiserId;
        break;
    }

    updateData.status = status;

    if (data.adminNotes) {
      updateData.adminNotes = data.adminNotes;
    }

    // Update all requests
    await db
      .update(payoutRequests)
      .set(updateData)
      .where(inArray(payoutRequests.id, data.requestIds));

    // Update corresponding invoices
    if (status === 'approved') {
      await db
        .update(invoices)
        .set({ status: 'sent', updatedAt: new Date() })
        .where(inArray(invoices.payoutRequestId, data.requestIds));
    }

    res.json({ 
      success: true, 
      message: `${data.requestIds.length} payout requests ${data.action}d successfully`
    });

  } catch (error) {
    console.error("Error bulk updating payout requests:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get payout request details
router.get("/api/advertiser/payout-requests/:id", authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const requestId = req.params.id;
    const advertiserId = req.user.id;

    const request = await db
      .select({
        // Payout request details
        id: payoutRequests.id,
        partnerId: payoutRequests.partnerId,
        amount: payoutRequests.amount,
        currency: payoutRequests.currency,
        paymentMethod: payoutRequests.paymentMethod,
        walletAddress: payoutRequests.walletAddress,
        walletNetwork: payoutRequests.walletNetwork,
        bankDetails: payoutRequests.bankDetails,
        status: payoutRequests.status,
        partnerNote: payoutRequests.partnerNote,
        adminNotes: payoutRequests.adminNotes,
        rejectionReason: payoutRequests.rejectionReason,
        invoiceId: payoutRequests.invoiceId,
        gatewayType: payoutRequests.gatewayType,
        gatewayTransactionId: payoutRequests.gatewayTransactionId,
        partnerBalanceAtRequest: payoutRequests.partnerBalanceAtRequest,
        processedAmount: payoutRequests.processedAmount,
        gatewayFee: payoutRequests.gatewayFee,
        ipAddress: payoutRequests.ipAddress,
        userAgent: payoutRequests.userAgent,
        createdAt: payoutRequests.createdAt,
        updatedAt: payoutRequests.updatedAt,
        approvedAt: payoutRequests.approvedAt,
        processedAt: payoutRequests.processedAt,
        rejectedAt: payoutRequests.rejectedAt,
        // Partner details
        partnerUsername: users.username,
        partnerEmail: users.email,
        partnerFirstName: users.firstName,
        partnerLastName: users.lastName,
        partnerCompany: users.company,
      })
      .from(payoutRequests)
      .leftJoin(users, eq(payoutRequests.partnerId, users.id))
      .where(and(
        eq(payoutRequests.id, requestId),
        eq(payoutRequests.advertiserId, advertiserId)
      ))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: "Payout request not found" });
    }

    // Get invoice details if exists
    let invoice = null;
    if (request[0].invoiceId) {
      const invoiceResult = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, request[0].invoiceId))
        .limit(1);

      if (invoiceResult.length > 0) {
        invoice = invoiceResult[0];
      }
    }

    res.json({
      request: request[0],
      invoice: invoice
    });

  } catch (error) {
    console.error("Error fetching payout request details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Payment Gateway Configuration Management

// Get gateway configurations for advertiser
router.get("/api/advertiser/gateway-configs", authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = req.user.id;

    const configs = await db
      .select({
        id: paymentGatewayConfigs.id,
        gatewayType: paymentGatewayConfigs.gatewayType,
        isActive: paymentGatewayConfigs.isActive,
        isDefault: paymentGatewayConfigs.isDefault,
        supportedCurrencies: paymentGatewayConfigs.supportedCurrencies,
        minimumAmount: paymentGatewayConfigs.minimumAmount,
        maximumAmount: paymentGatewayConfigs.maximumAmount,
        feePercentage: paymentGatewayConfigs.feePercentage,
        fixedFee: paymentGatewayConfigs.fixedFee,
        processingTime: paymentGatewayConfigs.processingTime,
        lastUsed: paymentGatewayConfigs.lastUsed,
        createdAt: paymentGatewayConfigs.createdAt,
        updatedAt: paymentGatewayConfigs.updatedAt,
      })
      .from(paymentGatewayConfigs)
      .where(eq(paymentGatewayConfigs.advertiserId, advertiserId))
      .orderBy(desc(paymentGatewayConfigs.updatedAt));

    res.json({ configs });

  } catch (error) {
    console.error("Error fetching gateway configurations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add or update gateway configuration
router.post("/api/advertiser/gateway-configs", authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = req.user.id;
    const data = gatewayConfigSchema.parse(req.body);

    // If setting as default, remove default from other configs
    if (data.isDefault) {
      await db
        .update(paymentGatewayConfigs)
        .set({ isDefault: false })
        .where(eq(paymentGatewayConfigs.advertiserId, advertiserId));
    }

    // Encrypt sensitive data before storing
    const configData: InsertPaymentGatewayConfig = {
      advertiserId: advertiserId,
      gatewayType: data.gatewayType,
      isActive: data.isActive,
      isDefault: data.isDefault || false,
      supportedCurrencies: data.supportedCurrencies,
      minimumAmount: data.minimumAmount?.toString(),
      maximumAmount: data.maximumAmount?.toString(),
      feePercentage: data.feePercentage?.toString(),
      fixedFee: data.fixedFee?.toString(),
      processingTime: data.processingTime,
      configuration: data.configuration,
    };

    // In a production environment, encrypt sensitive fields
    if (data.apiKey) {
      configData.apiKey = data.apiKey; // Should be encrypted
    }
    if (data.apiSecret) {
      configData.apiSecret = data.apiSecret; // Should be encrypted
    }
    if (data.webhookSecret) {
      configData.webhookSecret = data.webhookSecret; // Should be encrypted
    }

    const [config] = await db
      .insert(paymentGatewayConfigs)
      .values(configData)
      .returning({ id: paymentGatewayConfigs.id });

    res.json({ 
      success: true, 
      configId: config.id, 
      message: "Gateway configuration saved successfully"
    });

  } catch (error) {
    console.error("Error saving gateway configuration:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;