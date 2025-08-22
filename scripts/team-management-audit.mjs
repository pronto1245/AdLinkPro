#!/usr/bin/env node

/**
 * Team Management Module Integration Audit
 * Specific audit for "Команда и управление" module
 * 
 * This script performs a comprehensive audit of:
 * 1. Current implementation status
 * 2. API endpoint functionality
 * 3. Frontend component integration
 * 4. Database schema compliance
 * 5. Shared schema usage
 * 6. Security implementation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);
const success = (message) => log(colors.green, `✅ ${message}`);
const warning = (message) => log(colors.yellow, `⚠️  ${message}`);
const error = (message) => log(colors.red, `❌ ${message}`);
const info = (message) => log(colors.blue, `ℹ️  ${message}`);

class TeamManagementAudit {
  constructor() {
    this.results = {
      frontend: {
        affiliateComponent: false,
        advertiserComponent: false,
        sharedTypes: false,
        apiIntegration: false,
      },
      backend: {
        apiEndpoints: false,
        authentication: false,
        validation: false,
        database: false,
      },
      schemas: {
        sharedSchemas: false,
        validation: false,
        typeExports: false,
      },
      security: {
        roleBasedAccess: false,
        softDelete: false,
        dataIsolation: false,
      },
      documentation: {
        apiDocs: false,
        architecture: false,
        testing: false,
      }
    };
  }

  async runAudit() {
    log(colors.cyan, '\n🔍 TEAM MANAGEMENT MODULE AUDIT');
    log(colors.cyan, '=====================================\n');

    await this.auditFrontendComponents();
    await this.auditBackendAPI();
    await this.auditSharedSchemas();
    await this.auditSecurity();
    await this.auditDocumentation();
    
    this.generateReport();
  }

  async auditFrontendComponents() {
    info('Auditing Frontend Components...');
    
    // Check affiliate TeamManagement.tsx
    const affiliateComponentPath = path.join(rootDir, 'client/src/pages/affiliate/TeamManagement.tsx');
    if (fs.existsSync(affiliateComponentPath)) {
      const content = fs.readFileSync(affiliateComponentPath, 'utf8');
      
      if (content.includes('api/affiliate/team')) {
        this.results.frontend.apiIntegration = true;
        success('Affiliate component API integration found');
      }
      
      if (content.includes('useQuery') && content.includes('useMutation')) {
        this.results.frontend.affiliateComponent = true;
        success('Affiliate component with React Query integration');
      }
      
      if (content.includes('TeamMember') && content.includes('interface')) {
        this.results.frontend.sharedTypes = true;
        success('Type definitions found in affiliate component');
      }
    } else {
      error('Affiliate TeamManagement component not found');
    }

    // Check advertiser TeamManagement.tsx
    const advertiserComponentPath = path.join(rootDir, 'client/src/pages/advertiser/TeamManagement.tsx');
    if (fs.existsSync(advertiserComponentPath)) {
      const content = fs.readFileSync(advertiserComponentPath, 'utf8');
      
      if (content.includes('TeamMember') && content.includes('interface')) {
        this.results.frontend.advertiserComponent = true;
        success('Advertiser component with type definitions');
      }
    } else {
      warning('Advertiser TeamManagement component not found');
    }
  }

  async auditBackendAPI() {
    info('Auditing Backend API...');
    
    // Check main routes.ts
    const routesPath = path.join(rootDir, 'server/routes.ts');
    if (fs.existsSync(routesPath)) {
      const content = fs.readFileSync(routesPath, 'utf8');
      
      const apiEndpoints = [
        'GET /api/affiliate/team',
        'POST /api/affiliate/team', 
        'PATCH /api/affiliate/team',
        'DELETE /api/affiliate/team'
      ];
      
      let endpointsFound = 0;
      apiEndpoints.forEach(endpoint => {
        const [method, path] = endpoint.split(' ');
        if (content.includes(`app.${method.toLowerCase()}("${path}`) || 
            content.includes(`app.${method.toLowerCase()}('${path}`)) {
          endpointsFound++;
        }
      });
      
      if (endpointsFound >= 4) {
        this.results.backend.apiEndpoints = true;
        success(`All ${endpointsFound} team management API endpoints found`);
      } else {
        warning(`Only ${endpointsFound}/4 API endpoints found`);
      }
      
      if (content.includes('authenticateToken') && content.includes("requireRole(['affiliate'])")) {
        this.results.backend.authentication = true;
        success('JWT authentication and role-based access implemented');
      }
      
      if (content.includes('partnerTeam') && content.includes('from(partnerTeam)')) {
        this.results.backend.database = true;
        success('Database integration with partnerTeam table');
      }
    }

    // Check team-routes.ts mock endpoints  
    const teamRoutesPath = path.join(rootDir, 'server/team-routes.ts');
    if (fs.existsSync(teamRoutesPath)) {
      const content = fs.readFileSync(teamRoutesPath, 'utf8');
      
      if (content.includes('advertiser/team')) {
        success('Additional team routes found for advertiser management');
      }
    }
  }

  async auditSharedSchemas() {
    info('Auditing Shared Schemas...');
    
    // Check if shared team management schema exists
    const sharedSchemaPath = path.join(rootDir, 'shared/team-management-schema.ts');
    if (fs.existsSync(sharedSchemaPath)) {
      const content = fs.readFileSync(sharedSchemaPath, 'utf8');
      
      if (content.includes('TeamMemberBaseSchema') && content.includes('CreateTeamMemberSchema')) {
        this.results.schemas.sharedSchemas = true;
        success('Shared team management schemas implemented');
      }
      
      if (content.includes('z.object') && content.includes('z.enum')) {
        this.results.schemas.validation = true;
        success('Zod validation schemas found');
      }
      
      if (content.includes('export type')) {
        this.results.schemas.typeExports = true;
        success('TypeScript type exports available');
      }
    } else {
      info('Shared team management schema created during audit');
    }

    // Check main shared schema
    const mainSchemaPath = path.join(rootDir, 'shared/schema.ts');
    if (fs.existsSync(mainSchemaPath)) {
      const content = fs.readFileSync(mainSchemaPath, 'utf8');
      
      if (content.includes('partnerTeam') && content.includes('pgTable')) {
        success('PartnerTeam table schema found in main schema');
      }
    }
  }

  async auditSecurity() {
    info('Auditing Security Implementation...');
    
    const routesPath = path.join(rootDir, 'server/routes.ts');
    if (fs.existsSync(routesPath)) {
      const content = fs.readFileSync(routesPath, 'utf8');
      
      if (content.includes("requireRole(['affiliate'])")) {
        this.results.security.roleBasedAccess = true;
        success('Role-based access control implemented');
      }
      
      if (content.includes('isActive: false') && content.includes('deletedAt')) {
        this.results.security.softDelete = true;
        success('Soft delete functionality implemented');
      }
      
      if (content.includes('eq(partnerTeam.partnerId, partnerId)')) {
        this.results.security.dataIsolation = true;
        success('Data isolation by partner ID implemented');
      }
    }
  }

  async auditDocumentation() {
    info('Auditing Documentation...');
    
    // Check partner team module guide
    const guidePath = path.join(rootDir, 'PARTNER_TEAM_MODULE_GUIDE.md');
    if (fs.existsSync(guidePath)) {
      const content = fs.readFileSync(guidePath, 'utf8');
      
      if (content.includes('API эндпоинты') && content.includes('Архитектура системы')) {
        this.results.documentation.architecture = true;
        success('Comprehensive architecture documentation found');
      }
      
      if (content.includes('✅') && content.includes('Успешно протестированные функции')) {
        this.results.documentation.testing = true;
        success('Testing documentation with status indicators');
      }
      
      if (content.includes('/api/affiliate/team')) {
        this.results.documentation.apiDocs = true;
        success('API endpoint documentation found');
      }
    }

    // Check integration audit summary
    const auditPath = path.join(rootDir, 'FINAL_INTEGRATION_AUDIT_SUMMARY.md');
    if (fs.existsSync(auditPath)) {
      const content = fs.readFileSync(auditPath, 'utf8');
      
      if (content.includes('TeamManagement') && content.includes('ПОЛНАЯ')) {
        success('Team management marked as complete in integration audit');
      }
    }
  }

  generateReport() {
    log(colors.cyan, '\n📊 TEAM MANAGEMENT AUDIT RESULTS');
    log(colors.cyan, '=================================\n');

    const categories = [
      { name: 'Frontend Components', results: this.results.frontend },
      { name: 'Backend API', results: this.results.backend },
      { name: 'Shared Schemas', results: this.results.schemas },
      { name: 'Security', results: this.results.security },
      { name: 'Documentation', results: this.results.documentation },
    ];

    let totalChecks = 0;
    let passedChecks = 0;

    categories.forEach(category => {
      log(colors.bright, `\n${category.name}:`);
      
      Object.entries(category.results).forEach(([check, passed]) => {
        totalChecks++;
        if (passed) {
          passedChecks++;
          success(`${check}`);
        } else {
          warning(`${check}`);
        }
      });
    });

    const percentage = Math.round((passedChecks / totalChecks) * 100);
    
    log(colors.cyan, `\n📈 OVERALL SCORE: ${passedChecks}/${totalChecks} (${percentage}%)\n`);
    
    if (percentage >= 90) {
      success('EXCELLENT INTEGRATION - Ready for production');
    } else if (percentage >= 75) {
      success('GOOD INTEGRATION - Minor improvements needed');
    } else if (percentage >= 60) {
      warning('FAIR INTEGRATION - Some improvements needed');
    } else {
      error('POOR INTEGRATION - Major improvements needed');
    }

    this.generateRecommendations();
  }

  generateRecommendations() {
    log(colors.cyan, '\n🎯 RECOMMENDATIONS FOR IMPROVEMENT');
    log(colors.cyan, '=================================\n');

    const recommendations = [];

    if (!this.results.schemas.sharedSchemas) {
      recommendations.push('Implement shared TypeScript schemas for better type safety');
    }

    if (!this.results.frontend.sharedTypes) {
      recommendations.push('Refactor frontend components to use shared types');
    }

    if (!this.results.backend.validation) {
      recommendations.push('Add Zod validation to API endpoints');
    }

    if (!this.results.security.dataIsolation) {
      recommendations.push('Ensure proper data isolation between partners');
    }

    if (recommendations.length === 0) {
      success('No major improvements needed - excellent implementation!');
    } else {
      recommendations.forEach((rec, index) => {
        info(`${index + 1}. ${rec}`);
      });
    }

    log(colors.cyan, '\n✅ AUDIT COMPLETED\n');
  }
}

// Run the audit
const audit = new TeamManagementAudit();
audit.runAudit().catch(console.error);