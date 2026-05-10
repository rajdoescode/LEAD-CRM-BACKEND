/**
 * Async handler wrapper — eliminates try/catch boilerplate in controllers.
 *
 * Wraps an async route handler and forwards any thrown error to the
 * Express global error handler via next(). Works with both async
 * functions and synchronous functions that throw.
 *
 * @param {Function} fn - Express route handler (req, res, next) => Promise
 * @returns {Function}  - Wrapped handler with automatic error forwarding
 *
 * @example
 *   // In routes:
 *   router.get('/', asyncHandler(leadController.getAll));
 *
 *   // In controllers — just throw, no try/catch needed:
 *   const getAll = async (req, res) => {
 *     const leads = await fetchLeads();
 *     if (!leads) throw ApiError.notFound('No leads found');
 *     ApiResponse.success(res, leads);
 *   };
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
