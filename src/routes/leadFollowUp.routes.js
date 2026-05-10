import express from 'express';
const router = express.Router({ mergeParams: true });
import asyncHandler from '../utils/asyncHandler.js';
import * as followUpController from '../controllers/followUp.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateFollowUp } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(followUpController.getByLeadId));
router.post('/', authenticate, validateCreateFollowUp, asyncHandler(followUpController.create));

export default router;
