import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AdLinkPro API',
      version: '1.0.0',
      description: 'API documentation for the AdLinkPro affiliate marketing platform',
      contact: {
        name: 'AdLinkPro Support',
        url: 'https://adlinkpro.com',
        email: 'support@adlinkpro.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './server/routes/*.ts',
    './server/routes/*.js',
    './server/api-routes.ts',
    './server/auth.routes.ts'
  ]
};

const specs = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AdLinkPro API Documentation'
  }));

  // JSON endpoint for the OpenAPI spec
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 [SERVER] Swagger documentation available at /api-docs');
}