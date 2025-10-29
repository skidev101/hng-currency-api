import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS), 
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS)  ,
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for refresh endpoint
 */
export const refreshLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS), // 1 hour
  max: Number(process.env.REFRESH_RATE_LIMIT_MAX), // limit each IP to 5 requests per windowMs
  message: {
    error: 'Refresh limit exceeded. Please wait before refreshing again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});