#!/usr/bin/env node

/**
 * Integration Validation Script
 * Comprehensive test to validate all module integrations
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class IntegrationValidator {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
  }

  log(category, name, status, message, details = null) {
    const result = { category, name, status, message, details };
    this.results.push(result);
    
    if (status === 'fail') {
      this.errors.push(result);
    } else if (status === 'warn') {
      this.warnings.push(result);
    }
    
    const emoji = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
    console.log(`${emoji} [${category}] ${name}: ${message}`);
    
    if (details && process.env.VERBOSE) {
      console.log('   Details:', details);
    }
  }

  // Validate complete integration
  async validateIntegration() {
    console.log('🚀 Starting Comprehensive Integration Validation...\n');
    
    await this.validateFrontendIntegration();
    await this.validateBackendIntegration();
    await this.validateInfrastructureIntegration();
    await this.validateSharedSchemaIntegration();
    
    const summary = this.generateSummary();
    this.printSummary(summary);
    
    return summary;
  }

  async validateFrontendIntegration() {
    console.log('\n📱 Validating Frontend Integration...');
    
    // Validate route mappings
    await this.validateRoutes();
    
    // Validate components
    await this.validateComponents();
    
    // Validate infrastructure connections
    await this.validateFrontendInfrastructure();
  }

  async validateRoutes() {
    try {
      const appPath = path.join(PROJECT_ROOT, 'client/src/App.tsx');
      if (!fs.existsSync(appPath)) {
        this.log('frontend', 'routes', 'fail', 'App.tsx not found');
        return;
      }
      
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      // Check for route duplication issues (routes pointing to same component)
      const routeMatches = [...appContent.matchAll(/path="([^"]+)"[^>]+component=\{[^}]+\(([^)]+)\)/g)];
      const routeComponentMap = new Map();
      let duplications = 0;
      
      routeMatches.forEach(match => {
        const route = match[1];
        const component = match[2];
        
        if (!routeComponentMap.has(component)) {
          routeComponentMap.set(component, []);
        }
        routeComponentMap.get(component).push(route);
      });
      
      routeComponentMap.forEach((routes, component) => {
        if (routes.length > 3 && component.includes('AffiliateOffers')) {
          duplications++;
        }
      });
      
      if (duplications === 0) {
        this.log('frontend', 'route-duplication', 'pass', 'No major route duplication issues found');
      } else {
        this.log('frontend', 'route-duplication', 'warn', `Found ${duplications} potential route duplications`);
      }
      
      // Check for specialized components
      const specializedComponents = [
        'TrackingLinks',
        'SecuritySettings', 
        'DocumentsManager',
        'CreativesAndTools',
        'ReferralSystem',
        'TeamManagement'
      ];
      
      let foundSpecialized = 0;
      specializedComponents.forEach(component => {
        if (appContent.includes(component)) {
          foundSpecialized++;
        }
      });
      
      if (foundSpecialized >= 4) {
        this.log('frontend', 'specialized-components', 'pass', 
          `Found ${foundSpecialized}/${specializedComponents.length} specialized components integrated`);
      } else {
        this.log('frontend', 'specialized-components', 'warn',
          `Only ${foundSpecialized}/${specializedComponents.length} specialized components integrated`);
      }
      
    } catch (error) {
      this.log('frontend', 'route-validation', 'fail', 
        `Route validation failed: ${error.message}`);
    }
  }

  async validateComponents() {
    try {
      // Check if new components exist and are properly structured
      const newComponents = [
        'client/src/pages/affiliate/TrackingLinks.tsx',
        'client/src/pages/affiliate/SecuritySettings.tsx',
        'client/src/pages/affiliate/DocumentsManager.tsx'
      ];
      
      let validComponents = 0;
      for (const componentPath of newComponents) {
        const fullPath = path.join(PROJECT_ROOT, componentPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Check if component has proper structure
          if (content.includes('useTranslation') && content.includes('apiRequest') && content.includes('export default')) {
            validComponents++;
          }
        }
      }
      
      if (validComponents === newComponents.length) {
        this.log('frontend', 'new-components', 'pass', 
          `All ${newComponents.length} new components are properly structured`);
      } else {
        this.log('frontend', 'new-components', 'warn',
          `Only ${validComponents}/${newComponents.length} new components are properly structured`);
      }
      
    } catch (error) {
      this.log('frontend', 'component-validation', 'fail',
        `Component validation failed: ${error.message}`);
    }
  }

  async validateFrontendInfrastructure() {
    try {
      // Check WebSocket integration
      const appPath = path.join(PROJECT_ROOT, 'client/src/App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      if (appContent.includes('WebSocketManager')) {
        this.log('frontend', 'websocket-integration', 'pass', 'WebSocketManager integrated in App');
      } else {
        this.log('frontend', 'websocket-integration', 'warn', 'WebSocketManager not found in App');
      }
      
      // Check i18n integration
      const mainPath = path.join(PROJECT_ROOT, 'client/src/main.tsx');
      const mainContent = fs.readFileSync(mainPath, 'utf-8');
      
      if (mainContent.includes('./lib/i18n')) {
        this.log('frontend', 'i18n-integration', 'pass', 'i18n initialized in main.tsx');
      } else {
        this.log('frontend', 'i18n-integration', 'warn', 'i18n not initialized in main.tsx');
      }
      
      // Check theme integration
      if (mainContent.includes('ThemeProvider')) {
        this.log('frontend', 'theme-integration', 'pass', 'ThemeProvider integrated in main.tsx');
      } else {
        this.log('frontend', 'theme-integration', 'fail', 'ThemeProvider not found in main.tsx');
      }
      
    } catch (error) {
      this.log('frontend', 'infrastructure-validation', 'fail',
        `Infrastructure validation failed: ${error.message}`);
    }
  }

  async validateBackendIntegration() {
    console.log('\n🖥️ Validating Backend Integration...');
    
    try {
      // Check server routes structure
      const routesPath = path.join(PROJECT_ROOT, 'server/routes.ts');
      if (fs.existsSync(routesPath)) {
        const routesContent = fs.readFileSync(routesPath, 'utf-8');
        
        // Count different types of routes
        const routeTypes = {
          'partner': (routesContent.match(/\/api\/partner\//g) || []).length,
          'advertiser': (routesContent.match(/\/api\/advertiser\//g) || []).length,
          'admin': (routesContent.match(/\/api\/admin\//g) || []).length,
          'auth': (routesContent.match(/\/api\/auth\//g) || []).length
        };
        
        let totalRoutes = Object.values(routeTypes).reduce((sum, count) => sum + count, 0);
        
        if (totalRoutes > 100) {
          this.log('backend', 'api-coverage', 'pass', 
            `Found ${totalRoutes} API routes across all modules`);
        } else {
          this.log('backend', 'api-coverage', 'warn',
            `Only ${totalRoutes} API routes found`);
        }
        
        // Check middleware integration
        if (routesContent.includes('authenticateToken')) {
          this.log('backend', 'auth-middleware', 'pass', 'Authentication middleware integrated');
        } else {
          this.log('backend', 'auth-middleware', 'warn', 'Authentication middleware not found');
        }
        
      } else {
        this.log('backend', 'routes-file', 'fail', 'server/routes.ts not found');
      }
      
    } catch (error) {
      this.log('backend', 'backend-validation', 'fail',
        `Backend validation failed: ${error.message}`);
    }
  }

  async validateInfrastructureIntegration() {
    console.log('\n🏗️ Validating Infrastructure Integration...');
    
    try {
      // Check WebSocket system
      const wsManagerPath = path.join(PROJECT_ROOT, 'client/src/components/WebSocketManager.tsx');
      if (fs.existsSync(wsManagerPath)) {
        const wsContent = fs.readFileSync(wsManagerPath, 'utf-8');
        
        const features = [
          'notification',
          'reconnection',
          'authentication',
          'heartbeat'
        ];
        
        let foundFeatures = 0;
        features.forEach(feature => {
          if (wsContent.toLowerCase().includes(feature)) {
            foundFeatures++;
          }
        });
        
        if (foundFeatures >= 3) {
          this.log('infrastructure', 'websocket-features', 'pass',
            `WebSocket has ${foundFeatures}/${features.length} key features`);
        } else {
          this.log('infrastructure', 'websocket-features', 'warn',
            `WebSocket only has ${foundFeatures}/${features.length} key features`);
        }
      }
      
      // Check translation completeness
      const locales = ['en.json', 'ru.json'];
      let translationScore = 0;
      
      for (const locale of locales) {
        const localePath = path.join(PROJECT_ROOT, `client/src/locales/${locale}`);
        if (fs.existsSync(localePath)) {
          const translations = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
          
          // Check if new sections are present - they're nested under dashboard or similar
          const newSections = ['links', 'security', 'documents'];
          let foundSections = 0;
          
          // Check at multiple levels since translations may be nested
          const checkForSection = (obj, sectionName) => {
            if (obj[sectionName] && Object.keys(obj[sectionName]).length > 5) {
              return true;
            }
            // Check nested objects
            for (const key in obj) {
              if (typeof obj[key] === 'object' && obj[key][sectionName]) {
                if (Object.keys(obj[key][sectionName]).length > 5) {
                  return true;
                }
              }
            }
            return false;
          };
          
          newSections.forEach(section => {
            if (checkForSection(translations, section)) {
              foundSections++;
            }
          });
          
          translationScore += foundSections;
        }
      }
      
      if (translationScore >= 4) {
        this.log('infrastructure', 'i18n-completeness', 'pass',
          'Translation files have comprehensive coverage for new components');
      } else {
        this.log('infrastructure', 'i18n-completeness', 'warn',
          'Translation files may be missing some new component translations');
      }
      
    } catch (error) {
      this.log('infrastructure', 'infrastructure-validation', 'fail',
        `Infrastructure validation failed: ${error.message}`);
    }
  }

  async validateSharedSchemaIntegration() {
    console.log('\n🧩 Validating Shared Schema Integration...');
    
    try {
      const schemaPath = path.join(PROJECT_ROOT, 'shared/schema.ts');
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        
        // Check for comprehensive schema coverage
        const schemaTypes = [
          'insertUserSchema',
          'insertOfferSchema',
          'insertPostbackSchema',
          'insertTrackingClickSchema',
          'insertTransactionSchema'
        ];
        
        let foundSchemas = 0;
        schemaTypes.forEach(schema => {
          if (schemaContent.includes(schema)) {
            foundSchemas++;
          }
        });
        
        if (foundSchemas >= 4) {
          this.log('shared', 'schema-coverage', 'pass',
            `Found ${foundSchemas}/${schemaTypes.length} key schemas`);
        } else {
          this.log('shared', 'schema-coverage', 'warn',
            `Only ${foundSchemas}/${schemaTypes.length} key schemas found`);
        }
        
      } else {
        this.log('shared', 'schema-file', 'fail', 'shared/schema.ts not found');
      }
      
    } catch (error) {
      this.log('shared', 'schema-validation', 'fail',
        `Schema validation failed: ${error.message}`);
    }
  }

  generateSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    return { 
      total, 
      passed, 
      warnings, 
      failed, 
      score: Math.round((passed / total) * 100),
      results: this.results,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  printSummary(summary) {
    console.log('\n📊 Integration Validation Summary:');
    console.log('=====================================');
    console.log(`Total Validations: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`\n🎯 Integration Score: ${summary.score}%`);
    
    if (summary.score >= 95) {
      console.log('🎉 Excellent! All modules are comprehensively integrated.');
    } else if (summary.score >= 85) {
      console.log('👍 Great! Most modules are properly integrated.');
    } else if (summary.score >= 70) {
      console.log('⚠️  Good progress, but some integrations need attention.');
    } else {
      console.log('🚨 Integration needs significant improvement.');
    }

    if (summary.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      summary.errors.forEach(error => {
        console.log(`  • ${error.category}: ${error.message}`);
      });
    }

    if (summary.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      summary.warnings.forEach(warning => {
        console.log(`  • ${warning.category}: ${warning.message}`);
      });
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new IntegrationValidator();
  validator.validateIntegration()
    .then(summary => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export { IntegrationValidator };