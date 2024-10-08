import { Router } from 'express';
import { checkSchema, Schema } from 'express-validator';
import '../strategies/localStrategy';
import validateCredentialsMiddleware from '../middlewares/validateCredentials';
import * as rateLimiters from '../middlewares/rateLimiters';
import * as authController from '../controllers/auth';

const signupSchema: Schema = {
  username: {
    exists: {
      bail: true,
      errorMessage: 'Username property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'A name is required',
    },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Name must be between 3 and 50 characters',
    },
  },
  email: {
    exists: {
      bail: true,
      errorMessage: 'Email property was not defined in request body',
    },
    trim: true,
    notEmpty: { bail: true, errorMessage: 'An email is required' },
    isEmail: {
      errorMessage: 'Invalid email format',
    },
    toLowerCase: true,
  },
  password: {
    in: ['body'],
    exists: {
      bail: true,
      errorMessage: 'Password property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'A password is required',
    },
    errorMessage: 'Password must be at least 3 characters long',
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Password must be between 3 and 50 characters',
    },
  },
  passwordConfirmation: {
    in: ['body'],
    exists: {
      bail: true,
      errorMessage:
        'Password Confirmation property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'Please enter your password confirmation',
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      },
    },
  },
};

const loginSchema: Schema = {
  username: signupSchema.username,
  password: signupSchema.password,
};

const emailSchema: Schema = {
  email: signupSchema.email,
};

const otpSchema: Schema = {
  otp: {
    exists: {
      bail: true,
      errorMessage: 'OTP was not defined in path params',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'OTP was not provided in path params',
    },
    matches: {
      options: /^\d{6}$/,
      errorMessage: 'Invalid OTP format',
    },
  },
};

const tokenSchema: Schema = {
  token: {
    exists: true,
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'Token was not provided in query params',
    },
  },
  id: {
    exists: true,
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'Id was not provided in query params',
    },
    isMongoId: {
      errorMessage: 'Invalid MongoId format',
    },
  },
};

const generateResetTokenSchema: Schema = {
  email: {
    exists: {
      bail: true,
      errorMessage: 'Email property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'Email was not provided in request body',
    },
    isEmail: {
      bail: true,
      errorMessage: 'Invalid email format',
    },
    toLowerCase: true,
  },
};

const resetPasswordSchema: Schema = {
  token: { ...tokenSchema.token, in: ['query'] },
  id: { ...tokenSchema.id, in: ['query'] },
  password: signupSchema.password,
  passwordConfirmation: signupSchema.passwordConfirmation,
};

const router = Router();

// gets user auth status
router.get('/status', authController.getAuthStatus);

// get password reset token status
router.get(
  '/token-status',
  checkSchema(tokenSchema, ['query']),
  validateCredentialsMiddleware,
  authController.getTokenStatus
);

// generate password reset token
router.post(
  '/generate-reset-token',
  rateLimiters.limitGenerateResetTokenMiddleware,
  checkSchema(generateResetTokenSchema, ['body']),
  validateCredentialsMiddleware,
  authController.generateResetToken
);

// reset password
router.patch(
  '/reset-password',
  rateLimiters.limitResetPasswordMiddleware,
  checkSchema(resetPasswordSchema),
  validateCredentialsMiddleware,
  authController.resetPassword
);

// registers a user
router.post(
  '/signup',
  checkSchema(signupSchema, ['body']),
  validateCredentialsMiddleware,
  authController.signup
);

// logs a user in
router.post(
  '/login',
  checkSchema(loginSchema, ['body']),
  validateCredentialsMiddleware,
  authController.login
);

// sends an OTP to the user's email
router.post(
  '/generate-email-otp',
  rateLimiters.limitGenerateEmailOTPMiddleware,
  checkSchema(emailSchema, ['body']),
  validateCredentialsMiddleware,
  authController.generateEmailOTP
);

// verifies email address
router.post(
  '/verify-email/:otp',
  rateLimiters.limitVerifyEmailMiddleware,
  checkSchema(otpSchema, ['params']),
  validateCredentialsMiddleware,
  authController.verifyEmail
);

// update user credentials
router.post(
  '/update-credentials',
  rateLimiters.limitUpdateCredentialsMiddleware,
  authController.updateCredentials
);

// logs the user out of session
router.delete('/logout', authController.logout);

export default router;
