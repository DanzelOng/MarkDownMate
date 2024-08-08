import { sendOTPVerificationMail } from '../utils/mailer';
import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import User from '../models/user';
import OTP from '../models/OTP';

// serializes user Id to session
passport.serializeUser((user, done) => {
  return done(null, user.userId);
});

// deserializes user session and attaches user object to req.user
passport.deserializeUser(async (id: Types.ObjectId, done) => {
  const user = await User.findOne(
    { userId: id },
    'userId username email isVerified'
  ).exec();

  if (!user) {
    return done(null, null);
  }

  return done(null, {
    userId: user.userId,
    username: user.username,
    email: user.email,
    isVerified: user.isVerified,
  });
});

passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const existingUser = await User.findOne(
        { username },
        'userId username password email isVerified'
      ).exec();

      if (!existingUser) {
        return done(null, false, {
          message: 'Invalid credentials or user does not exists',
        });
      }

      const isValidPassword = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isValidPassword) {
        return done(null, false, {
          message: 'Invalid credentials or user does not exists',
        });
      }

      if (!existingUser.isVerified) {
        const existingOTP = await OTP.findOne({
          email: existingUser.email,
        }).exec();

        if (!existingOTP) {
          const newOTP = await OTP.create({
            email: existingUser.email,
          });

          await sendOTPVerificationMail(existingUser, newOTP.otp);
        } else {
          await sendOTPVerificationMail(existingUser, existingOTP.otp);
        }

        return done(null, false, {
          message: existingUser.email,
        });
      }

      done(null, {
        userId: existingUser.userId,
        username: existingUser.username,
        email: existingUser.email,
        isVerified: existingUser.isVerified,
      });
    } catch (error) {
      done(error);
    }
  })
);
