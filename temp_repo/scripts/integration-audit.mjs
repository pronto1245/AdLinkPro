#!/usr/bin/env node

/**
 * AdLinkPro Advanced Integration Audit Tool
 * Comprehensive analysis of frontend-backend integration,
 * infrastructure services, and component dependencies
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
    this.frontendPages = new Map();
    this.backendRoutes = new Map();
    this.sharedSchemas = new Map();
    this.infrastructureServices = new Map();
    this.componentUsage = new Map();
    this.deadModules = [];
    this.integrationProblems = [];
  }

  log(category, name, status, message, details = null) {
    this.results.push({ category, name, status, message, details });
    
    const emoji = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
    console.log(`${emoji} [${category}] ${name}: ${message}`);
    
    if (details && process.env.VERBOSE) {
      console.log('   Details:', details);
    }
  }

  addProblem(category, issue, solution, severity = 'medium') {
    this.integrationProblems.push({
      category,
      issue,
      solution,
      severity,
      timestamp: new Date().toISOString()
    });
  }

  // Run all audits
  async runAllAudits() {
    console.log('🚀 Starting AdLinkPro Advanced Integration Audit...\n');
    
    // Phase 1: Discovery and mapping
    await this.discoverFrontendPages();
    await this.mapBackendRoutes();
    await this.analyzeSharedSchemas();
    await this.mapInfrastructureServices();
    
    // Phase 2: Integration analysis
    await this.auditPageBackendIntegration();
    await this.auditComponentIntegration();
    await this.auditSharedSchemaConsistency();
    await this.auditInfrastructureIntegration();
    
    // Phase 3: Legacy audits (enhanced)
    await this.auditRouteConsistency();
    await this.auditWebSocketIntegration();
    await this.auditThemeIntegration();
    await this.auditI18nIntegration();
    await this.auditAuthIntegration();
    await this.auditTestCoverage();
    await this.auditDocumentation();
    
    // Phase 4: Analysis and reporting
    await this.detectDeadModules();
    await this.generateComprehensiveReport();
    
    const summary = this.generateSummary();
    this.printSummary(summary);
    this.printProblemsTable();
    
    return summary;
  }

  // Phase 1: Discovery Methods
  async discoverFrontendPages() {
    console.log('\n🔍 Phase 1: Discovering Frontend Pages...');
    
    try {
      const pagesDir = path.join(PROJECT_ROOT, 'client/src/pages');
      const appFile = path.join(PROJECT_ROOT, 'client/src/App.tsx');
      
      // Scan pages directory structure
      this.scanPagesDirectory(pagesDir);
      
      // Analyze App.tsx routing
      if (fs.existsSync(appFile)) {
        const appContent = fs.readFileSync(appFile, 'utf-8');
        this.parseRouteDefinitions(appContent);
      }
      
      this.log('discovery', 'frontend-pages', 'pass', 
        `Discovered ${this.frontendPages.size} frontend pages with routing info`);
      
    } catch (error) {
      this.log('discovery', 'frontend-pages', 'fail', 
        `Failed to discover frontend pages: ${error.message}`);
    }
  }

  scanPagesDirectory(dir, parentPath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanPagesDirectory(fullPath, `${parentPath}/${item}`);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const pageName = item.replace(/\.(tsx|ts)$/, '');
        const pageInfo = this.analyzePageFile(fullPath);
        
        this.frontendPages.set(`${parentPath}/${pageName}`, {
          file: fullPath,
          name: pageName,
          path: parentPath,
          ...pageInfo
        });
      }
    }
  }

  analyzePageFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return {
        imports: this.extractImports(content),
        apiCalls: this.extractApiCalls(content),
        hooks: this.extractHooks(content),
        components: this.extractComponents(content),
        hasWebSocket: content.includes('useWebSocket') || content.includes('WebSocketManager'),
        hasNotifications: content.includes('NotificationToast') || content.includes('useNotification'),
        hasThemeSupport: content.includes('useTheme') || content.includes('theme'),
        hasI18n: content.includes('useTranslation') || content.includes('t('),
        hasAuth: content.includes('useAuth') || content.includes('ProtectedRoute')
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractApiCalls(content) {
    const apiCalls = [];
    
    // Look for common API patterns
    const patterns = [
      /fetch\(['"`]([^'"`]+)['"`]/g,
      /axios\.\w+\(['"`]([^'"`]+)['"`]/g,
      /api\.\w+\(['"`]([^'"`]+)['"`]/g,
      /\/api\/[^'"`\s)]+/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        apiCalls.push(match[1] || match[0]);
      }
    }
    
    return [...new Set(apiCalls)];
  }

  extractHooks(content) {
    const hooks = [];
    const hookRegex = /use[A-Z]\w*/g;
    let match;
    
    while ((match = hookRegex.exec(content)) !== null) {
      hooks.push(match[0]);
    }
    
    return [...new Set(hooks)];
  }

  extractComponents(content) {
    const components = [];
    const componentRegex = /<([A-Z]\w*)/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      components.push(match[1]);
    }
    
    return [...new Set(components)];
  }

  parseRouteDefinitions(appContent) {
    const routeRegex = /<(?:Route|ProtectedRoute)\s+path="([^"]+)"[^>]*component=\{[^}]*([A-Za-z]+)[^}]*\}/g;
    let match;
    
    while ((match = routeRegex.exec(appContent)) !== null) {
      const routePath = match[1];
      const componentName = match[2];
      
      // Find corresponding page info
      for (const [pageName, pageInfo] of this.frontendPages.entries()) {
        if (pageInfo.name.toLowerCase().includes(componentName.toLowerCase()) || 
            componentName.toLowerCase().includes(pageInfo.name.toLowerCase())) {
          pageInfo.routePath = routePath;
          pageInfo.routeComponent = componentName;
          break;
        }
      }
    }
  }

  async mapBackendRoutes() {
    console.log('\n🔍 Mapping Backend Routes...');
    
    try {
      const routesFiles = [
        'server/routes.ts',
        'server/api-routes.ts',
        'server/auth.routes.ts',
        'server/team-routes.ts'
      ];
      
      const routeDirs = [
        'server/routes',
        'server/api'
      ];
      
      // Scan individual route files
      for (const routeFile of routesFiles) {
        const fullPath = path.join(PROJECT_ROOT, routeFile);
        if (fs.existsSync(fullPath)) {
          this.analyzeBackendRouteFile(fullPath);
        }
      }
      
      // Scan route directories
      for (const routeDir of routeDirs) {
        const fullPath = path.join(PROJECT_ROOT, routeDir);
        if (fs.existsSync(fullPath)) {
          this.scanRouteDirectory(fullPath);
        }
      }
      
      this.log('discovery', 'backend-routes', 'pass', 
        `Mapped ${this.backendRoutes.size} backend route groups`);
      
    } catch (error) {
      this.log('discovery', 'backend-routes', 'fail', 
        `Failed to map backend routes: ${error.message}`);
    }
  }

  scanRouteDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
        this.analyzeBackendRouteFile(fullPath);
      } else if (stat.isDirectory()) {
        this.scanRouteDirectory(fullPath);
      }
    }
  }

  analyzeBackendRouteFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const routes = this.extractBackendRoutes(content);
      const fileName = path.basename(filePath, path.extname(filePath));
      
      this.backendRoutes.set(fileName, {
        file: filePath,
        routes: routes,
        middleware: this.extractMiddleware(content),
        schemas: this.extractSchemaReferences(content),
        dependencies: this.extractImports(content)
      });
      
    } catch (error) {
      console.warn(`Warning: Could not analyze route file ${filePath}: ${error.message}`);
    }
  }

  extractMiddleware(content) {
    const middleware = [];
    const patterns = [
      /(?:app|router)\.\w+\([^,]+,\s*([a-zA-Z]\w*)/g,
      /(?:authenticateToken|requireRole|rateLimiter|auditLog)/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        middleware.push(match[1] || match[0]);
      }
    }
    
    return [...new Set(middleware)];
  }

  extractSchemaReferences(content) {
    const schemas = [];
    const schemaPatterns = [
      /@shared\/schema/g,
      /@shared\/postback-schema/g,
      /@shared\/tracking-schema/g,
      /@shared\/creatives-schema/g,
      /\w+Schema/g
    ];
    
    for (const pattern of schemaPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        schemas.push(match[0]);
      }
    }
    
    return [...new Set(schemas)];
  }

  async analyzeSharedSchemas() {
    console.log('\n🔍 Analyzing Shared Schemas...');
    
    try {
      const sharedDir = path.join(PROJECT_ROOT, 'shared');
      const schemaFiles = fs.readdirSync(sharedDir).filter(f => 
        f.endsWith('-schema.ts') || f === 'schema.ts');
      
      for (const schemaFile of schemaFiles) {
        const filePath = path.join(sharedDir, schemaFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        this.sharedSchemas.set(schemaFile, {
          file: filePath,
          tables: this.extractTableDefinitions(content),
          enums: this.extractEnumDefinitions(content),
          schemas: this.extractZodSchemas(content),
          types: this.extractTypeDefinitions(content)
        });
      }
      
      this.log('discovery', 'shared-schemas', 'pass', 
        `Analyzed ${this.sharedSchemas.size} shared schema files`);
      
    } catch (error) {
      this.log('discovery', 'shared-schemas', 'fail', 
        `Failed to analyze shared schemas: ${error.message}`);
    }
  }

  extractTableDefinitions(content) {
    const tables = [];
    const tableRegex = /export\s+const\s+(\w+)\s*=\s*pgTable\s*\(\s*["']([^"']+)["']/g;
    let match;
    
    while ((match = tableRegex.exec(content)) !== null) {
      tables.push({
        name: match[1],
        tableName: match[2]
      });
    }
    
    return tables;
  }

  extractEnumDefinitions(content) {
    const enums = [];
    const enumRegex = /export\s+const\s+(\w+)\s*=\s*pgEnum\s*\(\s*['"]([^'"]+)['"],\s*\[([^\]]+)\]/g;
    let match;
    
    while ((match = enumRegex.exec(content)) !== null) {
      const values = match[3].split(',').map(v => v.trim().replace(/['"]/g, ''));
      enums.push({
        name: match[1],
        dbName: match[2],
        values: values
      });
    }
    
    return enums;
  }

  extractZodSchemas(content) {
    const schemas = [];
    const zodRegex = /export\s+const\s+(\w+Schema)\s*=/g;
    let match;
    
    while ((match = zodRegex.exec(content)) !== null) {
      schemas.push(match[1]);
    }
    
    return schemas;
  }

  extractTypeDefinitions(content) {
    const types = [];
    const typeRegex = /export\s+type\s+(\w+)/g;
    let match;
    
    while ((match = typeRegex.exec(content)) !== null) {
      types.push(match[1]);
    }
    
    return types;
  }

  async mapInfrastructureServices() {
    console.log('\n🔍 Mapping Infrastructure Services...');
    
    try {
      const services = {
        websocket: this.analyzeWebSocketService(),
        notifications: this.analyzeNotificationService(),
        themes: this.analyzeThemeService(),
        i18n: this.analyzeI18nService(),
        auth: this.analyzeAuthService()
      };
      
      for (const [serviceName, serviceInfo] of Object.entries(services)) {
        this.infrastructureServices.set(serviceName, serviceInfo);
      }
      
      this.log('discovery', 'infrastructure-services', 'pass', 
        `Mapped ${this.infrastructureServices.size} infrastructure services`);
      
    } catch (error) {
      this.log('discovery', 'infrastructure-services', 'fail', 
        `Failed to map infrastructure services: ${error.message}`);
    }
  }

  analyzeWebSocketService() {
    const wsFiles = [
      'client/src/components/WebSocketManager.tsx',
      'client/src/hooks/useWebSocket.ts',
      'client/src/services/websocket.ts'
    ];
    
    const serviceInfo = {
      files: [],
      features: [],
      usage: []
    };
    
    for (const wsFile of wsFiles) {
      const filePath = path.join(PROJECT_ROOT, wsFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        serviceInfo.files.push({
          path: filePath,
          hasReconnection: content.includes('reconnect'),
          hasAuth: content.includes('token') || content.includes('auth'),
          hasNotifications: content.includes('notification'),
          hasHeartbeat: content.includes('ping') || content.includes('heartbeat')
        });
      }
    }
    
    return serviceInfo;
  }

  analyzeNotificationService() {
    const notificationFiles = [
      'client/src/components/NotificationToast.tsx',
      'client/src/hooks/useNotification.ts',
      'client/src/services/notification.ts',
      'server/services/notification.ts'
    ];
    
    const serviceInfo = {
      files: [],
      types: [],
      usage: []
    };
    
    for (const notifFile of notificationFiles) {
      const filePath = path.join(PROJECT_ROOT, notifFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        serviceInfo.files.push({
          path: filePath,
          hasToast: content.includes('toast'),
          hasSuccess: content.includes('success'),
          hasError: content.includes('error'),
          hasWarning: content.includes('warn')
        });
      }
    }
    
    return serviceInfo;
  }

  analyzeThemeService() {
    const themeFiles = [
      'client/src/contexts/theme-context.tsx',
      'client/src/hooks/useTheme.ts',
      'client/src/services/theme.ts'
    ];
    
    const serviceInfo = {
      files: [],
      themes: [],
      usage: []
    };
    
    for (const themeFile of themeFiles) {
      const filePath = path.join(PROJECT_ROOT, themeFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        serviceInfo.files.push({
          path: filePath,
          hasProvider: content.includes('Provider'),
          hasToggle: content.includes('toggle'),
          hasStorage: content.includes('localStorage'),
          hasDark: content.includes('dark'),
          hasLight: content.includes('light')
        });
      }
    }
    
    return serviceInfo;
  }

  analyzeI18nService() {
    const i18nFiles = [
      'client/src/services/i18n.ts',
      'client/src/locales',
      'client/src/hooks/useTranslation.ts'
    ];
    
    const serviceInfo = {
      files: [],
      locales: [],
      usage: []
    };
    
    // Check locale files
    const localesDir = path.join(PROJECT_ROOT, 'client/src/locales');
    if (fs.existsSync(localesDir)) {
      const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
      serviceInfo.locales = localeFiles.map(f => f.replace('.json', ''));
    }
    
    for (const i18nFile of i18nFiles) {
      const filePath = path.join(PROJECT_ROOT, i18nFile);
      if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          serviceInfo.files.push({
            path: filePath,
            hasNamespaces: content.includes('namespace'),
            hasInterpolation: content.includes('{{'),
            hasPluralization: content.includes('_plural')
          });
        }
      }
    }
    
    return serviceInfo;
  }

  analyzeAuthService() {
    const authFiles = [
      'client/src/contexts/auth-context.tsx',
      'client/src/hooks/useAuth.ts',
      'client/src/services/auth.ts',
      'server/middleware/auth.ts'
    ];
    
    const serviceInfo = {
      files: [],
      methods: [],
      middleware: []
    };
    
    for (const authFile of authFiles) {
      const filePath = path.join(PROJECT_ROOT, authFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        serviceInfo.files.push({
          path: filePath,
          hasJWT: content.includes('jwt') || content.includes('token'),
          hasLogin: content.includes('login'),
          hasLogout: content.includes('logout'),
          hasRegister: content.includes('register'),
          hasRoles: content.includes('role')
        });
      }
    }
    
    return serviceInfo;
  }

  // Phase 2: Integration Analysis Methods
  async auditPageBackendIntegration() {
    console.log('\n🔍 Phase 2: Auditing Page-Backend Integration...');
    
    try {
      let connectedPages = 0;
      let orphanedPages = 0;
      let missingRoutes = [];
      
      for (const [pageName, pageInfo] of this.frontendPages.entries()) {
        const hasApiCalls = pageInfo.apiCalls && pageInfo.apiCalls.length > 0;
        const hasBackendConnection = this.checkBackendConnection(pageInfo);
        
        if (hasApiCalls || hasBackendConnection) {
          connectedPages++;
        } else {
          orphanedPages++;
          this.addProblem(
            'integration',
            `Page ${pageName} has no backend connections`,
            `Add appropriate API calls or connect to backend services`,
            'low'
          );
        }
        
        // Check if API calls have corresponding backend routes
        if (pageInfo.apiCalls) {
          for (const apiCall of pageInfo.apiCalls) {
            if (!this.findMatchingBackendRoute(apiCall)) {
              missingRoutes.push({ page: pageName, route: apiCall });
              this.addProblem(
                'integration',
                `API call "${apiCall}" in page ${pageName} has no matching backend route`,
                `Implement backend route for ${apiCall} or fix the API call`,
                'high'
              );
            }
          }
        }
      }
      
      if (connectedPages > orphanedPages) {
        this.log('integration', 'page-backend', 'pass', 
          `${connectedPages} pages connected, ${orphanedPages} orphaned`);
      } else {
        this.log('integration', 'page-backend', 'warn', 
          `${orphanedPages} orphaned pages found`);
      }
      
      if (missingRoutes.length > 0) {
        this.log('integration', 'missing-routes', 'fail', 
          `${missingRoutes.length} API calls without backend routes`);
      }
      
    } catch (error) {
      this.log('integration', 'page-backend', 'fail', 
        `Page-backend integration audit failed: ${error.message}`);
    }
  }

  checkBackendConnection(pageInfo) {
    // Check if page uses hooks that connect to backend
    const backendHooks = ['useQuery', 'useMutation', 'useAuth', 'useWebSocket'];
    return pageInfo.hooks && pageInfo.hooks.some(hook => 
      backendHooks.some(backendHook => hook.includes(backendHook))
    );
  }

  findMatchingBackendRoute(apiCall) {
    // Normalize API call to extract route pattern
    const normalizedCall = apiCall.replace(/^\/api\//, '').split('?')[0];
    
    for (const [routeGroup, routeInfo] of this.backendRoutes.entries()) {
      for (const route of routeInfo.routes) {
        const routePath = typeof route === 'string' ? route : route.path;
        if (routePath && routePath.includes(normalizedCall)) {
          return true;
        }
      }
    }
    
    return false;
  }

  async auditComponentIntegration() {
    console.log('\n🧩 Auditing Component Integration...');
    
    try {
      const componentsDir = path.join(PROJECT_ROOT, 'client/src/components');
      let totalComponents = 0;
      let infrastructureComponents = 0;
      let orphanedComponents = 0;
      
      await this.scanComponentsForIntegration(componentsDir);
      
      // Count components by integration type
      for (const [componentName, usage] of this.componentUsage.entries()) {
        totalComponents++;
        
        if (usage.usesInfrastructure) {
          infrastructureComponents++;
        }
        
        if (usage.usage.length === 0) {
          orphanedComponents++;
          this.addProblem(
            'components',
            `Component ${componentName} is not used anywhere`,
            `Remove unused component or integrate it into the application`,
            'low'
          );
        }
      }
      
      this.log('components', 'component-integration', 'pass',
        `${totalComponents} components analyzed, ${infrastructureComponents} use infrastructure`);
      
      if (orphanedComponents > 0) {
        this.log('components', 'orphaned-components', 'warn',
          `${orphanedComponents} orphaned components found`);
      }
      
    } catch (error) {
      this.log('components', 'component-integration', 'fail',
        `Component integration audit failed: ${error.message}`);
    }
  }

  async scanComponentsForIntegration(dir, parentPath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.scanComponentsForIntegration(fullPath, `${parentPath}/${item}`);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const componentName = item.replace(/\.(tsx|ts)$/, '');
        const componentPath = `${parentPath}/${componentName}`;
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        const usage = this.analyzeComponentUsage(content, componentPath);
        
        this.componentUsage.set(componentPath, usage);
      }
    }
  }

  analyzeComponentUsage(content, componentPath) {
    return {
      hasWebSocket: content.includes('useWebSocket') || content.includes('WebSocketManager'),
      hasNotifications: content.includes('NotificationToast') || content.includes('useNotification'),
      hasTheme: content.includes('useTheme') || content.includes('theme'),
      hasI18n: content.includes('useTranslation') || content.includes('t('),
      hasAuth: content.includes('useAuth'),
      usesInfrastructure: this.checkInfrastructureUsage(content),
      usage: this.findComponentUsage(componentPath),
      dependencies: this.extractImports(content)
    };
  }

  checkInfrastructureUsage(content) {
    const infrastructurePatterns = [
      'useWebSocket', 'WebSocketManager',
      'NotificationToast', 'useNotification',
      'useTheme', 'theme',
      'useTranslation', 't(',
      'useAuth'
    ];
    
    return infrastructurePatterns.some(pattern => content.includes(pattern));
  }

  findComponentUsage(componentPath) {
    const usage = [];
    const componentName = path.basename(componentPath);
    
    // Search for component usage across the codebase
    for (const [pageName, pageInfo] of this.frontendPages.entries()) {
      if (pageInfo.components && pageInfo.components.includes(componentName)) {
        usage.push(`page:${pageName}`);
      }
    }
    
    // Search in other components
    for (const [otherComponentPath, otherUsage] of this.componentUsage.entries()) {
      if (otherComponentPath !== componentPath && 
          otherUsage.dependencies && 
          otherUsage.dependencies.some(dep => dep.includes(componentName))) {
        usage.push(`component:${otherComponentPath}`);
      }
    }
    
    return usage;
  }

  async auditSharedSchemaConsistency() {
    console.log('\n📋 Auditing Shared Schema Consistency...');
    
    try {
      let consistentSchemas = 0;
      let inconsistentSchemas = 0;
      
      for (const [schemaName, schemaInfo] of this.sharedSchemas.entries()) {
        const frontendUsage = this.findSchemaUsageInFrontend(schemaName);
        const backendUsage = this.findSchemaUsageInBackend(schemaName);
        
        if (frontendUsage.length > 0 && backendUsage.length > 0) {
          consistentSchemas++;
          this.log('schemas', `schema-${schemaName}`, 'pass',
            `Schema used in ${frontendUsage.length} frontend and ${backendUsage.length} backend files`);
        } else if (frontendUsage.length === 0 && backendUsage.length === 0) {
          inconsistentSchemas++;
          this.addProblem(
            'schemas',
            `Schema ${schemaName} is not used anywhere`,
            `Remove unused schema or integrate it into the application`,
            'medium'
          );
        } else {
          inconsistentSchemas++;
          this.addProblem(
            'schemas',
            `Schema ${schemaName} is only used in ${frontendUsage.length > 0 ? 'frontend' : 'backend'}`,
            `Ensure schema is used consistently across frontend and backend`,
            'high'
          );
        }
      }
      
      if (consistentSchemas > inconsistentSchemas) {
        this.log('schemas', 'schema-consistency', 'pass',
          `${consistentSchemas} consistent schemas, ${inconsistentSchemas} inconsistent`);
      } else {
        this.log('schemas', 'schema-consistency', 'warn',
          `${inconsistentSchemas} schema consistency issues found`);
      }
      
    } catch (error) {
      this.log('schemas', 'schema-consistency', 'fail',
        `Schema consistency audit failed: ${error.message}`);
    }
  }

  findSchemaUsageInFrontend(schemaName) {
    const usage = [];
    
    for (const [pageName, pageInfo] of this.frontendPages.entries()) {
      if (pageInfo.imports && pageInfo.imports.some(imp => 
        imp.includes('shared/') && (imp.includes(schemaName) || imp.includes('schema')))) {
        usage.push(pageName);
      }
    }
    
    for (const [componentPath, componentInfo] of this.componentUsage.entries()) {
      if (componentInfo.dependencies && componentInfo.dependencies.some(dep => 
        dep.includes('shared/') && (dep.includes(schemaName) || dep.includes('schema')))) {
        usage.push(componentPath);
      }
    }
    
    return usage;
  }

  findSchemaUsageInBackend(schemaName) {
    const usage = [];
    
    for (const [routeGroup, routeInfo] of this.backendRoutes.entries()) {
      if (routeInfo.schemas && routeInfo.schemas.some(schema => 
        schema.includes(schemaName) || schema.includes('schema'))) {
        usage.push(routeGroup);
      }
    }
    
    return usage;
  }

  async auditInfrastructureIntegration() {
    console.log('\n🏗️ Auditing Infrastructure Integration...');
    
    try {
      const serviceResults = {};
      
      for (const [serviceName, serviceInfo] of this.infrastructureServices.entries()) {
        const result = this.auditServiceIntegration(serviceName, serviceInfo);
        serviceResults[serviceName] = result;
        
        if (result.score >= 0.8) {
          this.log('infrastructure', `service-${serviceName}`, 'pass',
            `${serviceName} service well integrated (${Math.round(result.score * 100)}%)`);
        } else if (result.score >= 0.6) {
          this.log('infrastructure', `service-${serviceName}`, 'warn',
            `${serviceName} service partially integrated (${Math.round(result.score * 100)}%)`);
        } else {
          this.log('infrastructure', `service-${serviceName}`, 'fail',
            `${serviceName} service poorly integrated (${Math.round(result.score * 100)}%)`);
        }
        
        // Add specific problems for each service
        result.issues.forEach(issue => {
          this.addProblem('infrastructure', issue.problem, issue.solution, 'medium');
        });
      }
      
    } catch (error) {
      this.log('infrastructure', 'infrastructure-integration', 'fail',
        `Infrastructure integration audit failed: ${error.message}`);
    }
  }

  auditServiceIntegration(serviceName, serviceInfo) {
    const result = {
      score: 0,
      issues: [],
      recommendations: []
    };
    
    // Check if service files exist
    const fileScore = serviceInfo.files.length > 0 ? 0.3 : 0;
    
    // Check service usage across pages
    let pageUsage = 0;
    for (const [pageName, pageInfo] of this.frontendPages.entries()) {
      if (this.pageUsesService(pageInfo, serviceName)) {
        pageUsage++;
      }
    }
    const usageScore = Math.min(pageUsage / Math.max(this.frontendPages.size * 0.5, 1), 0.4);
    
    // Check component integration
    let componentUsage = 0;
    for (const [componentPath, componentInfo] of this.componentUsage.entries()) {
      if (this.componentUsesService(componentInfo, serviceName)) {
        componentUsage++;
      }
    }
    const componentScore = Math.min(componentUsage / Math.max(this.componentUsage.size * 0.3, 1), 0.3);
    
    result.score = fileScore + usageScore + componentScore;
    
    // Generate specific issues and recommendations
    if (fileScore === 0) {
      result.issues.push({
        problem: `${serviceName} service files are missing`,
        solution: `Implement ${serviceName} service files and infrastructure`
      });
    }
    
    if (usageScore < 0.2) {
      result.issues.push({
        problem: `${serviceName} service is underutilized in pages`,
        solution: `Integrate ${serviceName} service into more pages where appropriate`
      });
    }
    
    if (componentScore < 0.15) {
      result.issues.push({
        problem: `${serviceName} service is underutilized in components`,
        solution: `Integrate ${serviceName} service into UI components where needed`
      });
    }
    
    return result;
  }

  pageUsesService(pageInfo, serviceName) {
    switch (serviceName) {
      case 'websocket':
        return pageInfo.hasWebSocket;
      case 'notifications':
        return pageInfo.hasNotifications;
      case 'themes':
        return pageInfo.hasThemeSupport;
      case 'i18n':
        return pageInfo.hasI18n;
      case 'auth':
        return pageInfo.hasAuth;
      default:
        return false;
    }
  }

  componentUsesService(componentInfo, serviceName) {
    switch (serviceName) {
      case 'websocket':
        return componentInfo.hasWebSocket;
      case 'notifications':
        return componentInfo.hasNotifications;
      case 'themes':
        return componentInfo.hasTheme;
      case 'i18n':
        return componentInfo.hasI18n;
      case 'auth':
        return componentInfo.hasAuth;
      default:
        return false;
    }
  }

  async detectDeadModules() {
    console.log('\n🗑️ Detecting Dead Modules...');
    
    try {
      // Check for unused files
      await this.findUnusedFiles();
      
      // Check for unreachable routes
      await this.findUnreachableRoutes();
      
      // Check for unused components
      await this.findUnusedComponents();
      
      if (this.deadModules.length > 0) {
        this.log('cleanup', 'dead-modules', 'warn',
          `${this.deadModules.length} dead modules detected`);
        
        this.deadModules.forEach(module => {
          this.addProblem(
            'cleanup',
            `Dead module: ${module.path}`,
            `${module.action}: ${module.reason}`,
            'low'
          );
        });
      } else {
        this.log('cleanup', 'dead-modules', 'pass',
          'No dead modules detected');
      }
      
    } catch (error) {
      this.log('cleanup', 'dead-modules', 'fail',
        `Dead module detection failed: ${error.message}`);
    }
  }

  async findUnusedFiles() {
    // Implementation for finding unused files
    // This is a simplified version - in production you'd want more sophisticated analysis
    
    const excludePatterns = [
      /\.test\./,
      /\.spec\./,
      /\.d\.ts$/,
      /package\.json$/,
      /README/,
      /\.md$/
    ];
    
    // For now, just check for obvious patterns
    const potentialDeadFiles = [
      'client/src/components/unused',
      'client/src/pages/deprecated',
      'server/routes/legacy'
    ];
    
    for (const deadPath of potentialDeadFiles) {
      const fullPath = path.join(PROJECT_ROOT, deadPath);
      if (fs.existsSync(fullPath)) {
        this.deadModules.push({
          path: deadPath,
          type: 'directory',
          reason: 'Appears to be unused or deprecated',
          action: 'Review and remove if not needed'
        });
      }
    }
  }

  async findUnreachableRoutes() {
    // Find backend routes that aren't called from frontend
    for (const [routeGroup, routeInfo] of this.backendRoutes.entries()) {
      for (const route of routeInfo.routes) {
        const routePath = typeof route === 'string' ? route : route.path;
        if (routePath && !this.isRouteUsedInFrontend(routePath)) {
          this.deadModules.push({
            path: `${routeInfo.file}:${routePath}`,
            type: 'route',
            reason: 'Route not called from frontend',
            action: 'Review if route is needed or add frontend integration'
          });
        }
      }
    }
  }

  isRouteUsedInFrontend(routePath) {
    const normalizedRoute = routePath.replace(/^\/api\//, '');
    
    for (const [pageName, pageInfo] of this.frontendPages.entries()) {
      if (pageInfo.apiCalls && pageInfo.apiCalls.some(call => 
        call.includes(normalizedRoute))) {
        return true;
      }
    }
    
    return false;
  }

  async findUnusedComponents() {
    // Components that aren't used anywhere
    for (const [componentPath, componentInfo] of this.componentUsage.entries()) {
      if (componentInfo.usage.length === 0 && !this.isInfrastructureComponent(componentPath)) {
        this.deadModules.push({
          path: componentPath,
          type: 'component',
          reason: 'Component not used anywhere',
          action: 'Remove unused component'
        });
      }
    }
  }

  isInfrastructureComponent(componentPath) {
    const infrastructureComponents = [
      'WebSocketManager',
      'NotificationToast',
      'ThemeProvider',
      'AuthProvider',
      'Layout',
      'ErrorBoundary'
    ];
    
    return infrastructureComponents.some(name => componentPath.includes(name));
  }

  async generateComprehensiveReport() {
    console.log('\n📋 Generating Comprehensive Integration Report...');
    
    try {
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalPages: this.frontendPages.size,
          totalBackendRoutes: Array.from(this.backendRoutes.values()).reduce((acc, route) => acc + route.routes.length, 0),
          totalComponents: this.componentUsage.size,
          totalSchemas: this.sharedSchemas.size,
          totalInfrastructureServices: this.infrastructureServices.size,
          totalProblems: this.integrationProblems.length,
          totalDeadModules: this.deadModules.length
        },
        problems: this.integrationProblems,
        deadModules: this.deadModules,
        recommendations: this.generateRecommendations()
      };
      
      // Write detailed report to file
      const reportPath = path.join(PROJECT_ROOT, 'INTEGRATION_ANALYSIS_REPORT.md');
      await this.writeDetailedReport(reportPath, report);
      
      this.log('reporting', 'comprehensive-report', 'pass',
        `Comprehensive report generated: ${reportPath}`);
      
    } catch (error) {
      this.log('reporting', 'comprehensive-report', 'fail',
        `Report generation failed: ${error.message}`);
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze problems and generate recommendations
    const problemsByCategory = {};
    this.integrationProblems.forEach(problem => {
      if (!problemsByCategory[problem.category]) {
        problemsByCategory[problem.category] = [];
      }
      problemsByCategory[problem.category].push(problem);
    });
    
    for (const [category, problems] of Object.entries(problemsByCategory)) {
      if (problems.length > 3) {
        recommendations.push({
          priority: 'high',
          category: category,
          action: `Address ${problems.length} ${category} integration issues`,
          impact: 'Improves system reliability and maintainability'
        });
      }
    }
    
    // Infrastructure recommendations
    for (const [serviceName, serviceInfo] of this.infrastructureServices.entries()) {
      const result = this.auditServiceIntegration(serviceName, serviceInfo);
      if (result.score < 0.6) {
        recommendations.push({
          priority: 'medium',
          category: 'infrastructure',
          action: `Improve ${serviceName} service integration`,
          impact: 'Enhances user experience and system consistency'
        });
      }
    }
    
    // Dead code recommendations
    if (this.deadModules.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'cleanup',
        action: `Remove ${this.deadModules.length} dead modules`,
        impact: 'Reduces codebase complexity and maintenance burden'
      });
    }
    
    return recommendations;
  }

  async writeDetailedReport(reportPath, report) {
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(reportPath, markdown, 'utf-8');
  }

  generateMarkdownReport(report) {
    return `# AdLinkPro Integration Analysis Report

Generated: ${report.timestamp}

## Executive Summary

- **Total Pages**: ${report.summary.totalPages}
- **Total Backend Routes**: ${report.summary.totalBackendRoutes}
- **Total Components**: ${report.summary.totalComponents}
- **Total Shared Schemas**: ${report.summary.totalSchemas}
- **Infrastructure Services**: ${report.summary.totalInfrastructureServices}
- **Problems Identified**: ${report.summary.totalProblems}
- **Dead Modules**: ${report.summary.totalDeadModules}

## Problems Table

| Category | Severity | Issue | Solution |
|----------|----------|--------|----------|
${report.problems.map(p => 
  `| ${p.category} | ${p.severity} | ${p.issue} | ${p.solution} |`
).join('\n')}

## Dead Modules

${report.deadModules.map(m => 
  `- **${m.type}**: \`${m.path}\` - ${m.reason} *(${m.action})*`
).join('\n')}

