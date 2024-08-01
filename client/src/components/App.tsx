import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../routes/LandingPage';
import Login from '../routes/Login';
import Signup from '../routes/Signup';
import Home from '../routes/Home';
import Settings from '../routes/Settings';
import PageNotFound from '../routes/PageNotFound';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Home />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
