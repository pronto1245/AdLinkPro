import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { eq, and, desc, asc, sql, count, sum } from "drizzle-orm";
import { db } from "../db";
import { 
  payoutRequests, 
  invoices, 
  paymentGatewayConfigs, 
  users, 
  financialTransactions,
  type InsertPayoutRequest,
  type PayoutRequest,
  type InsertInvoice,
  type InsertPaymentGatewayConfig
} from "@shared/schema";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = express.Router();

// Validation schemas
const createPayoutRequestSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  currency: z.enum(["USD", "EUR", "BTC", "ETH", "USDT", "USDC", "TRX"]),
  paymentMethod: z.enum(["crypto", "bank_transfer", "paypal", "stripe", "manual"]),
  walletAddress: z.string().optional(),
  walletNetwork: z.string().optional(),
  bankDetails: z.object({
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    iban: z.string().optional(),
    swift: z.string().optional(),
  }).optional(),
  partnerNote: z.string().max(500).optional(),
});

const updatePayoutStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "processing", "completed", "failed", "cancelled"]),
  adminNotes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(500).optional(),
});

// Crypto wallet validation functions
const validateWalletAddress = (address: string, currency: string): boolean => {
  if (!address) return false;
  
  switch (currency) {
    case "BTC":
      // Basic Bitcoin address validation (simplified)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
    case "ETH":
    case "USDT":
    case "USDC":
      // Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "TRX":
      // Tron address validation
      return /^T[A-Za-z1-9]{33}$/.test(address);
    default:
      return true; // For fiat currencies, skip wallet validation
  }
};

