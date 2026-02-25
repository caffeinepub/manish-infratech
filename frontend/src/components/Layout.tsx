import React from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import { FileText, Search, BarChart2, Users, Building2, LogOut } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Add Bill', icon: FileText },
  { path: '/search', label: 'Search Bills', icon: Search },
  { path: '/summary', label: 'Summary', icon: BarChart2 },
  { path: '/party-summary', label: 'Party Summary', icon: Users },
  { path: '/company-report', label: 'Company Report', icon: Building2 },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useSimpleAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1e3a8a', boxShadow: '0 2px 8px rgba(30,58,138,0.25)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate({ to: '/' })}>
              {/* MI Logo Badge */}
              <div
                style={{
                  backgroundColor: '#dc2626',
                  borderRadius: '6px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '16px', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.5px' }}>
                  MI
                </span>
              </div>
              {/* Brand Name */}
              <div className="hidden sm:block">
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '18px', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.3px' }}>
                  MANISH INFRATECH
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate({ to: path })}
                    style={{
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)',
                      backgroundColor: isActive ? 'rgba(220,38,38,0.85)' : 'transparent',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.12)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
                      }
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
              }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-2 flex flex-wrap gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate({ to: path })}
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)',
                    backgroundColor: isActive ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.08)',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1e3a8a', borderTop: '3px solid #dc2626' }} className="mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div style={{ backgroundColor: '#dc2626', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '10px' }}>MI</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                © {new Date().getFullYear()} Manish Infratech. All rights reserved.
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'manish-infratech')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#93c5fd', textDecoration: 'underline' }}
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
