import React from 'react';
import type { Bill } from '../backend';
import { formatINR } from '../utils/formatCurrency';
import { formatDateDDMMYYYY } from '../utils/dateConversion';
import { numberToWords } from '../utils/numberToWords';

interface InvoicePrintViewProps {
  bill: Bill;
  partyGstNumber?: string;
}

export default function InvoicePrintView({ bill, partyGstNumber }: InvoicePrintViewProps) {
  const amountInWords = numberToWords(bill.finalAmount);

  return (
    <div className="invoice-print bg-white text-gray-900 max-w-4xl mx-auto font-sans">
      {/* Red Header Band */}
      <div style={{ background: '#c0392b', color: 'white', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Logo + Company Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#c0392b', fontWeight: 900, fontSize: '22px', letterSpacing: '-1px' }}>MI</span>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '26px', letterSpacing: '2px', lineHeight: 1 }}>
                MANISH INFRATECH
              </div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
                Infrastructure &amp; Construction Services
              </div>
            </div>
          </div>
          {/* Right: TAX INVOICE label */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'white', color: '#c0392b', fontWeight: 900,
              fontSize: '18px', padding: '6px 18px', borderRadius: '6px',
              letterSpacing: '2px',
            }}>
              TAX INVOICE
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Meta */}
      <div style={{ background: '#fff8f8', borderBottom: '2px solid #c0392b', padding: '16px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Bill To</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginTop: '4px' }}>{bill.partyName}</div>
            {partyGstNumber && (
              <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                GST No: <span style={{ fontWeight: 600 }}>{partyGstNumber}</span>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice No.</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#c0392b' }}>{bill.invoiceNumber}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{formatDateDDMMYYYY(bill.billDate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div style={{ padding: '0 32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr style={{ background: '#c0392b', color: 'white' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700 }}>Sr. No.</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700 }}>HSN Code</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700 }}>Product / Service</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 700 }}>Qty</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700 }}>Unit</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 700 }}>Rate (₹)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 700 }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.lineItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f0e0e0', background: idx % 2 === 0 ? '#fff' : '#fff8f8' }}>
                <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ padding: '8px 10px', fontSize: '13px' }}>{item.hsnCode || '—'}</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 500 }}>{item.productName}</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '8px 10px', fontSize: '13px' }}>{item.unit || '—'}</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right' }}>{formatINR(item.rate)}</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>{formatINR(item.totalAmount)}</td>
              </tr>
            ))}
            {/* Empty rows to fill up to 15 */}
            {Array.from({ length: Math.max(0, 5 - bill.lineItems.length) }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #f0e0e0' }}>
                <td style={{ padding: '8px 10px' }}>&nbsp;</td>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GST Summary */}
      <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ width: '320px', borderCollapse: 'collapse', border: '2px solid #c0392b', borderRadius: '8px', overflow: 'hidden' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '7px 14px', fontSize: '13px', color: '#555' }}>Base Amount</td>
              <td style={{ padding: '7px 14px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>{formatINR(bill.baseAmount)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '7px 14px', fontSize: '13px', color: '#555' }}>CGST (9%)</td>
              <td style={{ padding: '7px 14px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>{formatINR(bill.cgst)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '7px 14px', fontSize: '13px', color: '#555' }}>SGST (9%)</td>
              <td style={{ padding: '7px 14px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>{formatINR(bill.sgst)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '7px 14px', fontSize: '13px', color: '#555' }}>Round Off</td>
              <td style={{ padding: '7px 14px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                {bill.roundOff >= 0 ? '+' : ''}{bill.roundOff.toFixed(2)}
              </td>
            </tr>
            <tr style={{ background: '#c0392b', color: 'white' }}>
              <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 700 }}>Final Amount</td>
              <td style={{ padding: '10px 14px', fontSize: '14px', textAlign: 'right', fontWeight: 700 }}>{formatINR(bill.finalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div style={{ padding: '0 32px 16px', borderTop: '1px solid #f0e0e0', marginTop: '4px' }}>
        <div style={{
          background: '#fff8f8', border: '1px solid #f0e0e0', borderRadius: '6px',
          padding: '10px 16px', fontSize: '13px',
        }}>
          <span style={{ color: '#888', fontWeight: 600 }}>Amount in Words: </span>
          <span style={{ fontWeight: 700, color: '#c0392b' }}>{amountInWords}</span>
        </div>
      </div>

      {/* Payment Status */}
      <div style={{ padding: '0 32px 16px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, background: '#f0fff4', border: '1px solid #86efac', borderRadius: '6px', padding: '10px 16px' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Amount Paid</div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#16a34a' }}>{formatINR(bill.amountPaid)}</div>
        </div>
        <div style={{ flex: 1, background: bill.pendingAmount > 0 ? '#fff5f5' : '#f0fff4', border: `1px solid ${bill.pendingAmount > 0 ? '#fca5a5' : '#86efac'}`, borderRadius: '6px', padding: '10px 16px' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Pending Amount</div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: bill.pendingAmount > 0 ? '#dc2626' : '#16a34a' }}>{formatINR(bill.pendingAmount)}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#c0392b', color: 'white', padding: '14px 32px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.9 }}>
          Thank you for your business!
        </div>
        <div style={{ fontSize: '11px', opacity: 0.75 }}>
          This is a computer-generated invoice.
        </div>
      </div>
    </div>
  );
}
