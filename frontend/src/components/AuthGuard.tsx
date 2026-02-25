import React, { useState } from 'react';
import { getIsAuthenticated } from '../hooks/useSimpleAuth';
import SimpleLoginScreen from './SimpleLoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getIsAuthenticated());

  const handleLogin = () => {
    setIsAuthenticated(getIsAuthenticated());
  };

  if (!isAuthenticated) {
    return <SimpleLoginScreen onLogin={handleLogin} />;
  }

  return <>{children}</>;
}
