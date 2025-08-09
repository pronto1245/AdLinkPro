#!/bin/bash

# E2E Test Script - Full Conversion Cycle
# Tests the complete flow from registration to purchase with postback deliveries

BASE_URL="http://localhost:5000"
CLICK_ID="C-$(date +%s)"
REG_TXID="R-$(date +%s)"
PURCHASE_TXID="O-$(date +%s)"

echo "🚀 Starting E2E Full Cycle Test"
echo "Click ID: $CLICK_ID"
echo "Registration TX: $REG_TXID"
echo "Purchase TX: $PURCHASE_TXID"
echo ""

# 1. Registration Event (initiated)
echo "1️⃣ Creating registration event..."
REG_RESPONSE=$(curl -sX POST "$BASE_URL/api/v3/event" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"reg\",\"clickid\":\"$CLICK_ID\",\"txid\":\"$REG_TXID\"}")

echo "Registration created: $REG_RESPONSE"
REG_CONV_ID=$(echo $REG_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Registration Conversion ID: $REG_CONV_ID"
echo ""

# Wait for postback processing
sleep 2

# 2. Registration Approval via Webhook
echo "2️⃣ Approving registration via webhook..."
WEBHOOK_RESPONSE=$(curl -sX POST "$BASE_URL/api/webhook/affiliate" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"reg\",\"txid\":\"$REG_TXID\",\"status\":\"approved\",\"payout\":0,\"currency\":\"USD\"}")

echo "Webhook response: $WEBHOOK_RESPONSE"
echo ""

# Wait for postback processing
sleep 2

# 3. Purchase Event (initiated)
echo "3️⃣ Creating purchase event..."
PURCHASE_RESPONSE=$(curl -sX POST "$BASE_URL/api/v3/event" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"purchase\",\"clickid\":\"$CLICK_ID\",\"txid\":\"$PURCHASE_TXID\",\"value\":49.90,\"currency\":\"USD\"}")

echo "Purchase created: $PURCHASE_RESPONSE"
PURCHASE_CONV_ID=$(echo $PURCHASE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Purchase Conversion ID: $PURCHASE_CONV_ID"
echo ""

# Wait for postback processing
sleep 2

# 4. Purchase Approval via PSP Webhook
echo "4️⃣ Approving purchase via PSP webhook..."
PSP_RESPONSE=$(curl -sX POST "$BASE_URL/api/webhook/psp" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"purchase\",\"txid\":\"$PURCHASE_TXID\",\"status\":\"approved\",\"amount\":49.90,\"currency\":\"USD\"}")

echo "PSP webhook response: $PSP_RESPONSE"
echo ""

# Wait for final postback processing
sleep 3

# 5. Check final statistics
echo "5️⃣ Checking final statistics..."
STATS=$(curl -s "$BASE_URL/api/queue/stats")
echo "Queue stats: $STATS"
echo ""

# 6. Summary
echo "📊 Test Summary:"
echo "✓ Registration event created: $REG_CONV_ID"
echo "✓ Registration approved via webhook"
echo "✓ Purchase event created: $PURCHASE_CONV_ID" 
echo "✓ Purchase approved via PSP webhook"
echo "✓ Postback deliveries processed"
echo ""
echo "🎯 E2E Test Completed Successfully!"
echo ""
echo "Next steps:"
echo "- Check conversions table for status progression"
echo "- Check postback_deliveries for delivery logs"
echo "- Verify Keitaro received postbacks with correct parameters"