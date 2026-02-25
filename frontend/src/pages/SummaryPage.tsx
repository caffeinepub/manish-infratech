import React, { useState } from 'react';
import { useGetAllBills, useGetProfitLossSummary } from '../hooks/useQueries';
import BillResultsTable from '../components/BillResultsTable';
import SummaryCard from '../components/SummaryCard';
import type { Bill } from '../backend';

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export default function SummaryPage() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);

  const { data: allBills = [], isLoading } = useGetAllBills();

  const fromMs = new Date(fromDate).getTime();
  const toMs = new Date(toDate).getTime() + 86400000 - 1;

  const filteredBills = allBills.filter(bill => {
    const billMs = Number(bill.billDate) / 1_000_000;
    return billMs >= fromMs && billMs <= toMs;
  });

  const fromNs = fromMs * 1_000_000;
  const toNs = toMs * 1_000_000;
  const { data: plSummary } = useGetProfitLossSummary(fromNs, toNs);

  const totalBilled = filteredBills.reduce((s, b) => s + b.finalAmount, 0);
  const totalPaid = filteredBills.reduce((s, b) => s + b.amountPaid, 0);
  const totalPending = filteredBills.reduce((s, b) => s + b.pendingAmount, 0);
  const totalGst = filteredBills.reduce((s, b) => s + b.totalGst, 0);

  const downloadCSV = () => {
    const headers = ['Invoice No', 'Party Name', 'Date', 'Base Amount', 'GST', 'Total', 'Paid', 'Pending'];
    const rows = filteredBills.map(b => {
      const ms = Number(b.billDate) / 1_000_000;
      const date = new Date(ms).toLocaleDateString('en-IN');
      return [b.invoiceNumber, b.partyName, date, b.baseAmount, b.totalGst, b.finalAmount, b.amountPaid, b.pendingAmount];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${fromDate}-to-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Summary</h1>
          <p className="text-gray-600 text-sm mt-1">Overview of billing and payments</p>
        </div>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
        >
          Download CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-red"
          />
        </div>
        <span className="text-sm text-gray-500">{filteredBills.length} bills</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Billed" value={formatCurrency(totalBilled)} highlight />
        <SummaryCard label="Total Paid" value={formatCurrency(totalPaid)} />
        <SummaryCard label="Total Pending" value={formatCurrency(totalPending)} />
        <SummaryCard label="Total GST" value={formatCurrency(totalGst)} />
      </div>

      {/* P&L Section */}
      {plSummary && (
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Profit & Loss</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Billed</div>
              <div className="font-bold text-gray-900 text-lg">{formatCurrency(plSummary.totalBilled)}</div>
            </div>
            <div>
              <div className="text-gray-600">Total Received</div>
              <div className="font-bold text-green-700 text-lg">{formatCurrency(plSummary.totalReceived)}</div>
            </div>
            <div>
              <div className="text-gray-600">Outstanding</div>
              <div className={`font-bold text-lg ${plSummary.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(plSummary.totalOutstanding)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Bills</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading bills...</div>
        ) : (
          <BillResultsTable bills={filteredBills} />
        )}
      </div>
    </div>
  );
}
