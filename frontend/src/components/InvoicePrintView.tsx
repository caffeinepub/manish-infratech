import React from 'react';
import { Bill } from '../backend';

interface InvoicePrintViewProps {
  bill: Bill;
  partyGstNumber?: string;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function numberToWords(num: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  if (num === 0) return 'Zero';

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  function convertToWords(n: number): string {
    if (n === 0) return '';
    let result = '';
    if (n >= 10000000) {
      result += convertHundreds(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      result += convertHundreds(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertHundreds(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    result += convertHundreds(n);
    return result;
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let words = convertToWords(intPart).trim() + ' Rupees';
  if (decPart > 0) {
    words += ' and ' + convertToWords(decPart).trim() + ' Paise';
  }
  words += ' Only';
  return words;
}

function formatDate(billDate: bigint | number): string {
  let ms: number;
  if (typeof billDate === 'bigint') {
    ms = Number(billDate / 1_000_000n);
  } else {
    ms = billDate > 1e12 ? billDate / 1_000_000 : billDate * 1000;
  }
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function InvoicePrintView({ bill, partyGstNumber }: InvoicePrintViewProps) {
  return (
    <div
      className="invoice-print-view bg-white text-gray-900"
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        border: '1px solid #ddd',
      }}
    >
      {/* ── Company Header Band ── */}
      <div
        className="print-bg-red"
        style={{
          backgroundColor: '#c0392b',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <img
          src="/assets/generated/mi-logo.dim_128x128.png"
          alt="MI Logo"
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '4px',
          }}
        />
        <div>
          <div style={{ fontSize: '20pt', fontWeight: 'bold', letterSpacing: '1px' }}>
            MANISH INFRATECH
          </div>
          <div style={{ fontSize: '9pt', opacity: 0.9, marginTop: '2px' }}>
            GST Invoice
          </div>
        </div>
      </div>

      {/* ── Invoice Meta + Party Details ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '2px solid #c0392b',
          gap: '20px',
        }}
      >
        {/* Bill To */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '8pt', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
            Bill To
          </div>
          <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#1a1a1a' }}>
            {bill.partyName}
          </div>
          {partyGstNumber && (
            <div style={{ fontSize: '10pt', color: '#555', marginTop: '4px' }}>
              GST No: <span style={{ fontWeight: '600', color: '#333' }}>{partyGstNumber}</span>
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div style={{ textAlign: 'right', minWidth: '180px' }}>
          <table style={{ marginLeft: 'auto', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontSize: '9pt', color: '#666', paddingRight: '8px', paddingBottom: '4px' }}>
                  Invoice No:
                </td>
                <td style={{ fontSize: '9pt', fontWeight: 'bold', paddingBottom: '4px' }}>
                  {bill.invoiceNumber}
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: '9pt', color: '#666', paddingRight: '8px' }}>
                  Date:
                </td>
                <td style={{ fontSize: '9pt', fontWeight: 'bold' }}>
                  {formatDate(bill.billDate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <div style={{ padding: '0 20px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '12px',
            fontSize: '9pt',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#c0392b', color: 'white' }}>
              <th style={{ padding: '7px 6px', textAlign: 'center', width: '32px', border: '1px solid #a93226' }}>
                Sr.
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'left', border: '1px solid #a93226' }}>
                Description / Product
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'center', width: '70px', border: '1px solid #a93226' }}>
                HSN Code
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'center', width: '55px', border: '1px solid #a93226' }}>
                Qty
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'center', width: '45px', border: '1px solid #a93226' }}>
                Unit
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'right', width: '75px', border: '1px solid #a93226' }}>
                Rate (₹)
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'right', width: '85px', border: '1px solid #a93226' }}>
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {bill.lineItems.map((item, idx) => (
              <tr
                key={idx}
                style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fdf5f5' }}
              >
                <td style={{ padding: '6px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '6px', border: '1px solid #e0e0e0' }}>
                  {item.productName}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                  {item.hsnCode || '—'}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                  {Number(item.quantity)}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                  {item.unit || '—'}
                </td>
                <td style={{ padding: '6px', textAlign: 'right', border: '1px solid #e0e0e0' }}>
                  {Number(item.rate).toFixed(2)}
                </td>
                <td style={{ padding: '6px', textAlign: 'right', border: '1px solid #e0e0e0', fontWeight: '500' }}>
                  {Number(item.totalAmount).toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Empty rows to fill table if few items */}
            {bill.lineItems.length < 5 &&
              Array.from({ length: 5 - bill.lineItems.length }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ height: '28px' }}>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                  <td style={{ border: '1px solid #e0e0e0' }}></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── GST Summary ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '12px 20px 16px',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            fontSize: '9.5pt',
            minWidth: '260px',
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: '5px 12px',
                  color: '#555',
                  borderTop: '1px solid #e0e0e0',
                  borderLeft: '1px solid #e0e0e0',
                }}
              >
                Base Amount
              </td>
              <td
                style={{
                  padding: '5px 12px',
                  textAlign: 'right',
                  fontWeight: '500',
                  borderTop: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0',
                }}
              >
                {formatINR(bill.baseAmount)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '5px 12px',
                  color: '#555',
                  borderTop: '1px solid #e0e0e0',
                  borderLeft: '1px solid #e0e0e0',
                }}
              >
                CGST (9%)
              </td>
              <td
                style={{
                  padding: '5px 12px',
                  textAlign: 'right',
                  fontWeight: '500',
                  borderTop: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0',
                }}
              >
                {formatINR(bill.cgst)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '5px 12px',
                  color: '#555',
                  borderTop: '1px solid #e0e0e0',
                  borderLeft: '1px solid #e0e0e0',
                }}
              >
                SGST (9%)
              </td>
              <td
                style={{
                  padding: '5px 12px',
                  textAlign: 'right',
                  fontWeight: '500',
                  borderTop: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0',
                }}
              >
                {formatINR(bill.sgst)}
              </td>
            </tr>
            {Math.abs(bill.roundOff) > 0.001 && (
              <tr>
                <td
                  style={{
                    padding: '5px 12px',
                    color: '#555',
                    borderTop: '1px solid #e0e0e0',
                    borderLeft: '1px solid #e0e0e0',
                  }}
                >
                  Round Off
                </td>
                <td
                  style={{
                    padding: '5px 12px',
                    textAlign: 'right',
                    fontWeight: '500',
                    borderTop: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                  }}
                >
                  {bill.roundOff >= 0 ? '+' : ''}{bill.roundOff.toFixed(2)}
                </td>
              </tr>
            )}
            <tr>
              <td
                style={{
                  padding: '7px 12px',
                  fontWeight: 'bold',
                  fontSize: '11pt',
                  backgroundColor: '#c0392b',
                  color: 'white',
                  borderTop: '2px solid #a93226',
                  borderLeft: '1px solid #a93226',
                }}
              >
                Final Amount
              </td>
              <td
                style={{
                  padding: '7px 12px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '11pt',
                  backgroundColor: '#c0392b',
                  color: 'white',
                  borderTop: '2px solid #a93226',
                  borderRight: '1px solid #a93226',
                }}
              >
                {formatINR(bill.finalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Amount in Words ── */}
      <div
        style={{
          margin: '0 20px 16px',
          padding: '10px 14px',
          backgroundColor: '#fdf5f5',
          border: '1px solid #e8c5c5',
          borderRadius: '4px',
          fontSize: '9.5pt',
        }}
      >
        <span style={{ color: '#888', marginRight: '6px' }}>Amount in Words:</span>
        <span style={{ fontWeight: '600', color: '#1a1a1a' }}>
          {numberToWords(bill.finalAmount)}
        </span>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: '2px solid #c0392b',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: '8.5pt',
          color: '#666',
        }}
      >
        <div>
          <div style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '2px' }}>
            MANISH INFRATECH
          </div>
          <div>Thank you for your business!</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '24px', color: '#999' }}>Authorised Signatory</div>
          <div style={{ borderTop: '1px solid #999', paddingTop: '4px', minWidth: '120px' }}>
            Signature
          </div>
        </div>
      </div>
    </div>
  );
}
