import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as taskController from '../controllers/task.controller.js';

router.get('/', asyncHandler(taskController.getAll));
router.post('/', asyncHandler(taskController.create));
router.put('/:id', asyncHandler(taskController.update));
router.delete('/:id', asyncHandler(taskController.remove));

export default router;
