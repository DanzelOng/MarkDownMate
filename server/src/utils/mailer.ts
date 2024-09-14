import env from '../utils/validateEnv';
import { Types } from 'mongoose';
import { IUser } from '../models/unverifiedUsers';
import nodemailer, { SendMailOptions } from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.HOST_EMAIL,
    pass: env.APP_PASSWORD,
  },
});

// sends the OTP to the email address
export async function sendOTPVerificationMail(user: IUser, otp: number) {
  const mailOptions: SendMailOptions = {
    from: {
      name: 'MarkdownMate',
      address: env.HOST_EMAIL,
    },
    to: user.email,
    subject: 'Verify your email',
    html: `
      <p>Hello ${user.username},</p>
      <p>To complete your registration, please use the following 6 digit One Time Password (OTP), valid for 5 minutes.</p>
      <p>${otp}</p>
      <p>To keep your account safe, never forward this code.</p>
      <p>MarkdownMate</p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Internal server mail error');
  }
}

// for password resetting
export async function sendPasswordResetMail(
  username: string,
  userId: Types.ObjectId,
  email: string,
  token: string
) {
  const resetLink = `${env.CLIENT_URL}/password-reset?token=${token}&id=${userId}`;

  const mailOptions: SendMailOptions = {
    from: {
      name: 'MarkdownMate',
      address: env.HOST_EMAIL,
    },
    to: email,
    subject: 'Reset your password',
    html: `
      <p>Hello ${username},</p>
      <p>We've received a request has to reset the password for the account associated with ${email}. No changes has been made to your account yet. If you made this request, please click on the link below to reset your password:</p>
      <p>
        <a href=${resetLink} target="_blank" style="
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
          text-align: center;
          border: 1px solid #007bff;
        ">Reset your password</a>
      </p>
      <p>This link will only be valid for 5 minutes.</p>
      <p>MarkdownMate</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Internal server mail error');
  }
}
