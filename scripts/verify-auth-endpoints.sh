#!/bin/bash

# Authentication Endpoints Verification Script
# This script tests the authentication endpoints to verify they are working correctly

echo "🔐 Testing Authentication Endpoints"
echo "=================================="

# Server URL - change this to test different environments
SERVER_URL="https://central-matelda-pronto12-95b8129d.koyeb.app"
LOCAL_URL="http://localhost:5000"

# Test function
test_endpoint() {
  local url=$1
  local endpoint=$2
  local method=$3
  local data=$4
  local description=$5
  
  echo ""
  echo "🧪 Testing: $description"
  echo "URL: $url$endpoint"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "HTTP_CODE:%{http_code}" "$url$endpoint")
  else
    response=$(curl -s -w "HTTP_CODE:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url$endpoint")
  fi
  
  http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
  body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ PASS (HTTP $http_code)"
    if echo "$body" | grep -q '"success":true\|"ok":true'; then
      echo "✅ Response contains success indicator"
    fi
  else
    echo "❌ FAIL (HTTP $http_code)"
    echo "Response: $body"
  fi
}

# Test production server
echo ""
echo "🌐 Testing Production Server: $SERVER_URL"
echo "================================================"

test_endpoint "$SERVER_URL" "/api/health" "GET" "" "Health Check"
test_endpoint "$SERVER_URL" "/api/auth/login" "POST" '{"username":"owner","password":"Affilix123!"}' "Owner Login via /api/auth/login"
test_endpoint "$SERVER_URL" "/auth/login" "POST" '{"username":"advertiser","password":"adv123"}' "Advertiser Login via /auth/login"
test_endpoint "$SERVER_URL" "/api/auth/v2/login" "POST" '{"username":"partner","password":"partner123"}' "Partner Login via /api/auth/v2/login"

# Test if local server is running
if curl -s "$LOCAL_URL/api/health" > /dev/null; then
  echo ""
  echo "🏠 Testing Local Server: $LOCAL_URL"
  echo "====================================="
  
  test_endpoint "$LOCAL_URL" "/api/health" "GET" "" "Health Check"
  test_endpoint "$LOCAL_URL" "/api/auth/login" "POST" '{"username":"owner","password":"Affilix123!"}' "Owner Login via /api/auth/login"
  test_endpoint "$LOCAL_URL" "/auth/login" "POST" '{"username":"advertiser","password":"adv123"}' "Advertiser Login via /auth/login"
else
  echo ""
  echo "🏠 Local server not running at $LOCAL_URL"
  echo "To test locally, run: npm run dev"
fi

echo ""
echo "📋 Summary"
echo "=========="
echo "The following endpoints should now be available:"
echo "✅ GET  /api/health - Health check"
echo "✅ POST /api/auth/login - Main authentication endpoint"
echo "✅ POST /auth/login - Alternative authentication endpoint"
echo "✅ POST /api/auth/v2/login - V2 authentication endpoint"
echo "✅ POST /api/auth/fixed/login - Fixed authentication endpoint"
echo ""
echo "Test credentials:"
echo "- Owner: username='owner', password='Affilix123!'"
echo "- Advertiser: username='advertiser', password='adv123'"  
echo "- Partner: username='partner', password='partner123'"
echo ""
echo "🔧 If endpoints are not working on production:"
echo "1. Ensure JWT_SECRET environment variable is set"
echo "2. Check that the server is properly deployed with the latest changes"
echo "3. Verify CORS settings allow requests from your domain"