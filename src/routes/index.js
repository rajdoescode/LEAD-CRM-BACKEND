import express from 'express';
const router = express.Router();

import authRoutes from './auth.routes.js';
import leadRoutes from './lead.routes.js';
import pipelineRoutes from './pipeline.routes.js';
import analyticsRoutes from './analytics.routes.js';
import userRoutes from './user.routes.js';
import taskRoutes from './task.routes.js';
import notificationRoutes from './notification.routes.js';
import callLogRoutes from './callLog.routes.js';

// ─── Mount Route Modules ──────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/leads/:leadId/calls', callLogRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);

export default router;
