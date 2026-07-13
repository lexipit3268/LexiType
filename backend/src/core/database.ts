import mongoose from 'mongoose';
import { config } from '../config/index.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri);
    console.log('Kết nối MongoDB (Mongoose) thành công!');
  } catch (error) {
    console.error('Lỗi kết nối Mongoose:', error);
    process.exit(1);
  }
};
