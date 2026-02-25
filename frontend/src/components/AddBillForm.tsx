import React, { useState, useCallback } from 'react';
import { useAddBill, useGetUniquePartyNames, useGetUniqueProductNames } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import AutocompleteInput from './AutocompleteInput';
import { formatINR } from '../utils/formatCurrency';
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle, WifiOff } from 'lucide-react';
import type { LineItem } from '../backend';

interface LineItemRow {
  srNo: number;
  hsnCode: string;
  productName: string;
  quantity: string;
  unit: string;
  rate: string;
  totalAmount: number;
}

function emptyRow(srNo: number): LineItemRow {
  return { srNo, hsnCode: '', productName: '', quantity: '', unit: '', rate: '', totalAmount: 0 };
}

export default function AddBillForm() {
  const { actor, isFetching: actorFetching } = useActor();
  const addBill = useAddBill();
  const { data: partyNames = [] } = useGetUniquePartyNames();
  const { data: productNames = [] } = useGetUniqueProductNames();

  const [partyName, setPartyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState('');
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow(1)]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const actorReady = !!actor && !actorFetching;

  // Computed totals
  const baseAmount = lineItems.reduce((s, r) => s + r.totalAmount, 0);
  const totalGst = baseAmount * 0.18;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const finalAmountRaw = baseAmount + totalGst;
  const roundOff = Math.round(finalAmountRaw) - finalAmountRaw;
  const finalAmount = Math.round(finalAmountRaw);

  const updateRow = useCallback((idx: number, field: keyof LineItemRow, value: string) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(field === 'quantity' ? value : row.quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : row.rate) || 0;
        row.totalAmount = parseFloat((qty * rate).toFixed(2));
      }
      updated[idx] = row;
      return updated;
    });
  }, []);

  const addRow = () => {
    if (lineItems.length >= 15) return;
    setLineItems((prev) => [...prev, emptyRow(prev.length + 1)]);
  };

  const removeRow = (idx: number) => {
    setLineItems((prev) => {
      const updated = prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, srNo: i + 1 }));
      return updated.length === 0 ? [emptyRow(1)] : updated;
    });
  };

  const resetForm = () => {
    setPartyName('');
    setInvoiceNumber('');
    setBillDate(new Date().toISOString().split('T')[0]);
    setAmountPaid('');
    setLineItems([emptyRow(1)]);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!actorReady) {
      setErrorMsg('Unable to connect to server. Please refresh the page and try again.');
      return;
    }
    if (!partyName.trim()) { setErrorMsg('Party name is required.'); return; }
    if (!invoiceNumber.trim()) { setErrorMsg('Invoice number is required.'); return; }
    if (!billDate) { setErrorMsg('Bill date is required.'); return; }

    const validItems = lineItems.filter((r) => r.productName.trim() && r.totalAmount > 0);
    if (validItems.length === 0) {
      setErrorMsg('At least one line item with a product name and amount is required.');
      return;
    }

    const billDateNano = BigInt(new Date(billDate).getTime()) * 1_000_000n;
    const paidAmount = parseFloat(amountPaid) || 0;

    const items: LineItem[] = validItems.map((r) => ({
      srNo: BigInt(r.srNo),
      hsnCode: r.hsnCode,
      productName: r.productName,
      quantity: parseFloat(r.quantity) || 0,
      unit: r.unit,
      rate: parseFloat(r.rate) || 0,
      totalAmount: r.totalAmount,
    }));

    try {
      await addBill.mutateAsync({
        partyName: partyName.trim(),
        invoiceNumber: invoiceNumber.trim(),
        billDate: billDateNano,
        lineItems: items,
        amountPaid: paidAmount,
      });
      setSuccessMsg(`Bill ${invoiceNumber.trim()} saved successfully!`);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.includes('already exists') ? `Invoice number "${invoiceNumber}" already exists. Please use a unique invoice number.` : msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Actor not ready warning */}
      {!actorReady && !actorFetching && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 flex items-center gap-2 text-sm text-destructive">
          <WifiOff className="w-4 h-4 shrink-0" />
          Unable to connect to server. Please refresh the page and try again.
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="p-3 rounded-lg border border-green-300 bg-green-50 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Bill details */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-4">Bill Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Party Name *</label>
            <AutocompleteInput
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              onValueChange={setPartyName}
              suggestions={partyNames}
              placeholder="Enter party name"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Invoice Number *</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-001"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Bill Date *</label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Amount Paid (₹)</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Line Items</h2>
          <span className="text-xs text-muted-foreground">{lineItems.length}/15 items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a2744] text-white">
                <th className="px-2 py-2 text-center font-semibold w-10">Sr.</th>
                <th className="px-2 py-2 text-left font-semibold w-24">HSN Code</th>
                <th className="px-2 py-2 text-left font-semibold min-w-[160px]">Product Name</th>
                <th className="px-2 py-2 text-right font-semibold w-20">Qty</th>
                <th className="px-2 py-2 text-left font-semibold w-20">Unit</th>
                <th className="px-2 py-2 text-right font-semibold w-24">Rate ₹</th>
                <th className="px-2 py-2 text-right font-semibold w-28">Amount ₹</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                  <td className="px-2 py-1.5 text-center text-muted-foreground">{row.srNo}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.hsnCode}
                      onChange={(e) => updateRow(idx, 'hsnCode', e.target.value)}
                      placeholder="HSN"
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AutocompleteInput
                      value={row.productName}
                      onChange={(e) => updateRow(idx, 'productName', e.target.value)}
                      onValueChange={(v) => updateRow(idx, 'productName', v)}
                      suggestions={productNames}
                      placeholder="Product name"
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="any"
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                      placeholder="e.g. Nos"
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={row.rate}
                      onChange={(e) => updateRow(idx, 'rate', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="any"
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-foreground">
                    {row.totalAmount > 0 ? formatINR(row.totalAmount) : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive transition"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lineItems.length < 15 && (
          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        )}
      </div>

      {/* GST Summary */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-4">GST Summary</h2>
        <div className="max-w-xs ml-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Amount</span>
            <span className="font-medium text-foreground">{formatINR(baseAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CGST (9%)</span>
            <span className="font-medium text-foreground">{formatINR(cgst)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SGST (9%)</span>
            <span className="font-medium text-foreground">{formatINR(sgst)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Round Off</span>
            <span className="font-medium text-foreground">{roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Final Amount</span>
            <span className="font-bold text-primary text-base">{formatINR(finalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium text-green-600">{formatINR(parseFloat(amountPaid) || 0)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">Pending Amount</span>
            <span className={`font-semibold ${finalAmount - (parseFloat(amountPaid) || 0) > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {formatINR(Math.max(0, finalAmount - (parseFloat(amountPaid) || 0)))}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!actorReady || addBill.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addBill.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : actorFetching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting…
            </>
          ) : !actorReady ? (
            <>
              <WifiOff className="w-4 h-4" />
              Not Connected
            </>
          ) : (
            'Save Bill'
          )}
        </button>
      </div>
    </form>
  );
}
