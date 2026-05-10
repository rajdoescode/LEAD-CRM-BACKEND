import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';

router.get('/', authenticate, asyncHandler(notificationController.getAll));
router.put('/:id/read', authenticate, asyncHandler(notificationController.markRead));
router.put('/mark-all-read', authenticate, asyncHandler(notificationController.markAllRead));

export default router;
