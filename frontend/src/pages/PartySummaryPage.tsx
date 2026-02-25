import React, { useState } from 'react';
import { Loader2, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { useGetPartySummaryByDateRange, useSavePartyGstNumber } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useNavigate } from '@tanstack/react-router';
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

export default function PartySummaryPage() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [editingGst, setEditingGst] = useState<string | null>(null);
  const [gstValue, setGstValue] = useState('');

  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const {
    data: summaries = [],
    isLoading,
    isError: summaryError,
  } = useGetPartySummaryByDateRange(dateToNano(fromDate), dateToNano(toDate));
  const saveGst = useSavePartyGstNumber();

  const isConnecting = actorFetching && !actor;
  const hasError = (!actorFetching && !actor) || summaryError;

  const totals = summaries.reduce(
    (acc, s) => ({
      billed: acc.billed + s.totalBilled,
      paid: acc.paid + s.totalPaid,
      pending: acc.pending + s.totalPending,
    }),
    { billed: 0, paid: 0, pending: 0 }
  );

  const handleSaveGst = async (partyName: string) => {
    await saveGst.mutateAsync({ partyName, gstNumber: gstValue });
    setEditingGst(null);
    setGstValue('');
  };

  if (isConnecting) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Party Summary</h1>
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Party Summary</h1>
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
      <h1 className="text-2xl font-bold text-foreground mb-6">Party Summary</h1>

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Aggregate totals */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
              <p className="text-lg font-bold text-foreground">{formatINR(totals.billed)}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
              <p className="text-lg font-bold text-green-600">{formatINR(totals.paid)}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Pending</p>
              <p className="text-lg font-bold text-destructive">{formatINR(totals.pending)}</p>
            </div>
          </div>

          {summaries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No bills found for the selected date range.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Party Name</th>
                    <th className="px-4 py-3 text-left font-medium">GST Number</th>
                    <th className="px-4 py-3 text-right font-medium">Bills</th>
                    <th className="px-4 py-3 text-right font-medium">Total Billed</th>
                    <th className="px-4 py-3 text-right font-medium">Total Paid</th>
                    <th className="px-4 py-3 text-right font-medium">Pending</th>
                    <th className="px-4 py-3 text-center font-medium no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s, idx) => (
                    <tr
                      key={s.partyName}
                      className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{s.partyName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {editingGst === s.partyName ? (
                          <div className="flex items-center gap-2 no-print">
                            <input
                              type="text"
                              value={gstValue}
                              onChange={(e) => setGstValue(e.target.value)}
                              placeholder="Enter GST number"
                              className="border border-border rounded px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-36"
                            />
                            <button
                              onClick={() => handleSaveGst(s.partyName)}
                              disabled={saveGst.isPending}
                              className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50"
                            >
                              {saveGst.isPending ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingGst(null)}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/80"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary no-print"
                            onClick={() => {
                              setEditingGst(s.partyName);
                              setGstValue(s.gstNumber || '');
                            }}
                            title="Click to edit GST number"
                          >
                            {s.gstNumber || <span className="italic text-muted-foreground/60">Click to add</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {Number(s.billCount)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatINR(s.totalBilled)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {formatINR(s.totalPaid)}
                      </td>
                      <td className="px-4 py-3 text-right text-destructive font-medium">
                        {formatINR(s.totalPending)}
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <button
                          onClick={() => navigate({ to: '/company-report' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors mx-auto"
                        >
                          View Report
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
