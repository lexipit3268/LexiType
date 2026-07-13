import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { setupSwagger } from './src/core/swagger.js';
import { config } from './src/config/index.js';
import { connectDB } from './src/core/database.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import router from './src/core/router.js';
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(`${config.api.prefix}`, router);

app.use(errorHandler);

const startServer = async () => {
  setupSwagger(app);
  await connectDB();
  app.listen(config.app.port, () => {
    console.log(`Server đang chạy tại http://localhost:${config.app.port}`);
  });
};

startServer();
