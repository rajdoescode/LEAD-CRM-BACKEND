import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as leadController from '../controllers/lead.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateLead, validateUpdateLead } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(leadController.getAll));
router.get('/:id', authenticate, asyncHandler(leadController.getById));
router.post('/', authenticate, validateCreateLead, asyncHandler(leadController.create));
router.put('/:id', authenticate, validateUpdateLead, asyncHandler(leadController.update));
router.delete('/:id', authenticate, asyncHandler(leadController.remove));
router.post('/bulk-delete', authenticate, asyncHandler(leadController.bulkDelete));

export default router;
