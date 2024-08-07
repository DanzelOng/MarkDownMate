import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStatus from '../hooks/useAuthStatus';
import Spinner from '../components/ui/Spinner';
import SignupPage from '../components/pages/SignupPage';
import VerifyPage from '../components/pages/VerifyPage';
import UnauthenticatedPage from '../components/pages/UnauthenticatedPage';

const Signup = () => {
  const {
    authResponse: { status },
    getAuthStatus,
  } = useAuthStatus();

  const [email, setEmail] = useState<string>('');
  const [verifyPage, setVerifyPage] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = 'auto';
    document.body.classList.add('hasScrollBar');

    getAuthStatus();

    return () => {
      document.body.style.overflowY = 'revert';
      document.body.classList.remove('hasScrollBar');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'loading') {
    return (
      <div className='grid h-dvh place-items-center'>
        <Spinner size='screen' />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className='grid h-dvh place-items-center bg-gradient-to-r from-slate-350 to-slate-400 font-roboto text-slate-150'>
        <div className='flex w-full max-w-[20rem] flex-col gap-y-5 rounded-md bg-slate-100 p-6 text-slate-500'>
          <span className='text-center font-medium'>
            You are already logged in.
          </span>
          <Link
            to='/home'
            className='bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return status !== 'networkError' ? (
    <div className='grid min-h-full place-items-center bg-gradient-to-r from-slate-350 to-slate-400'>
      <div className='my-10 w-full max-w-[31.25rem] px-4'>
        {verifyPage && email ? (
          <VerifyPage type='register' email={email} />
        ) : (
          <SignupPage setEmail={setEmail} setVerifyPage={setVerifyPage} />
        )}
      </div>
    </div>
  ) : (
    <UnauthenticatedPage errorType={status} getAuthStatus={getAuthStatus} />
  );
};

export default Signup;
