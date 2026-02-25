import React, { useState } from 'react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

interface SimpleLoginScreenProps {
  onLogin: () => void;
}

export default function SimpleLoginScreen({ onLogin }: SimpleLoginScreenProps) {
  const { login, error } = useSimpleAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Red header strip */}
          <div className="bg-brand-red px-8 py-6 flex flex-col items-center">
            <img
              src="/assets/generated/manish-infratech-logo.dim_320x80.png"
              alt="Manish Infratech"
              className="h-12 object-contain mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="text-white text-center mt-1">
              <div className="text-xs font-medium tracking-widest uppercase opacity-80">Billing Management System</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Password / PIN
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-red-700 text-white font-semibold py-2.5 rounded transition-colors"
            >
              Login
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
          © {new Date().getFullYear()} Manish Infratech. All rights reserved.
        </p>
      </div>
    </div>
  );
}
