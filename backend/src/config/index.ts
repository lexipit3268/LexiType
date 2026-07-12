import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lexitype',
  },
  api: {
    prefix: process.env.API_PREFIX,
  },
};
