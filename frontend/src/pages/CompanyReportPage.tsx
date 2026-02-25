import React, { useState } from 'react';
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetCompanyReport, useGetUniquePartyNames } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
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

export default function CompanyReportPage() {
  const defaults = getDefaultDateRange();
  const [selectedParty, setSelectedParty] = useState('');
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);

  const { actor, isFetching: actorFetching } = useActor();
  const { data: partyNames = [], isLoading: partiesLoading } = useGetUniquePartyNames();
  const {
    data: report,
    isLoading: reportLoading,
    isError: reportError,
  } = useGetCompanyReport(
    selectedParty,
    dateToNano(fromDate),
    dateToNano(toDate)
  );

  const isConnecting = actorFetching && !actor;
  const hasError = (!actorFetching && !actor) || reportError;

  const handleExportCSV = () => {
    if (!report) return;
    const headers = ['Invoice No', 'Party Name', 'Date', 'Base Amount', 'CGST', 'SGST', 'Final Amount', 'Amount Paid', 'Pending'];
    const rows = report.bills.map((b) => {
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
    a.download = `${selectedParty}_report_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isConnecting) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Company Report</h1>
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Company Report</h1>
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
        <h1 className="text-2xl font-bold text-foreground">Company Report</h1>
        {report && selectedParty && (
          <button
            onClick={handleExportCSV}
            className="no-print flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="no-print flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Party:</label>
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[180px]"
          >
            <option value="">Select a party…</option>
            {partyNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
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

      {!selectedParty ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Select a party to view their report.</p>
        </div>
      ) : reportLoading || partiesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
              <p className="text-lg font-bold text-foreground">{formatINR(report.totalServiceAmount)}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Received</p>
              <p className="text-lg font-bold text-green-600">{formatINR(report.totalReceived)}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-lg font-bold text-destructive">{formatINR(report.totalPending)}</p>
            </div>
          </div>

          <div className="mt-2">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Bills for {selectedParty} ({report.bills.length})
            </h2>
            <BillResultsTable bills={report.bills} />
          </div>
        </>
      ) : null}
    </div>
  );
}
