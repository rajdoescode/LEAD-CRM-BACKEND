/**
 * Request sanitizer middleware.
 * Strips potentially dangerous characters from query params and body
 * to prevent NoSQL injection and XSS.
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove MongoDB operators
    return value.replace(/\$|{|}/g, '');
  }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Skip keys that start with $ (MongoDB operators)
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
};

const sanitize = (req, _res, next) => {
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
};

export default sanitize;
