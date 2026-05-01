import { useEffect, useState } from 'react';
import { getAuthData } from './auth.js';

const AUTH_EVENT = 'auth-updated';

export const useAuthUser = () => {
  const [auth, setAuth] = useState(getAuthData());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuth(getAuthData());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_EVENT, handleAuthChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(AUTH_EVENT, handleAuthChange);
      }
    };
  }, []);

  return auth;
};
