#!/bin/bash

# Manual test script to verify 2FA is disabled and login works
# Based on user request: "пока делаем без интеграции 2FA. можешь сделать, но временно отключить, чтобы при входе 2FA не требовалось"

echo "🔐 Testing login without 2FA requirement..."

# Start server in background (if not already running)
JWT_SECRET=test-secret npm start &
SERVER_PID=$!
sleep 3

echo "📝 Testing owner login (should work without 2FA):"
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"Affilix123!"}' \
  http://localhost:3000/api/auth/login 2>/dev/null | python3 -m json.tool

echo -e "\n📝 Testing advertiser login (should work without 2FA):"
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"advertiser","password":"adv123"}' \
  http://localhost:3000/api/auth/login 2>/dev/null | python3 -m json.tool

echo -e "\n📝 Testing partner login (should work without 2FA):"
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"partner","password":"partner123"}' \
  http://localhost:3000/api/auth/login 2>/dev/null | python3 -m json.tool

echo -e "\n📝 Testing email login (should work without 2FA):"
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"9791207@gmail.com","password":"Affilix123!"}' \
  http://localhost:3000/api/auth/login 2>/dev/null | python3 -m json.tool

# Clean up
kill $SERVER_PID 2>/dev/null

echo -e "\n✅ All logins should complete successfully without 2FA verification"
echo "🔍 Check that twoFactorEnabled is false in all responses"
echo "⚠️  No requires2FA field should be present in responses"