import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { setupSwagger } from './src/core/swagger.js';
import { config } from './src/config/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const startServer = async () => {
  setupSwagger(app);

  app.listen(config.app.port, () => {
    console.log(`Server đang chạy tại http://localhost:${config.app.port}`);
  });
};

startServer();
