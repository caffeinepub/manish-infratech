import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from '../hooks/useQueries';
import { UserRole } from '../backend';
import LoginScreen from './LoginScreen';
import ProfileSetupModal from './ProfileSetupModal';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userRole,
    isLoading: roleLoading,
    isFetched: roleFetched,
    error: roleError,
  } = useGetCallerUserRole();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Loading role check
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Role has been fetched — check authorization
  // Only admin or user roles are allowed; guest means unauthorized
  if (roleFetched) {
    const isAuthorized =
      userRole === UserRole.admin || userRole === UserRole.user;

    if (!isAuthorized) {
      // Strictly block all content — render ONLY the access denied screen
      return <AccessDeniedScreen />;
    }
  }

  // If role fetch errored, treat as unauthorized
  if (roleError && !roleLoading) {
    return <AccessDeniedScreen />;
  }

  // Loading profile (only reached if authorized)
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Profile setup needed (only for authorized users without a profile yet)
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  return <>{children}</>;
}
