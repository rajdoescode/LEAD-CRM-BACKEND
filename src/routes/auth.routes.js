import express from 'express';
const router = express.Router();
import asyncHandler from '../utils/asyncHandler.js';
import * as authController from '../controllers/auth.controller.js';

router.post('/verify-pin', asyncHandler(authController.verifyPin));
router.post('/change-pin', asyncHandler(authController.changePin));

export default router;
