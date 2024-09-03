import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InputField from '../components/ui/InputField';
import Spinner from '../components/ui/Spinner';
import ErrorMsg from '../components/ui/ErrorMsg';
import { ExceedRequestsError } from '../utils/httpErrors';
import * as authAPI from '../services/authAPI';

interface FormProps {
  password: string;
  passwordConfirmation: string;
}

type TStatus = 'loading' | 'invalid' | 'valid';

const PasswordReset = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [pageStatus, setPageStatus] = useState<TStatus>('loading');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>();

  const onSubmit: SubmitHandler<FormProps> = async (formData) => {
    const data = {
      ...formData,
      token: searchParams.get('token') as string,
      id: searchParams.get('id') as string,
    };
    try {
      await authAPI.resetPassword(data);
      reset();
      toast.success(
        'Password has been successfully resetted! Redirecting to Login page...',
        {
          id: 'success',
        }
      );
      setTimeout(() => {
        navigate('/login');
      }, 1850);
    } catch (error) {
      if (error instanceof ExceedRequestsError) {
        setIsRateLimited(true);
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  const togglePass = () => setShowPassword((mode) => !mode);

  useEffect(() => {
    async function getStatus() {
      const token: string | null = searchParams.get('token');
      const id: string | null = searchParams.get('id');
      try {
        await authAPI.getTokenStatus(token, id);
        setPageStatus('valid');
      } catch (error) {
        setPageStatus('invalid');
      }
    }
    getStatus();
  }, [setPageStatus, searchParams]);

  if (pageStatus === 'loading') {
    return (
      <div className='grid h-dvh place-items-center'>
        <Spinner size='screen' />
      </div>
    );
  }

  return (
    <div className='grid h-dvh place-items-center bg-gradient-to-r from-slate-350 to-slate-400 px-4 font-roboto'>
      <div className='w-full max-w-[31.25rem] rounded-md bg-slate-100'>
        {pageStatus === 'valid' ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6 p-8'
            autoComplete='off'
          >
            <div className='flex flex-col gap-y-5'>
              <h1 className='text-3xl font-medium text-slate-500'>
                Reset Your Password
              </h1>
              <div className='flex flex-col gap-y-1'>
                {errors?.password?.message && (
                  <ErrorMsg msg={errors.password.message} />
                )}
                <div className='relative flex'>
                  <InputField
                    fullWidth
                    disabled={isRateLimited}
                    type={showPassword ? 'text' : 'password'}
                    label='New Password'
                    error={!(errors.password === undefined)}
                    register={register}
                    registerName='password'
                    validationOptions={{
                      required: 'Please enter a new password',
                      validate: {
                        detectWhitespaces: (password) =>
                          !/^\s|\s$/.test(password) ||
                          'No leading or trailing whitespaces',
                      },
                      minLength: {
                        value: 3,
                        message: 'Min length of 3 characters',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Max length of 50 characters',
                      },
                    }}
                  />
                  <button
                    type='button'
                    aria-label='toggles password visibility'
                    onClick={togglePass}
                    className='absolute right-0 top-[50%] mr-4 translate-y-[-50%] focus-visible:outline focus-visible:outline-2'
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>
              <div className='flex flex-col gap-y-1'>
                {errors?.passwordConfirmation?.message && (
                  <ErrorMsg msg={errors.passwordConfirmation.message} />
                )}
                <div className='relative flex'>
                  <InputField
                    fullWidth
                    disabled={isRateLimited}
                    type='password'
                    label='Confirm Password'
                    error={!(errors.passwordConfirmation === undefined)}
                    register={register}
                    registerName='passwordConfirmation'
                    validationOptions={{
                      required: 'Please enter your password confirmation',
                      validate: {
                        detectWhitespaces: (passwordConfirmation) =>
                          !/^\s|\s$/.test(passwordConfirmation) ||
                          'No leading or trailing whitespaces',
                        validatePasswordFields: () => {
                          const { password, passwordConfirmation } =
                            getValues();
                          return (
                            password === passwordConfirmation ||
                            'Passwords do not match'
                          );
                        },
                      },
                    }}
                  />
                  <LockIcon className='absolute right-0 top-[50%] mr-4 translate-y-[-50%]' />
                </div>
              </div>
              <div>
                {isRateLimited && (
                  <ErrorMsg msg='You have sent out too many requests. Please try again later.' />
                )}
                <button
                  type='submit'
                  disabled={isSubmitting || isRateLimited}
                  className='w-full bg-orange-600 px-6 py-3 text-base text-slate-50 transition-all duration-200 hover:bg-orange-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
                >
                  Reset Password
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className='space-y-4 p-4'>
            <p className='text-center font-medium'>
              The password reset link has already expired
            </p>
            <Link
              to='/'
              className='block bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
            >
              Back to Landing Page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
