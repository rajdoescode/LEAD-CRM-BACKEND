import express from 'express';
const router = express.Router({ mergeParams: true });
import asyncHandler from '../utils/asyncHandler.js';
import * as statusHistoryController from '../controllers/statusHistory.controller.js';
import { authenticate } from '../middleware/auth.js';

router.get('/', authenticate, asyncHandler(statusHistoryController.getByLeadId));
router.post('/', authenticate, asyncHandler(statusHistoryController.create));

export default router;
