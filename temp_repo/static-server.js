#!/usr/bin/env node

/**
 * Simple static file server to test built assets
 * Ensures proper Content-Type headers for JS/CSS files
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'client', 'dist');

// Ensure proper Content-Type headers for static assets
app.use('/assets', express.static(path.join(DIST_PATH, 'assets'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.map')) {
      res.setHeader('Content-Type', 'application/json');
    }
    // Add cache headers for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Serve other static files (favicons, etc.)
app.use(express.static(DIST_PATH, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'index.html not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Static server running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${DIST_PATH}`);
});