/**
 * Integration Audit Test Suite
 * Tests the comprehensive integration analysis functionality
 */

import { IntegrationAuditor } from '../scripts/integration-audit.mjs';
import path from 'path';
import fs from 'fs';

describe('Integration Audit System', () => {
  let auditor;
  const PROJECT_ROOT = path.resolve(__dirname, '..');

  beforeEach(() => {
    auditor = new IntegrationAuditor();
  });

  describe('Discovery Phase', () => {
    test('should discover frontend pages', async () => {
      await auditor.discoverFrontendPages();
      
      expect(auditor.frontendPages.size).toBeGreaterThan(0);
      
      // Check that pages have expected properties
      const firstPage = Array.from(auditor.frontendPages.values())[0];
      expect(firstPage).toHaveProperty('file');
      expect(firstPage).toHaveProperty('name');
      expect(firstPage).toHaveProperty('imports');
    });

    test('should map backend routes', async () => {
      await auditor.mapBackendRoutes();
      
      expect(auditor.backendRoutes.size).toBeGreaterThan(0);
      
      // Check route structure
      const firstRoute = Array.from(auditor.backendRoutes.values())[0];
      expect(firstRoute).toHaveProperty('file');
      expect(firstRoute).toHaveProperty('routes');
      expect(firstRoute).toHaveProperty('middleware');
    });

    test('should analyze shared schemas', async () => {
      await auditor.analyzeSharedSchemas();
      
      expect(auditor.sharedSchemas.size).toBeGreaterThan(0);
      
      // Check schema structure
      const firstSchema = Array.from(auditor.sharedSchemas.values())[0];
      expect(firstSchema).toHaveProperty('file');
      expect(firstSchema).toHaveProperty('tables');
      expect(firstSchema).toHaveProperty('enums');
    });
  });

  describe('Integration Analysis', () => {
    beforeEach(async () => {
      // Setup discovery data for integration tests
      await auditor.discoverFrontendPages();
      await auditor.mapBackendRoutes();
      await auditor.analyzeSharedSchemas();
      await auditor.mapInfrastructureServices();
    });

    test('should audit page-backend integration', async () => {
      await auditor.auditPageBackendIntegration();
      
      // Should have logged results
      const integrationResults = auditor.results.filter(r => r.category === 'integration');
      expect(integrationResults.length).toBeGreaterThan(0);
    });

    test('should audit component integration', async () => {
      await auditor.auditComponentIntegration();
      
      // Should have component usage data
      expect(auditor.componentUsage.size).toBeGreaterThan(0);
    });

    test('should audit schema consistency', async () => {
      await auditor.auditSharedSchemaConsistency();
      
      const schemaResults = auditor.results.filter(r => r.category === 'schemas');
      expect(schemaResults.length).toBeGreaterThan(0);
    });

    test('should audit infrastructure integration', async () => {
      await auditor.auditInfrastructureIntegration();
      
      const infraResults = auditor.results.filter(r => r.category === 'infrastructure');
      expect(infraResults.length).toBeGreaterThan(0);
    });
  });

  describe('Dead Module Detection', () => {
    beforeEach(async () => {
      await auditor.discoverFrontendPages();
      await auditor.mapBackendRoutes();
      await auditor.mapInfrastructureServices();
    });

    test('should detect dead modules', async () => {
      await auditor.detectDeadModules();
      
      // Should have some results (could be empty if no dead modules)
      expect(Array.isArray(auditor.deadModules)).toBe(true);
    });
  });

  describe('Report Generation', () => {
    test('should generate comprehensive report', async () => {
      // Setup minimal data for report generation
      auditor.frontendPages.set('test-page', { name: 'test', file: '/test' });
      auditor.backendRoutes.set('test-route', { routes: ['GET /api/test'] });
      auditor.sharedSchemas.set('test-schema.ts', { tables: [] });
      
      await auditor.generateComprehensiveReport();
      
      // Check if report file was created
      const reportPath = path.join(PROJECT_ROOT, 'INTEGRATION_ANALYSIS_REPORT.md');
      expect(fs.existsSync(reportPath)).toBe(true);
      
      // Check report content
      const reportContent = fs.readFileSync(reportPath, 'utf-8');
      expect(reportContent).toContain('# AdLinkPro Integration Analysis Report');
      expect(reportContent).toContain('## Executive Summary');
    });

    test('should generate problems table', () => {
      // Add test problems
      auditor.addProblem('test', 'Test issue', 'Test solution', 'high');
      auditor.addProblem('test', 'Another issue', 'Another solution', 'medium');
      
      expect(auditor.integrationProblems.length).toBe(2);
      expect(auditor.integrationProblems[0].severity).toBe('high');
      expect(auditor.integrationProblems[1].severity).toBe('medium');
    });
  });

  describe('Utility Methods', () => {
    test('should extract imports correctly', () => {
      const testCode = `
        import React from 'react';
        import { useState } from 'react';
        import './styles.css';
        import api from '@/services/api';
      `;
      
      const imports = auditor.extractImports(testCode);
      expect(imports).toContain('react');
      expect(imports).toContain('./styles.css');
      expect(imports).toContain('@/services/api');
    });

    test('should extract API calls correctly', () => {
      const testCode = `
        fetch('/api/users');
        axios.get('/api/posts');
        api.post('/api/comments');
      `;
      
      const apiCalls = auditor.extractApiCalls(testCode);
      expect(apiCalls.some(call => call.includes('/api/users'))).toBe(true);
      expect(apiCalls.some(call => call.includes('/api/posts'))).toBe(true);
      expect(apiCalls.some(call => call.includes('/api/comments'))).toBe(true);
    });

    test('should extract hooks correctly', () => {
      const testCode = `
        const [state, setState] = useState();
        const data = useQuery();
        const auth = useAuth();
        const theme = useTheme();
      `;
      
      const hooks = auditor.extractHooks(testCode);
      expect(hooks).toContain('useState');
      expect(hooks).toContain('useQuery');
      expect(hooks).toContain('useAuth');
      expect(hooks).toContain('useTheme');
    });

    test('should extract components correctly', () => {
      const testCode = `
        <Button onClick={handler}>
        <Modal isOpen={true}>
        <UserProfile user={user} />
      `;
      
      const components = auditor.extractComponents(testCode);
      expect(components).toContain('Button');
      expect(components).toContain('Modal');
      expect(components).toContain('UserProfile');
    });
  });

  describe('Full Integration Test', () => {
    test('should run complete audit successfully', async () => {
      const summary = await auditor.runAllAudits();
      
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('passed');
      expect(summary).toHaveProperty('warnings');
      expect(summary).toHaveProperty('failed');
      expect(summary.total).toBeGreaterThan(0);
      
      // Should have generated problems and recommendations
      expect(auditor.integrationProblems.length).toBeGreaterThan(0);
    });
  });
});