import { useState } from 'react';
import * as authAPI from '../services/authAPI';

type AuthResponse =
  | { isAuthenticated: null; status: 'loading' }
  | {
      isAuthenticated: false;
      status: 'unAuthorizedError' | 'networkError';
    }
  | {
      isAuthenticated: true;
      status: 'authenticated';
      username: string;
      email: string;
    };

const useAuthStatus = () => {
  const [authResponse, setAuthResponse] = useState<AuthResponse>({
    isAuthenticated: null,
    status: 'loading',
  });

  const getAuthStatus = async () => {
    setAuthResponse({
      isAuthenticated: null,
      status: 'loading',
    });
    try {
      const authResponse = await authAPI.getAuthStatus();
      if (!authResponse.isAuthenticated) {
        setAuthResponse({
          isAuthenticated: authResponse.isAuthenticated,
          status: 'unAuthorizedError',
        });
      } else {
        setAuthResponse({
          isAuthenticated: authResponse.isAuthenticated,
          status: 'authenticated',
          username: authResponse.username,
          email: authResponse.email,
        });
      }
    } catch (error) {
      setAuthResponse({
        isAuthenticated: false,
        status: 'networkError',
      });
    }
  };

  return { authResponse, getAuthStatus };
};

export default useAuthStatus;
