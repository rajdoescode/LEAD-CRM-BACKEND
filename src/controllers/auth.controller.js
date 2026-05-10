import { readJSON, writeJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const USERS_FILE = 'users.json';

/**
 * POST /api/auth/verify-pin
 * Verify a user's PIN and return their profile.
 */
const verifyPin = (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    throw ApiError.badRequest('PIN is required', [
      { field: 'pin', message: 'PIN is required' },
    ]);
  }

  const users = readJSON(USERS_FILE);
  const user = users.find((u) => u.pin === pin);

  if (!user) {
    throw ApiError.unauthorized('Invalid PIN');
  }

  const { pin: _, ...safeUser } = user;
  ApiResponse.success(res, { user: safeUser }, 'Authentication successful');
};

/**
 * POST /api/auth/change-pin
 * Change a user's PIN after verifying the old one.
 */
const changePin = (req, res) => {
  const { userId, oldPin, newPin } = req.body;

  if (!userId || !oldPin || !newPin) {
    throw ApiError.badRequest('userId, oldPin, and newPin are required', [
      ...(!userId ? [{ field: 'userId', message: 'User ID is required' }] : []),
      ...(!oldPin ? [{ field: 'oldPin', message: 'Current PIN is required' }] : []),
      ...(!newPin ? [{ field: 'newPin', message: 'New PIN is required' }] : []),
    ]);
  }

  const users = readJSON(USERS_FILE);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.pin !== oldPin) {
    throw ApiError.unauthorized('Incorrect current PIN');
  }

  user.pin = newPin;
  writeJSON(USERS_FILE, users);

  ApiResponse.success(res, null, 'PIN changed successfully');
};

export {
  verifyPin,
  changePin
};