## Recommendations

${report.recommendations.map(r => 
  `### ${r.priority.toUpperCase()}: ${r.action}
- **Category**: ${r.category}
- **Impact**: ${r.impact}
`).join('\n')}

## Next Steps

1. **High Priority**: Address critical integration issues first
2. **Medium Priority**: Improve infrastructure service integration
3. **Low Priority**: Clean up dead modules and improve documentation
4. **Ongoing**: Set up automated integration testing

---
*Report generated by AdLinkPro Advanced Integration Audit Tool*
`;
  }

  printProblemsTable() {
    if (this.integrationProblems.length === 0) {
      console.log('\n✅ No integration problems detected!');
      return;
    }
    
    console.log('\n📋 Integration Problems Summary:');
    console.log('=====================================');
    
    const problemsByCategory = {};
    this.integrationProblems.forEach(problem => {
      if (!problemsByCategory[problem.category]) {
        problemsByCategory[problem.category] = [];
      }
      problemsByCategory[problem.category].push(problem);
    });
    
    for (const [category, problems] of Object.entries(problemsByCategory)) {
      console.log(`\n${category.toUpperCase()}:`);
      problems.forEach((problem, index) => {
        const icon = problem.severity === 'high' ? '🔴' : 
                    problem.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${index + 1}. ${icon} ${problem.issue}`);
        console.log(`     → ${problem.solution}`);
      });
    }
    
    console.log(`\n📊 Total Problems: ${this.integrationProblems.length}`);
    console.log(`🔴 High: ${this.integrationProblems.filter(p => p.severity === 'high').length}`);
    console.log(`🟡 Medium: ${this.integrationProblems.filter(p => p.severity === 'medium').length}`);
    console.log(`🟢 Low: ${this.integrationProblems.filter(p => p.severity === 'low').length}`);
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