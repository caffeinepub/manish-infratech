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
    <div className="invoice-print bg-white text-gray-900 max-w-4xl mx-auto font-sans" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* Red Header Band */}
      <div style={{ background: '#c0392b', color: 'white', padding: '24px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Logo + Company Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '10px',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}>
              <span style={{ color: '#c0392b', fontWeight: 900, fontSize: '24px', letterSpacing: '-1px' }}>MI</span>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '3px', lineHeight: 1.1 }}>
                MANISH INFRATECH
              </div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '5px', letterSpacing: '0.5px' }}>
                Infrastructure &amp; Construction Services
              </div>
            </div>
          </div>
          {/* Right: TAX INVOICE label */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'white', color: '#c0392b', fontWeight: 900,
              fontSize: '17px', padding: '8px 22px', borderRadius: '6px',
              letterSpacing: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}>
              TAX INVOICE
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Meta */}
      <div style={{ background: '#fff8f8', borderBottom: '2.5px solid #c0392b', padding: '18px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Bill To</div>
            <div style={{ fontWeight: 800, fontSize: '17px', marginTop: '5px', color: '#1a1a1a' }}>{bill.partyName}</div>
            {partyGstNumber && (
              <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>
                GST No: <span style={{ fontWeight: 700, color: '#333' }}>{partyGstNumber}</span>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Invoice No.</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#c0392b', marginTop: '3px' }}>{bill.invoiceNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Date</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#333', marginTop: '3px' }}>{formatDateDDMMYYYY(bill.billDate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div style={{ padding: '0 36px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#c0392b', color: 'white' }}>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', width: '50px' }}>Sr. No.</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>HSN Code</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>Product / Service</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>Unit</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>Rate (₹)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.lineItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f0e0e0', background: idx % 2 === 0 ? '#ffffff' : '#fff8f8' }}>
                <td style={{ padding: '9px 12px', fontSize: '13px', textAlign: 'center', color: '#555' }}>{idx + 1}</td>
                <td style={{ padding: '9px 12px', fontSize: '13px', color: '#444' }}>{item.hsnCode || '—'}</td>
                <td style={{ padding: '9px 12px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{item.productName}</td>
                <td style={{ padding: '9px 12px', fontSize: '13px', textAlign: 'right', color: '#444' }}>{item.quantity}</td>
                <td style={{ padding: '9px 12px', fontSize: '13px', color: '#444' }}>{item.unit || '—'}</td>
                <td style={{ padding: '9px 12px', fontSize: '13px', textAlign: 'right', color: '#444' }}>{formatINR(item.rate)}</td>
                <td style={{ padding: '9px 12px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatINR(item.totalAmount)}</td>
              </tr>
            ))}
            {/* Empty rows to fill up to minimum 5 */}
            {Array.from({ length: Math.max(0, 5 - bill.lineItems.length) }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #f0e0e0' }}>
                <td style={{ padding: '9px 12px' }}>&nbsp;</td>
                <td style={{ padding: '9px 12px' }}></td>
                <td style={{ padding: '9px 12px' }}></td>
                <td style={{ padding: '9px 12px' }}></td>
                <td style={{ padding: '9px 12px' }}></td>
                <td style={{ padding: '9px 12px' }}></td>
                <td style={{ padding: '9px 12px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GST Summary */}
      <div style={{ padding: '20px 36px 8px', display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ width: '340px', borderCollapse: 'collapse', border: '2px solid #c0392b', borderRadius: '8px', overflow: 'hidden' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '9px 16px', fontSize: '13px', color: '#555', fontWeight: 500 }}>Base Amount</td>
              <td style={{ padding: '9px 16px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatINR(bill.baseAmount)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '9px 16px', fontSize: '13px', color: '#555', fontWeight: 500 }}>CGST (9%)</td>
              <td style={{ padding: '9px 16px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatINR(bill.cgst)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '9px 16px', fontSize: '13px', color: '#555', fontWeight: 500 }}>SGST (9%)</td>
              <td style={{ padding: '9px 16px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatINR(bill.sgst)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0e0e0' }}>
              <td style={{ padding: '9px 16px', fontSize: '13px', color: '#555', fontWeight: 500 }}>Round Off</td>
              <td style={{ padding: '9px 16px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>
                {bill.roundOff >= 0 ? '+' : ''}{bill.roundOff.toFixed(2)}
              </td>
            </tr>
            <tr style={{ background: '#c0392b', color: 'white' }}>
              <td style={{ padding: '12px 16px', fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px' }}>Final Amount</td>
              <td style={{ padding: '12px 16px', fontSize: '15px', textAlign: 'right', fontWeight: 800 }}>{formatINR(bill.finalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div style={{ padding: '12px 36px 20px' }}>
        <div style={{
          background: '#fff8f8', border: '1.5px solid #f0c0c0', borderRadius: '7px',
          padding: '12px 18px', fontSize: '13px',
        }}>
          <span style={{ color: '#888', fontWeight: 600 }}>Amount in Words: </span>
          <span style={{ fontWeight: 800, color: '#c0392b', fontSize: '13.5px' }}>{amountInWords}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#c0392b', color: 'white', padding: '16px 36px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.92, fontWeight: 500 }}>
          Thank you for your business!
        </div>
        <div style={{ fontSize: '11px', opacity: 0.75, letterSpacing: '0.3px' }}>
          This is a computer-generated invoice.
        </div>
      </div>
    </div>
  );
}
