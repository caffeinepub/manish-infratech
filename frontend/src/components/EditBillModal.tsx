import React, { useState, useEffect } from 'react';
import { Bill, LineItem } from '../backend';
import { useEditBill, useGetUniqueProductNames } from '../hooks/useQueries';
import AutocompleteInput from './AutocompleteInput';
import { X, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';

interface LineItemForm {
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
  const [partyName, setPartyName] = useState(bill.partyName);
  const [invoiceNumber] = useState(bill.invoiceNumber);
  const [billDate, setBillDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const editBillMutation = useEditBill();
  const { data: productNames = [] } = useGetUniqueProductNames();

  useEffect(() => {
    // Convert nanoseconds to milliseconds for date input
    const dateMs = Number(bill.billDate / 1_000_000n);
    const date = new Date(dateMs);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setBillDate(`${yyyy}-${mm}-${dd}`);

    setLineItems(
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
  }, [bill]);

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      const qty = parseFloat(updated[index].quantity) || 0;
      const rate = parseFloat(updated[index].rate) || 0;
      updated[index].totalAmount = qty * rate;
      return updated;
    });
  };

  const addLineItem = () => {
    if (lineItems.length < 15) {
      setLineItems(prev => [
        ...prev,
        { srNo: prev.length + 1, hsnCode: '', productName: '', quantity: '', unit: '', rate: '', totalAmount: 0 },
      ]);
    }
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev =>
        prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, srNo: i + 1 }))
      );
    }
  };

  const baseAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalGst = baseAmount * 0.18;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const finalAmountRaw = baseAmount + totalGst;
  const roundOff = Math.round(finalAmountRaw) - finalAmountRaw;
  const finalAmount = Math.round(finalAmountRaw);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!partyName.trim()) { setErrorMessage('Party name is required.'); return; }
    if (!billDate) { setErrorMessage('Bill date is required.'); return; }

    const validItems = lineItems.filter(
      item => item.productName.trim() && parseFloat(item.quantity) > 0 && parseFloat(item.rate) > 0
    );
    if (validItems.length === 0) { setErrorMessage('At least one valid line item is required.'); return; }

    const billDateMs = new Date(billDate).getTime();
    const billDateNs = BigInt(billDateMs) * 1_000_000n;

    const backendLineItems: LineItem[] = validItems.map((item, idx) => ({
      srNo: BigInt(idx + 1),
      hsnCode: item.hsnCode.trim(),
      productName: item.productName.trim(),
      quantity: parseFloat(item.quantity),
      unit: item.unit.trim(),
      rate: parseFloat(item.rate),
      totalAmount: item.totalAmount,
    }));

    try {
      await editBillMutation.mutateAsync({
        invoiceNumber,
        billOp: {
          partyName: partyName.trim(),
          invoiceNumber,
          billDate: billDateNs,
          lineItems: backendLineItems,
        },
      });
      setSuccessMessage('✓ Bill updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update bill. Please try again.');
    }
  };

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '14px',
    color: '#1a1a2e',
    backgroundColor: '#ffffff',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e3a8a',
    marginBottom: '4px',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '900px',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Modal Header */}
        <div style={{ backgroundColor: '#1e3a8a', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px 12px 0 0' }}>
          <h2 style={{ color: '#ffffff', fontSize: '17px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
            Edit Bill — {invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Party Name *</label>
              <input
                type="text"
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
                placeholder="Party name"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                disabled
                style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Bill Date *</label>
              <input
                type="date"
                value={billDate}
                onChange={e => setBillDate(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
              />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ color: '#1e3a8a', fontSize: '15px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                Line Items
              </h3>
              <button
                type="button"
                onClick={addLineItem}
                disabled={lineItems.length >= 15}
                style={{
                  backgroundColor: lineItems.length >= 15 ? '#e2e8f0' : '#1e3a8a',
                  color: lineItems.length >= 15 ? '#94a3b8' : '#ffffff',
                  border: 'none', borderRadius: '6px', padding: '6px 12px',
                  fontSize: '13px', fontWeight: 600,
                  cursor: lineItems.length >= 15 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1.5px solid #bfdbfe' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e3a8a' }}>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'center', width: '50px' }}>Sr. No.</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'left', width: '110px' }}>HSN Code</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'left' }}>Product Name</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'center', width: '80px' }}>Qty</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'center', width: '80px' }}>Unit</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'right', width: '100px' }}>Rate (₹)</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'right', width: '110px' }}>Amount (₹)</th>
                    <th style={{ color: '#ffffff', padding: '10px 8px', fontSize: '12px', fontWeight: 700, textAlign: 'center', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eff6ff', borderBottom: '1px solid #dbeafe' }}>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#1e3a8a', fontWeight: 600, fontSize: '13px' }}>
                        {item.srNo}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={e => updateLineItem(index, 'hsnCode', e.target.value)}
                          placeholder="HSN Code"
                          style={{ ...inputStyle, padding: '5px 7px', fontSize: '13px' }}
                          onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <AutocompleteInput
                          suggestions={productNames}
                          value={item.productName}
                          onValueChange={val => updateLineItem(index, 'productName', val)}
                          onChange={e => updateLineItem(index, 'productName', e.target.value)}
                          placeholder="Product Name"
                          style={{ ...inputStyle, padding: '5px 7px', fontSize: '13px' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLineItem(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          min="0"
                          step="any"
                          style={{ ...inputStyle, padding: '5px 7px', fontSize: '13px', textAlign: 'center' }}
                          onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={e => updateLineItem(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          style={{ ...inputStyle, padding: '5px 7px', fontSize: '13px', textAlign: 'center' }}
                          onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={e => updateLineItem(index, 'rate', e.target.value)}
                          placeholder="Rate"
                          min="0"
                          step="any"
                          style={{ ...inputStyle, padding: '5px 7px', fontSize: '13px', textAlign: 'right' }}
                          onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#1a1a2e', fontWeight: 600, fontSize: '13px' }}>
                        {formatINR(item.totalAmount)}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          style={{
                            backgroundColor: 'transparent', border: 'none',
                            cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                            color: lineItems.length === 1 ? '#cbd5e1' : '#dc2626',
                            padding: '4px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GST Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '8px', padding: '14px' }}>
              <h4 style={{ color: '#1e3a8a', fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GST Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'Base Amount', value: formatINR(baseAmount) },
                  { label: 'CGST (9%)', value: formatINR(cgst) },
                  { label: 'SGST (9%)', value: formatINR(sgst) },
                  { label: 'Total GST (18%)', value: formatINR(totalGst) },
                  { label: 'Round Off', value: `${roundOff >= 0 ? '+' : ''}${roundOff.toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>{label}</span>
                    <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e3a8a', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '0 0 6px 0', fontWeight: 500 }}>
                Total Invoice Amount
              </p>
              <p style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                {formatINR(finalAmount)}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '4px 0 0 0' }}>
                Inclusive of 18% GST
              </p>
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '14px', fontWeight: 500 }}>
              ⚠ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#16a34a', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#16a34a" />
              {successMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff', color: '#1e3a8a',
                border: '1.5px solid #1e3a8a', borderRadius: '8px',
                padding: '10px 20px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editBillMutation.isPending}
              style={{
                backgroundColor: editBillMutation.isPending ? '#94a3b8' : '#1e3a8a',
                color: '#ffffff', border: 'none', borderRadius: '8px',
                padding: '10px 24px', fontSize: '14px', fontWeight: 700,
                cursor: editBillMutation.isPending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {editBillMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
