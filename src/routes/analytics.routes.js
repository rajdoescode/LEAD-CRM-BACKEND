import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

router.get('/', authenticate, asyncHandler(analyticsController.getAll));
router.get('/kpis', authenticate, asyncHandler(analyticsController.getKpis));
router.get('/revenue', authenticate, asyncHandler(analyticsController.getRevenue));
router.get('/sources', authenticate, asyncHandler(analyticsController.getSources));
router.get('/funnel', authenticate, asyncHandler(analyticsController.getFunnel));
router.get('/activities', authenticate, asyncHandler(analyticsController.getActivities));

export default router;
