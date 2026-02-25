import React from 'react';
import { useActor } from '../hooks/useActor';
import AddBillForm from '../components/AddBillForm';

export default function AddBillPage() {
  const { actor, isFetching } = useActor();
  const isConnectionError = !actor && !isFetching;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Bill</h1>
        <p className="text-gray-600 text-sm mt-1">Create a new GST invoice</p>
      </div>

      {/* Connection Status */}
      {isFetching && (
        <div className="mb-4 flex items-center gap-2 text-gray-600 text-sm">
          <svg className="animate-spin h-4 w-4 text-brand-red" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Connecting to backend...
        </div>
      )}
      {isConnectionError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          Backend connection error. Please refresh the page.
        </div>
      )}
      {actor && !isFetching && (
        <div className="mb-4 flex items-center gap-2 text-green-700 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          Connected
        </div>
      )}

      <AddBillForm />
    </div>
  );
}
