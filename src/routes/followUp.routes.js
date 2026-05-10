import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as followUpController from '../controllers/followUp.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateFollowUp } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(followUpController.getAll));
router.post('/', authenticate, validateCreateFollowUp, asyncHandler(followUpController.create));
router.put('/:id', authenticate, asyncHandler(followUpController.update));
router.delete('/:id', authenticate, asyncHandler(followUpController.remove));

export default router;
