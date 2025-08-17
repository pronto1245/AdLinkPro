#!/bin/bash

# Test script for payout request system
# Usage: ./test-payout-api.sh

API_BASE="http://localhost:5000"
PARTNER_TOKEN=""
ADVERTISER_TOKEN=""

echo "🧪 Testing Payout Request System API"
echo "======================================"

# Function to make authenticated requests
make_request() {
    local method="$1"
    local endpoint="$2"
    local token="$3"
    local data="$4"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            "$API_BASE$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $token" \
            "$API_BASE$endpoint"
    fi
}

# Get auth tokens (mock for testing)
get_auth_tokens() {
    echo "📋 Getting authentication tokens..."
    
    # Partner login
    PARTNER_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"4321@gmail.com","password":"partner123"}' \
        "$API_BASE/api/auth/login")
    
    PARTNER_TOKEN=$(echo "$PARTNER_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')
    
    # Advertiser login
    ADVERTISER_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"12345@gmail.com","password":"adv123"}' \
        "$API_BASE/api/auth/login")
    
    ADVERTISER_TOKEN=$(echo "$ADVERTISER_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')
    
    echo "✅ Partner token: ${PARTNER_TOKEN:0:20}..."
    echo "✅ Advertiser token: ${ADVERTISER_TOKEN:0:20}..."
}

# Test partner balance endpoint
test_partner_balance() {
    echo "💰 Testing partner balance endpoint..."
    
    response=$(make_request "GET" "/api/affiliate/balance" "$PARTNER_TOKEN")
    echo "Response: $response"
    
    if echo "$response" | grep -q "balance"; then
        echo "✅ Partner balance endpoint working"
    else
        echo "❌ Partner balance endpoint failed"
    fi
}

# Test payout request creation
test_create_payout_request() {
    echo "📝 Testing payout request creation..."
    
    payout_data='{
        "amount": 100.50,
        "currency": "USD",
        "paymentMethod": "crypto",
        "walletAddress": "0x742d35Cc6435D9532C4fd5a0A9D3d7E6d3b5a8b6",
        "walletNetwork": "ETH",
        "partnerNote": "Test payout request"
    }'
    
    response=$(make_request "POST" "/api/affiliate/payout-requests" "$PARTNER_TOKEN" "$payout_data")
    echo "Response: $response"
    
    if echo "$response" | grep -q "payoutRequestId"; then
        echo "✅ Payout request creation working"
        PAYOUT_REQUEST_ID=$(echo "$response" | grep -o '"payoutRequestId":"[^"]*"' | sed 's/"payoutRequestId":"\([^"]*\)"/\1/')
        echo "Created payout request ID: $PAYOUT_REQUEST_ID"
    else
        echo "❌ Payout request creation failed"
    fi
}

# Test partner payout history
test_partner_payout_history() {
    echo "📋 Testing partner payout history..."
    
    response=$(make_request "GET" "/api/affiliate/payout-requests" "$PARTNER_TOKEN")
    echo "Response: $response"
    
    if echo "$response" | grep -q "requests"; then
        echo "✅ Partner payout history working"
    else
        echo "❌ Partner payout history failed"
    fi
}

# Test advertiser payout management
test_advertiser_payout_list() {
    echo "👔 Testing advertiser payout list..."
    
    response=$(make_request "GET" "/api/advertiser/payout-requests" "$ADVERTISER_TOKEN")
    echo "Response: $response"
    
    if echo "$response" | grep -q "requests"; then
        echo "✅ Advertiser payout list working"
    else
        echo "❌ Advertiser payout list failed"
    fi
}

# Test gateway configuration
test_gateway_config() {
    echo "⚙️ Testing gateway configuration..."
    
    # Get gateway configs
    response=$(make_request "GET" "/api/advertiser/gateway-configs" "$ADVERTISER_TOKEN")
    echo "Get configs response: $response"
    
    # Create gateway config
    config_data='{
        "gatewayType": "stripe",
        "isActive": true,
        "isDefault": true,
        "supportedCurrencies": ["USD", "EUR"],
        "minimumAmount": 10,
        "maximumAmount": 10000,
        "feePercentage": 2.5,
        "processingTime": "1-3 business days"
    }'
    
    response=$(make_request "POST" "/api/advertiser/gateway-configs" "$ADVERTISER_TOKEN" "$config_data")
    echo "Create config response: $response"
    
    if echo "$response" | grep -q "configId"; then
        echo "✅ Gateway configuration working"
    else
        echo "❌ Gateway configuration failed"
    fi
}

# Test validation - invalid wallet address
test_validation() {
    echo "🔍 Testing validation..."
    
    invalid_data='{
        "amount": 100,
        "currency": "BTC",
        "paymentMethod": "crypto",
        "walletAddress": "invalid_address",
        "partnerNote": "Test invalid wallet"
    }'
    
    response=$(make_request "POST" "/api/affiliate/payout-requests" "$PARTNER_TOKEN" "$invalid_data")
    echo "Validation response: $response"
    
    if echo "$response" | grep -q "Invalid wallet address"; then
        echo "✅ Wallet validation working"
    else
        echo "❓ Wallet validation may need improvement"
    fi
}

# Test insufficient balance scenario
test_insufficient_balance() {
    echo "💸 Testing insufficient balance scenario..."
    
    large_amount_data='{
        "amount": 999999,
        "currency": "USD",
        "paymentMethod": "bank_transfer",
        "partnerNote": "Test insufficient balance"
    }'
    
    response=$(make_request "POST" "/api/affiliate/payout-requests" "$PARTNER_TOKEN" "$large_amount_data")
    echo "Insufficient balance response: $response"
    
    if echo "$response" | grep -q "Insufficient balance"; then
        echo "✅ Balance validation working"
    else
        echo "❓ Balance validation may need improvement"
    fi
}

# Main test execution
echo "🚀 Starting API tests..."
echo ""

get_auth_tokens
echo ""

if [ -z "$PARTNER_TOKEN" ] || [ -z "$ADVERTISER_TOKEN" ]; then
    echo "❌ Failed to get authentication tokens. Make sure the server is running and test accounts exist."
    exit 1
fi

test_partner_balance
echo ""

test_create_payout_request
echo ""

test_partner_payout_history
echo ""

test_advertiser_payout_list
echo ""

test_gateway_config
echo ""

test_validation
echo ""

test_insufficient_balance
echo ""

echo "🏁 Tests completed!"
echo "Note: Some tests may fail if database is not properly set up or server is not running."
echo "To run the server: npm run dev"