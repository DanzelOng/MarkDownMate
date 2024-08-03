import env from '../utils/validateEnv';
import { IUser } from '../models/user';
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
