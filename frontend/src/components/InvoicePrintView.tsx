import type { Bill } from '../backend';
import { formatAmount } from '../utils/formatCurrency';

interface InvoicePrintViewProps {
  bill: Bill;
}

export default function InvoicePrintView({ bill }: InvoicePrintViewProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const hasLineItems = bill.lineItems && bill.lineItems.length > 0;

  return (
    <div className="print-invoice bg-white text-gray-900 max-w-3xl mx-auto p-10 font-sans">
      {/* Header */}
      <div className="border-b-4 border-navy pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-navy tracking-wide">MANISH INFRATECH</h1>
            <p className="text-sm text-gray-500 mt-1">Infrastructure & Construction Services</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-saffron text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Tax Invoice
            </span>
            <p className="text-sm text-gray-500 mt-2">{today}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invoice Number</p>
          <p className="font-mono font-bold text-navy text-lg">{bill.invoiceNumber}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
          <p className="font-bold text-gray-800 text-lg">{bill.partyName}</p>
        </div>
      </div>

      {/* Line Items Table */}
      {hasLineItems && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Item Details</h2>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-navy text-white">
                <th className="px-3 py-2.5 text-center font-semibold w-10">Sr.</th>
                <th className="px-3 py-2.5 text-left font-semibold w-24">HSN Code</th>
                <th className="px-3 py-2.5 text-left font-semibold">Product Name</th>
                <th className="px-3 py-2.5 text-right font-semibold w-32">Amount (₹)</th>
                <th className="px-3 py-2.5 text-right font-semibold w-28">GST 18% (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-3 py-2.5 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">
                    {item.hsnCode || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-800 font-medium">
                    {item.productName || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-800">{formatAmount(item.amount)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{formatAmount(item.itemGst)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-navy/10 border-t-2 border-navy/20 font-semibold">
                <td colSpan={3} className="px-3 py-2.5 text-right text-navy text-sm">
                  Sub Total
                </td>
                <td className="px-3 py-2.5 text-right text-navy text-sm">
                  {formatAmount(bill.baseAmount)}
                </td>
                <td className="px-3 py-2.5 text-right text-navy text-sm">
                  {formatAmount(bill.totalGst)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Amount Breakdown Table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="bg-navy text-white">
            <th className="text-left px-4 py-3 rounded-tl-lg font-semibold">Description</th>
            <th className="text-right px-4 py-3 rounded-tr-lg font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="px-4 py-3 text-gray-700">Base Amount (Services)</td>
            <td className="px-4 py-3 text-right font-medium">{formatAmount(bill.baseAmount)}</td>
          </tr>
          <tr className="border-b border-gray-100 bg-gray-50">
            <td className="px-4 py-3 text-gray-700">CGST @ 9%</td>
            <td className="px-4 py-3 text-right font-medium">{formatAmount(bill.cgst)}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="px-4 py-3 text-gray-700">SGST @ 9%</td>
            <td className="px-4 py-3 text-right font-medium">{formatAmount(bill.sgst)}</td>
          </tr>
          <tr className="border-b border-gray-100 bg-gray-50">
            <td className="px-4 py-3 text-gray-500 text-xs">Sub Total (incl. GST)</td>
            <td className="px-4 py-3 text-right text-gray-500 text-xs">
              {formatAmount(bill.baseAmount + bill.totalGst)}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="px-4 py-3 text-gray-500 text-xs">Round Off</td>
            <td className="px-4 py-3 text-right text-gray-500 text-xs">
              {bill.roundOff >= 0 ? '+' : ''}{formatAmount(bill.roundOff)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-navy text-white">
            <td className="px-4 py-4 rounded-bl-lg font-bold text-base">TOTAL AMOUNT</td>
            <td className="px-4 py-4 rounded-br-lg text-right font-bold text-xl">{formatAmount(bill.finalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      {/* GST Summary */}
      <div className="bg-saffron/10 border border-saffron/20 rounded-lg p-4 mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">GST Summary</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total GST</p>
            <p className="font-bold text-navy">{formatAmount(bill.totalGst)}</p>
          </div>
          <div>
            <p className="text-gray-500">CGST (9%)</p>
            <p className="font-bold text-navy">{formatAmount(bill.cgst)}</p>
          </div>
          <div>
            <p className="text-gray-500">SGST (9%)</p>
            <p className="font-bold text-navy">{formatAmount(bill.sgst)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-center">
        <p className="text-xs text-gray-400">
          This is a computer-generated invoice. No signature required.
        </p>
        <p className="text-xs text-gray-400 mt-1">MANISH INFRATECH — Thank you for your business!</p>
      </div>
    </div>
  );
}
