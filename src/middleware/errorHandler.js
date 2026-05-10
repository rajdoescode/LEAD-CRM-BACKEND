import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Handle 404 — Route not found.
 * Throws an ApiError so it flows through the global errorHandler.
 */
const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler middleware.
 *
 * Catches all errors (thrown manually, from asyncHandler, or from ApiError)
 * and sends a consistent JSON error response using ApiResponse.error().
 *
 * - ApiError instances → use their statusCode, message, code, errors
 * - SyntaxError (malformed JSON body) → 400
 * - Everything else → 500
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // ─── Already an ApiError ────────────────────────────────────
  if (err instanceof ApiError) {
    logger.error(`[${err.code}] ${req.method} ${req.originalUrl} → ${err.statusCode}: ${err.message}`);

    return ApiResponse.error(
      res,
      err.statusCode,
      err.message,
      err.code,
      err.errors,
      err.stack
    );
  }

  // ─── Malformed JSON body ────────────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error(`[BAD_REQUEST] ${req.method} ${req.originalUrl} → 400: Malformed JSON`);

    return ApiResponse.error(res, 400, 'Malformed JSON in request body', 'BAD_REQUEST');
  }

  // ─── Unknown / Programming Errors ──────────────────────────
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';

  logger.error(`[INTERNAL] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.stack);
  }

  return ApiResponse.error(res, statusCode, message, 'INTERNAL_SERVER_ERROR', [], err.stack);
};

export {
  notFoundHandler,
  errorHandler
};
