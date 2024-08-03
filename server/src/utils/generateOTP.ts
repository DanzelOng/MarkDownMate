import otpGenerator from 'otp-generator';

export default function generateOTP() {
  return parseInt(
    otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
  );
}
