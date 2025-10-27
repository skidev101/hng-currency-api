import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS! as string as unknown as number, 
  max: process.env.RATE_LIMIT_MAX_REQUESTS! as string as unknown as number,
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
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.REFRESH_RATE_LIMIT_MAX! as string as unknown as number,
  message: {
    error: 'Refresh limit exceeded. Please wait before refreshing again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});