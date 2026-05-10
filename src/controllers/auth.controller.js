import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../services/tokenService.js';
import { logActivity } from '../services/activityService.js';

/**
 * POST /api/auth/verify-pin
 * Verify a user's PIN and return JWT token + profile.
 */
const verifyPin = async (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    throw ApiError.badRequest('PIN is required', [
      { field: 'pin', message: 'PIN is required' },
    ]);
  }

  // Find all active users, then check PIN (bcrypt comparison)
  const users = await User.find({ isActive: true }).select('+pin');

  let matchedUser = null;
  for (const user of users) {
    // user.pin is the hashed version; comparePin uses bcrypt.compare
    const isMatch = await user.comparePin(pin);
    if (isMatch) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw ApiError.unauthorized('Invalid PIN');
  }

  // Update last login
  matchedUser.lastLoginAt = new Date();
  await matchedUser.save({ validateBeforeSave: false });

  // Generate JWT
  const token = generateToken({ id: matchedUser._id, role: matchedUser.role });

  // Log activity
  await logActivity({
    type: 'user_login',
    description: `${matchedUser.name} logged in`,
    user: matchedUser._id,
  });

  const userObj = matchedUser.toJSON();

  ApiResponse.success(res, { user: userObj, token }, 'Authentication successful');
};

/**
 * POST /api/auth/change-pin
 * Change a user's PIN after verifying the old one.
 */
const changePin = async (req, res) => {
  const { userId, oldPin, newPin } = req.body;

  if (!userId || !oldPin || !newPin) {
    throw ApiError.badRequest('userId, oldPin, and newPin are required', [
      ...(!userId ? [{ field: 'userId', message: 'User ID is required' }] : []),
      ...(!oldPin ? [{ field: 'oldPin', message: 'Current PIN is required' }] : []),
      ...(!newPin ? [{ field: 'newPin', message: 'New PIN is required' }] : []),
    ]);
  }

  const user = await User.findById(userId).select('+pin');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePin(oldPin);
  if (!isMatch) {
    throw ApiError.unauthorized('Incorrect current PIN');
  }

  user.pin = newPin; // Will be hashed by pre-save hook
  await user.save();

  ApiResponse.success(res, null, 'PIN changed successfully');
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user.toJSON(), 'Profile fetched successfully');
};

export {
  verifyPin,
  changePin,
  getMe,
};
