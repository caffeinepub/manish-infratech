import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEditBill, useGetPartyNames, useGetProductNames } from '../hooks/useQueries';
import type { Bill, LineItem } from '../backend';
import { formatCurrency } from '../utils/formatCurrency';
import AutocompleteInput from './AutocompleteInput';

const MAX_ROWS = 30;
const UNIT_OPTIONS = ['SQM', 'RMT', 'PCS', 'KG', 'MTR', 'NOS', 'SET', 'JOB'];

function nanosecondsToDateString(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().split('T')[0];
}

function dateToNanoseconds(dateStr: string): bigint {
  const ms = new Date(dateStr).getTime();
  return BigInt(ms) * BigInt(1_000_000);
}

interface RowData {
  hsnCode: string;
  productName: string;
  quantity: string;
  unit: string;
  rate: string;
}

interface EditBillModalProps {
  bill: Bill | null;
  open: boolean;
  onClose: () => void;
}

export default function EditBillModal({ bill, open, onClose }: EditBillModalProps) {
  const [partyName, setPartyName] = useState('');
  const [billDate, setBillDate] = useState('');
  const [rows, setRows] = useState<RowData[]>([]);
  const [error, setError] = useState('');

  const editBillMutation = useEditBill();
  const { data: partyNames = [] } = useGetPartyNames();
  const { data: productNames = [] } = useGetProductNames();

  useEffect(() => {
    if (bill) {
      setPartyName(bill.partyName);
      setBillDate(nanosecondsToDateString(bill.billDate));
      if (bill.lineItems.length > 0) {
        setRows(bill.lineItems.map(item => ({
          hsnCode: item.hsnCode,
          productName: item.productName,
          quantity: item.quantity.toString(),
          unit: item.unit,
          rate: item.rate.toString(),
        })));
      } else {
        setRows([{ hsnCode: '', productName: '', quantity: '', unit: 'SQM', rate: '' }]);
      }
      setError('');
    }
  }, [bill]);

  const updateRow = useCallback((idx: number, field: keyof RowData, value: string) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }, []);

  const addRow = () => {
    if (rows.length < MAX_ROWS) {
      setRows(prev => [...prev, { hsnCode: '', productName: '', quantity: '', unit: 'SQM', rate: '' }]);
    }
  };

  const removeRow = (idx: number) => {
    if (rows.length > 1) setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const getRowTotal = (row: RowData): number => {
    const qty = parseFloat(row.quantity) || 0;
    const rate = parseFloat(row.rate) || 0;
    return qty * rate;
  };

  const baseAmount = rows.reduce((sum, r) => sum + getRowTotal(r), 0);
  const totalGst = baseAmount * 0.18;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const finalAmountRaw = baseAmount + totalGst;
  const finalAmountRounded = Math.round(finalAmountRaw);
  const roundOff = finalAmountRounded - finalAmountRaw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill) return;
    setError('');

    if (!partyName.trim()) { setError('Party name is required.'); return; }
    if (!billDate) { setError('Bill date is required.'); return; }

    const validRows = rows.filter(r => r.productName.trim() || r.hsnCode.trim() || r.quantity || r.rate);
    if (validRows.length === 0) { setError('At least one line item is required.'); return; }

    try {
      const lineItems: LineItem[] = validRows.map((r, i) => ({
        srNo: BigInt(i + 1),
        hsnCode: r.hsnCode.trim(),
        productName: r.productName.trim(),
        quantity: parseFloat(r.quantity) || 0,
        unit: r.unit,
        rate: parseFloat(r.rate) || 0,
        totalAmount: getRowTotal(r),
      }));

      await editBillMutation.mutateAsync({
        invoiceNumber: bill.invoiceNumber,
        billOp: {
          partyName: partyName.trim(),
          invoiceNumber: bill.invoiceNumber,
          billDate: dateToNanoseconds(billDate),
          lineItems,
        },
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update bill.');
    }
  };

  const inputCls = 'w-full border border-navy-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-400 bg-white text-navy-900';

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy-800">Edit Bill — {bill?.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Party & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1">Party Name *</label>
              <AutocompleteInput
                value={partyName}
                onChange={setPartyName}
                suggestions={partyNames}
                placeholder="Enter party name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1">Bill Date *</label>
              <input
                type="date"
                value={billDate}
                onChange={e => setBillDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-navy-700">Line Items ({rows.length}/{MAX_ROWS})</h3>
              <button
                type="button"
                onClick={addRow}
                disabled={rows.length >= MAX_ROWS}
                className="text-xs bg-saffron-500 hover:bg-saffron-600 text-white px-3 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                + Add Row
              </button>
            </div>
            <div className="overflow-x-auto rounded border border-navy-200">
              <table className="w-full text-xs">
                <thead className="bg-navy-800 text-white">
                  <tr>
                    <th className="px-2 py-1.5 text-left w-8">#</th>
                    <th className="px-2 py-1.5 text-left w-20">HSN Code</th>
                    <th className="px-2 py-1.5 text-left min-w-[140px]">Product / Service</th>
                    <th className="px-2 py-1.5 text-left w-16">Qty</th>
                    <th className="px-2 py-1.5 text-left w-24">Unit</th>
                    <th className="px-2 py-1.5 text-left w-20">Rate (₹)</th>
                    <th className="px-2 py-1.5 text-right w-24">Amount (₹)</th>
                    <th className="px-2 py-1.5 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-navy-50'}>
                      <td className="px-2 py-1 text-navy-500">{idx + 1}</td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={row.hsnCode}
                          onChange={e => updateRow(idx, 'hsnCode', e.target.value)}
                          placeholder="HSN"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <AutocompleteInput
                          value={row.productName}
                          onChange={v => updateRow(idx, 'productName', v)}
                          suggestions={productNames}
                          placeholder="Product/Service"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={e => updateRow(idx, 'quantity', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="any"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={e => updateRow(idx, 'unit', e.target.value)}
                            className={`${inputCls} w-14`}
                          />
                          <select
                            value={UNIT_OPTIONS.includes(row.unit) ? row.unit : ''}
                            onChange={e => { if (e.target.value) updateRow(idx, 'unit', e.target.value); }}
                            className="border border-navy-200 rounded text-xs bg-white text-navy-700 px-1"
                          >
                            <option value="">▾</option>
                            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={e => updateRow(idx, 'rate', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="any"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-2 py-1 text-right font-medium text-navy-800">
                        {formatCurrency(getRowTotal(row))}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GST Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between text-navy-700">
                <span>Base Amount</span>
                <span className="font-medium">{formatCurrency(baseAmount)}</span>
              </div>
              <div className="flex justify-between text-navy-600">
                <span>CGST (9%)</span>
                <span>{formatCurrency(cgst)}</span>
              </div>
              <div className="flex justify-between text-navy-600">
                <span>SGST (9%)</span>
                <span>{formatCurrency(sgst)}</span>
              </div>
              {Math.abs(roundOff) > 0.001 && (
                <div className="flex justify-between text-navy-500 text-xs">
                  <span>Round-off</span>
                  <span>{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-navy-900 border-t border-navy-200 pt-1">
                <span>Final Amount</span>
                <span className="text-saffron-600">{formatCurrency(finalAmountRounded)}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-navy-300 rounded text-navy-700 hover:bg-navy-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editBillMutation.isPending}
              className="px-6 py-2 text-sm bg-navy-800 hover:bg-navy-900 text-white rounded font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {editBillMutation.isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {editBillMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
