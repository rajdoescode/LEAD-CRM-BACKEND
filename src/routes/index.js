import express from 'express';
const router = express.Router();

import authRoutes from './auth.routes.js';
import leadRoutes from './lead.routes.js';
import clientRoutes from './client.routes.js';
import pipelineRoutes from './pipeline.routes.js';
import analyticsRoutes from './analytics.routes.js';
import userRoutes from './user.routes.js';
import taskRoutes from './task.routes.js';
import notificationRoutes from './notification.routes.js';
import callLogRoutes from './callLog.routes.js';
import noteRoutes from './note.routes.js';
import followUpRoutes from './followUp.routes.js';
import leadFollowUpRoutes from './leadFollowUp.routes.js';
import statusHistoryRoutes from './statusHistory.routes.js';

// ─── Mount Route Modules ──────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/leads/:leadId/calls', callLogRoutes);
router.use('/leads/:leadId/notes', noteRoutes);
router.use('/leads/:leadId/follow-ups', leadFollowUpRoutes);
router.use('/leads/:leadId/status-history', statusHistoryRoutes);
router.use('/clients', clientRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/follow-ups', followUpRoutes);

export default router;
