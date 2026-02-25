import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useDeleteBill } from '../hooks/useQueries';
import EditBillModal from './EditBillModal';
import type { Bill } from '../backend';
import { formatAmount } from '../utils/formatCurrency';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Printer, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

function formatBillDate(ns: bigint): string {
  if (!ns) return '—';
  const ms = Number(ns) / 1_000_000;
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface BillResultsTableProps {
  bills: Bill[];
  isLoading?: boolean;
  emptyMessage?: string;
  hideActions?: boolean;
}

export default function BillResultsTable({ bills, isLoading, emptyMessage, hideActions = false }: BillResultsTableProps) {
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);

  const { mutate: deleteBill, isPending: isDeleting } = useDeleteBill();

  const handleDelete = (invoiceNumber: string) => {
    setDeletingInvoice(invoiceNumber);
    deleteBill(invoiceNumber, {
      onSuccess: () => {
        toast.success(`Bill ${invoiceNumber} deleted successfully.`);
        setDeletingInvoice(null);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to delete bill';
        toast.error(msg);
        setDeletingInvoice(null);
      },
    });
  };

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
        <p className="text-muted-foreground font-medium">
          {emptyMessage ?? 'No results found'}
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-navy/5 hover:bg-navy/5">
              <TableHead className="font-semibold text-navy whitespace-nowrap">Invoice No.</TableHead>
              <TableHead className="font-semibold text-navy whitespace-nowrap">Bill Date</TableHead>
              <TableHead className="font-semibold text-navy whitespace-nowrap">Party Name</TableHead>
              <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Base Amount</TableHead>
              <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Final Amount</TableHead>
              <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Paid (₹)</TableHead>
              <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Pending (₹)</TableHead>
              {!hideActions && (
                <TableHead className="font-semibold text-navy text-center whitespace-nowrap">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill, idx) => (
              <TableRow
                key={bill.invoiceNumber}
                className={idx % 2 === 0 ? 'bg-background' : 'bg-navy/[0.02]'}
              >
                <TableCell className="font-mono text-sm font-medium text-navy whitespace-nowrap">
                  {bill.invoiceNumber}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatBillDate(bill.billDate)}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">{bill.partyName}</TableCell>
                <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                  {formatAmount(bill.baseAmount)}
                </TableCell>
                <TableCell className="text-right font-bold text-saffron whitespace-nowrap">
                  {formatAmount(bill.finalAmount)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-700 whitespace-nowrap">
                  {formatAmount(bill.amountPaid)}
                </TableCell>
                <TableCell className={`text-right font-semibold whitespace-nowrap ${bill.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {bill.pendingAmount > 0 ? formatAmount(bill.pendingAmount) : '✓ Paid'}
                </TableCell>
                {!hideActions && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to="/invoice/$invoiceNumber/print"
                        params={{ invoiceNumber: bill.invoiceNumber }}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy hover:bg-navy/10" title="Print Invoice">
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-saffron hover:bg-saffron/10"
                        title="Edit Bill"
                        onClick={() => setEditingBill(bill)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Delete Bill"
                            disabled={isDeleting && deletingInvoice === bill.invoiceNumber}
                          >
                            {isDeleting && deletingInvoice === bill.invoiceNumber ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice{' '}
                              <span className="font-mono font-bold">{bill.invoiceNumber}</span>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(bill.invoiceNumber)}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditBillModal
        bill={editingBill}
        open={!!editingBill}
        onClose={() => setEditingBill(null)}
      />
    </>
  );
}
