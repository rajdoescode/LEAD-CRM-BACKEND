import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token.
 * @param {object} payload - Data to embed in the token (e.g., { id, role })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT token.
 * @param {string} token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export { generateToken, verifyToken };
