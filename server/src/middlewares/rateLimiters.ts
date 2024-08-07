import { rateLimit } from 'express-rate-limit';

export const limitGenerateEmailOTPMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 min
  limit: 5, // 5 requests
  legacyHeaders: true,
  statusCode: 429,
  message: {
    type: 'Exceed Requests Error',
    errorMsgs:
      'You have sent out too many requests to generate an email OTP. Please try again after 1 minute.',
  },
});

export const limitVerifyEmailMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 min
  limit: 5, // 5 requests
  legacyHeaders: true,
  statusCode: 429,
  message: {
    type: 'Exceed Requests Error',
    errorMsgs:
      'You have sent out too many OTP requests. Please try again after 1 minute.',
  },
});
