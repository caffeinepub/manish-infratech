import React, { useState, useEffect } from 'react';
import { useEditBill, useGetUniquePartyNames, useGetUniqueProductNames, useGetPartyProfile } from '../hooks/useQueries';
import AutocompleteInput from './AutocompleteInput';
import type { Bill, LineItem } from '../backend';

interface LineItemRow {
  srNo: number;
  hsnCode: string;
  productName: string;
  quantity: string;
  unit: string;
  rate: string;
  totalAmount: number;
}

interface EditBillModalProps {
  bill: Bill;
  onClose: () => void;
}

export default function EditBillModal({ bill, onClose }: EditBillModalProps) {
  const editBillMutation = useEditBill();
  const { data: partyNames = [] } = useGetUniquePartyNames();
  const { data: productNames = [] } = useGetUniqueProductNames();

  const [partyName, setPartyName] = useState(bill.partyName);
  const [partyGstNo, setPartyGstNo] = useState(bill.partyGstNo ?? '');
  const [partyAddress, setPartyAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(bill.invoiceNumber);
  const [billDate, setBillDate] = useState(() => {
    const ms = Number(bill.billDate) / 1_000_000;
    return new Date(ms).toISOString().split('T')[0];
  });
  const [amountPaid, setAmountPaid] = useState(String(bill.amountPaid));
  const [siteAddress, setSiteAddress] = useState(bill.siteAddress);
  const [lineItems, setLineItems] = useState<LineItemRow[]>(() =>
    bill.lineItems.map(item => ({
      srNo: Number(item.srNo),
      hsnCode: item.hsnCode,
      productName: item.productName,
      quantity: String(item.quantity),
      unit: item.unit,
      rate: String(item.rate),
      totalAmount: item.totalAmount,
    }))
  );
  const [error, setError] = useState('');
  const [selectedPartyForProfile, setSelectedPartyForProfile] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  const { data: partyProfile } = useGetPartyProfile(selectedPartyForProfile);

  // Load initial party address from profile on mount
  useEffect(() => {
    if (!profileLoaded) {
      setSelectedPartyForProfile(bill.partyName);
      setProfileLoaded(true);
    }
  }, [bill.partyName, profileLoaded]);

  // Auto-fill address when party profile loads (initial load or party change)
  useEffect(() => {
    if (partyProfile && selectedPartyForProfile) {
      // Only auto-fill address (GST is already from bill data on initial load)
      if (selectedPartyForProfile !== bill.partyName || partyAddress === '') {
        setPartyAddress(partyProfile.address || '');
      }
      // If party changed (not initial load), also update GST
      if (selectedPartyForProfile !== bill.partyName) {
        setPartyGstNo(partyProfile.gstNumber || '');
      }
    }
  }, [partyProfile, selectedPartyForProfile]);

  const handlePartySelect = (name: string) => {
    setPartyName(name);
    if (partyNames.includes(name)) {
      setSelectedPartyForProfile(name);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItemRow, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(field === 'quantity' ? (value as string) : updated[index].quantity) || 0;
        const rate = parseFloat(field === 'rate' ? (value as string) : updated[index].rate) || 0;
        updated[index].totalAmount = parseFloat((qty * rate).toFixed(2));
      }
      return updated;
    });
  };

  const addLineItem = () => {
    if (lineItems.length >= 15) return;
    setLineItems(prev => [...prev, {
      srNo: prev.length + 1,
      hsnCode: '',
      productName: '',
      quantity: '',
      unit: 'MT',
      rate: '',
      totalAmount: 0,
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, srNo: i + 1 })));
  };

  const baseAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalGst = baseAmount * 0.18;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const finalAmountRaw = baseAmount + totalGst;
  const finalAmount = Math.round(finalAmountRaw);
  const roundOff = finalAmount - finalAmountRaw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!partyName.trim()) { setError('Party name is required'); return; }
    if (!invoiceNumber.trim()) { setError('Invoice number is required'); return; }
    if (lineItems.some(item => !item.productName.trim())) { setError('All line items must have a product name'); return; }

    const dateMs = new Date(billDate).getTime();
    const billDateNs = BigInt(dateMs) * BigInt(1_000_000);

    const backendLineItems: LineItem[] = lineItems.map(item => ({
      srNo: BigInt(item.srNo),
      hsnCode: item.hsnCode,
      productName: item.productName,
      quantity: parseFloat(item.quantity) || 0,
      unit: item.unit,
      rate: parseFloat(item.rate) || 0,
      totalAmount: item.totalAmount,
    }));

    try {
      await editBillMutation.mutateAsync({
        invoiceNumber: bill.invoiceNumber,
        updatedBillOp: {
          partyName: partyName.trim(),
          partyGstNo: partyGstNo.trim() || undefined,
          invoiceNumber: invoiceNumber.trim(),
          billDate: billDateNs,
          lineItems: backendLineItems,
          amountPaid: parseFloat(amountPaid) || 0,
          siteAddress: siteAddress.trim(),
        },
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update bill');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-brand-red px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white">Edit Bill — {bill.invoiceNumber}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Party / Bill To Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
              Bill To / Party Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party Name <span className="text-red-500">*</span>
                </label>
                <AutocompleteInput
                  value={partyName}
                  onChange={(val) => {
                    setPartyName(val);
                    if (!partyNames.includes(val)) {
                      setSelectedPartyForProfile('');
                    }
                  }}
                  onSelect={handlePartySelect}
                  suggestions={partyNames}
                  placeholder="Enter party name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party GST Number
                </label>
                <input
                  type="text"
                  value={partyGstNo}
                  onChange={e => setPartyGstNo(e.target.value)}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party Address
                </label>
                <textarea
                  value={partyAddress}
                  onChange={e => setPartyAddress(e.target.value)}
                  placeholder="Enter party's address"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={e => setBillDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Address</label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={e => setSiteAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
              Line Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-red text-white">
                    <th className="px-2 py-2 text-left w-10">Sr.</th>
                    <th className="px-2 py-2 text-left w-24">HSN Code</th>
                    <th className="px-2 py-2 text-left">Product Name</th>
                    <th className="px-2 py-2 text-left w-20">Qty</th>
                    <th className="px-2 py-2 text-left w-20">Unit</th>
                    <th className="px-2 py-2 text-left w-24">Rate (₹)</th>
                    <th className="px-2 py-2 text-left w-28">Amount (₹)</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-2 py-1 text-gray-700">{item.srNo}</td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={e => updateLineItem(index, 'hsnCode', e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <AutocompleteInput
                          value={item.productName}
                          onChange={val => updateLineItem(index, 'productName', val)}
                          onSelect={val => updateLineItem(index, 'productName', val)}
                          suggestions={productNames}
                          placeholder="Product name"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLineItem(index, 'quantity', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={item.unit}
                          onChange={e => updateLineItem(index, 'unit', e.target.value)}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                        >
                          <option>MT</option>
                          <option>KG</option>
                          <option>PCS</option>
                          <option>NOS</option>
                          <option>RMT</option>
                          <option>SQM</option>
                          <option>CUM</option>
                          <option>LTR</option>
                          <option>SET</option>
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={e => updateLineItem(index, 'rate', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                        />
                      </td>
                      <td className="px-2 py-1 text-gray-700 font-medium">
                        ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              disabled={lineItems.length >= 15}
              className="mt-3 text-sm text-brand-red hover:text-red-700 font-medium disabled:opacity-40"
            >
              + Add Line Item
            </button>
          </div>

          {/* GST Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
              GST Summary
            </h3>
            <div className="max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Base Amount:</span>
                <span className="font-medium">₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>CGST (9%):</span>
                <span className="font-medium">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>SGST (9%):</span>
                <span className="font-medium">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Total GST (18%):</span>
                <span className="font-medium">₹{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {Math.abs(roundOff) > 0.001 && (
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Round Off:</span>
                  <span>{roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-bold text-base border-t border-gray-200 pt-2">
                <span>Final Amount:</span>
                <span>₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editBillMutation.isPending}
              className="px-6 py-2 bg-brand-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {editBillMutation.isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 12h-4z" />
                </svg>
              )}
              {editBillMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
