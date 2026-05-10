import express from 'express';
const router = express.Router({ mergeParams: true });
import asyncHandler from '../utils/asyncHandler.js';
import * as callLogController from '../controllers/callLog.controller.js';

router.get('/', asyncHandler(callLogController.getByLeadId));
router.post('/', asyncHandler(callLogController.create));
router.put('/:callId', asyncHandler(callLogController.update));
router.delete('/:callId', asyncHandler(callLogController.remove));

export default router;
