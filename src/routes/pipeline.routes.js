import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as pipelineController from '../controllers/pipeline.controller.js';

router.get('/', asyncHandler(pipelineController.getAll));
router.get('/stages', asyncHandler(pipelineController.getStages));
router.get('/deals', asyncHandler(pipelineController.getDeals));
router.post('/deals', asyncHandler(pipelineController.createDeal));
router.put('/deals/:id', asyncHandler(pipelineController.updateDeal));
router.put('/deals/:id/stage', asyncHandler(pipelineController.updateDealStage));

export default router;