// Generate next invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const lastInvoice = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(sql`invoice_number LIKE 'AUTO-INV-${year}-%'`)
    .orderBy(desc(invoices.createdAt))
    .limit(1);

  let nextNumber = 1;
  if (lastInvoice.length > 0) {
    const match = lastInvoice[0].invoiceNumber.match(/AUTO-INV-\d{4}-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `AUTO-INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

// Partner routes

// Create payout request
router.post("/api/affiliate/payout-requests", authenticateToken, requireRole(['affiliate']), async (req, res) => {
  try {
    const data = createPayoutRequestSchema.parse(req.body);
    const partnerId = req.user.id;

    // Validate crypto wallet address if applicable
    if (data.paymentMethod === "crypto" && data.currency !== "USD") {
      if (!data.walletAddress) {
        return res.status(400).json({ error: "Wallet address is required for crypto payments" });
      }
      if (!validateWalletAddress(data.walletAddress, data.currency)) {
        return res.status(400).json({ error: "Invalid wallet address format" });
      }
    }

    // Get partner's current balance
    const partner = await db
      .select({ balance: users.balance, advertiserId: users.advertiserId })
      .from(users)
      .where(eq(users.id, partnerId))
      .limit(1);

    if (partner.length === 0) {
      return res.status(404).json({ error: "Partner not found" });
    }

    const partnerBalance = parseFloat(partner[0].balance || "0");
    const requestedAmount = data.amount;

    // Validate balance
    if (partnerBalance < requestedAmount) {
      return res.status(400).json({ 
        error: "Insufficient balance", 
        currentBalance: partnerBalance,
        requestedAmount: requestedAmount
      });
    }

    // Get advertiser ID
    const advertiserId = partner[0].advertiserId;
    if (!advertiserId) {
      return res.status(400).json({ error: "No advertiser associated with this partner" });
    }

    // Create payout request
    const payoutRequestId = randomUUID();
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    const newPayoutRequest: InsertPayoutRequest = {
      id: payoutRequestId,
      advertiserId: advertiserId,
      partnerId: partnerId,
      amount: requestedAmount.toString(),
      currency: data.currency,
      walletAddress: data.walletAddress,
      walletNetwork: data.walletNetwork,
      bankDetails: data.bankDetails,
      paymentMethod: data.paymentMethod,
      partnerNote: data.partnerNote,
      status: "pending",
      partnerBalanceAtRequest: partnerBalance.toString(),
      ipAddress: ipAddress,
      userAgent: userAgent,
    };

    await db.insert(payoutRequests).values(newPayoutRequest);

    // Auto-generate invoice
    try {
      const invoiceNumber = await generateInvoiceNumber();
      const invoiceId = randomUUID();
      
      const invoice: InsertInvoice = {
        id: invoiceId,
        invoiceNumber: invoiceNumber,
        payoutRequestId: payoutRequestId,
        advertiserId: advertiserId,
        partnerId: partnerId,
        amount: requestedAmount.toString(),
        currency: data.currency,
        totalAmount: requestedAmount.toString(),
        description: `Payout request for ${data.currency} ${requestedAmount}`,
      };

      await db.insert(invoices).values(invoice);

      // Update payout request with invoice ID
      await db
        .update(payoutRequests)
        .set({ invoiceId: invoiceId })
        .where(eq(payoutRequests.id, payoutRequestId));

    } catch (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      // Continue without failing the payout request
    }

    res.json({ 
      success: true, 
      payoutRequestId: payoutRequestId,
      message: "Payout request created successfully"
    });

  } catch (error) {
    console.error("Error creating payout request:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get partner's payout requests
router.get("/api/affiliate/payout-requests", authenticateToken, requireRole(['affiliate']), async (req, res) => {
  try {
    const partnerId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: payoutRequests.id,
        amount: payoutRequests.amount,
        currency: payoutRequests.currency,
        paymentMethod: payoutRequests.paymentMethod,
        status: payoutRequests.status,
        partnerNote: payoutRequests.partnerNote,
        adminNotes: payoutRequests.adminNotes,
        rejectionReason: payoutRequests.rejectionReason,
        invoiceId: payoutRequests.invoiceId,
        createdAt: payoutRequests.createdAt,
        updatedAt: payoutRequests.updatedAt,
        approvedAt: payoutRequests.approvedAt,
        processedAt: payoutRequests.processedAt,
      })
      .from(payoutRequests)
      .where(eq(payoutRequests.partnerId, partnerId));

    if (status) {
      query = query.where(and(
        eq(payoutRequests.partnerId, partnerId),
        eq(payoutRequests.status, status as any)
      ));
    }

    const requests = await query
      .orderBy(desc(payoutRequests.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(payoutRequests)
      .where(status ? 
        and(eq(payoutRequests.partnerId, partnerId), eq(payoutRequests.status, status as any)) :
        eq(payoutRequests.partnerId, partnerId)
      );

    res.json({
      requests: requests,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching payout requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get partner's balance
router.get("/api/affiliate/balance", authenticateToken, requireRole(['affiliate']), async (req, res) => {
  try {
    const partnerId = req.user.id;

    const partner = await db
      .select({ 
        balance: users.balance,
        holdAmount: users.holdAmount,
        currency: users.currency
      })
      .from(users)
      .where(eq(users.id, partnerId))
      .limit(1);

    if (partner.length === 0) {
      return res.status(404).json({ error: "Partner not found" });
    }

    // Get pending payout amount
    const pendingPayouts = await db
      .select({ totalPending: sum(payoutRequests.amount) })
      .from(payoutRequests)
      .where(and(
        eq(payoutRequests.partnerId, partnerId),
        sql`status IN ('pending', 'approved', 'processing')`
      ));

    const pendingAmount = parseFloat(pendingPayouts[0].totalPending?.toString() || "0");

    res.json({
      balance: parseFloat(partner[0].balance || "0"),
      holdAmount: parseFloat(partner[0].holdAmount || "0"),
      availableBalance: parseFloat(partner[0].balance || "0") - pendingAmount,
      pendingPayouts: pendingAmount,
      currency: partner[0].currency || "USD"
    });

  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;