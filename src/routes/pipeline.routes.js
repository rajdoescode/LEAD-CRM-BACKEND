import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as pipelineController from '../controllers/pipeline.controller.js';
import { authenticate } from '../middleware/auth.js';

router.get('/', authenticate, asyncHandler(pipelineController.getAll));
router.get('/stages', authenticate, asyncHandler(pipelineController.getStages));
router.get('/deals', authenticate, asyncHandler(pipelineController.getDeals));
router.post('/deals', authenticate, asyncHandler(pipelineController.createDeal));
router.put('/deals/:id', authenticate, asyncHandler(pipelineController.updateDeal));
router.put('/deals/:id/stage', authenticate, asyncHandler(pipelineController.updateDealStage));
router.delete('/deals/:id', authenticate, asyncHandler(pipelineController.deleteDeal));

export default router;
