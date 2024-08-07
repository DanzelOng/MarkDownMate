import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className='grid h-dvh place-items-center bg-gradient-to-r from-slate-350 to-slate-400 p-4 font-roboto text-slate-150'>
      <div className='flex w-full max-w-[31.25rem] flex-col gap-y-5 rounded-md bg-slate-100 p-5 text-slate-500'>
        <span className='text-center font-medium'>
          The page cannot be found.
        </span>
        <Link
          to='/'
          className='bg-slate-950 p-3 text-center text-base text-slate-50 transition-all duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-[0.5px] focus-visible:outline-slate-250'
        >
          Back to landing page
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
