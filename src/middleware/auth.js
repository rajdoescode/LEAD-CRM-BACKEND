import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

/**
 * JWT Authentication Middleware.
 * Extracts token from Authorization header and attaches user to req.
 */
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-pin');

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid access token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired'));
    }
    next(error);
  }
};

/**
 * Role-based authorization middleware.
 * Must be used AFTER authenticate middleware.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

export { authenticate, authorize };
