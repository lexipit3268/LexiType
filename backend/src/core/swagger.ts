import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from '../config/index.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LexiType API Document',
      version: '1.0.0',
      description: 'Tài liệu đặc tả API cho LexiType',
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}`,
        description: 'Development Server',
      },
    ],
  },
  // đảm bảo Swagger đi tìm tất cả các file có đuôi .routes.ts để đọc API
  apis: ['./src/modules/**/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger UI: http://localhost:${config.app.port}/api-docs`);
};
