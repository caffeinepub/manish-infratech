import React, { useState, useMemo } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetAllBills } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import BillResultsTable from '../components/BillResultsTable';

export default function SearchBillsPage() {
  const [query, setQuery] = useState('');
  const { actor, isFetching: actorFetching } = useActor();
  const { data: bills = [], isLoading, isError } = useGetAllBills();

  const filtered = useMemo(() => {
    if (!query.trim()) return bills;
    const q = query.toLowerCase();
    return bills.filter(
      (b) =>
        b.partyName.toLowerCase().includes(q) ||
        b.invoiceNumber.toLowerCase().includes(q)
    );
  }, [bills, query]);

  const isConnecting = actorFetching && !actor;
  const hasError = !actorFetching && !actor;

  if (isConnecting) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Search Bills</h1>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Connecting to server…</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || isError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Search Bills</h1>
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
      <h1 className="text-2xl font-bold text-foreground mb-6">Search Bills</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by party name or invoice number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            {filtered.length} bill{filtered.length !== 1 ? 's' : ''} found
            {query ? ` for "${query}"` : ''}
          </p>
          <BillResultsTable bills={filtered} />
        </>
      )}
    </div>
  );
}
