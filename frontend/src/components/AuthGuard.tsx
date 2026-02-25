import React, { useState } from 'react';
import { getIsAuthenticated } from '../hooks/useSimpleAuth';
import SimpleLoginScreen from './SimpleLoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [authenticated, setAuthenticated] = useState(() => getIsAuthenticated());

  if (!authenticated) {
    return (
      <SimpleLoginScreen
        onLogin={() => setAuthenticated(true)}
      />
    );
  }

  return <>{children}</>;
}
