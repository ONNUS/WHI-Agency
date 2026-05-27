import rateLimit from 'express-rate-limit';

export const assessLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many assessment requests from this IP. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'Too many login attempts from this IP. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
