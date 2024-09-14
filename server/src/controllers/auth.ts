import env from '../utils/validateEnv';
import {
  sendOTPVerificationMail,
  sendPasswordResetMail,
} from '../utils/mailer';
import passport, { AuthenticateCallback } from 'passport';
import { matchedData } from 'express-validator';
import validator from 'validator';
import createHttpError from 'http-errors';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { IVerifyOptions } from 'passport-local';
import { UserCredentialsDto } from '../dto/Dto';
import UnverifiedUser from '../models/unverifiedUsers';
import User from '../models/user';
import OTP from '../models/OTP';
import ResetToken from '../models/token';

// (GET) get authentication status of user
export async function getAuthStatus(req: Request, res: Response) {
  if (!req.user?.isVerified) {
    return res.status(401).json({ isAuthenticated: false });
  }

  res.status(200).json({
    isAuthenticated: true,
    username: req.user.username,
    email: req.user.email,
  });
}

// (GET) get password reset token status
export async function getTokenStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token } = matchedData(req);
  try {
    const existingToken = await ResetToken.findOne({ token }).exec();
    existingToken
      ? res.sendStatus(200)
      : res.status(404).json({
          type: 'Bad Request error',
          errorMsgs:
            'The token has already expired. Please request a new token to reset your password.',
        });
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (POST) generates token for resetting password
export async function generateResetToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = matchedData(req);

    const existingUser = await User.findOne(
      { email },
      'userId username'
    ).exec();

    if (!existingUser) {
      return res.status(404).json({
        type: 'Resource Not Found Error',
        errorMsgs:
          'We were unable to find a user for this email address. Please sign up instead',
      });
    }

    const existingToken = await ResetToken.findOne(
      { email },
      'userId token'
    ).exec();

    if (!existingToken) {
      const { userId, token } = await ResetToken.create({
        userId: existingUser.userId,
        email,
        token: crypto.randomBytes(32).toString('hex'),
      });
      await sendPasswordResetMail(existingUser.username, userId, email, token);
    } else {
      await sendPasswordResetMail(
        existingUser.username,
        existingToken.userId,
        email,
        existingToken.token
      );
    }

    res.sendStatus(200);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (PATCH) resets users password
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token, id, password } = matchedData(req);

  try {
    const existingUser = await User.findOne({ userId: id }).exec();

    if (!existingUser) {
      return res.status(401).json({
        type: 'Unauthorized Error',
        errorMsgs: 'We could not find a user. Please sign up instead.',
      });
    }

    const existingToken = await ResetToken.findOne({ token }).exec();

    if (!existingToken) {
      return res.status(404).json({
        type: 'Resource Not Found Error',
        errorMsgs:
          'The token has already expired. Please request a new token to reset your password.',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    existingUser.password = hashedPassword;

    // update user password and delete existing token
    await Promise.all([
      existingUser.save(),
      ResetToken.findOneAndDelete({ userId: id }).exec(),
    ]);

    res.sendStatus(200);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (POST) registers a user
export async function signup(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = matchedData(req);

  try {
    const [
      existingUser,
      existingUserByEmail,
      existingUnverifiedUser,
      existingUnverifiedUserByEmail,
    ] = await Promise.all([
      User.findOne({ username }).exec(),
      User.findOne({ email }, 'email').exec(),
      UnverifiedUser.findOne({ username }).exec(),
      UnverifiedUser.findOne({ email }, 'email').exec(),
    ]);

    const errorMsgs: { username?: string; email?: string } = {};

    if (existingUser || existingUnverifiedUser) {
      errorMsgs.username = 'Username is already taken';
    }

    if (existingUserByEmail || existingUnverifiedUserByEmail) {
      errorMsgs.email = 'Email is already taken';
    }

    if (email === env.HOST_EMAIL) {
      errorMsgs.email = 'Unauthorized email address';
    }

    if (Object.keys(errorMsgs).length) {
      return res.status(409).json({ type: 'Conflict Error', errorMsgs });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create new user
    const newUnverifiedUser = await UnverifiedUser.create({
      username,
      email,
      password: hashedPassword,
    });

    // create OTP token
    const { otp } = await OTP.create({
      email: newUnverifiedUser.email,
    });

    // send OTP to user's email
    await sendOTPVerificationMail(newUnverifiedUser, otp);

    res.sendStatus(201);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (POST) logs a user in
export function login(req: Request, res: Response, next: NextFunction) {
  const callbackFn: AuthenticateCallback = (err, user, info) => {
    if (err) {
      return next(createHttpError(500, 'Internal Server Error'));
    }

    if (!user) {
      return res.status(401).json({
        type: 'Unauthorized Error',
        errorMsgs: (info as IVerifyOptions).message,
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(createHttpError(500, 'Internal Server Error'));
      }
      res.sendStatus(200);
    });
  };

  passport.authenticate('local', callbackFn)(req, res, next);
}

// (POST) sends OTP to email address
export async function generateEmailOTP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = matchedData(req);

  try {
    const existingUser = await UnverifiedUser.findOne(
      { email },
      'username email isVerified'
    ).exec();

    if (!existingUser) {
      return res.status(400).json({
        type: 'Bad Request Error',
        errorMsgs:
          'We were unable to find a user for this email address. Please sign up instead',
      });
    }

    const existingOTP = await OTP.findOne({ email }, 'otp').exec();

    if (!existingOTP) {
      const { otp } = await OTP.create({ email });
      await sendOTPVerificationMail(existingUser, otp);
    } else {
      await sendOTPVerificationMail(existingUser, existingOTP.otp);
    }

    res.sendStatus(200);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (POST) verifies email address
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { otp } = matchedData(req);

  try {
    const existingOTP = await OTP.findOne({ otp }, '_id email').exec();

    if (!existingOTP) {
      return res.status(400).json({
        type: 'Bad Request Error',
        errorMsgs: 'Invalid OTP',
      });
    }

    const { email } = existingOTP;

    const user = await UnverifiedUser.findOne(
      { email },
      'userId username email password'
    ).exec();

    if (!user) {
      return res.status(401).json({
        type: 'Unauthorized Error',
        errorMsgs:
          'We were unable to find a user for this verification. Please sign up instead',
      });
    }

    // deleting temp user, existing OTP and add unverified user to perm user collection concurrently
    const [, , newUser] = await Promise.all([
      UnverifiedUser.findByIdAndDelete(user._id).exec(),
      OTP.findByIdAndDelete(existingOTP._id).exec(),
      User.create({
        userId: user.userId,
        username: user.username,
        email: user.email,
        password: user.password,
        isVerified: true,
      }),
    ]);

    // create user session upon successful verification for unverified users
    req.login(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
      (err) => {
        if (err) {
          return next(createHttpError(500, 'Internal Server Error'));
        }
        res.sendStatus(201);
      }
    );
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (POST) updates user's credentials
export async function updateCredentials(
  req: Request<unknown, unknown, UserCredentialsDto, unknown>,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      type: 'Unauthorized Error',
      errorMsgs: 'Unauthorized access to endpoint',
    });
  }

  try {
    const { userId } = req.user;

    const existingUser = await User.findOne(
      { userId },
      'username email password'
    ).exec();

    if (!existingUser) {
      return res.status(401).json({
        type: 'Unauthorized Error',
        errorMsgs: 'We were unable to find a user',
      });
    }

    let { username, passwordConfirmation, newPassword } = req.body;

    // trim all fields before processing
    username = username ? validator.trim(username) : '';
    passwordConfirmation = passwordConfirmation
      ? validator.trim(passwordConfirmation)
      : '';
    newPassword = newPassword ? validator.trim(newPassword) : '';

    // throw bad request if all fields are empty
    if (!username && !passwordConfirmation && !newPassword) {
      return res.status(400).json({
        type: 'Bad Request Error',
        errorMsgs: 'No data was provided',
      });
    }

    // updates the username
    if (username) {
      const existingUsername = await User.findOne({ username }).exec();

      if (existingUsername) {
        return res.status(409).json({
          type: 'Conflict Error',
          errorMsgs: 'This name is already taken',
        });
      }

      existingUser.username = username;
    }

    // updates the password
    if (passwordConfirmation || newPassword) {
      // throw bad request if password fields are empty
      if (!passwordConfirmation || !newPassword) {
        return res.status(400).json({
          type: 'Bad Request Error',
          errorMsgs: {
            passwordConfirmation: 'Please enter your current password',
            newPassword: 'You did not enter a new password',
          },
        });
      }

      const isValidPassword = await bcrypt.compare(
        passwordConfirmation,
        existingUser.password
      );

      if (!isValidPassword) {
        return res.status(400).json({
          type: 'Bad Request Error',
          errorMsgs: { passwordConfirmation: 'Invalid password' },
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      existingUser.password = hashedPassword;
    }

    await existingUser.save();
    res.sendStatus(200);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (DELETE) logs a user out
export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) {
      return next(createHttpError(500, 'Internal Server Error'));
    }
    res.sendStatus(200);
  });
}
