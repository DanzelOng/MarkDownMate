import { useEffect } from 'react';
import useAuthStatus from '../hooks/useAuthStatus';
import Spinner from '../components/ui/Spinner';
import HomePageLoggedIn from '../components/pages/HomePageLoggedIn';
import UnauthenticatedPage from '../components/pages/UnauthenticatedPage';

interface HomeProps {
  isDarkTheme: boolean;
  setDarkTheme: React.Dispatch<React.SetStateAction<boolean>>;
}

const Home = ({ isDarkTheme, setDarkTheme }: HomeProps) => {
  const {
    authResponse: { status },
    getAuthStatus,
  } = useAuthStatus();

  useEffect(() => {
    document.body.style.height = '100dvh';
    document.body.style.overflow = 'hidden';

    getAuthStatus();

    return () => {
      document.body.style.height = '';
      document.body.style.overflow = 'revert';
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

  return status === 'authenticated' ? (
    <HomePageLoggedIn isDarkTheme={isDarkTheme} setDarkTheme={setDarkTheme} />
  ) : (
    <UnauthenticatedPage errorType={status} getAuthStatus={getAuthStatus} />
  );
};

export default Home;
