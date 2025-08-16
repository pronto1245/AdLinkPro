#!/usr/bin/env node

// Production deployment script
// Starts the server without migrations to avoid deployment hanging

console.log('🚀 Starting AdLinkPro in production mode...');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Import and start the production server
import('./dist/index.js')
  .then(() => {
    console.log('✅ AdLinkPro production server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  });