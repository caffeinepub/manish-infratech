import { useState } from 'react';
import { useAddBill } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatAmount } from '../utils/formatCurrency';
import { Loader2, CheckCircle2, AlertCircle, Calculator, Receipt, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LineItem } from '../backend';

const MAX_ROWS = 10;
const GST_RATE = 0.18;

interface LineItemRow {
  id: number;
  hsnCode: string;
  productName: string;
  amountStr: string;
}

function computeItemGst(amount: number): number {
  return amount * GST_RATE;
}

let rowIdCounter = 1;

function createEmptyRow(): LineItemRow {
  return { id: rowIdCounter++, hsnCode: '', productName: '', amountStr: '' };
}

export default function AddBillForm() {
  const [partyName, setPartyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [rows, setRows] = useState<LineItemRow[]>([createEmptyRow()]);
  const [savedBill, setSavedBill] = useState<{ invoiceNumber: string; finalAmount: number } | null>(null);

  const { mutate: addBill, isPending, error } = useAddBill();

  // ── Derived totals ──────────────────────────────────────────────────────────
  const parsedAmounts = rows.map((r) => {
    const v = parseFloat(r.amountStr);
    return isNaN(v) || v < 0 ? 0 : v;
  });
  const baseAmount = parsedAmounts.reduce((s, v) => s + v, 0);
  const totalGst = baseAmount * GST_RATE;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const rawTotal = baseAmount + totalGst;
  const finalAmount = Math.round(rawTotal);
  const roundOff = finalAmount - rawTotal;
  const hasBreakdown = baseAmount > 0;

  // ── Row management ──────────────────────────────────────────────────────────
  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const updateRow = (id: number, field: keyof Omit<LineItemRow, 'id'>, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || !invoiceNumber.trim()) return;

    // Validate at least one row has a valid amount
    const validRows = rows.filter((r) => {
      const v = parseFloat(r.amountStr);
      return !isNaN(v) && v > 0;
    });
    if (validRows.length === 0) {
      toast.error('Please enter at least one item with a valid amount.');
      return;
    }

    const lineItems: LineItem[] = rows
      .filter((r) => {
        const v = parseFloat(r.amountStr);
        return !isNaN(v) && v > 0;
      })
      .map((r, idx) => {
        const amount = parseFloat(r.amountStr);
        return {
          srNo: BigInt(idx + 1),
          hsnCode: r.hsnCode.trim(),
          productName: r.productName.trim(),
          amount,
          itemGst: computeItemGst(amount),
        };
      });

    addBill(
      { partyName: partyName.trim(), invoiceNumber: invoiceNumber.trim(), lineItems },
      {
        onSuccess: (bill) => {
          setSavedBill({ invoiceNumber: bill.invoiceNumber, finalAmount: bill.finalAmount });
          toast.success(`Bill saved! Final amount: ${formatAmount(bill.finalAmount)}`);
          setPartyName('');
          setInvoiceNumber('');
          setRows([createEmptyRow()]);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Failed to save bill';
          toast.error(msg.includes('already exists') ? 'Invoice number already exists' : msg);
        },
      }
    );
  };

  const errorMsg = error instanceof Error ? error.message : null;

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-navy">
            <Receipt className="w-5 h-5 text-saffron" />
            New Bill Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Party & Invoice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="partyName" className="text-foreground font-medium">
                  Party Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="partyName"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Sharma Constructions"
                  required
                  className="border-border focus-visible:ring-saffron/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-foreground font-medium">
                  Invoice Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2024-001"
                  required
                  className="border-border focus-visible:ring-saffron/50"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-semibold text-base">
                  Items <span className="text-destructive">*</span>
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    ({rows.length}/{MAX_ROWS} rows)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  disabled={rows.length >= MAX_ROWS}
                  className="border-navy/30 text-navy hover:bg-navy/5 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </Button>
              </div>

              {/* Table wrapper with horizontal scroll on small screens */}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-navy text-white">
                      <th className="px-3 py-2.5 text-center font-semibold w-12">Sr.</th>
                      <th className="px-3 py-2.5 text-left font-semibold w-28">HSN Code</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Product Name</th>
                      <th className="px-3 py-2.5 text-right font-semibold w-36">Amount (₹)</th>
                      <th className="px-3 py-2.5 text-right font-semibold w-32">GST 18% (₹)</th>
                      <th className="px-3 py-2.5 text-center font-semibold w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const amt = parseFloat(row.amountStr);
                      const itemAmt = isNaN(amt) || amt < 0 ? 0 : amt;
                      const itemGst = computeItemGst(itemAmt);
                      return (
                        <tr
                          key={row.id}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-navy/[0.03]'}
                        >
                          <td className="px-3 py-2 text-center text-muted-foreground font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.hsnCode}
                              onChange={(e) => updateRow(row.id, 'hsnCode', e.target.value)}
                              placeholder="e.g. 9954"
                              className="h-8 text-xs border-border/60 focus-visible:ring-saffron/40"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.productName}
                              onChange={(e) => updateRow(row.id, 'productName', e.target.value)}
                              placeholder="Product / Service name"
                              className="h-8 text-xs border-border/60 focus-visible:ring-saffron/40"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              value={row.amountStr}
                              onChange={(e) => updateRow(row.id, 'amountStr', e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="h-8 text-xs text-right border-border/60 focus-visible:ring-saffron/40"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground font-medium text-xs">
                            {itemAmt > 0 ? formatAmount(itemGst) : '—'}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              disabled={rows.length === 1}
                              className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors p-1 rounded"
                              title="Remove row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals row */}
                  <tfoot>
                    <tr className="bg-navy/5 border-t-2 border-navy/20 font-semibold text-sm">
                      <td colSpan={3} className="px-3 py-2.5 text-right text-navy">
                        Total
                      </td>
                      <td className="px-3 py-2.5 text-right text-navy">
                        {formatAmount(baseAmount)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-navy">
                        {formatAmount(totalGst)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Live GST Breakdown */}
            {hasBreakdown && (
              <div className="bg-navy/5 border border-navy/10 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-saffron" />
                  <span className="text-sm font-semibold text-navy">GST Calculation Breakdown</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium">{formatAmount(baseAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST @ 9%</span>
                    <span className="font-medium text-navy">{formatAmount(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST @ 9%</span>
                    <span className="font-medium text-navy">{formatAmount(sgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total GST (18%)</span>
                    <span className="font-medium text-navy">{formatAmount(totalGst)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sub Total</span>
                    <span className="font-medium">{formatAmount(rawTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Round Off</span>
                    <span className={`font-medium ${roundOff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {roundOff >= 0 ? '+' : ''}{formatAmount(roundOff)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-navy">Final Amount</span>
                    <span className="text-saffron text-lg">{formatAmount(finalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg.includes('already exists') ? 'Invoice number already exists' : errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending || !partyName.trim() || !invoiceNumber.trim()}
              className="w-full bg-navy hover:bg-navy-dark text-white font-semibold rounded-xl py-3"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Bill...
                </>
              ) : (
                'Save Bill'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Banner */}
      {savedBill && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">Bill saved successfully!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Invoice <span className="font-mono font-bold">{savedBill.invoiceNumber}</span> — Final Amount:{' '}
              <span className="font-bold">{formatAmount(savedBill.finalAmount)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
