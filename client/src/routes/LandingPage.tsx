import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className='grid h-dvh place-items-center bg-gradient-to-r from-slate-350 to-slate-400 p-4 font-roboto'>
      <div className='w-full max-w-[31.25rem] space-y-8 rounded-md bg-slate-100 p-8 text-center'>
        <div className='space-y-3'>
          <h1 className='text-[1.6rem] font-bold leading-[2.8125rem] tracking-wide md:text-4xl md:leading-[3.125rem]'>
            Welcome to MarkDownMate
          </h1>
          <p className='text-lg text-slate-500'>
            Edit, create, upload, and download markdown documents with ease.
            Your one-stop solution for managing markdown documents.
          </p>
        </div>
        <div className='space-y-2'>
          <Link
            to='/signup'
            className='inline-block font-medium text-slate-350 underline transition-all duration-200 hover:text-slate-250 focus-visible:no-underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-slate-250'
          >
            Create an Account
          </Link>
          <p className='font-medium'>or</p>
          <Link
            to='/login'
            className='block bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
