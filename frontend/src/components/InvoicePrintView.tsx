import React from 'react';
import type { Bill } from '../backend';
import { formatCurrency } from '../utils/formatCurrency';
import { useGetPartyGstNumber } from '../hooks/useQueries';

interface InvoicePrintViewProps {
  bill: Bill;
}

function formatBillDate(ns: bigint): string {
  if (!ns) return '—';
  const ms = Number(ns) / 1_000_000;
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function InvoicePrintView({ bill }: InvoicePrintViewProps) {
  const { data: gstNumber = '' } = useGetPartyGstNumber(bill.partyName);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-4 print:max-w-none font-sans">
      {/* Header */}
      <div className="border-2 border-navy-800 rounded-lg overflow-hidden mb-6 print:rounded-none">
        {/* Company Header */}
        <div className="bg-navy-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/assets/generated/mi-logo.dim_128x128.png" alt="MI Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold tracking-wide">MANISH INFRATECH</h1>
              <p className="text-saffron-300 text-sm">Infrastructure & Construction Services</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-saffron-300 text-xs uppercase tracking-widest">Tax Invoice</p>
            <p className="text-white font-bold text-lg">{bill.invoiceNumber}</p>
            <p className="text-saffron-200 text-sm">{formatBillDate(bill.billDate)}</p>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="px-6 py-4 bg-navy-50 border-b border-navy-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-navy-500 uppercase tracking-wider font-semibold mb-1">Bill To</p>
              <p className="text-navy-900 font-bold text-lg">{bill.partyName}</p>
              {gstNumber && (
                <p className="text-navy-600 text-sm mt-0.5">
                  <span className="font-semibold">GST No:</span> {gstNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-navy-500 uppercase tracking-wider font-semibold mb-1">Invoice Date</p>
              <p className="text-navy-800 font-semibold">{formatBillDate(bill.billDate)}</p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-navy-800">
                <th className="text-left py-2 text-navy-700 font-semibold w-10">Sr.</th>
                <th className="text-left py-2 text-navy-700 font-semibold w-24">HSN Code</th>
                <th className="text-left py-2 text-navy-700 font-semibold">Product / Service</th>
                <th className="text-right py-2 text-navy-700 font-semibold w-16">Qty</th>
                <th className="text-right py-2 text-navy-700 font-semibold w-16">Unit</th>
                <th className="text-right py-2 text-navy-700 font-semibold w-24">Rate (₹)</th>
                <th className="text-right py-2 text-navy-700 font-semibold w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems.map((item, idx) => (
                <tr key={idx} className={`border-b border-navy-100 ${idx % 2 === 0 ? '' : 'bg-navy-50'}`}>
                  <td className="py-2 text-navy-600">{Number(item.srNo)}</td>
                  <td className="py-2 text-navy-600">{item.hsnCode || '—'}</td>
                  <td className="py-2 text-navy-800 font-medium">{item.productName}</td>
                  <td className="py-2 text-right text-navy-700">{item.quantity}</td>
                  <td className="py-2 text-right text-navy-600">{item.unit}</td>
                  <td className="py-2 text-right text-navy-700">{formatCurrency(item.rate)}</td>
                  <td className="py-2 text-right font-semibold text-navy-800">{formatCurrency(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Summary */}
        <div className="px-6 py-4 bg-navy-50 border-t border-navy-200">
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5">
              <div className="flex justify-between text-sm text-navy-700">
                <span>Base Amount</span>
                <span className="font-medium">{formatCurrency(bill.baseAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-navy-600">
                <span>CGST @ 9%</span>
                <span>{formatCurrency(bill.cgst)}</span>
              </div>
              <div className="flex justify-between text-sm text-navy-600">
                <span>SGST @ 9%</span>
                <span>{formatCurrency(bill.sgst)}</span>
              </div>
              {Math.abs(bill.roundOff) > 0.001 && (
                <div className="flex justify-between text-xs text-navy-500">
                  <span>Round-off</span>
                  <span>{bill.roundOff > 0 ? '+' : ''}{bill.roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-navy-900 border-t-2 border-navy-800 pt-2 text-base">
                <span>Total Amount</span>
                <span className="text-saffron-600">{formatCurrency(bill.finalAmount)}</span>
              </div>
              {bill.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Amount Paid</span>
                    <span className="font-medium">{formatCurrency(bill.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-red-600">
                    <span>Pending Amount</span>
                    <span>{formatCurrency(bill.pendingAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-navy-400 mt-4 print:mt-2">
        <p>This is a computer-generated invoice. No signature required.</p>
        <p className="mt-1">Manish Infratech — Infrastructure & Construction Services</p>
      </div>
    </div>
  );
}
