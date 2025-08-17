#!/usr/bin/env node

/**
 * Enhanced UI Testing Suite for AdLinkPro
 * Comprehensive browser and UI compatibility testing
 */

const fs = require('fs');
const path = require('path');

class UITester {
    constructor() {
        this.testResults = {};
        this.startTime = Date.now();
        this.testCount = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'INFO': 'ℹ️',
            'SUCCESS': '✅',
            'ERROR': '❌',
            'WARNING': '⚠️'
        };
        console.log(`[${timestamp}] ${prefix[level]} ${message}`);
    }

    async runTest(testName, testFunction) {
        this.testCount++;
        this.log(`Running test: ${testName}`);
        
        try {
            const result = await testFunction();
            this.testResults[testName] = { status: 'PASSED', result };
            this.passedTests++;
            this.log(`Test ${testName}: PASSED`, 'SUCCESS');
            return result;
        } catch (error) {
            this.testResults[testName] = { status: 'FAILED', error: error.message };
            this.failedTests++;
            this.log(`Test ${testName}: FAILED - ${error.message}`, 'ERROR');
            throw error;
        }
    }

    // Test 1: File Structure and Dependencies
    async testFileStructure() {
        const requiredFiles = [
            'package.json',
            'ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html',
            'client/src/main.tsx',
            'server/index.ts'
        ];

        const missingFiles = [];
        const existingFiles = [];

        for (const file of requiredFiles) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                existingFiles.push(file);
            } else {
                missingFiles.push(file);
            }
        }

        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }

        return {
            existingFiles,
            totalFiles: requiredFiles.length,
            status: 'All required files present'
        };
    }

    // Test 2: HTML Validation
    async testHTMLStructure() {
        const htmlFiles = [
            'ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html',
            'ui-comprehensive-test.html',
            'test-creatives-ui.html'
        ];

        const results = {};

        for (const file of htmlFiles) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Basic HTML validation
                const hasDoctype = content.includes('<!DOCTYPE html>');
                const hasHtml = content.includes('<html');
                const hasHead = content.includes('<head>');
                const hasBody = content.includes('<body>');
                const hasMetaCharset = content.includes('charset=');
                const hasViewport = content.includes('viewport');

                results[file] = {
                    hasDoctype,
                    hasHtml,
                    hasHead,
                    hasBody,
                    hasMetaCharset,
                    hasViewport,
                    valid: hasDoctype && hasHtml && hasHead && hasBody && hasMetaCharset
                };
            }
        }

        return results;
    }

    // Test 3: CSS and Responsiveness
    async testCSSStructure() {
        const htmlFiles = ['ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html', 'ui-comprehensive-test.html'];
        const results = {};

        for (const file of htmlFiles) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for responsive design patterns
                const hasMediaQueries = content.includes('@media');
                const hasFlexbox = content.includes('flex');
                const hasGrid = content.includes('grid');
                const hasCSSVariables = content.includes('--');
                const hasViewportUnits = content.includes('vw') || content.includes('vh');

                results[file] = {
                    hasMediaQueries,
                    hasFlexbox,
                    hasGrid,
                    hasCSSVariables,
                    hasViewportUnits,
                    responsive: hasMediaQueries && (hasFlexbox || hasGrid)
                };
            }
        }

        return results;
    }

    // Test 4: JavaScript Functionality
    async testJavaScriptStructure() {
        const files = [
            'ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html',
            'ui-comprehensive-test.html',
            'check-console-errors.js',
            'test-antifraud.js'
        ];

        const results = {};

        for (const file of files) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for modern JavaScript features
                const hasArrowFunctions = content.includes('=>');
                const hasAsyncAwait = content.includes('async') && content.includes('await');
                const hasPromises = content.includes('Promise') || content.includes('.then');
                const hasEventListeners = content.includes('addEventListener');
                const hasModernAPIs = content.includes('fetch') || content.includes('XMLHttpRequest');

                results[file] = {
                    hasArrowFunctions,
                    hasAsyncAwait,
                    hasPromises,
                    hasEventListeners,
                    hasModernAPIs,
                    modern: hasArrowFunctions && hasAsyncAwait && hasEventListeners
                };
            }
        }

        return results;
    }

    // Test 5: UI Component Analysis
    async testUIComponents() {
        const htmlFile = 'ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html';
        const fullPath = path.join(process.cwd(), htmlFile);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${htmlFile}`);
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        // Count UI components
        const buttons = (content.match(/<button/g) || []).length;
        const inputs = (content.match(/<input/g) || []).length;
        const forms = (content.match(/<form/g) || []).length;
        const modals = (content.match(/modal/gi) || []).length;
        const links = (content.match(/<a\s+href/g) || []).length;
        const images = (content.match(/<img/g) || []).length;

        // Check for accessibility features
        const hasAriaLabels = content.includes('aria-label');
        const hasAriaDescribedBy = content.includes('aria-describedby');
        const hasRoles = content.includes('role=');
        const hasAltAttributes = content.includes('alt=');

        return {
            components: {
                buttons,
                inputs,
                forms,
                modals,
                links,
                images
            },
            accessibility: {
                hasAriaLabels,
                hasAriaDescribedBy,
                hasRoles,
                hasAltAttributes,
                score: [hasAriaLabels, hasAriaDescribedBy, hasRoles, hasAltAttributes].filter(Boolean).length
            },
            totalComponents: buttons + inputs + forms + links + images
        };
    }

    // Test 6: Cross-browser Compatibility
    async testCrossBrowserCompatibility() {
        const htmlFiles = ['ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html', 'ui-comprehensive-test.html'];
        const results = {};

        for (const file of htmlFiles) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');

                // Check for browser compatibility issues
                const usesModernCSS = content.includes('grid') || content.includes('flex');
                const usesVendorPrefixes = content.includes('-webkit-') || content.includes('-moz-');
                const hasPolyfills = content.includes('polyfill');
                const usesModernJS = content.includes('const ') || content.includes('let ');
                const hasFeatureDetection = content.includes('if (') && content.includes('support');

                results[file] = {
                    usesModernCSS,
                    usesVendorPrefixes,
                    hasPolyfills,
                    usesModernJS,
                    hasFeatureDetection,
                    compatibilityScore: [usesVendorPrefixes, hasPolyfills, hasFeatureDetection].filter(Boolean).length
                };
            }
        }

        return results;
    }

    // Test 7: Performance Analysis
    async testPerformance() {
        const htmlFile = 'ПОЛНАЯ_РАБОЧАЯ_ПЛАТФОРМА.html';
        const fullPath = path.join(process.cwd(), htmlFile);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${htmlFile}`);
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const stats = fs.statSync(fullPath);

        // Analyze file size and content
        const fileSize = stats.size;
        const lines = content.split('\n').length;
        const scriptsCount = (content.match(/<script/g) || []).length;
        const stylesheetsCount = (content.match(/<link.*stylesheet/g) || []).length;
        const inlineStyles = (content.match(/<style/g) || []).length;
        const inlineScripts = (content.match(/<script[^>]*>[^<]/g) || []).length;

        // Performance recommendations
        const recommendations = [];
        if (fileSize > 1000000) recommendations.push('File size is large (>1MB)');
        if (inlineStyles > 5) recommendations.push('Too many inline styles');
        if (inlineScripts > 3) recommendations.push('Consider moving scripts to external files');

        return {
            fileSize,
            lines,
            scriptsCount,
            stylesheetsCount,
            inlineStyles,
            inlineScripts,
            recommendations,
            performanceScore: Math.max(0, 100 - recommendations.length * 20)
        };
    }

    // Generate comprehensive report
    generateReport() {
        const duration = Date.now() - this.startTime;
        const successRate = (this.passedTests / this.testCount) * 100;

        const report = {
            summary: {
                totalTests: this.testCount,
                passed: this.passedTests,
                failed: this.failedTests,
                successRate: successRate.toFixed(1) + '%',
                duration: duration + 'ms'
            },
            results: this.testResults,
            timestamp: new Date().toISOString()
        };

        // Write report to file
        const reportPath = path.join(process.cwd(), 'ui-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    // Main test runner
    async runAllTests() {
        this.log('🚀 Starting AdLinkPro UI Comprehensive Testing Suite', 'INFO');
        this.log('='.repeat(60), 'INFO');

        try {
            // Run all tests
            await this.runTest('File Structure', () => this.testFileStructure());
            await this.runTest('HTML Structure', () => this.testHTMLStructure());
            await this.runTest('CSS & Responsiveness', () => this.testCSSStructure());
            await this.runTest('JavaScript Structure', () => this.testJavaScriptStructure());
            await this.runTest('UI Components', () => this.testUIComponents());
            await this.runTest('Cross-browser Compatibility', () => this.testCrossBrowserCompatibility());
            await this.runTest('Performance Analysis', () => this.testPerformance());

            // Generate final report
            const report = this.generateReport();

            this.log('='.repeat(60), 'INFO');
            this.log('🎉 All tests completed!', 'SUCCESS');
            this.log(`📊 Results: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'SUCCESS');
            this.log(`⏱️ Duration: ${report.summary.duration}`, 'INFO');
            this.log(`📄 Report saved to: ui-test-report.json`, 'SUCCESS');

            // Print detailed summary
            this.printDetailedSummary();

        } catch (error) {
            this.log(`❌ Critical error: ${error.message}`, 'ERROR');
            process.exit(1);
        }
    }

    printDetailedSummary() {
        this.log('\n📋 DETAILED SUMMARY:', 'INFO');
        
        Object.entries(this.testResults).forEach(([testName, result]) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            this.log(`${status} ${testName}: ${result.status}`);
            
            if (result.status === 'PASSED' && result.result) {
                // Print key metrics for each test
                const r = result.result;
                
                if (testName === 'UI Components' && r.components) {
                    this.log(`   - Total UI Components: ${r.totalComponents}`);
                    this.log(`   - Accessibility Score: ${r.accessibility.score}/4`);
                }
                
                if (testName === 'Performance Analysis' && r.performanceScore) {
                    this.log(`   - Performance Score: ${r.performanceScore}/100`);
                    this.log(`   - File Size: ${(r.fileSize / 1024).toFixed(1)}KB`);
                }
            }
        });
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new UITester();
    tester.runAllTests().catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = UITester;