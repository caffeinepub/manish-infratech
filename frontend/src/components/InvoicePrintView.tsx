import React from 'react';
import type { Bill, CompanySettings, PartyProfile } from '../backend';

interface InvoicePrintViewProps {
  bill: Bill;
  companySettings?: CompanySettings | null;
  partyGstNo?: string;
  partyAddress?: string;
  partyProfile?: PartyProfile | null;
}

export default function InvoicePrintView({
  bill,
  companySettings,
  partyGstNo: partyGstNoProp,
  partyAddress: partyAddressProp,
  partyProfile,
}: InvoicePrintViewProps) {
  const billDate = new Date(Number(bill.billDate) / 1_000_000);
  const formattedDate = billDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Resolve GST number: prop > bill field > party profile
  const resolvedGstNo =
    partyGstNoProp ||
    bill.partyGstNo ||
    partyProfile?.gstNumber ||
    '';

  // Resolve party address: prop > party profile
  const resolvedAddress =
    partyAddressProp ||
    partyProfile?.address ||
    '';

  return (
    <div className="invoice-print bg-white text-gray-900 p-8 max-w-4xl mx-auto font-sans text-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-brand-red">
        <div className="flex items-center gap-4">
          <img
            src="/assets/generated/manish-infratech-logo.dim_320x80.png"
            alt="Manish Infratech"
            className="h-16 object-contain"
          />
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">TAX INVOICE</div>
          <div className="text-lg font-bold text-brand-red mt-1">#{bill.invoiceNumber}</div>
          <div className="text-xs text-gray-600 mt-1">Date: {formattedDate}</div>
          {companySettings?.gstin && (
            <div className="text-xs text-gray-600 mt-1">GSTIN: {companySettings.gstin}</div>
          )}
        </div>
      </div>

      {/* Company & Bill To */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* From (Seller) */}
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs font-bold text-brand-red uppercase tracking-wide mb-2">From</div>
          <div className="font-bold text-gray-900 text-base">Manish Infratech</div>
          {companySettings?.companyAddress && (
            <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{companySettings.companyAddress}</div>
          )}
          {companySettings?.gstin && (
            <div className="text-xs text-gray-600 mt-1">GSTIN: {companySettings.gstin}</div>
          )}
          {companySettings?.panNumber && (
            <div className="text-xs text-gray-600">PAN: {companySettings.panNumber}</div>
          )}
        </div>

        {/* Bill To (Buyer) */}
        <div className="bg-red-50 rounded p-3">
          <div className="text-xs font-bold text-brand-red uppercase tracking-wide mb-2">Bill To</div>
          <div className="font-bold text-gray-900 text-base">{bill.partyName}</div>
          {resolvedGstNo && (
            <div className="text-xs text-gray-600 mt-1">GST No.: {resolvedGstNo}</div>
          )}
          {resolvedAddress && (
            <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{resolvedAddress}</div>
          )}
          {bill.siteAddress && (
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-medium">Site:</span> {bill.siteAddress}
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full border-collapse mb-6 text-xs">
        <thead>
          <tr className="bg-brand-red text-white">
            <th className="border border-red-700 px-2 py-2 text-left w-8">Sr.</th>
            <th className="border border-red-700 px-2 py-2 text-left w-20">HSN Code</th>
            <th className="border border-red-700 px-2 py-2 text-left">Description</th>
            <th className="border border-red-700 px-2 py-2 text-right w-16">Qty</th>
            <th className="border border-red-700 px-2 py-2 text-left w-12">Unit</th>
            <th className="border border-red-700 px-2 py-2 text-right w-20">Rate (₹)</th>
            <th className="border border-red-700 px-2 py-2 text-right w-24">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.lineItems.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-700">{Number(item.srNo)}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-700">{item.hsnCode || '—'}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-800 font-medium">{item.productName}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right text-gray-700">{item.quantity}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-700">{item.unit}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right text-gray-700">
                {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="border border-gray-200 px-2 py-1.5 text-right text-gray-800 font-medium">
                {item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Base Amount:</span>
            <span>₹{bill.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>CGST (9%):</span>
            <span>₹{bill.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>SGST (9%):</span>
            <span>₹{bill.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total GST (18%):</span>
            <span>₹{bill.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {Math.abs(bill.roundOff) > 0.001 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Round Off:</span>
              <span>{bill.roundOff >= 0 ? '+' : ''}{bill.roundOff.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-300 pt-1 mt-1">
            <span>Total Amount:</span>
            <span>₹{bill.finalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-green-700">
            <span>Amount Paid:</span>
            <span>₹{bill.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-red-700 border-t border-gray-200 pt-1">
            <span>Pending Amount:</span>
            <span>₹{bill.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      {(companySettings?.bankName || companySettings?.accountNumber) && (
        <div className="border border-gray-200 rounded p-3 mb-4 bg-gray-50">
          <div className="text-xs font-bold text-brand-red uppercase tracking-wide mb-2">Bank Details</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
            {companySettings.bankName && (
              <div><span className="font-medium">Bank:</span> {companySettings.bankName}</div>
            )}
            {companySettings.accountNumber && (
              <div><span className="font-medium">A/C No:</span> {companySettings.accountNumber}</div>
            )}
            {companySettings.ifscCode && (
              <div><span className="font-medium">IFSC:</span> {companySettings.ifscCode}</div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
        <div className="text-xs text-gray-500">
          <div>Thank you for your business!</div>
          <div className="mt-1">This is a computer-generated invoice.</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-6">For Manish Infratech</div>
          <div className="border-t border-gray-400 pt-1 text-xs text-gray-600 w-36 text-center">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
