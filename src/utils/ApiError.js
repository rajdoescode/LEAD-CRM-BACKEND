/**
 * Custom API Error class for consistent error handling.
 *
 * Extends the native Error class with HTTP status codes, error codes,
 * and optional validation error details. Works seamlessly with the
 * global errorHandler middleware.
 *
 * @example
 *   throw ApiError.notFound('Lead not found');
 *   throw ApiError.badRequest('Email is required', [{ field: 'email', message: 'Required' }]);
 *   throw ApiError.unauthorized('Invalid PIN');
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable error message
   * @param {object} options
   * @param {string}   [options.code]   - Machine-readable error code (e.g., 'LEAD_NOT_FOUND')
   * @param {Array}    [options.errors] - Validation error details array
   * @param {boolean}  [options.isOperational=true] - Distinguishes operational vs programming errors
   */
  constructor(statusCode, message, { code, errors, isOperational = true } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || this._deriveCode(statusCode);
    this.errors = errors || [];
    this.isOperational = isOperational;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Derive a default error code from the HTTP status.
   * @private
   */
  _deriveCode(statusCode) {
    const codeMap = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codeMap[statusCode] || 'ERROR';
  }

  // ─── Static Factory Methods ──────────────────────────────────

  /** 400 Bad Request */
  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', errors });
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, { code: 'UNAUTHORIZED' });
  }

  /** 403 Forbidden */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, { code: 'FORBIDDEN' });
  }

  /** 404 Not Found */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }

  /** 409 Conflict */
  static conflict(message = 'Resource conflict') {
    return new ApiError(409, message, { code: 'CONFLICT' });
  }

  /** 422 Validation Error */
  static validation(message = 'Validation failed', errors = []) {
    return new ApiError(422, message, { code: 'VALIDATION_ERROR', errors });
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message, { code: 'TOO_MANY_REQUESTS' });
  }

  /** 500 Internal Server Error */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, { code: 'INTERNAL_SERVER_ERROR', isOperational: false });
  }
}

export default ApiError;
