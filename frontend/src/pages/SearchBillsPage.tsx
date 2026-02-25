import React, { useState } from 'react';
import { useGetAllBills } from '../hooks/useQueries';
import BillResultsTable from '../components/BillResultsTable';
import { Search, Loader2 } from 'lucide-react';

export default function SearchBillsPage() {
  const [query, setQuery] = useState('');
  const { data: allBills = [], isLoading } = useGetAllBills();

  const filtered = query.trim()
    ? allBills.filter(
        bill =>
          bill.partyName.toLowerCase().includes(query.toLowerCase()) ||
          bill.invoiceNumber.toLowerCase().includes(query.toLowerCase())
      )
    : allBills;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ backgroundColor: '#1e3a8a', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              Search Bills
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Search and manage your invoices
            </p>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '18px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(30,58,138,0.06)' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e3a8a', marginBottom: '8px' }}>
          Search by Party Name or Invoice Number
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search..."
            style={{
              width: '100%',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 12px 10px 36px',
              fontSize: '14px',
              color: '#1a1a2e',
              backgroundColor: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
            onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px' }}>
          <Loader2 size={24} color="#1e3a8a" className="animate-spin" />
          <span style={{ color: '#64748b', fontSize: '15px' }}>Loading bills...</span>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#374151', fontSize: '13px', fontWeight: 500 }}>
              {filtered.length} bill{filtered.length !== 1 ? 's' : ''} found
              {query && ` for "${query}"`}
            </span>
          </div>
          <BillResultsTable bills={filtered} />
        </div>
      )}
    </div>
  );
}
