import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as leadController from '../controllers/lead.controller.js';

router.get('/', asyncHandler(leadController.getAll));
router.get('/:id', asyncHandler(leadController.getById));
router.post('/', asyncHandler(leadController.create));
router.put('/:id', asyncHandler(leadController.update));
router.delete('/:id', asyncHandler(leadController.remove));
router.post('/bulk-delete', asyncHandler(leadController.bulkDelete));

export default router;
