/**
 * Standardized API Response utility.
 *
 * Enforces a consistent response envelope across ALL endpoints:
 *
 *   {
 *     success: true|false,
 *     statusCode: 200,
 *     message: 'Human-readable message',
 *     data: { ... },              // payload (omitted on errors)
 *     pagination: { ... },        // only on paginated lists
 *     meta: { timestamp, ... }    // always present
 *   }
 *
 * @example
 *   ApiResponse.success(res, data, 'Leads fetched');
 *   ApiResponse.created(res, newLead, 'Lead created');
 *   ApiResponse.paginated(res, leads, paginationMeta);
 */
class ApiResponse {
  /**
   * Send a success response.
   * @param {import('express').Response} res
   * @param {any}    data       - Response payload
   * @param {string} [message]  - Human-readable message
   * @param {number} [statusCode=200]
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * 201 Created shorthand.
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Success with no content (204-style but sends JSON for consistency).
   */
  static noContent(res, message = 'Operation completed successfully') {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send a paginated response.
   * @param {import('express').Response} res
   * @param {Array}  data       - Page items
   * @param {object} pagination - { page, limit, total, totalPages, hasNextPage, hasPrevPage }
   * @param {string} [message]
   */
  static paginated(res, data = [], pagination = {}, message = 'Data fetched successfully') {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send a standardized error response.
   * Typically called by the global errorHandler, but available for manual use.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {string} [code]     - Machine-readable error code
   * @param {Array}  [errors]   - Validation error details
   * @param {string} [stack]    - Stack trace (dev only)
   */
  static error(res, statusCode = 500, message = 'Internal server error', code = 'ERROR', errors = [], stack = null) {
    const response = {
      success: false,
      statusCode,
      message,
      code,
      ...(errors.length > 0 && { errors }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    if (stack && process.env.NODE_ENV === 'development') {
      response.stack = stack;
    }

    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;
