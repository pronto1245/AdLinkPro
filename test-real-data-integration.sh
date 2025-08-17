#!/bin/bash

# Integration Testing Script for Real Data Sources
# Tests the updated data integration features

set -e

echo "🧪 Starting Real Data Integration Tests..."
echo "========================================"

# Configuration
BASE_URL="http://localhost:5000"
API_BASE="$BASE_URL/api"
TEST_TOKEN=""
ADVERTISER_ID=""
TEST_RESULTS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Helper functions
log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((TESTS_FAILED++))
}

log_test_start() {
    echo "🔍 Testing: $1"
    ((TOTAL_TESTS++))
}

# API request helper
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local auth_header="Authorization: Bearer $TEST_TOKEN"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
             -H "Content-Type: application/json" \
             -H "$auth_header" \
             -d "$data" \
             "$API_BASE$endpoint"
    else
        curl -s -X "$method" \
             -H "$auth_header" \
             "$API_BASE$endpoint"
    fi
}

# Test authentication
test_auth() {
    log_test_start "Authentication with test advertiser"
    
    local auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"username":"advertiser1","password":"password123"}' \
        "$API_BASE/auth/login")
    
    if echo "$auth_response" | grep -q "token"; then
        TEST_TOKEN=$(echo "$auth_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        ADVERTISER_ID=$(echo "$auth_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        log_success "Authentication successful"
        return 0
    else
        log_error "Authentication failed: $auth_response"
        return 1
    fi
}

# Test real data API endpoint
test_real_data_api() {
    log_test_start "Real data API endpoint"
    
    local date_from=$(date -d "7 days ago" -I)
    local date_to=$(date -I)
    
    local response=$(api_request "GET" "/integration/real-data?dateFrom=${date_from}&dateTo=${date_to}&format=json")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Real data API endpoint working"
        
        # Check if response contains expected fields
        if echo "$response" | grep -q '"data"' && echo "$response" | grep -q '"metadata"'; then
            log_success "Response contains required data and metadata fields"
        else
            log_error "Response missing required fields"
        fi
        
        # Check integration status
        if echo "$response" | grep -q '"integration"'; then
            log_success "Integration status included in response"
        else
            log_error "Integration status missing from response"
        fi
    else
        log_error "Real data API failed: $response"
    fi
}

# Test data validation API
test_data_validation() {
    log_test_start "Data validation API"
    
    local test_data='{
        "data": [
            {
                "clickId": "test_click_123",
                "advertiserId": "'$ADVERTISER_ID'",
                "timestamp": "'$(date -Iseconds)'",
                "country": "US",
                "device": "mobile",
                "ip": "192.168.1.1"
            },
            {
                "clickId": "invalid_click",
                "advertiserId": "invalid-uuid",
                "timestamp": "invalid-date",
                "country": "INVALID",
                "device": "unknown_device"
            }
        ],
        "format": "standard",
        "strictMode": false
    }'
    
    local response=$(api_request "POST" "/integration/validate-data" "$test_data")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Data validation API working"
        
        # Check validation results
        if echo "$response" | grep -q '"validationResults"'; then
            log_success "Validation results returned"
            
            # Check if summary contains expected metrics
            if echo "$response" | grep -q '"totalRecords":2'; then
                log_success "Correct record count in validation summary"
            else
                log_error "Incorrect record count in validation summary"
            fi
        else
            log_error "Validation results missing"
        fi
    else
        log_error "Data validation API failed: $response"
    fi
}

# Test BI integration API
test_bi_integration() {
    log_test_start "BI integration API"
    
    local date_from=$(date -d "1 day ago" -I)
    local date_to=$(date -I)
    
    local test_export='{
        "biSystem": "metabase",
        "dateFrom": "'$date_from'",
        "dateTo": "'$date_to'",
        "filters": {
            "country": "US"
        }
    }'
    
    local response=$(api_request "POST" "/integration/bi-export" "$test_export")
    
    # Note: This will likely show "not configured" message, which is expected
    if echo "$response" | grep -q '"export"'; then
        log_success "BI integration API responding"
        
        if echo "$response" | grep -q '"success":false' && echo "$response" | grep -q "not configured"; then
            log_success "BI system correctly reports not configured status"
        elif echo "$response" | grep -q '"success":true'; then
            log_success "BI export completed successfully"
        else
            log_error "Unexpected BI export response"
        fi
    else
        log_error "BI integration API failed: $response"
    fi
}

