import { Link } from '@tanstack/react-router';
import type { Bill } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatAmount } from '../utils/formatCurrency';
import { Printer, FileText } from 'lucide-react';

interface BillResultsTableProps {
  bills: Bill[];
  isLoading?: boolean;
}

export default function BillResultsTable({ bills, isLoading }: BillResultsTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No results found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-navy/5 hover:bg-navy/5">
            <TableHead className="font-semibold text-navy">Invoice No.</TableHead>
            <TableHead className="font-semibold text-navy">Party Name</TableHead>
            <TableHead className="font-semibold text-navy text-right">Base Amount</TableHead>
            <TableHead className="font-semibold text-navy text-right">CGST (9%)</TableHead>
            <TableHead className="font-semibold text-navy text-right">SGST (9%)</TableHead>
            <TableHead className="font-semibold text-navy text-right">Final Amount</TableHead>
            <TableHead className="font-semibold text-navy text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill, idx) => (
            <TableRow
              key={bill.invoiceNumber}
              className={idx % 2 === 0 ? 'bg-background' : 'bg-navy/[0.02]'}
            >
              <TableCell className="font-mono text-sm font-medium text-navy">
                {bill.invoiceNumber}
              </TableCell>
              <TableCell className="font-medium">{bill.partyName}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatAmount(bill.baseAmount)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatAmount(bill.cgst)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatAmount(bill.sgst)}
              </TableCell>
              <TableCell className="text-right font-bold text-saffron">
                {formatAmount(bill.finalAmount)}
              </TableCell>
              <TableCell className="text-center">
                <Link to="/invoice/$invoiceNumber/print" params={{ invoiceNumber: bill.invoiceNumber }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-navy/20 text-navy hover:bg-navy hover:text-white transition-all gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
