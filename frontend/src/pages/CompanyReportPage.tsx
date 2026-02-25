import React, { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useGetCompanyReport, useGetPartyGstNumber } from '../hooks/useQueries';
import BillResultsTable from '../components/BillResultsTable';
import { formatCurrency } from '../utils/formatCurrency';
import { Building2, Download } from 'lucide-react';
import type { Bill } from '../backend';

function formatBillDate(ns: bigint): string {
  if (!ns) return '';
  const ms = Number(ns) / 1_000_000;
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function startOfDayNs(dateStr: string): bigint {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return BigInt(d.getTime()) * BigInt(1_000_000);
}

function endOfDayNs(dateStr: string): bigint {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return BigInt(d.getTime()) * BigInt(1_000_000);
}

export default function CompanyReportPage() {
  const search = useSearch({ from: '/company-report' }) as { party?: string };
  const partyName = search.party || '';

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fromNs = fromDate ? startOfDayNs(fromDate) : BigInt(0);
  const toNs = toDate ? endOfDayNs(toDate) : BigInt(Date.now()) * BigInt(1_000_000);

  const { data: report, isLoading } = useGetCompanyReport(partyName, fromNs, toNs);
  const { data: gstNumber = '' } = useGetPartyGstNumber(partyName);

  const downloadCSV = () => {
    if (!report) return;
    const bills = report.bills;

    const headerRows = [
      [`Party Name: ${partyName}`],
      [`GST No: ${gstNumber || 'N/A'}`],
      [],
      ['Invoice No.', 'Bill Date', 'Base Amount', 'CGST', 'SGST', 'Final Amount', 'Amount Paid', 'Pending'],
    ];

    const dataRows = bills.map(bill => [
      bill.invoiceNumber,
      formatBillDate(bill.billDate),
      bill.baseAmount.toFixed(2),
      bill.cgst.toFixed(2),
      bill.sgst.toFixed(2),
      bill.finalAmount.toFixed(2),
      bill.amountPaid.toFixed(2),
      bill.pendingAmount.toFixed(2),
    ]);

    const allRows = [...headerRows, ...dataRows];
    const csv = allRows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = partyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    a.download = `${safeName}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = 'border border-navy-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-saffron-400 bg-white text-navy-900';

  if (!partyName) {
    return (
      <div className="text-center py-16 text-navy-400">
        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No party selected. Go to Party Summary and click "View Report".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="h-6 w-6 text-saffron-500" />
            <h1 className="text-2xl font-bold text-navy-800">{partyName}</h1>
          </div>
          {gstNumber && (
            <p className="text-sm text-navy-600 ml-9">
              <span className="font-semibold">GST No:</span> {gstNumber}
            </p>
          )}
        </div>
        <button
          onClick={downloadCSV}
          disabled={!report || report.bills.length === 0}
          className="flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg border border-navy-200 p-4">
        <span className="text-sm font-semibold text-navy-700">Filter by Date:</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-navy-600">From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputCls} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-navy-600">To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputCls} />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="text-xs text-navy-500 hover:text-navy-700 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="text-navy-400 text-sm">Loading report...</div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-navy-800 text-white rounded-xl p-5 shadow">
              <p className="text-xs text-saffron-300 uppercase tracking-wider font-semibold mb-1">Total Service Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalServiceAmount)}</p>
            </div>
            <div className="bg-green-700 text-white rounded-xl p-5 shadow">
              <p className="text-xs text-green-200 uppercase tracking-wider font-semibold mb-1">Total Received</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalReceived)}</p>
            </div>
            <div className={`rounded-xl p-5 shadow text-white ${report.totalPending > 0 ? 'bg-red-600' : 'bg-green-600'}`}>
              <p className="text-xs uppercase tracking-wider font-semibold mb-1 opacity-80">Pending</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalPending)}</p>
            </div>
          </div>

          {/* Bills Table */}
          <div>
            <h2 className="text-lg font-bold text-navy-800 mb-3">
              Bills ({report.bills.length})
            </h2>
            <BillResultsTable bills={report.bills} hideActions={false} />
          </div>
        </>
      ) : null}
    </div>
  );
}
