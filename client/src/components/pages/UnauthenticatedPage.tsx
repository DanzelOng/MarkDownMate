import { Link } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';

interface UnauthenticatedPageProps {
  errorType: 'unAuthorizedError' | 'networkError';
  getAuthStatus: () => Promise<void>;
}

const UnauthenticatedPage = ({
  errorType,
  getAuthStatus,
}: UnauthenticatedPageProps) => {
  return (
    <div className='grid h-dvh place-items-center bg-gradient-to-r from-slate-350 to-slate-400 px-4 text-center font-roboto'>
      <div className='mx-4 w-full max-w-[31.25rem] rounded-md bg-slate-100 p-5'>
        {errorType === 'unAuthorizedError' ? (
          <div className='space-y-6'>
            <p className='leading-7 font-medium'>
              Opps, you are not authorized to visit this page. <br />
              You can access this page by creating an account or logging in.
            </p>
            <div className='flex justify-center gap-x-5'>
              <Link
                to='/signup'
                className='w-full bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
              >
                Sign Up
              </Link>
              <Link
                to='/login'
                className='w-full bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
              >
                Log In
              </Link>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <h3 className='flex items-center justify-center gap-x-2 bg-red-500 p-3 text-2xl font-medium tracking-wide text-slate-100'>
              <ErrorIcon />
              Connection Error
            </h3>
            <p className='font-medium leading-7'>
              Sorry, there was a problem connecting to the server.<br></br>
              Please try again.
            </p>
            <button
              onClick={getAuthStatus}
              className='w-full bg-slate-950 p-3 text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250'
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthenticatedPage;
