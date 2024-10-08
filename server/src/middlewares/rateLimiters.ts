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

export const limitGenerateResetTokenMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hr
  limit: 5, // 5 requests
  legacyHeaders: true,
  statusCode: 429,
  message: {
    type: 'Exceed Requests Error',
    errorMsgs:
      'You have sent out too many requests to generate a password reset token. Please try again after 1 hour.',
  },
});

export const limitResetPasswordMiddleware = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  limit: 5, // 5 requests
  legacyHeaders: true,
  statusCode: 429,
  message: {
    type: 'Exceed Requests Error',
    errorMsgs:
      'You have sent out too many requests to reset your password. Please request a new password reset token.',
  },
});

export const limitSaveDocumentMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // 10 requests
  legacyHeaders: true,
  statusCode: 429,
  message: {
    type: 'Exceed Requests Error',
    errorMsgs:
      'You have sent out to many requests to save the documents. Please try again after 10 minutes.',
  },
});

export const limitUpdateCredentialsMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 10, // 10 requests
  legacyHeaders: true,
  statusCode: 429,
  message: {
    type: 'Exceed Requests Error',
    errorMsgs:
      'You have sent out to many requests to update your credentials. Please try again after 15 minutes.',
  },
});
