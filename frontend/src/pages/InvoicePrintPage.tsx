import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBill, useGetPartyGstNumber } from '../hooks/useQueries';
import InvoicePrintView from '../components/InvoicePrintView';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';

export default function InvoicePrintPage() {
  const { id } = useParams({ from: '/invoice/$id/print' });
  const navigate = useNavigate();
  const { data: bill, isLoading, error } = useGetBill(id);
  const { data: partyGst = '' } = useGetPartyGstNumber(bill?.partyName ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary mr-2" size={24} />
        <span className="text-muted-foreground">Loading invoice...</span>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-semibold text-lg">Invoice not found.</p>
        <button onClick={() => navigate({ to: '/search' })} className="mt-4 text-primary hover:underline text-sm">
          ← Back to Search
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Print Controls - hidden on print */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <button
          onClick={() => navigate({ to: '/search' })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded-lg transition-colors shadow"
        >
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      <InvoicePrintView bill={bill} partyGstNumber={partyGst} />
    </div>
  );
}
