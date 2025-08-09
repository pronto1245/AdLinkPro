#!/bin/bash

# Master E2E Test Runner
# Runs all end-to-end tests in sequence

echo "🎯 Starting Complete E2E Test Suite"
echo "=================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:5000/api/queue/stats > /dev/null; then
    echo "❌ Server is not running on localhost:5000"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo "✅ Server is running, starting tests..."
echo ""

# Run individual test suites
echo "📊 Running Test Suite 1: Full Conversion Cycle"
echo "==============================================="
bash test-e2e-full-cycle.sh
echo ""

echo "🛡️ Running Test Suite 2: Antifraud System"
echo "=========================================="
bash test-antifraud-e2e.sh
echo ""

echo "📡 Running Test Suite 3: Postback Delivery"
echo "=========================================="
bash test-postback-delivery.sh
echo ""

echo "🗄️ Running Test Suite 4: Database Verification"
echo "==============================================="
bash test-database-verification.sh
echo ""

# Final system health check
echo "🏥 Final System Health Check"
echo "============================"

# Check queue stats
FINAL_STATS=$(curl -s http://localhost:5000/api/queue/stats)
echo "Final queue statistics:"
echo "$FINAL_STATS"
echo ""

# Extract key metrics
PROCESSED_TASKS=$(echo $FINAL_STATS | grep -o '"processedTasks":[0-9]*' | cut -d':' -f2)
SUCCESSFUL_DELIVERIES=$(echo $FINAL_STATS | grep -o '"successfulDeliveries":[0-9]*' | cut -d':' -f2)
FAILED_DELIVERIES=$(echo $FINAL_STATS | grep -o '"failedDeliveries":[0-9]*' | cut -d':' -f2)
SUCCESS_RATE=$(echo $FINAL_STATS | grep -o '"successRate":[0-9.]*' | cut -d':' -f2)
TOTAL_BLOCKS=$(echo $FINAL_STATS | grep -o '"totalBlocks":[0-9]*' | cut -d':' -f2)

echo "📈 Overall Test Results:"
echo "========================"
echo "Tasks processed: $PROCESSED_TASKS"
echo "Successful deliveries: $SUCCESSFUL_DELIVERIES"
echo "Failed deliveries: $FAILED_DELIVERIES"
echo "Success rate: $SUCCESS_RATE%"
echo "Antifraud blocks: $TOTAL_BLOCKS"
echo ""

# Calculate overall health score
if [ "$SUCCESS_RATE" != "" ] && (( $(echo "$SUCCESS_RATE > 80" | bc -l) )); then
    HEALTH_STATUS="✅ HEALTHY"
elif [ "$SUCCESS_RATE" != "" ] && (( $(echo "$SUCCESS_RATE > 50" | bc -l) )); then
    HEALTH_STATUS="⚠️ WARNING"
else
    HEALTH_STATUS="❌ CRITICAL"
fi

echo "🎯 System Health: $HEALTH_STATUS"
echo ""

echo "🏁 Complete E2E Test Suite Finished!"
echo "====================================="
echo ""
echo "📋 Test Coverage:"
echo "✓ Event creation (reg/purchase)"
echo "✓ Webhook processing (affiliate/PSP)"  
echo "✓ Postback delivery to trackers"
echo "✓ Antifraud blocking policies"
echo "✓ Database consistency"
echo "✓ Status progression"
echo "✓ Error handling"
echo ""
echo "💡 Next Steps:"
echo "1. Review any failed tests above"
echo "2. Check application logs for errors"
echo "3. Verify external tracker integrations"
echo "4. Monitor system performance"
echo ""

if [ "$HEALTH_STATUS" = "✅ HEALTHY" ]; then
    echo "🎉 All systems operational - ready for production!"
    exit 0
else
    echo "⚠️ Some issues detected - review test output"
    exit 1
fi