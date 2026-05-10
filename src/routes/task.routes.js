import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateTask } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(taskController.getAll));
router.post('/', authenticate, validateCreateTask, asyncHandler(taskController.create));
router.put('/:id', authenticate, asyncHandler(taskController.update));
router.delete('/:id', authenticate, asyncHandler(taskController.remove));

export default router;
