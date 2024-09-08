import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from '../routes/LandingPage';
import Login from '../routes/Login';
import Signup from '../routes/Signup';
import Home from '../routes/Home';
import Settings from '../routes/Settings';
import PasswordReset from '../routes/PasswordReset';
import PageNotFound from '../routes/PageNotFound';

const App = () => {
  const [isDarkTheme, setDarkTheme] = useState<boolean>(() => {
    const result: string | null = localStorage.getItem('theme');

    if (!result) {
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      return query.matches ? true : false;
    }
    const theme = JSON.parse(result);
    return theme === 'dark' ? true : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
    const theme = JSON.stringify(isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [isDarkTheme]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route
            path='/home'
            element={
              <Home isDarkTheme={isDarkTheme} setDarkTheme={setDarkTheme} />
            }
          />
          <Route path='password-reset' element={<PasswordReset />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster toastOptions={{ className: 'font-roboto' }} />
    </>
  );
};

export default App;
