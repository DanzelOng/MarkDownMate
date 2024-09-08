import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import InputField from '../ui/InputField';
import ErrorMsg from '../ui/ErrorMsg';
import PasswordResetPage from './PasswordResetPage';
import { BadRequestError, UnauthorizedError } from '../../utils/httpErrors';
import * as authAPI from '../../services/authAPI';

interface LoginPageProps {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setVerifyPage: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface LoginFormProps {
  username: string;
  password: string;
}

const LoginPage = ({ setEmail, setVerifyPage }: LoginPageProps) => {
  const [loginError, setLoginError] = useState<string>('');
  const [passwordResetPage, setPasswordResetPage] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormProps>();

  const navigate = useNavigate();

  const togglePasswordResetPage = () => setPasswordResetPage((state) => !state);

  const onSubmit: SubmitHandler<LoginFormProps> = async (data) => {
    try {
      await authAPI.login(data);
      reset();
      toast.success('Login Successful!');
      setTimeout(() => {
        navigate('/home');
      }, 1850);
    } catch (error) {
      if (
        error instanceof UnauthorizedError &&
        typeof error.errorMsgs === 'string'
      ) {
        if (error.errorMsgs === 'Invalid credentials') {
          setLoginError(error.errorMsgs);
        } else {
          setEmail(error.errorMsgs);
          setVerifyPage(true);
        }
      } else if (error instanceof BadRequestError) {
        // in the case where front end validation fails
        Object.entries(error.errorMsgs as object).forEach((err) =>
          setError(err[0] as keyof LoginFormProps, {
            type: 'custom',
            message: err[1],
          })
        );
      } else {
        toast.error((error as Error).message, { id: 'server-error' });
      }
    }
  };

  const hasErrors = !!Object.keys(errors).length;

  useEffect(() => {
    if (passwordResetPage) {
      if (getValues('username') || getValues('password')) {
        reset();
      } else if (hasErrors) {
        clearErrors();
      }
      if (loginError) {
        setLoginError('');
      }
    }
  }, [
    passwordResetPage,
    getValues,
    reset,
    clearErrors,
    hasErrors,
    loginError,
    setLoginError,
  ]);

  return passwordResetPage ? (
    <PasswordResetPage togglePasswordPage={togglePasswordResetPage} />
  ) : (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete='off'
      className='flex flex-col gap-y-6 rounded-md bg-slate-100 p-8 font-slab md:p-10'
    >
      <h1 className='text-center text-[2.5rem] font-medium tracking-wide text-slate-500'>
        Log In
      </h1>
      {loginError && <ErrorMsg msg={loginError} />}
      <div className='space-y-8'>
        <div>
          {errors?.username?.message && (
            <ErrorMsg msg={errors.username.message} />
          )}
          <div className='relative flex'>
            <InputField
              fullWidth
              type='text'
              label='Name'
              error={!(errors.username === undefined) || !!loginError}
              register={register}
              registerName='username'
              validationOptions={{
                required: 'A name is required',
                minLength: {
                  value: 3,
                  message: 'Min length of 3 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Max length of 50 characters',
                },
                onChange: () => {
                  if (loginError) {
                    setLoginError('');
                  }
                },
              }}
            />
            <PersonIcon className='absolute right-0 top-[50%] mr-4 translate-y-[-50%]' />
          </div>
        </div>
        <div>
          {errors?.password?.message && (
            <ErrorMsg msg={errors.password.message} />
          )}
          <div className='relative flex'>
            <InputField
              fullWidth
              type='password'
              label='Password'
              error={!(errors.password === undefined) || !!loginError}
              register={register}
              registerName='password'
              validationOptions={{
                required: 'A password is required',
                onChange: () => {
                  if (loginError) {
                    setLoginError('');
                  }
                },
              }}
            />
            <LockIcon className='absolute right-0 top-[50%] mr-4 translate-y-[-50%]' />
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-y-4'>
        <button
          disabled={isSubmitting}
          type='submit'
          className='w-full bg-slate-950 p-3 text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250 disabled:cursor-not-allowed disabled:bg-slate-300'
        >
          Log In
        </button>
        <button
          type='button'
          onClick={togglePasswordResetPage}
          className='self-center text-[0.9375rem] font-medium underline decoration-1 transition-all duration-200 hover:text-slate-300 hover:decoration-slate-450 focus-visible:no-underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250'
        >
          Forgot your password?
        </button>
      </div>
      <div className='flex flex-col items-center gap-y-2.5'>
        <p className='space-x-1.5 text-pretty text-center font-medium text-slate-450'>
          <span>Don't have an account?</span>
          <Link
            to='/signup'
            className='underline decoration-1 transition-all duration-200 hover:text-slate-400 hover:decoration-slate-450 focus-visible:no-underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250'
          >
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginPage;
