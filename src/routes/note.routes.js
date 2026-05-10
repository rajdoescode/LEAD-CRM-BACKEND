import express from 'express';
const router = express.Router({ mergeParams: true });
import asyncHandler from '../utils/asyncHandler.js';
import * as noteController from '../controllers/note.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateNote } from '../middleware/validate.js';

router.get('/', authenticate, asyncHandler(noteController.getByLeadId));
router.post('/', authenticate, validateCreateNote, asyncHandler(noteController.create));
router.put('/:noteId', authenticate, asyncHandler(noteController.update));
router.delete('/:noteId', authenticate, asyncHandler(noteController.remove));

export default router;
