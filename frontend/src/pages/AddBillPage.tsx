import React from 'react';
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import AddBillForm from '../components/AddBillForm';
import { useActor } from '../hooks/useActor';

export default function AddBillPage() {
  const { actor, isFetching } = useActor();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Add New Bill</h1>

      {/* Connecting */}
      {isFetching && !actor && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-muted rounded-lg border border-border text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
          <span>Connecting to server…</span>
        </div>
      )}

      {/* Connection failed — actor never arrived after fetching stopped */}
      {!isFetching && !actor && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Unable to connect to server. Please refresh and try again.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded text-xs font-medium hover:bg-destructive/90 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      )}

      {/* Connected */}
      {actor && !isFetching && (
        <div className="mb-4 flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200 text-xs text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Connected</span>
        </div>
      )}

      <AddBillForm />
    </div>
  );
}
