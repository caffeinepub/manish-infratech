import React, { useState, useMemo } from 'react';
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetAllBills, useGetProfitLossSummary } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import SummaryCard from '../components/SummaryCard';
import BillResultsTable from '../components/BillResultsTable';
import { formatINR } from '../utils/formatCurrency';

function dateToNano(date: string): bigint {
  return BigInt(new Date(date).getTime()) * 1_000_000n;
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

  const { actor, isFetching: actorFetching } = useActor();
  const { data: allBills = [], isLoading: billsLoading, isError: billsError } = useGetAllBills();
  const { data: plSummary, isLoading: plLoading, isError: plError } = useGetProfitLossSummary(
    dateToNano(fromDate),
    dateToNano(toDate)
  );

  const isConnecting = actorFetching && !actor;
  const hasError = (!actorFetching && !actor) || billsError || plError;

  const filteredBills = useMemo(() => {
    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime() + 86400000;
    return allBills.filter((b) => {
      const ms = Number(BigInt(b.billDate) / 1_000_000n);
      return ms >= from && ms <= to;
    });
  }, [allBills, fromDate, toDate]);

  const totals = useMemo(() => {
    return filteredBills.reduce(
      (acc, b) => ({
        revenue: acc.revenue + b.finalAmount,
        gst: acc.gst + b.totalGst,
        cgst: acc.cgst + b.cgst,
        sgst: acc.sgst + b.sgst,
      }),
      { revenue: 0, gst: 0, cgst: 0, sgst: 0 }
    );
  }, [filteredBills]);

  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Party Name', 'Date', 'Base Amount', 'CGST', 'SGST', 'Final Amount', 'Amount Paid', 'Pending'];
    const rows = filteredBills.map((b) => {
      const ms = Number(BigInt(b.billDate) / 1_000_000n);
      const date = new Date(ms).toLocaleDateString('en-IN');
      return [
        b.invoiceNumber,
        b.partyName,
        date,
        b.baseAmount.toFixed(2),
        b.cgst.toFixed(2),
        b.sgst.toFixed(2),
        b.finalAmount.toFixed(2),
        b.amountPaid.toFixed(2),
        b.pendingAmount.toFixed(2),
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isConnecting) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Financial Summary</h1>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Connecting to server…</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Financial Summary</h1>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-base font-semibold text-foreground">
            Unable to connect to server. Please refresh and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Financial Summary</h1>
        <button
          onClick={handleExportCSV}
          className="no-print flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Date range filter */}
      <div className="no-print flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {billsLoading || plLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <SummaryCard
            totalRevenue={totals.revenue}
            totalGst={totals.gst}
            cgst={totals.cgst}
            sgst={totals.sgst}
          />

          {plSummary && (
            <div className="mt-6 p-4 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-3">Profit & Loss</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Billed</p>
                  <p className="font-semibold text-foreground">{formatINR(plSummary.totalBilled)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Received</p>
                  <p className="font-semibold text-green-600">{formatINR(plSummary.totalReceived)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outstanding</p>
                  <p className="font-semibold text-destructive">{formatINR(plSummary.totalOutstanding)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Bills ({filteredBills.length})
            </h2>
            <BillResultsTable bills={filteredBills} />
          </div>
        </>
      )}
    </div>
  );
}
