import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import rateLimit from './middleware/rateLimit.js';
import sanitize from './middleware/sanitize.js';
import ApiResponse from './utils/ApiResponse.js';
import apiRoutes from './routes/index.js';

const app = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

// ─── CORS Configuration ───────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// ─── Rate Limiting ────────────────────────────────────────────
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

// ─── Request Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Sanitization ─────────────────────────────────────
app.use(sanitize);

// ─── HTTP Logging ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  ApiResponse.success(
    res,
    {
      status: 'ok',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
    'Server is healthy'
  );
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
