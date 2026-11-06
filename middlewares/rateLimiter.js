const { rateLimit } = require("express-rate-limit");
const AppError = require("../errors/AppError");

const handler = (req, res, next) => next(new AppError("Too many requests. Please try again later.", 429));

// Login / register: stop password guessing. Successful logins are not counted.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Public JSON API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = { loginLimiter, apiLimiter };
