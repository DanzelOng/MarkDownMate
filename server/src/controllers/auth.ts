import { sendOTPVerificationMail } from '../utils/mailer';
import passport, { AuthenticateCallback } from 'passport';
import { matchedData } from 'express-validator';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { IVerifyOptions } from 'passport-local';
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

// (POST) registers a user
export async function signup(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = matchedData(req);

  try {
    const existingUser = await User.findOne({ username }).exec();
    const existingEmail = await User.findOne({ email }).exec();

    const errorMsgs: { username?: string; email?: string } = {};

    if (existingUser) {
      errorMsgs.username = 'Username is already taken';
    }

    if (existingEmail) {
      errorMsgs.email = 'Email is already taken';
    }

    if (Object.keys(errorMsgs).length) {
      return res.status(409).json({ type: 'Conflict Error', errorMsgs });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // create OTP token
    const { otp } = await OTP.create({
      email: newUser.email,
    });

    // send OTP to user's email
    await sendOTPVerificationMail(newUser, otp);

    res.sendStatus(201);
  } catch (error) {
    return next(createHttpError(500, 'Internal server error'));
  }
}

// (POST) logs a user in
export function login(req: Request, res: Response, next: NextFunction) {
  const callbackFn: AuthenticateCallback = (err, user, info) => {
    if (err) {
      return next(createHttpError(500, 'Internal server error'));
    }

    if (!user) {
      return res.status(401).json({
        type: 'Unauthorized Error',
        errorMsgs: (info as IVerifyOptions).message,
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(createHttpError(500, 'Internal server error'));
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
    const existingUser = await User.findOne(
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

    if (existingUser.isVerified) {
      return res
        .status(200)
        .json({ message: 'User is already verified. Please log in instead' });
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
    return next(createHttpError(500, 'Internal server error'));
  }
}

// (PATCH) verifies email address
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

    const user = await User.findOne(
      { email },
      'userId username email isVerified'
    ).exec();

    if (!user) {
      return res.status(401).json({
        type: 'Unauthorized Error',
        errorMsgs:
          'We were unable to find a user for this verification. Please sign up instead',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        msg: 'User has already been verified. Please login instead',
      });
    }

    user.isVerified = true;
    await user.save();

    // delete existing OTP
    await OTP.findByIdAndDelete({ _id: existingOTP._id });

    if (req.user) {
      // user is already authenticated, return 200 response
      return res.sendStatus(200);
    } else {
      // create user session upon successful verification for unverified users
      // to allow frontend authentication
      req.login(
        {
          userId: user.userId,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
        (err) => {
          if (err) {
            return next(createHttpError(500, 'Internal server error'));
          }
          res.sendStatus(200);
        }
      );
    }
  } catch (error) {
    return next(createHttpError(500, 'Internal server error'));
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
