import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

router.get('/', authenticate, asyncHandler(userController.getAll));
router.get('/:id', authenticate, asyncHandler(userController.getById));
router.post('/', authenticate, authorize('admin'), asyncHandler(userController.create));
router.put('/:id', authenticate, asyncHandler(userController.update));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(userController.remove));

export default router;
