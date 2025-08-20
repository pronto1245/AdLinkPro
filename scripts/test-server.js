#!/usr/bin/env node

/**
 * Test server for postback endpoints
 * Uses memory storage instead of database for testing
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(cors());

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // Add mock user to request
  req.user = {
    id: 'user_123',
    email: 'test@example.com',
    role: 'partner',
    username: 'testuser'
  };
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Test server running',
    timestamp: new Date().toISOString()
  });
});

// V1 Postback API
app.get('/api/v1/postback', mockAuth, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'pb_001',
        name: 'Test Postback Profile',
        endpointUrl: 'https://tracker.example.com/postback',
        method: 'GET',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ],
    count: 1
  });
});

// Admin postback logs
app.get('/api/admin/postback-logs', mockAuth, (req, res) => {
  res.json([
    {
      id: 'log_001',
      postbackId: 'pb_001',
      status: 'success',
      url: 'https://tracker.example.com/postback?clickid=abc123',
      responseCode: 200,
      createdAt: new Date().toISOString()
    }
  ]);
});

// Admin postback templates
app.get('/api/admin/postback-templates', mockAuth, (req, res) => {
  res.json([
    {
      id: 'tpl_001',
      name: 'Basic Tracker Template',
      url: 'https://tracker.com/postback?click_id={clickid}&status={status}',
      level: 'global',
      isActive: true
    }
  ]);
});

// Get single postback template by ID
app.get('/api/admin/postback-templates/:id', mockAuth, (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Basic Tracker Template',
    url: 'https://tracker.com/postback?click_id={clickid}&status={status}',
    level: 'global',
    isActive: true
  });
});

// Postback profiles (affiliate)
app.get('/api/postback/profiles', mockAuth, (req, res) => {
  res.json([
    {
      id: 'prof_001',
      name: 'Affiliate Postback Profile',
      endpointUrl: 'https://affiliate-tracker.com/postback',
      method: 'GET',
      ownerId: req.user.id,
      createdAt: new Date().toISOString()
    }
  ]);
});

// Postback deliveries
app.get('/api/postback/deliveries', (req, res) => {
  res.json([
    {
      id: 'del_001',
      profileId: 'prof_001',
      clickid: 'click_123',
      status: 'delivered',
      responseCode: 200,
      duration: 150,
      createdAt: new Date().toISOString()
    }
  ]);
});

// Postback logs alias
app.get('/api/postback/logs', (req, res) => {
  res.json([
    {
      id: 'log_001',
      postbackName: 'Test Postback',
      status: 'success',
      url: 'https://tracker.com/postback?clickid=test123',
      sentAt: new Date().toISOString()
    }
  ]);
});

// Postback profiles collection
app.get('/api/postback-profiles', mockAuth, (req, res) => {
  res.json([
    {
      id: 'prof_001',
      name: 'Main Postback Profile',
      ownerId: req.user.id,
      ownerScope: req.user.role,
      isActive: true
    }
  ]);
});

// Get single postback profile by ID
app.get('/api/postback-profiles/:id', mockAuth, (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Main Postback Profile',
    ownerId: req.user.id,
    ownerScope: req.user.role,
    isActive: true
  });
});

// Retry postback
app.post('/api/admin/postback-logs/:id/retry', mockAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Postback queued for retry',
    logId: req.params.id
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('📡 Ready to test postback endpoints');
});