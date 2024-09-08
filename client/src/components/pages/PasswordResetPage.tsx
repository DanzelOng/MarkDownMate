import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import EmailIcon from '@mui/icons-material/Email';
import {
  ExceedRequestsError,
  ResourceNotFoundError,
} from '../../utils/httpErrors';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import * as authAPI from '../../services/authAPI';

interface PasswordResetPageProps {
  togglePasswordPage: () => void;
}

interface FormProps {
  email: string;
}

const PasswordResetPage = ({ togglePasswordPage }: PasswordResetPageProps) => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>();

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    try {
      await authAPI.generateResetToken(data);
      toast.success(
        'The password reset link has been sent to your email address!',
        { id: 'success' }
      );
    } catch (error) {
      if (error instanceof ExceedRequestsError) {
        setIsRateLimited(true);
      } else if (error instanceof ResourceNotFoundError) {
        setError('email', {
          type: 'custom',
          message: error.errorMsgs as string,
        });
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
      className='space-y-5 rounded-md bg-slate-100 p-8 font-roboto md:p-10'
    >
      <div className='space-y-1'>
        <h1 className='text-[2.2rem] font-medium tracking-wide text-slate-500'>
          Forgot Password
        </h1>
        <p className='font-medium'>
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>
      <div className='space-y-3'>
        {errors?.email?.message && <ErrorMsg msg={errors.email.message} />}
        <div className='relative flex'>
          <InputField
            fullWidth
            disabled={isRateLimited}
            type='text'
            label='Email'
            error={!(errors.email === undefined)}
            register={register}
            registerName='email'
            validationOptions={{
              required: 'An email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                message: 'Invalid email format',
              },
            }}
          />
          <EmailIcon className='absolute right-0 top-[50%] mr-4 translate-y-[-50%]' />
        </div>
        <div>
          {isRateLimited && (
            <ErrorMsg msg='You have sent out too many email requests. Please try again later.' />
          )}
          <div className='flex flex-col gap-y-4 mt-6'>
            <button
              disabled={isSubmitting || isRateLimited}
              type='submit'
              className='w-full bg-slate-950 p-3 text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              Submit Email
            </button>
            <button
              type='button'
              onClick={togglePasswordPage}
              className='flex self-center font-medium underline decoration-1 transition-all duration-200 hover:text-slate-300 hover:decoration-slate-450 focus-visible:no-underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250'
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PasswordResetPage;
