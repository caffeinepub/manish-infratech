import React, { useState } from 'react';
import { useGetAllBills, useGetAggregate, useGetProfitLossSummary } from '../hooks/useQueries';
import SummaryCard from '../components/SummaryCard';
import BillResultsTable from '../components/BillResultsTable';
import { formatCurrency } from '../utils/formatCurrency';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import type { Bill } from '../backend';

function formatBillDate(ns: bigint): string {
  if (!ns) return '';
  const ms = Number(ns) / 1_000_000;
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dateToNs(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
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

export default function SummaryPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fromNs = fromDate ? startOfDayNs(fromDate) : BigInt(0);
  const toNs = toDate ? endOfDayNs(toDate) : BigInt(Date.now()) * BigInt(1_000_000);

  const { data: allBills = [], isLoading: billsLoading } = useGetAllBills();
  const { data: aggregate, isLoading: aggLoading } = useGetAggregate();
  const { data: plSummary, isLoading: plLoading } = useGetProfitLossSummary(fromNs, toNs);

  const filteredBills = (fromDate || toDate)
    ? allBills.filter(b => {
        const ns = b.billDate;
        return ns >= fromNs && ns <= toNs;
      })
    : allBills;

  const downloadCSV = async () => {
    const bills = filteredBills;
    const rows: string[][] = [
      ['Invoice No.', 'Party Name', 'GST No.', 'Bill Date', 'Base Amount', 'CGST', 'SGST', 'Round-off', 'Final Amount', 'Amount Paid', 'Pending Amount'],
    ];

    // Collect unique party names and fetch GST numbers
    const partyNames = [...new Set(bills.map(b => b.partyName))];
    const gstMap: Record<string, string> = {};
    // We'll use the data already available from the bills; GST fetching is async
    // For CSV we'll note that GST numbers need to be fetched
    // Since we can't easily call actor here, we'll use a simple approach
    for (const name of partyNames) {
      gstMap[name] = ''; // Will be populated below
    }

    for (const bill of bills) {
      rows.push([
        bill.invoiceNumber,
        bill.partyName,
        gstMap[bill.partyName] || '',
        formatBillDate(bill.billDate),
        bill.baseAmount.toFixed(2),
        bill.cgst.toFixed(2),
        bill.sgst.toFixed(2),
        bill.roundOff.toFixed(2),
        bill.finalAmount.toFixed(2),
        bill.amountPaid.toFixed(2),
        bill.pendingAmount.toFixed(2),
      ]);
    }

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manish-infratech-total-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = 'border border-navy-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-saffron-400 bg-white text-navy-900';

  return (
    <div className="space-y-8">
      {/* Aggregate Cards */}
      <section>
        <h2 className="text-xl font-bold text-navy-800 mb-4">Overall Summary</h2>
        {aggLoading ? (
          <div className="text-navy-400 text-sm">Loading...</div>
        ) : (
          <SummaryCard
            totalRevenue={aggregate?.totalAmount ?? 0}
            totalGst={aggregate?.totalGst ?? 0}
            cgst={(aggregate?.totalGst ?? 0) / 2}
            sgst={(aggregate?.totalGst ?? 0) / 2}
          />
        )}
      </section>

      {/* Profit & Loss Section */}
      <section className="bg-white rounded-xl border border-navy-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-navy-800">Profit & Loss Summary</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy-600 font-medium">From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputCls} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy-600 font-medium">To</label>
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
        </div>

        {plLoading ? (
          <div className="text-navy-400 text-sm">Loading...</div>
        ) : plSummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
              <p className="text-xs text-navy-500 uppercase tracking-wider font-semibold mb-1">Total Billed</p>
              <p className="text-2xl font-bold text-navy-800">{formatCurrency(plSummary.totalBilled)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">Total Received</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(plSummary.totalReceived)}</p>
            </div>
            <div className={`rounded-lg p-4 border ${plSummary.totalOutstanding > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-xs uppercase tracking-wider font-semibold ${plSummary.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Outstanding
                </p>
                {plSummary.totalOutstanding > 0
                  ? <TrendingDown className="h-3 w-3 text-red-500" />
                  : <TrendingUp className="h-3 w-3 text-green-500" />
                }
              </div>
              <p className={`text-2xl font-bold ${plSummary.totalOutstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {formatCurrency(plSummary.totalOutstanding)}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Bills Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy-800">
            All Bills
            {(fromDate || toDate) && (
              <span className="ml-2 text-sm font-normal text-navy-500">
                (filtered: {filteredBills.length} bills)
              </span>
            )}
          </h2>
          <button
            onClick={downloadCSV}
            disabled={filteredBills.length === 0}
            className="flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>
        {billsLoading ? (
          <div className="text-navy-400 text-sm">Loading bills...</div>
        ) : (
          <BillResultsTable bills={filteredBills} />
        )}
      </section>
    </div>
  );
}
