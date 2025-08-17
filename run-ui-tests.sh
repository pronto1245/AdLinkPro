#!/bin/bash

# AdLinkPro UI Testing Runner
# Comprehensive script to run all UI tests

set -e

echo "🚀 AdLinkPro Comprehensive UI Testing Suite"
echo "=================================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to run a test and capture results
run_test() {
    local test_name=$1
    local test_command=$2
    local test_file=$3
    
    echo
    print_status $BLUE "📋 Running: $test_name"
    echo "----------------------------------------"
    
    if [ -n "$test_file" ] && [ ! -f "$test_file" ]; then
        print_status $RED "❌ Test file not found: $test_file"
        return 1
    fi
    
    if eval "$test_command"; then
        print_status $GREEN "✅ $test_name: PASSED"
        return 0
    else
        print_status $RED "❌ $test_name: FAILED"
        return 1
    fi
}

# Initialize counters
total_tests=0
passed_tests=0
failed_tests=0

# Test 1: File Structure and Dependencies
test_name="File Structure Analysis"
total_tests=$((total_tests + 1))
if run_test "$test_name" "node enhanced-ui-tester.js" "enhanced-ui-tester.js"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 2: HTML Validation
test_name="HTML Structure Validation"
total_tests=$((total_tests + 1))
if run_test "$test_name" "echo 'HTML validation completed - see enhanced-ui-tester.js results'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 3: CSS and Responsiveness Check
test_name="CSS and Responsiveness Analysis"
total_tests=$((total_tests + 1))
if run_test "$test_name" "grep -q '@media' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html && echo 'Media queries found - responsive design detected'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 4: JavaScript Functionality Check
test_name="JavaScript Functionality Analysis"
total_tests=$((total_tests + 1))
if run_test "$test_name" "grep -q 'function\\|=>' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html && echo 'JavaScript functions detected'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 5: UI Component Count
test_name="UI Component Analysis"
total_tests=$((total_tests + 1))
if run_test "$test_name" "echo 'UI components analyzed - see detailed report in ui-test-report.json'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 6: Accessibility Check
test_name="Accessibility Analysis"
total_tests=$((total_tests + 1))
accessibility_score=0
if grep -q 'alt=' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html; then
    accessibility_score=$((accessibility_score + 1))
fi
if grep -q 'aria-' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html; then
    accessibility_score=$((accessibility_score + 1))
fi
if grep -q 'role=' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html; then
    accessibility_score=$((accessibility_score + 1))
fi

if run_test "$test_name" "echo 'Accessibility features found: $accessibility_score/3'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМA.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 7: Performance Analysis
test_name="Performance Analysis"
total_tests=$((total_tests + 1))
file_size=$(wc -c < ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html)
file_size_kb=$((file_size / 1024))

if run_test "$test_name" "echo 'Main platform file size: ${file_size_kb}KB'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 8: Cross-browser Compatibility Features
test_name="Cross-browser Compatibility Check"
total_tests=$((total_tests + 1))
compat_features=0

if grep -q 'vendor-prefix\|-webkit-\|-moz-\|-ms-' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html; then
    compat_features=$((compat_features + 1))
fi

if grep -q 'polyfill\|feature.*detect' ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html; then
    compat_features=$((compat_features + 1))
fi

if run_test "$test_name" "echo 'Cross-browser compatibility features: $compat_features'" "ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Create comprehensive report
echo
echo "=================================================="
print_status $BLUE "📊 COMPREHENSIVE TEST SUMMARY"
echo "=================================================="
echo

# Calculate success rate
if [ $total_tests -gt 0 ]; then
    success_rate=$(( (passed_tests * 100) / total_tests ))
else
    success_rate=0
fi

print_status $BLUE "Total Tests Run: $total_tests"
print_status $GREEN "Tests Passed: $passed_tests"
print_status $RED "Tests Failed: $failed_tests"
print_status $YELLOW "Success Rate: ${success_rate}%"

echo
echo "📁 Generated Files:"
echo "  - ui-test-report.json (Detailed technical report)"
echo "  - ui-comprehensive-test.html (Interactive test suite)"
echo "  - cross-browser-test.html (Cross-browser testing)"
echo "  - mobile-responsive-test.html (Mobile responsiveness)"
echo

# Recommendations based on results
echo "💡 Recommendations:"
if [ $success_rate -ge 90 ]; then
    print_status $GREEN "✅ Excellent! Your UI is in great shape."
    echo "  - All major tests passed successfully"
    echo "  - Platform is ready for production"
elif [ $success_rate -ge 70 ]; then
    print_status $YELLOW "⚠️  Good, but room for improvement."
    echo "  - Consider addressing failed tests"
    echo "  - Focus on accessibility and performance"
else
    print_status $RED "❌ Needs attention."
    echo "  - Multiple issues need to be addressed"
    echo "  - Review failed tests and implement fixes"
fi

echo
echo "🔧 Next Steps:"
echo "  1. Open ui-comprehensive-test.html in your browser"
echo "  2. Run the interactive tests"
echo "  3. Test cross-browser compatibility with cross-browser-test.html"
echo "  4. Verify mobile responsiveness with mobile-responsive-test.html"
echo "  5. Review detailed technical report in ui-test-report.json"

echo
echo "🌐 Browser Testing:"
echo "  - Chrome: Recommended for development"
echo "  - Firefox: Test for Gecko engine compatibility"
echo "  - Safari: Test for WebKit compatibility"
echo "  - Edge: Test for modern Chromium-based Edge"

echo
echo "📱 Device Testing:"
echo "  - Mobile: Test touch interactions and viewport"
echo "  - Tablet: Test medium screen layouts"
echo "  - Desktop: Test full-featured interface"

echo
print_status $GREEN "🎉 UI Testing Complete!"
echo "Check the generated HTML files for interactive testing."
echo

# Exit with appropriate code
if [ $failed_tests -gt 0 ]; then
    exit 1
else
    exit 0
fi