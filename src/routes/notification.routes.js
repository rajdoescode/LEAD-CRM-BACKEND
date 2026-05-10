import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as notificationController from '../controllers/notification.controller.js';

router.get('/', asyncHandler(notificationController.getAll));
router.put('/:id/read', asyncHandler(notificationController.markRead));
router.put('/mark-all-read', asyncHandler(notificationController.markAllRead));

export default router;
