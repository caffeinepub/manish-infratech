import React from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

const NAV_LINKS = [
  { label: 'Add Bill', path: '/' },
  { label: 'Search Bills', path: '/search' },
  { label: 'Summary', path: '/summary' },
  { label: 'Party Summary', path: '/party-summary' },
  { label: 'Company Report', path: '/company-report' },
] as const;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useSimpleAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'manish-infratech'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation header — hidden on print via no-print class */}
      <header className="no-print sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate({ to: '/' })}
            >
              <img
                src="/assets/generated/mi-logo.dim_128x128.png"
                alt="MI Logo"
                className="h-10 w-10 rounded object-contain bg-white p-0.5"
              />
              <span className="font-bold text-lg tracking-wide hidden sm:block">
                MANISH INFRATECH
              </span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate({ to: link.path })}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path })}
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer — hidden on print */}
      <footer className="no-print bg-primary/5 border-t border-border py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Manish Infratech. All rights reserved.
          </p>
          <p className="mt-1">
            Built with{' '}
            <span className="text-primary">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
