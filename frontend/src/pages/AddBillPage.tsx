import React from 'react';
import AddBillForm from '../components/AddBillForm';
import { useActor } from '../hooks/useActor';
import { FileText } from 'lucide-react';

export default function AddBillPage() {
  const { isFetching } = useActor();

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div style={{ backgroundColor: '#1e3a8a', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              Add New Bill
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {isFetching ? 'Connecting to backend...' : 'Create and save a new invoice'}
            </p>
          </div>
        </div>
      </div>

      <AddBillForm />
    </div>
  );
}
