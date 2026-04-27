import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { logger } from './logger.js';
import { buildOpenApiDocument } from './openapi.js';
import { env } from './env.js';

export function setupSwagger(app: Express): void {
  if (env.NODE_ENV === 'production') {
    logger.warn('Swagger UI is disabled in production to prevent API spec exposure');
    return;
  }

  try {
    const spec = buildOpenApiDocument();
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, {
      customSiteTitle: 'API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    }));
    app.get('/api/docs.json', (_req, res) => res.json(spec));
    logger.info('Swagger UI available at /api/docs');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Swagger docs');
  }
}
