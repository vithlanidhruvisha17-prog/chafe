const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.',
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};
