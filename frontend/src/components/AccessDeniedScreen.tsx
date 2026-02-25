import React from 'react';
import { ShieldX } from 'lucide-react';

interface AccessDeniedScreenProps {
  onLogout?: () => void;
}

export default function AccessDeniedScreen({ onLogout }: AccessDeniedScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="flex justify-center mb-4">
          <ShieldX className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this application.
        </p>
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Return to Login
          </button>
        )}
      </div>
    </div>
  );
}
