import { Schema, model } from 'mongoose';
import generateOTP from '../utils/generateOTP';

const otpSchema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: Number, length: 6, required: true, default: () => generateOTP() },
  expiredAt: { type: Date, expires: '5m', default: Date.now },
});

const OTP = model('OTP', otpSchema);

export default OTP;
