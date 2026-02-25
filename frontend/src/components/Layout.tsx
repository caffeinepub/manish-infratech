import React from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

const navLinks = [
  { label: 'Summary', path: '/summary' },
  { label: 'Add Bill', path: '/add-bill' },
  { label: 'Search', path: '/search' },
  { label: 'Parties', path: '/parties' },
  { label: 'Company Report', path: '/company-report' },
  { label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { logout } = useSimpleAuth();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky Red Header */}
      <header className="sticky top-0 z-50 bg-brand-red shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate({ to: '/summary' })}
          >
            <img
              src="/assets/generated/mi-logo.dim_128x128.png"
              alt="MI"
              className="h-8 w-8 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">
              MANISH INFRATECH
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path })}
                  className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-brand-red'
                      : 'text-white hover:bg-red-700'
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
            className="ml-2 px-3 py-1.5 bg-white text-brand-red text-sm font-semibold rounded hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-xs py-3 text-center no-print">
        <span>© {new Date().getFullYear()} Manish Infratech. </span>
        <span>
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
