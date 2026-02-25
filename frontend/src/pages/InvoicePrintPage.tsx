import { useParams } from '@tanstack/react-router';
import { useGetBill } from '../hooks/useQueries';
import InvoicePrintView from '../components/InvoicePrintView';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function InvoicePrintPage() {
  const { invoiceNumber } = useParams({ from: '/invoice/$invoiceNumber/print' });
  const { data: bill, isLoading, error } = useGetBill(invoiceNumber);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="font-semibold text-foreground">Invoice not found</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Invoice <span className="font-mono">{invoiceNumber}</span> could not be loaded.
          </p>
          <Link to="/search">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Controls - hidden on print */}
      <div className="no-print bg-navy text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/search">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <span className="text-white/60 text-sm">|</span>
          <span className="text-sm font-medium">Invoice: {invoiceNumber}</span>
        </div>
        <Button
          onClick={() => window.print()}
          className="bg-saffron hover:bg-saffron-light text-white font-semibold gap-2"
          size="sm"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <div className="py-8 px-4">
        <InvoicePrintView bill={bill} />
      </div>
    </div>
  );
}
