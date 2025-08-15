#!/bin/bash
# Koyeb Deployment Script for AdLinkPro

echo "🚀 Starting Koyeb deployment for AdLinkPro..."

# Check if Koyeb CLI is installed
if ! command -v koyeb &> /dev/null; then
    echo "Installing Koyeb CLI..."
    curl -sSL https://koyeb.com/install.sh | bash
    export PATH="$HOME/.koyeb:$PATH"
fi

# Create .koyeb.yaml deployment config
cat > .koyeb.yaml << EOF
# Koyeb deployment configuration for AdLinkPro
app: adlinkpro
services:
  - name: adlinkpro-backend
    type: web
    git:
      repository: github.com/YOUR_USERNAME/AdLinkPro
      branch: main
    env:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "8000"
      - name: DATABASE_URL
        value: "\${DATABASE_URL}"
      - name: JWT_SECRET
        value: "\${JWT_SECRET}"
      - name: SESSION_SECRET
        value: "\${SESSION_SECRET}"
    regions:
      - fra
    instance_type: free
    scale:
      min: 1
      max: 1
    health_check:
      http:
        port: 8000
        path: /health
    build:
      commands:
        - npm install
        - npm run build
    run:
      command: npm start
EOF

echo "✅ Koyeb config created"
echo "📝 Next steps:"
echo "1. Push code to GitHub repository 'AdLinkPro'"
echo "2. Go to https://app.koyeb.com/"
echo "3. Create new service from GitHub"
echo "4. Add environment variables:"
echo "   DATABASE_URL=<your_neon_connection_string>"
echo "   JWT_SECRET=hfxKEyw7TUYpimDwqDXbBMXxTXGGh5zE"
echo "   SESSION_SECRET=iP0q834n8AokwfuJRD445R1lVP6gH83i"
echo "   NODE_ENV=production"
echo "   PORT=8000"
echo "🎯 Expected URL: https://adlinkpro.koyeb.app"