import React, { useState } from 'react';
import { useGetAllBills } from '../hooks/useQueries';
import BillResultsTable from '../components/BillResultsTable';

export default function SearchBillsPage() {
  const { data: allBills = [], isLoading } = useGetAllBills();
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [partyFilter, setPartyFilter] = useState('');

  const filtered = allBills.filter(bill => {
    const matchInvoice = !invoiceFilter || bill.invoiceNumber.toLowerCase().includes(invoiceFilter.toLowerCase());
    const matchParty = !partyFilter || bill.partyName.toLowerCase().includes(partyFilter.toLowerCase());
    return matchInvoice && matchParty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Bills</h1>
        <p className="text-gray-600 text-sm mt-1">Find bills by invoice number or party name</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
          <input
            type="text"
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            placeholder="Search by invoice number..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-sm"
          />
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
          <input
            type="text"
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            placeholder="Search by party name..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-sm"
          />
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Results <span className="text-sm font-normal text-gray-500">({filtered.length} bills)</span>
          </h2>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading bills...</div>
        ) : (
          <BillResultsTable bills={filtered} />
        )}
      </div>
    </div>
  );
}
