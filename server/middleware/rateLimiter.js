const rateLimit = require('express-rate-limit');

// In test environment, skip all rate limiting so integration tests aren't throttled
const testPassthrough = (req, res, next) => next();
const isTest = process.env.NODE_ENV === 'test';

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please slow down.',
    });
  },
};

const apiLimiter = isTest ? testPassthrough : rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP.',
});

const mutationLimiter = isTest ? testPassthrough : rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000,
  max: 30,
});

const authLimiter = isTest ? testPassthrough : rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
});

module.exports = { apiLimiter, mutationLimiter, authLimiter };
