const AUTH_KEY = 'manish_infratech_auth';
const VALID_USERNAME = 'MANISHINFRATECH';
const VALID_PASSWORD = '1752';

export function getIsAuthenticated(): boolean {
  try {
    const val = localStorage.getItem(AUTH_KEY);
    return val === 'authenticated';
  } catch {
    return false;
  }
}

export function useSimpleAuth() {
  function login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'authenticated');
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
  }

  function isAuthenticated(): boolean {
    return getIsAuthenticated();
  }

  return { login, logout, isAuthenticated };
}
