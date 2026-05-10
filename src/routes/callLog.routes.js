import express from 'express';
const router = express.Router({ mergeParams: true });
import asyncHandler from '../utils/asyncHandler.js';
import * as callLogController from '../controllers/callLog.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateCallLog } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(callLogController.getByLeadId));
router.post('/', authenticate, validateCreateCallLog, asyncHandler(callLogController.create));
router.put('/:callId', authenticate, asyncHandler(callLogController.update));
router.delete('/:callId', authenticate, asyncHandler(callLogController.remove));

export default router;
