import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as userController from '../controllers/user.controller.js';

router.get('/', asyncHandler(userController.getAll));
router.get('/:id', asyncHandler(userController.getById));

export default router;
