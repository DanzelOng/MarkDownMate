import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import { BadRequestError, ConflictError } from '../../utils/httpErrors';
import * as authAPI from '../../services/authAPI';

interface LoginPageProps {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setVerifyPage: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SignupFormProps {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const SignupPage = ({ setEmail, setVerifyPage }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormProps>();

  const onSubmit: SubmitHandler<SignupFormProps> = async (data) => {
    const { email } = data;
    try {
      await authAPI.signup(data);
      setVerifyPage(true);
      setEmail(email);
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) {
        Object.entries(error.errorMsgs as object).forEach((err) =>
          setError(err[0] as keyof SignupFormProps, {
            type: 'custom',
            message: err[1],
          })
        );
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  const togglePass = () => setShowPassword((mode) => !mode);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
      className='flex w-full max-w-[31.25rem] flex-col gap-y-6 rounded-md bg-slate-100 p-8 font-slab'
    >
      <h1 className='text-center text-[2.5rem] font-medium tracking-wide text-slate-500'>
        Sign Up
      </h1>
      <div className='space-y-7'>
        <div>
          {errors?.username?.message && (
            <ErrorMsg msg={errors.username.message} />
          )}
          <div className='relative flex'>
            <InputField
              fullWidth
              type='text'
              label='Name'
              error={!(errors.username === undefined)}
              register={register}
              registerName='username'
              validationOptions={{
                required: 'A name is required',
                validate: {
                  detectWhitespaces: (username) =>
                    !/^\s|\s$/.test(username) ||
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
            <PersonIcon className='absolute right-0 top-[50%] mr-4 translate-y-[-50%]' />
          </div>
        </div>
        <div>
          {errors?.email?.message && <ErrorMsg msg={errors.email.message} />}
          <div className='relative flex'>
            <InputField
              fullWidth
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
        </div>
        <div>
          {errors?.password?.message && (
            <ErrorMsg msg={errors.password.message} />
          )}
          <div className='relative flex'>
            <InputField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label='Password'
              error={!(errors.password === undefined)}
              register={register}
              registerName='password'
              validationOptions={{
                required: 'Please enter your password confirmation',
                validate: {
                  detectWhitespaces: (passwordConfirmation) =>
                    !/^\s|\s$/.test(passwordConfirmation) ||
                    'No leading or trailing whitespaces',
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
        <div>
          {errors?.passwordConfirmation?.message && (
            <ErrorMsg msg={errors.passwordConfirmation.message} />
          )}
          <div className='relative flex'>
            <InputField
              fullWidth
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
                    const { password, passwordConfirmation } = getValues();
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
      </div>
      <button
        disabled={isSubmitting}
        type='submit'
        className='flex min-h-6 justify-center bg-slate-950 p-3 text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
      >
        Sign Up
      </button>
      <div className='flex flex-col items-center gap-y-2.5'>
        <p className='space-x-1.5 text-pretty text-center font-medium text-slate-450'>
          <span>Already have an account? </span>
          <Link
            to='/login'
            className='underline decoration-1 transition-all duration-200 hover:text-slate-300 hover:decoration-slate-450 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 focus-visible:no-underline'
          >
            Log In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignupPage;
