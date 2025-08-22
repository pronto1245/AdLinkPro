#!/bin/bash

echo "🔍 AdLinkPro Production Health Check"
echo "====================================="

# Function to check command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo "✅ $1 is installed"
        return 0
    else
        echo "❌ $1 is not installed"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    if [ -n "${!1}" ]; then
        echo "✅ $1 is set"
        return 0
    else
        echo "❌ $1 is not set"
        return 1
    fi
}

# Check required commands
echo
echo "📋 Checking system requirements..."
check_command node
check_command npm
check_command pg_isready || echo "⚠️  PostgreSQL client not found (optional for remote DB)"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo "✅ Node.js version: $(node --version) (>= 20 required)"
else
    echo "❌ Node.js version: $(node --version) (>= 20 required)"
fi

# Check if .env file exists
if [ -f .env ]; then
    echo "✅ .env file exists"
    source .env
else
    echo "❌ .env file not found"
    echo "💡 Copy .env.example to .env or .env.production to .env"
    exit 1
fi

# Check critical environment variables
echo
echo "🔐 Checking environment variables..."
check_env_var JWT_SECRET
check_env_var SESSION_SECRET
check_env_var DATABASE_URL

if [ "$NODE_ENV" = "production" ]; then
    echo "✅ NODE_ENV is set to production"
else
    echo "⚠️  NODE_ENV is not set to production (current: $NODE_ENV)"
fi

# Check JWT secret strength
if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -ge 32 ]; then
    echo "✅ JWT_SECRET has adequate length (${#JWT_SECRET} characters)"
else
    echo "❌ JWT_SECRET is too short (minimum 32 characters recommended)"
fi

# Test database connection (if pg_isready is available)
if command -v pg_isready &> /dev/null; then
    if pg_isready -d "$DATABASE_URL" &> /dev/null; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        echo "💡 Check DATABASE_URL and ensure database is running"
    fi
else
    echo "ℹ️  Database connection not tested (pg_isready not available)"
fi

# Check if build directory exists
if [ -d "dist" ]; then
    echo "✅ Build directory exists"
else
    echo "❌ Build directory not found"
    echo "💡 Run 'npm run build' first"
fi

# Check logs directory
if [ -d "logs" ]; then
    echo "✅ Logs directory exists"
else
    echo "⚠️  Logs directory not found (will be created automatically)"
fi

# Check package.json and dependencies
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    if [ -d "node_modules" ]; then
        echo "✅ Dependencies installed"
    else
        echo "❌ Dependencies not installed"
        echo "💡 Run 'npm install --legacy-peer-deps'"
    fi
else
    echo "❌ package.json not found"
fi

# Final recommendations
echo
echo "📝 Production Recommendations:"
echo "------------------------------"

if [ ${#JWT_SECRET} -lt 48 ]; then
    echo "🔑 Generate a stronger JWT_SECRET:"
    echo "   node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\""
fi

if [ -z "$SENDGRID_API_KEY" ]; then
    echo "📧 Consider setting up email notifications with SENDGRID_API_KEY"
fi

if [ -z "$REDIS_URL" ]; then
    echo "🚀 Consider adding Redis for improved performance (REDIS_URL)"
fi

echo
echo "🔍 Health check completed!"
echo "🚀 If all critical items are ✅, you're ready for production!"