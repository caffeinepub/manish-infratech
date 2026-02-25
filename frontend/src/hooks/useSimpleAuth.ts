const AUTH_KEY = 'simpleAuth';
const VALID_USERNAME = 'MANISHINFRATECH';
const VALID_PASSWORD = '1752';

export function getIsAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

import { useState } from 'react';

export function useSimpleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getIsAuthenticated());
  const [error, setError] = useState<string | null>(null);

  const login = (username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      try {
        localStorage.setItem(AUTH_KEY, 'authenticated');
      } catch {
        // ignore storage errors
      }
      setIsAuthenticated(true);
      setError(null);
      return true;
    } else {
      setError('Invalid username or password');
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore storage errors
    }
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout, error };
}
