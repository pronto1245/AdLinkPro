import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AdLinkPro API',
      version: '1.0.0',
      description: 'API documentation for AdLinkPro affiliate marketing platform',
      contact: {
        name: 'AdLinkPro Support',
        email: 'support@adlinkpro.com',
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://api.adlinkpro.com'
            : 'http://localhost:5000',
        description:
          process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            role: {
              type: 'string',
              enum: ['OWNER', 'ADVERTISER', 'PARTNER', 'ADMIN'],
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Event: {
          type: 'object',
          required: ['clickId', 'eventType'],
          properties: {
            clickId: { type: 'string' },
            eventType: { type: 'string' },
            status: { type: 'string' },
            payout: { type: 'number' },
            currency: { type: 'string', default: 'USD' },
            transactionId: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
  },
  apis: ['./server/routes/*.ts', './server/routes/**/*.ts', './server/index.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Serve swagger documentation
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'AdLinkPro API Documentation',
    })
  );

  // Serve swagger.json
  app.get('/api/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export { specs };
