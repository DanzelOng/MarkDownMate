import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import {
  BadRequestError,
  UnauthorizedError,
  ExceedRequestsError,
} from '../../utils/httpErrors';
import * as authAPI from '../../services/authAPI';

interface VerifyPageProps {
  email: string;
}

interface VerifyProps {
  otp: string;
}

const VerifyPage = ({ email }: VerifyPageProps) => {
  const [remainingEmailTime, setRemainingEmailTime] = useState(60);
  const [remainingOtpTime, setRemainingOtpTime] = useState(60);
  const [isEmailRateLimited, setIsEmailRateLimited] = useState(false);
  const [isOtpRateLimited, setIsOtpRateLimited] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<VerifyProps>();

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<VerifyProps> = async (data) => {
    if (isOtpRateLimited) return;
    const { otp } = data;

    try {
      await authAPI.verifyEmail(otp);
      toast.success(
        'Account successfully verified! Redirecting to home page...'
      );
      // to be fixed
      setTimeout(() => {
        navigate('/home');
      }, 1850);
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof UnauthorizedError
      ) {
        setError('otp', { type: 'custom', message: error.errorMsgs as string });
      } else if (error instanceof ExceedRequestsError) {
        setIsOtpRateLimited(true);
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  const onResendLink = async () => {
    if (isEmailRateLimited) return;

    try {
      await authAPI.generateEmailOTP({ email });
      toast.success(
        'The OTP has been successfully sent to your email address!',
        { id: 'otp' }
      );
    } catch (error) {
      if (error instanceof ExceedRequestsError) {
        setIsEmailRateLimited(true);
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  // manage email rate limit
  useEffect(() => {
    if (!isEmailRateLimited) return;

    if (remainingEmailTime === 0) {
      setIsEmailRateLimited(false);
      setRemainingEmailTime(60);
      return;
    }

    const id = setInterval(() => {
      setRemainingEmailTime((time) => --time);
    }, 1000);

    return () => clearInterval(id);
  }, [isEmailRateLimited, remainingEmailTime, setRemainingEmailTime]);

  // manage otp rate limit
  useEffect(() => {
    if (!isOtpRateLimited) return;

    if (remainingOtpTime === 0) {
      clearErrors();
      setIsOtpRateLimited(false);
      setRemainingOtpTime(60);
      return;
    }

    const id = setInterval(() => {
      setRemainingOtpTime((time) => --time);
      setError('otp', {
        type: 'custom',
        message: `You have sent out too many OTP requests. Please try again in ${remainingOtpTime}s`,
      });
    }, 1000);

    return () => clearInterval(id);
  }, [
    isOtpRateLimited,
    remainingOtpTime,
    setRemainingOtpTime,
    setError,
    clearErrors,
  ]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
      className='space-y-5 rounded-md bg-slate-100 p-8'
    >
      <h1 className='text-[1.2rem] font-medium text-slate-500'>
        Please enter the OTP sent to your email
      </h1>
      <div className='space-y-5'>
        {errors?.otp?.message && <ErrorMsg msg={errors.otp.message} />}
        <div className='relative flex'>
          <InputField
            fullWidth
            disabled={isOtpRateLimited}
            type='text'
            label='OTP'
            error={!(errors.otp === undefined) || isOtpRateLimited}
            register={register}
            registerName='otp'
            validationOptions={{
              required: 'An OTP is required',
              pattern: {
                value: /^\d{6}$/,
                message: 'Invalid OTP format',
              },
            }}
          />
          <VpnKeyIcon className='absolute right-0 top-[50%] mr-4 translate-y-[-50%]' />
        </div>
        <button
          disabled={isSubmitting || isOtpRateLimited}
          type='submit'
          className='w-full bg-slate-950 p-3 text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
        >
          Submit OTP
        </button>
      </div>
      <div className='text-slate-500'>
        {isEmailRateLimited && (
          <ErrorMsg
            msg={`You have sent out too many email requests. Please try again in ${remainingEmailTime}s`}
          />
        )}
        <div className='flex flex-wrap justify-center gap-1 font-medium'>
          <span> Didn't get an email?</span>
          <button
            type='button'
            disabled={isEmailRateLimited}
            onClick={onResendLink}
            className='cursor-pointer underline decoration-1 transition-all duration-200 hover:text-slate-300 hover:decoration-slate-450 focus-visible:no-underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:text-slate-300'
          >
            Resend verification link
          </button>
        </div>
      </div>
    </form>
  );
};

export default VerifyPage;
