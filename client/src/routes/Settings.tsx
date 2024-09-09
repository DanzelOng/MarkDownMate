import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStatus from '../hooks/useAuthStatus';
import Spinner from '../components/ui/Spinner';
import UnauthenticatedPage from '../components/pages/UnauthenticatedPage';
import UsernameSettings from '../components/settings/UsernameSettings';
import PasswordSettings from '../components/settings/PasswordSettings';

export interface IUserCredentials {
  username: string;
}

const Settings = () => {
  const [userCredentials, setUserCredentials] = useState<IUserCredentials>({
    username: '',
  });
  const { authResponse, getAuthStatus } = useAuthStatus();

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

  if (authResponse.status === 'loading') {
    return (
      <div className='grid h-dvh place-items-center'>
        <Spinner size='screen' />
      </div>
    );
  }

  return authResponse.status === 'authenticated' ? (
    <div className='grid min-h-full place-items-center bg-gradient-to-r from-slate-350 to-slate-400 p-7 font-roboto'>
      <div className='p-10 w-full max-w-[31.25rem] space-y-6 rounded-md bg-slate-100'>
        <h1 className='text-[2.5rem] font-medium tracking-wide text-slate-500'>
          Settings
        </h1>
        <div className='flex flex-col gap-7'>
          <UsernameSettings
            username={userCredentials.username || authResponse.username}
            setCredentials={setUserCredentials}
          />
          <div className='flex flex-col gap-y-5'>
            <h3 className='text-2xl font-medium text-slate-500'>Email</h3>
            <span className='text-slate-250 border font-medium border-slate-250 rounded-md p-3.5 cursor-not-allowed'>
              {authResponse.email}
            </span>
          </div>
          <PasswordSettings />
        </div>
        <Link
          to='/home'
          className='block bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
        >
          Back to home
        </Link>
      </div>
    </div>
  ) : (
    <UnauthenticatedPage
      errorType={authResponse.status}
      getAuthStatus={getAuthStatus}
    />
  );
};

export default Settings;
