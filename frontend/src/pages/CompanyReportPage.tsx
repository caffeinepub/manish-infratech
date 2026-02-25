import React, { useState } from 'react';
import { useGetUniquePartyNames, useGetCompanyReport } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import BillResultsTable from '../components/BillResultsTable';

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CompanyReportPage() {
  const { actor, isFetching: actorFetching } = useActor();
  const currentYear = new Date().getFullYear();
  const [selectedParty, setSelectedParty] = useState('');
  const [fromDate, setFromDate] = useState(`${currentYear}-04-01`);
  const [toDate, setToDate] = useState(`${currentYear + 1}-03-31`);

  const { data: partyNames = [] } = useGetUniquePartyNames();

  const fromMs = new Date(fromDate).getTime();
  const toMs = new Date(toDate + 'T23:59:59').getTime();
  const fromNs = fromMs * 1_000_000;
  const toNs = toMs * 1_000_000;

  const { data: report, isLoading, isError } = useGetCompanyReport(selectedParty, fromNs, toNs);

  const isConnectionError = !actorFetching && !actor;

  const downloadCSV = () => {
    if (!report) return;
    const headers = ['Invoice No', 'Party Name', 'Date', 'Base Amount', 'GST', 'Final Amount', 'Paid', 'Pending'];
    const rows = report.bills.map(b => {
      const ms = Number(b.billDate) / 1_000_000;
      const date = new Date(ms).toLocaleDateString('en-IN');
      return [b.invoiceNumber, b.partyName, date, b.baseAmount, b.totalGst, b.finalAmount, b.amountPaid, b.pendingAmount];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${selectedParty}_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Report</h1>
        <p className="text-gray-600 text-sm mt-1">Detailed billing report for a specific party</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Party *</label>
            <select
              value={selectedParty}
              onChange={e => setSelectedParty(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            >
              <option value="">-- Select a party --</option>
              {partyNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>
        </div>
      </div>

      {/* Error States */}
      {isConnectionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm font-medium">
          Unable to connect to the backend. Please refresh the page.
        </div>
      )}
      {isError && !isConnectionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm font-medium">
          Failed to load report data.
        </div>
      )}

      {!selectedParty && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-4 text-sm font-medium">
          Please select a party to view the report.
        </div>
      )}

      {/* Report Summary Cards */}
      {report && selectedParty && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-brand-red rounded-lg p-5 text-white shadow">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-100 mb-1">Total Billed</div>
              <div className="text-2xl font-bold">{formatCurrency(report.totalServiceAmount)}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Total Received</div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(report.totalReceived)}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Total Pending</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(report.totalPending)}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Bills for {selectedParty} ({report.bills.length})
              </h2>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white font-medium text-sm rounded transition-colors"
              >
                Download CSV
              </button>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading report...</div>
            ) : (
              <div className="p-4">
                <BillResultsTable bills={report.bills} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
