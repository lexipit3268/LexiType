import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './openApiRegistry.js';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'LexiType API',
      version: '1.0.0',
      description: 'Tài liệu API cho LexiType',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));
};
