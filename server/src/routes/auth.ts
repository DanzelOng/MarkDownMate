import { Router } from 'express';
import { checkSchema, Schema } from 'express-validator';
import validateCredentialsMiddleware from '../middlewares/validateCredentials';
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
      errorMessage: 'Password Confirmation property was not defined in request body',
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

const router = Router();

// register a user up
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

export default router;