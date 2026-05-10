/**
 * Simple in-memory rate limiter middleware.
 * No external dependencies — suitable for single-server deployments.
 * For production clusters, use Redis-based rate limiting.
 */
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now - record.start > record.window) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates a rate limiting middleware.
 * @param {object} options
 * @param {number} [options.windowMs=60000] - Time window in milliseconds
 * @param {number} [options.max=100]        - Max requests per window
 * @param {string} [options.message]        - Error message
 */
const rateLimit = ({ windowMs = 60_000, max = 100, message = 'Too many requests, please try again later' } = {}) => {
  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now - record.start > windowMs) {
      record = { count: 1, start: now, window: windowMs };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.start + windowMs) / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message,
        code: 'TOO_MANY_REQUESTS',
        meta: { timestamp: new Date().toISOString() },
      });
    }

    next();
  };
};

export default rateLimit;