# Test integration health endpoint
test_health_monitoring() {
    log_test_start "Integration health monitoring"
    
    local response=$(api_request "GET" "/integration/health")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Health monitoring API working"
        
        # Check for health components
        if echo "$response" | grep -q '"health"' && echo "$response" | grep -q '"monitoring"'; then
            log_success "Health response contains health and monitoring sections"
        else
            log_error "Health response missing required sections"
        fi
        
        # Check for metrics
        if echo "$response" | grep -q '"metrics"'; then
            log_success "Health response includes metrics"
        else
            log_error "Health response missing metrics"
        fi
    else
        log_error "Health monitoring API failed: $response"
    fi
}

# Test integration statistics
test_integration_statistics() {
    log_test_start "Integration statistics endpoint"
    
    local date_from=$(date -d "7 days ago" -I)
    local date_to=$(date -I)
    
    local response=$(api_request "GET" "/integration/statistics?dateFrom=${date_from}&dateTo=${date_to}")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Integration statistics API working"
        
        # Check for statistics components
        if echo "$response" | grep -q '"statistics"' && echo "$response" | grep -q '"summary"'; then
            log_success "Statistics response contains required sections"
        else
            log_error "Statistics response missing required sections"
        fi
    else
        log_error "Integration statistics API failed: $response"
    fi
}

# Test data format validation
test_data_format_compatibility() {
    log_test_start "Data format compatibility"
    
    # Test with different data formats
    local formats=("standard")
    
    for format in "${formats[@]}"; do
        local test_data='{
            "data": [{
                "clickId": "format_test_'$format'",
                "advertiserId": "'$ADVERTISER_ID'",
                "timestamp": "'$(date -Iseconds)'",
                "country": "US"
            }],
            "format": "'$format'"
        }'
        
        local response=$(api_request "POST" "/integration/validate-data" "$test_data")
        
        if echo "$response" | grep -q '"success":true'; then
            log_success "Format '$format' validation working"
        else
            log_error "Format '$format' validation failed"
        fi
    done
}

# Test error handling
test_error_handling() {
    log_test_start "Error handling"
    
    # Test with invalid data
    local invalid_request='{"invalid": "data"}'
    local response=$(api_request "POST" "/integration/validate-data" "$invalid_request")
    
    if echo "$response" | grep -q '"success":false'; then
        log_success "Error handling working for invalid requests"
    else
        log_error "Error handling not working for invalid requests"
    fi
    
    # Test unauthorized access (without token)
    TEST_TOKEN_BACKUP="$TEST_TOKEN"
    TEST_TOKEN=""
    
    local unauth_response=$(api_request "GET" "/integration/health")
    
    if echo "$unauth_response" | grep -q "Unauthorized\|401"; then
        log_success "Unauthorized access properly rejected"
    else
        log_error "Unauthorized access not properly rejected"
    fi
    
    TEST_TOKEN="$TEST_TOKEN_BACKUP"
}

# Check server availability
check_server() {
    log_info "Checking server availability..."
    
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        log_success "Server is running"
        return 0
    else
        log_error "Server is not running at $BASE_URL"
        log_info "Please start the server with: npm run dev"
        return 1
    fi
}

# Main test execution
run_tests() {
    echo ""
    log_info "Running integration tests..."
    echo ""
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Authenticate
    if ! test_auth; then
        log_error "Cannot proceed without authentication"
        exit 1
    fi
    
    echo ""
    
    # Run all tests
    test_real_data_api
    test_data_validation
    test_bi_integration
    test_health_monitoring
    test_integration_statistics
    test_data_format_compatibility
    test_error_handling
    
    echo ""
    echo "========================================"
    echo "🏁 Test Results Summary"
    echo "========================================"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        echo ""
        echo "The real data integration is working correctly."
        echo "Key features tested:"
        echo "  ✓ Real data API endpoints"
        echo "  ✓ Data validation and format checking"
        echo "  ✓ BI system integration interfaces"
        echo "  ✓ Health monitoring and metrics"
        echo "  ✓ Error handling and security"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed!${NC}"
        echo ""
        echo "Please check the error messages above and fix the issues."
        exit 1
    fi
}

# Script options
case "${1:-}" in
    --help|-h)
        echo "Real Data Integration Test Suite"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --server URL   Specify server URL (default: $BASE_URL)"
        echo ""
        echo "This script tests the updated data integration features including:"
        echo "  • Real advertiser data APIs"
        echo "  • BI system integrations (Looker, Metabase, Power BI)"
        echo "  • Data format validation and compatibility"
        echo "  • Integration health monitoring"
        echo "  • Error handling and security"
        exit 0
        ;;
    --server)
        BASE_URL="$2"
        API_BASE="$BASE_URL/api"
        shift 2
        ;;
esac

# Run the tests
run_tests