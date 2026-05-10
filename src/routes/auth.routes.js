import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateVerifyPin } from '../middleware/validate.js';

router.post('/verify-pin', validateVerifyPin, asyncHandler(authController.verifyPin));
router.post('/change-pin', authenticate, asyncHandler(authController.changePin));
router.get('/me', authenticate, asyncHandler(authController.getMe));

export default router;
