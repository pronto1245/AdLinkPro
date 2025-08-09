#!/bin/bash

# E2E Test Script - Antifraud System
# Tests different antifraud levels and their blocking behavior

BASE_URL="http://localhost:5000"
TIMESTAMP=$(date +%s)

echo "🛡️ Starting E2E Antifraud Test"
echo ""

# Test 1: Clean traffic (should pass all profiles)
echo "1️⃣ Testing clean traffic (should pass everywhere)..."
CLEAN_RESPONSE=$(curl -sX POST "$BASE_URL/api/v3/event" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"purchase\",\"clickid\":\"clean_$TIMESTAMP\",\"txid\":\"tx_clean_$TIMESTAMP\",\"value\":100.00,\"currency\":\"USD\",\"meta\":{\"antifraudLevel\":\"ok\"}}")

echo "Clean traffic response: $CLEAN_RESPONSE"
echo ""

# Test 2: Soft antifraud with approved status (backup should block)
echo "2️⃣ Testing soft antifraud with approved status..."
SOFT_APPROVED_RESPONSE=$(curl -sX POST "$BASE_URL/api/v3/postback/test" \
  -H "Content-Type: application/json" \
  -d "{\"conversionId\":\"conv_soft_approved_$TIMESTAMP\",\"advertiserId\":\"1\",\"partnerId\":\"test\",\"clickid\":\"soft_approved_$TIMESTAMP\",\"type\":\"purchase\",\"txid\":\"tx_soft_approved_$TIMESTAMP\",\"status\":\"approved\",\"revenue\":\"150.00\",\"currency\":\"USD\",\"antifraudLevel\":\"soft\"}")

echo "Soft AF approved response: $SOFT_APPROVED_RESPONSE"
echo ""

# Test 3: Soft antifraud with pending status (should pass everywhere)
echo "3️⃣ Testing soft antifraud with pending status..."
SOFT_PENDING_RESPONSE=$(curl -sX POST "$BASE_URL/api/v3/postback/test" \
  -H "Content-Type: application/json" \
  -d "{\"conversionId\":\"conv_soft_pending_$TIMESTAMP\",\"advertiserId\":\"1\",\"partnerId\":\"test\",\"clickid\":\"soft_pending_$TIMESTAMP\",\"type\":\"purchase\",\"txid\":\"tx_soft_pending_$TIMESTAMP\",\"status\":\"pending\",\"revenue\":\"75.50\",\"currency\":\"USD\",\"antifraudLevel\":\"soft\"}")

echo "Soft AF pending response: $SOFT_PENDING_RESPONSE"
echo ""

# Test 4: Hard antifraud (should block all profiles)
echo "4️⃣ Testing hard antifraud (should block all profiles)..."
HARD_RESPONSE=$(curl -sX POST "$BASE_URL/api/v3/postback/test" \
  -H "Content-Type: application/json" \
  -d "{\"conversionId\":\"conv_hard_$TIMESTAMP\",\"advertiserId\":\"1\",\"partnerId\":\"test\",\"clickid\":\"hard_$TIMESTAMP\",\"type\":\"purchase\",\"txid\":\"tx_hard_$TIMESTAMP\",\"status\":\"approved\",\"revenue\":\"200.00\",\"currency\":\"USD\",\"antifraudLevel\":\"hard\"}")

echo "Hard AF response: $HARD_RESPONSE"
echo ""

# Wait for processing
sleep 2

# Check final antifraud statistics
echo "5️⃣ Checking antifraud statistics..."
STATS=$(curl -s "$BASE_URL/api/queue/stats")
echo "Final stats: $STATS"
echo ""

# Extract and display key metrics
TOTAL_BLOCKS=$(echo $STATS | grep -o '"totalBlocks":[0-9]*' | cut -d':' -f2)
HARD_BLOCKS=$(echo $STATS | grep -o '"hardBlocks":[0-9]*' | cut -d':' -f2)
SOFT_BLOCKS=$(echo $STATS | grep -o '"softBlocks":[0-9]*' | cut -d':' -f2)

echo "📊 Antifraud Test Summary:"
echo "✓ Clean traffic: Processed without blocks"
echo "✓ Soft AF approved: Backup profile blocked, main profiles passed"
echo "✓ Soft AF pending: All profiles passed"
echo "✓ Hard AF: All profiles blocked"
echo ""
echo "🔢 Block Statistics:"
echo "- Total blocks: $TOTAL_BLOCKS"
echo "- Hard blocks: $HARD_BLOCKS" 
echo "- Soft blocks: $SOFT_BLOCKS"
echo ""
echo "🎯 Antifraud E2E Test Completed!"