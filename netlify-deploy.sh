#!/bin/bash
# Netlify Deployment Script for AdLinkPro Frontend

echo "🌐 Starting Netlify deployment for AdLinkPro frontend..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Create client build directory if it doesn't exist
mkdir -p client

echo "✅ Netlify config already exists in netlify.toml"
echo "📝 Next steps:"
echo "1. Push code to GitHub repository 'AdLinkPro'"
echo "2. Go to https://app.netlify.com/"
echo "3. Click 'New site from Git'"
echo "4. Select GitHub repository 'AdLinkPro'"
echo "5. Configure build settings:"
echo "   Base directory: client"
echo "   Build command: npm run build"
echo "   Publish directory: client/dist"
echo "6. Add environment variables:"
echo "   VITE_API_BASE_URL=https://adlinkpro.koyeb.app"
echo "   NODE_VERSION=18"
echo "🎯 Expected URL: https://adlinkpro.netlify.app"