import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as clientController from '../controllers/client.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateCreateClient } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(clientController.getAll));
router.get('/:id', authenticate, asyncHandler(clientController.getById));
router.get('/:id/timeline', authenticate, asyncHandler(clientController.getTimeline));
router.post('/', authenticate, validateCreateClient, asyncHandler(clientController.create));
router.put('/:id', authenticate, asyncHandler(clientController.update));
router.delete('/:id', authenticate, authorize('admin', 'manager'), asyncHandler(clientController.remove));

export default router;
