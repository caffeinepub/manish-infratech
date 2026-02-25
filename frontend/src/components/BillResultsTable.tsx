import React, { useState } from 'react';
import { Bill } from '../backend';
import { useDeleteBill } from '../hooks/useQueries';
import EditBillModal from './EditBillModal';
import { useNavigate } from '@tanstack/react-router';
import { Edit2, Trash2, Printer, AlertTriangle, Loader2 } from 'lucide-react';

interface BillResultsTableProps {
  bills: Bill[];
}

const formatDate = (billDate: bigint): string => {
  const ms = Number(billDate / 1_000_000n);
  const date = new Date(ms);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function BillResultsTable({ bills }: BillResultsTableProps) {
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const deleteMutation = useDeleteBill();
  const navigate = useNavigate();

  const handleDelete = async (invoiceNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;
    setDeletingInvoice(invoiceNumber);
    try {
      await deleteMutation.mutateAsync(invoiceNumber);
    } finally {
      setDeletingInvoice(null);
    }
  };

  if (bills.length === 0) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
        <AlertTriangle size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>No bills found.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(30,58,138,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e3a8a' }}>
                {['Invoice No.', 'Party Name', 'Date', 'Base Amount', 'GST (18%)', 'Total Amount', 'Paid', 'Pending', 'Actions'].map(header => (
                  <th
                    key={header}
                    style={{
                      color: '#ffffff',
                      padding: '12px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: header === 'Actions' ? 'center' : 'left',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, index) => (
                <tr
                  key={bill.invoiceNumber}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#eff6ff',
                    borderBottom: '1px solid #dbeafe',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#dbeafe'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#eff6ff'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#1e3a8a', fontWeight: 600 }}>
                    {bill.invoiceNumber}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#1a1a2e', fontWeight: 500 }}>
                    {bill.partyName}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                    {formatDate(bill.billDate)}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151' }}>
                    {formatINR(bill.baseAmount)}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151' }}>
                    {formatINR(bill.totalGst)}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#1a1a2e', fontWeight: 700 }}>
                    {formatINR(bill.finalAmount)}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
                    {formatINR(bill.amountPaid)}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13px', color: bill.pendingAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {formatINR(bill.pendingAmount)}
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setEditingBill(bill)}
                        title="Edit"
                        style={{
                          backgroundColor: '#eff6ff', color: '#1e3a8a',
                          border: '1px solid #bfdbfe', borderRadius: '5px',
                          padding: '5px 8px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          fontSize: '12px', fontWeight: 600,
                        }}
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate({ to: `/invoice/${bill.invoiceNumber}/print` })}
                        title="Print"
                        style={{
                          backgroundColor: '#f0fdf4', color: '#16a34a',
                          border: '1px solid #bbf7d0', borderRadius: '5px',
                          padding: '5px 8px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          fontSize: '12px', fontWeight: 600,
                        }}
                      >
                        <Printer size={12} />
                        Print
                      </button>
                      <button
                        onClick={() => handleDelete(bill.invoiceNumber)}
                        disabled={deletingInvoice === bill.invoiceNumber}
                        title="Delete"
                        style={{
                          backgroundColor: '#fef2f2', color: '#dc2626',
                          border: '1px solid #fecaca', borderRadius: '5px',
                          padding: '5px 8px', cursor: deletingInvoice === bill.invoiceNumber ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          fontSize: '12px', fontWeight: 600,
                          opacity: deletingInvoice === bill.invoiceNumber ? 0.6 : 1,
                        }}
                      >
                        {deletingInvoice === bill.invoiceNumber ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingBill && (
        <EditBillModal bill={editingBill} onClose={() => setEditingBill(null)} />
      )}
    </>
  );
}
