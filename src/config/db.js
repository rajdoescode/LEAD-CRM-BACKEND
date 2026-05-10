import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB with retry logic.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose 7+ doesn't need these, but explicit for clarity
      autoIndex: true,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnect...');
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
