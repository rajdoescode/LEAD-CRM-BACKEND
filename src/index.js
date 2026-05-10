import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// ─── Unhandled Rejection & Exception Handlers ─────────────────
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

// ─── Connect to DB and Start Server ───────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
