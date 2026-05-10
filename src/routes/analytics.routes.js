import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as analyticsController from '../controllers/analytics.controller.js';

router.get('/', asyncHandler(analyticsController.getAll));
router.get('/kpis', asyncHandler(analyticsController.getKpis));
router.get('/revenue', asyncHandler(analyticsController.getRevenue));
router.get('/sources', asyncHandler(analyticsController.getSources));
router.get('/funnel', asyncHandler(analyticsController.getFunnel));
router.get('/activities', asyncHandler(analyticsController.getActivities));

export default router;
