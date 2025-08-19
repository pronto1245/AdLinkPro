#!/usr/bin/env node

// Simple financial module test without database dependency
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;

// Middleware
app.use(express.json());

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    id: 'test-admin-id',
    username: 'test-admin',
    email: 'admin@test.com',
    role: 'super_admin'
  };
  next();
};

// Mock financial endpoints (simplified versions from routes.ts)
app.get("/api/admin/financial-metrics/:period", mockAuthMiddleware, (req, res) => {
  const period = req.params.period;
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d': startDate.setDate(endDate.getDate() - 7); break;
    case '30d': startDate.setDate(endDate.getDate() - 30); break;
    case '90d': startDate.setDate(endDate.getDate() - 90); break;
    default: startDate.setDate(endDate.getDate() - 30);
  }
  
  // Mock data - simulating the fallback logic from routes.ts
  const mockData = {
    platformBalance: 125000,
    advertiserRevenue: 85000,
    partnerPayouts: 32000,
    platformCommission: 53000,
    revenueGrowth: 12.5,
    period,
    dateRange: { startDate, endDate },
    source: 'mock-data' // indicator this is test data
  };
  
  console.log(`✅ Financial metrics request for period: ${period}`);
  res.json(mockData);
});

app.get("/api/admin/finances", mockAuthMiddleware, (req, res) => {
  const mockTransactions = [
    {
      id: "txn-001",
      amount: "5000.00",
      currency: "USD",
      type: "deposit",
      status: "completed",
      description: "Advertiser deposit",
      paymentMethod: "Bank Transfer",
      createdAt: new Date(),
      user: { id: "user-001", username: "advertiser1", email: "adv@example.com", role: "advertiser" }
    },
    {
      id: "txn-002",
      amount: "1500.00",
      currency: "USD",
      type: "payout",
      status: "pending",
      description: "Partner payout",
      paymentMethod: "PayPal",
      createdAt: new Date(Date.now() - 3600000),
      user: { id: "user-002", username: "partner1", email: "partner@example.com", role: "affiliate" }
    }
  ];
  
  console.log(`✅ Finances request - returning ${mockTransactions.length} transactions`);
  res.json(mockTransactions);
});

app.get("/api/admin/payout-requests", mockAuthMiddleware, (req, res) => {
  const mockPayoutRequests = [
    {
      id: "payout-001",
      amount: "1500.00",
      currency: "USD",
      status: "pending",
      paymentMethod: "PayPal",
      walletAddress: "user@paypal.com",
      description: "Partner payout request",
      requestedAt: new Date(),
      user: { id: "user-002", username: "partner1", email: "partner@example.com" }
    },
    {
      id: "payout-002",
      amount: "2500.00",
      currency: "USD",
      status: "completed",
      paymentMethod: "Bank Transfer",
      walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      description: "Crypto payout",
      requestedAt: new Date(Date.now() - 86400000),
      processedAt: new Date(Date.now() - 3600000),
      user: { id: "user-003", username: "partner2", email: "partner2@example.com" }
    }
  ];
  
  console.log(`✅ Payout requests - returning ${mockPayoutRequests.length} requests`);
  res.json(mockPayoutRequests);
});

app.get("/api/admin/deposits", mockAuthMiddleware, (req, res) => {
  const mockDeposits = [
    {
      id: "dep-001",
      amount: 5000,
      currency: "USD",
      status: "completed",
      paymentMethod: "Bank Transfer",
      description: "Monthly budget deposit",
      createdAt: new Date(),
      user: { 
        id: "user-001", 
        username: "advertiser1", 
        email: "adv@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "advertiser",
        company: "TechCorp Ltd"
      }
    }
  ];
  
  console.log(`✅ Deposits request - returning ${mockDeposits.length} deposits`);
  res.json(mockDeposits);
});

app.get("/api/admin/commission-data", mockAuthMiddleware, (req, res) => {
  const mockCommissionData = [];
  const now = new Date();
  
  // Generate 30 days of commission data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    mockCommissionData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      payouts: Math.floor(Math.random() * 2000) + 800,
      commission: Math.floor(Math.random() * 1500) + 500
    });
  }
  
  console.log(`✅ Commission data request - returning ${mockCommissionData.length} days of data`);
  res.json(mockCommissionData);
});

app.get("/api/admin/financial-chart/:period", mockAuthMiddleware, (req, res) => {
  const period = req.params.period;
  let days = 30;
  
  switch (period) {
    case '7d': days = 7; break;
    case '30d': days = 30; break;
    case '90d': days = 90; break;
  }
  
  const chartData = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 3000) + 1000,
      payouts: Math.floor(Math.random() * 1500) + 500,
      commission: Math.floor(Math.random() * 1000) + 300,
      netFlow: Math.floor(Math.random() * 500) + 200
    });
  }
  
  console.log(`✅ Financial chart request for ${period} - returning ${chartData.length} data points`);
  res.json(chartData);
});

app.get("/api/admin/crypto-portfolio", mockAuthMiddleware, (req, res) => {
  const mockCryptoPortfolio = [
    {
      currency: "BTC",
      balance: 2.5,
      usdValue: 112500,
      change24h: 3.2,
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    },
    {
      currency: "ETH", 
      balance: 15.8,
      usdValue: 39500,
      change24h: -1.8,
      address: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
    },
    {
      currency: "USDT",
      balance: 25000,
      usdValue: 25000,
      change24h: 0.1,
      address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oREi9x"
    }
  ];
  
  console.log(`✅ Crypto portfolio request - returning ${mockCryptoPortfolio.length} currencies`);
  res.json(mockCryptoPortfolio);
});

app.get("/api/admin/crypto-wallets", mockAuthMiddleware, (req, res) => {
  const mockCryptoWallets = [
    {
      id: "wallet-001",
      name: "BTC Hot Wallet",
      currency: "BTC",
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      balance: 2.5,
      status: "active",
      type: "hot",
      lastActivity: new Date()
    },
    {
      id: "wallet-002", 
      name: "ETH Main Wallet",
      currency: "ETH",
      address: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
      balance: 15.8,
      status: "active", 
      type: "hot",
      lastActivity: new Date(Date.now() - 3600000)
    }
  ];
  
  console.log(`✅ Crypto wallets request - returning ${mockCryptoWallets.length} wallets`);
  res.json(mockCryptoWallets);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Financial module test server is running",
    endpoints: [
      "GET /api/admin/financial-metrics/:period",
      "GET /api/admin/finances", 
      "GET /api/admin/payout-requests",
      "GET /api/admin/deposits",
      "GET /api/admin/commission-data",
      "GET /api/admin/financial-chart/:period",
      "GET /api/admin/crypto-portfolio",
      "GET /api/admin/crypto-wallets"
    ]
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Financial Module Test Server running on http://localhost:${port}`);
  console.log(`📊 Test the endpoints:`);
  console.log(`   Health: http://localhost:${port}/health`);
  console.log(`   Metrics: http://localhost:${port}/api/admin/financial-metrics/30d`);
  console.log(`   Transactions: http://localhost:${port}/api/admin/finances`);
  console.log(`   Payouts: http://localhost:${port}/api/admin/payout-requests`);
  console.log(`   Deposits: http://localhost:${port}/api/admin/deposits`);
  console.log(`   Commission: http://localhost:${port}/api/admin/commission-data`);
  console.log(`   Chart: http://localhost:${port}/api/admin/financial-chart/30d`);
  console.log(`   Crypto Portfolio: http://localhost:${port}/api/admin/crypto-portfolio`);
  console.log(`   Crypto Wallets: http://localhost:${port}/api/admin/crypto-wallets`);
});