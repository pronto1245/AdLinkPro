#!/bin/bash

# Setup script for payout system
echo "🚀 Setting up AdLinkPro Payout System..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/invoices
mkdir -p logs

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 public/invoices
chmod 755 logs

# Check if database migration needs to be run
echo "🗄️  Checking database..."
if [ -f "migrations/add-payout-system.sql" ]; then
    echo "⚠️  Run the database migration:"
    echo "   psql \$DATABASE_URL -f migrations/add-payout-system.sql"
fi

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET is not set"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run database migration: psql \$DATABASE_URL -f migrations/add-payout-system.sql"
echo "2. Start the server: npm run dev"
echo "3. Visit the demo: http://localhost:5000/payout-demo.html"
echo "4. Test the API: ./test-payout-api.sh"
echo ""
echo "🔗 Endpoints:"
echo "   Partner: /api/affiliate/payout-requests"
echo "   Advertiser: /api/advertiser/payout-requests"
echo "   Balance: /api/affiliate/balance"
echo "   Gateway Config: /api/advertiser/gateway-configs"