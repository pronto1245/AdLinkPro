#!/usr/bin/env node

/**
 * AdLinkPro Integration Audit Tool
 * Automated tool to check integration health and consistency
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class IntegrationAuditor {
  constructor() {
    this.results = [];
  }

  log(category, name, status, message, details = null) {
    this.results.push({ category, name, status, message, details });
    
    const emoji = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
    console.log(`${emoji} [${category}] ${name}: ${message}`);
    
    if (details && process.env.VERBOSE) {
      console.log('   Details:', details);
    }
  }

  // Run all audits
  async runAllAudits() {
    console.log('🚀 Starting AdLinkPro Integration Audit...\n');
    
    await this.auditRouteConsistency();
    await this.auditWebSocketIntegration();
    await this.auditThemeIntegration();
    await this.auditI18nIntegration();
    await this.auditAuthIntegration();
    await this.auditComponentIntegration();
    await this.auditTestCoverage();
    await this.auditDocumentation();
    
    const summary = this.generateSummary();
    this.printSummary(summary);
    
    return summary;
  }

  async auditRouteConsistency() {
    console.log('\n🔍 Auditing Route Consistency...');
    
    try {
      // Find frontend routes in App.tsx
      const appTsxPath = path.join(PROJECT_ROOT, 'client/src/App.tsx');
      if (fs.existsSync(appTsxPath)) {
        const appContent = fs.readFileSync(appTsxPath, 'utf-8');
        const frontendRoutes = this.extractFrontendRoutes(appContent);
        
        this.log('routes', 'frontend-routes', 'pass', 
          `Found ${frontendRoutes.length} frontend routes`
        );
      } else {
        this.log('routes', 'frontend-routes', 'fail', 'App.tsx not found');
      }
      
      // Find backend routes
      const serverRoutesPath = path.join(PROJECT_ROOT, 'server/routes.ts');
      if (fs.existsSync(serverRoutesPath)) {
        const routesContent = fs.readFileSync(serverRoutesPath, 'utf-8');
        const backendRoutes = this.extractBackendRoutes(routesContent);
        
        this.log('routes', 'backend-routes', 'pass',
          `Found ${backendRoutes.length} backend routes`
        );
      } else {
        this.log('routes', 'backend-routes', 'warn', 'server/routes.ts not found');
      }
      
    } catch (error) {
      this.log('routes', 'route-consistency', 'fail', 
        `Failed to audit routes: ${error.message}`);
    }
  }

  async auditWebSocketIntegration() {
    console.log('\n🌐 Auditing WebSocket Integration...');
    
    try {
      // Check WebSocketManager exists
      const wsManagerPath = path.join(PROJECT_ROOT, 'client/src/components/WebSocketManager.tsx');
      if (fs.existsSync(wsManagerPath)) {
        const wsContent = fs.readFileSync(wsManagerPath, 'utf-8');
        
        // Check for key features
        const hasReconnection = wsContent.includes('reconnectAttempts');
        const hasAuth = wsContent.includes('token');
        const hasNotifications = wsContent.includes('notification');
        
        if (hasReconnection && hasAuth && hasNotifications) {
          this.log('websocket', 'websocket-manager', 'pass', 
            'WebSocketManager has all required features');
        } else {
          this.log('websocket', 'websocket-manager', 'warn',
            'WebSocketManager missing some features');
        }
      } else {
        this.log('websocket', 'websocket-manager', 'fail',
          'WebSocketManager component not found');
      }
      
      // Check useWebSocket hook
      const wsHookPath = path.join(PROJECT_ROOT, 'client/src/hooks/useWebSocket.ts');
      if (fs.existsSync(wsHookPath)) {
        const hookContent = fs.readFileSync(wsHookPath, 'utf-8');
        const hasInterface = hookContent.includes('WebSocketHookReturn');
        
        if (hasInterface) {
          this.log('websocket', 'websocket-hook', 'pass',
            'useWebSocket hook is properly typed');
        } else {
          this.log('websocket', 'websocket-hook', 'warn',
            'useWebSocket hook may need improvements');
        }
      } else {
        this.log('websocket', 'websocket-hook', 'fail',
          'useWebSocket hook not found');
      }
      
    } catch (error) {
      this.log('websocket', 'websocket-audit', 'fail',
        `WebSocket audit failed: ${error.message}`);
    }
  }

  async auditThemeIntegration() {
    console.log('\n🎨 Auditing Theme Integration...');
    
    try {
      // Check theme context
      const themeContextPath = path.join(PROJECT_ROOT, 'client/src/contexts/theme-context.tsx');
      if (fs.existsSync(themeContextPath)) {
        const themeContent = fs.readFileSync(themeContextPath, 'utf-8');
        
        const hasProvider = themeContent.includes('ThemeProvider');
        const hasToggle = themeContent.includes('toggleTheme');
        const hasStorage = themeContent.includes('localStorage');
        
        if (hasProvider && hasToggle && hasStorage) {
          this.log('theme', 'theme-context', 'pass',
            'Theme context is properly implemented');
        } else {
          this.log('theme', 'theme-context', 'warn',
            'Theme context missing some features');
        }
      } else {
        this.log('theme', 'theme-context', 'fail',
          'Theme context not found');
      }
      
    } catch (error) {
      this.log('theme', 'theme-audit', 'fail',
        `Theme audit failed: ${error.message}`);
    }
  }

  async auditI18nIntegration() {
    console.log('\n🌍 Auditing i18n Integration...');
    
    try {
      // Check translation files
      const localesDir = path.join(PROJECT_ROOT, 'client/src/locales');
      if (fs.existsSync(localesDir)) {
        const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
        
        if (localeFiles.length >= 2) {
          this.log('i18n', 'locale-files', 'pass',
            `Found ${localeFiles.length} locale files`);
        } else {
          this.log('i18n', 'locale-files', 'warn',
            `Only ${localeFiles.length} locale files found`);
        }
      } else {
        this.log('i18n', 'locale-files', 'fail',
          'Locales directory not found');
      }
      
      // Check i18n service
      const i18nServicePath = path.join(PROJECT_ROOT, 'client/src/services/i18n.ts');
      if (fs.existsSync(i18nServicePath)) {
        this.log('i18n', 'i18n-service', 'pass',
          'i18n service found');
      } else {
        this.log('i18n', 'i18n-service', 'fail',
          'i18n service not found');
      }
      
    } catch (error) {
      this.log('i18n', 'i18n-audit', 'fail',
        `i18n audit failed: ${error.message}`);
    }
  }

  async auditAuthIntegration() {
    console.log('\n🔐 Auditing Authentication Integration...');
    
    try {
      // Check auth context
      const authContextPath = path.join(PROJECT_ROOT, 'client/src/contexts/auth-context.tsx');
      if (fs.existsSync(authContextPath)) {
        const authContent = fs.readFileSync(authContextPath, 'utf-8');
        
        const hasProvider = authContent.includes('AuthProvider');
        const hasLogin = authContent.includes('login');
        
        if (hasProvider && hasLogin) {
          this.log('auth', 'auth-context', 'pass',
            'Auth context is properly implemented');
        } else {
          this.log('auth', 'auth-context', 'warn',
            'Auth context missing some features');
        }
      } else {
        this.log('auth', 'auth-context', 'fail',
          'Auth context not found');
      }
      
    } catch (error) {
      this.log('auth', 'auth-audit', 'fail',
        `Authentication audit failed: ${error.message}`);
    }
  }

  async auditComponentIntegration() {
    console.log('\n🧩 Auditing Component Integration...');
    
    try {
      // Check UI components
      const componentsDir = path.join(PROJECT_ROOT, 'client/src/components');
      const uiDir = path.join(componentsDir, 'ui');
      
      if (fs.existsSync(uiDir)) {
        const uiComponents = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));
        
        if (uiComponents.length > 10) {
          this.log('components', 'ui-components', 'pass',
            `Found ${uiComponents.length} UI components`);
        } else {
          this.log('components', 'ui-components', 'warn',
            `Only ${uiComponents.length} UI components found`);
        }
      } else {
        this.log('components', 'ui-components', 'fail',
          'UI components directory not found');
      }
      
      // Check page components
      const pagesDir = path.join(PROJECT_ROOT, 'client/src/pages');
      if (fs.existsSync(pagesDir)) {
        const pageCount = this.countFiles(pagesDir, '.tsx');
        
        if (pageCount > 20) {
          this.log('components', 'page-components', 'pass',
            `Found ${pageCount} page components`);
        } else {
          this.log('components', 'page-components', 'warn',
            `Only ${pageCount} page components found`);
        }
      } else {
        this.log('components', 'page-components', 'fail',
          'Pages directory not found');
      }
      
    } catch (error) {
      this.log('components', 'component-audit', 'fail',
        `Component audit failed: ${error.message}`);
    }
  }

  async auditTestCoverage() {
    console.log('\n🧪 Auditing Test Coverage...');
    
    try {
      const testsDir = path.join(PROJECT_ROOT, 'tests');
      if (fs.existsSync(testsDir)) {
        const testFiles = fs.readdirSync(testsDir).filter(f => 
          f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
        
        if (testFiles.length >= 5) {
          this.log('testing', 'test-files', 'pass',
            `Found ${testFiles.length} test files`);
        } else {
          this.log('testing', 'test-files', 'warn',
            `Only ${testFiles.length} test files found`);
        }
      } else {
        this.log('testing', 'test-files', 'fail',
          'Tests directory not found');
      }
      
    } catch (error) {
      this.log('testing', 'test-audit', 'fail',
        `Test audit failed: ${error.message}`);
    }
  }

  async auditDocumentation() {
    console.log('\n📚 Auditing Documentation...');
    
    try {
      const requiredDocs = [
        'INTEGRATION_MAP.md',
        'INFRASTRUCTURE_INTEGRATION_GUIDE.md',
        'PROJECT_STRUCTURE.md'
      ];
      
      let foundDocs = 0;
      for (const doc of requiredDocs) {
        const docPath = path.join(PROJECT_ROOT, doc);
        if (fs.existsSync(docPath)) {
          foundDocs++;
        }
      }
      
      if (foundDocs === requiredDocs.length) {
        this.log('documentation', 'required-docs', 'pass',
          'All required documentation found');
      } else {
        this.log('documentation', 'required-docs', 'warn',
          `${foundDocs}/${requiredDocs.length} required documents found`);
      }
      
    } catch (error) {
      this.log('documentation', 'doc-audit', 'fail',
        `Documentation audit failed: ${error.message}`);
    }
  }

  // Helper methods
  extractFrontendRoutes(content) {
    const routeRegex = /<Route\s+path="([^"]+)"/g;
    const routes = [];
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push(match[1]);
    }
    
    return routes;
  }

  extractBackendRoutes(content) {
    const routeRegex = /app\.(get|post|put|delete|patch)\(['"]([^'"]+)/g;
    const routes = [];
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push(`${match[1].toUpperCase()} ${match[2]}`);
    }
    
    return routes;
  }

  countFiles(dir, extension) {
    let count = 0;
    
    const scanDir = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (item.endsWith(extension)) {
            count++;
          }
        }
      } catch (error) {
        // Ignore errors
      }
    };
    
    scanDir(dir);
    return count;
  }

  generateSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    return { total, passed, warnings, failed, results: this.results };
  }

  printSummary(summary) {
    console.log('\n📊 Audit Summary:');
    console.log('==================');
    console.log(`Total Checks: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`❌ Failed: ${summary.failed}`);
    
    const score = Math.round((summary.passed / summary.total) * 100);
    console.log(`\n🎯 Overall Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🎉 Excellent! Your integration is in great shape.');
    } else if (score >= 75) {
      console.log('👍 Good integration, but there are areas for improvement.');
    } else if (score >= 60) {
      console.log('⚠️  Integration needs attention.');
    } else {
      console.log('🚨 Integration needs significant work.');
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new IntegrationAuditor();
  auditor.runAllAudits()
    .then(summary => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

export { IntegrationAuditor };