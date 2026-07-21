import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './openApiRegistry.js';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Nhập Access Token của bạn vào đây ',
});

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
    // security: [{ BearerAuth: [] }],
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));
};
