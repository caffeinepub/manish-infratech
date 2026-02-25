import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Printer, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useGetBill, useGetPartyGstNumber } from '../hooks/useQueries';
import InvoicePrintView from '../components/InvoicePrintView';

export default function InvoicePrintPage() {
  const { id } = useParams({ from: '/invoice/$id/print' });
  const navigate = useNavigate();
  const { data: bill, isLoading, error } = useGetBill(id);
  const { data: partyGst = '' } = useGetPartyGstNumber(bill?.partyName ?? '');

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-lg font-semibold text-foreground">Invoice Not Found</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unable to load invoice. Please try again.'}
          </p>
          <button
            onClick={() => navigate({ to: '/search' })}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Action buttons — hidden on print via no-print class */}
      <div className="no-print flex items-center gap-3 p-4 bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate({ to: '/search' })}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </button>
        <span className="text-sm text-muted-foreground ml-2">
          Invoice #{bill.invoiceNumber}
        </span>
      </div>

      {/* Invoice content — this is what gets printed */}
      <div className="print-container p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <InvoicePrintView bill={bill} partyGstNumber={partyGst} />
        </div>
      </div>
    </div>
  );
}
