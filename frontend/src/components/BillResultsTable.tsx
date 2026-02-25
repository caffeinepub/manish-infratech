import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteBill } from '../hooks/useQueries';
import type { Bill } from '../backend';

interface BillResultsTableProps {
  bills: Bill[];
  onPrint?: (invoiceNumber: string) => void;
  showActions?: boolean;
}

export default function BillResultsTable({ bills, onPrint, showActions = true }: BillResultsTableProps) {
  const navigate = useNavigate();
  const deleteBillMutation = useDeleteBill();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleDelete = async (invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;
    setDeletingId(invoiceNumber);
    try {
      await deleteBillMutation.mutateAsync(invoiceNumber);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = (invoiceNumber: string) => {
    if (onPrint) {
      onPrint(invoiceNumber);
    } else {
      navigate({ to: '/invoice/$invoiceNumber', params: { invoiceNumber } });
    }
  };

  const formatDate = (billDate: bigint) => {
    const ms = Number(billDate) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-red text-white">
              <th className="px-3 py-3 text-left font-semibold">Invoice #</th>
              <th className="px-3 py-3 text-left font-semibold">Party Name</th>
              <th className="px-3 py-3 text-left font-semibold">Party GST</th>
              <th className="px-3 py-3 text-left font-semibold">Date</th>
              <th className="px-3 py-3 text-right font-semibold">Amount (₹)</th>
              <th className="px-3 py-3 text-right font-semibold">Paid (₹)</th>
              <th className="px-3 py-3 text-right font-semibold">Pending (₹)</th>
              {showActions && <th className="px-3 py-3 text-center font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 8 : 7} className="px-3 py-8 text-center text-gray-500">
                  No bills found
                </td>
              </tr>
            ) : (
              bills.map((bill, idx) => (
                <tr
                  key={bill.invoiceNumber}
                  className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition-colors`}
                >
                  <td className="px-3 py-2.5 font-medium text-gray-900">{bill.invoiceNumber}</td>
                  <td className="px-3 py-2.5 text-gray-800">{bill.partyName}</td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs font-mono">
                    {bill.partyGstNo || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">{formatDate(bill.billDate)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-800 font-medium">
                    {bill.finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5 text-right text-green-700 font-medium">
                    {bill.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium" style={{ color: bill.pendingAmount > 0 ? '#c0392b' : '#16a34a' }}>
                    {bill.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {showActions && (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingBill(bill)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePrint(bill.invoiceNumber)}
                          className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 font-medium"
                        >
                          Print
                        </button>
                        <button
                          onClick={() => handleDelete(bill.invoiceNumber)}
                          disabled={deletingId === bill.invoiceNumber}
                          className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 font-medium disabled:opacity-50"
                        >
                          {deletingId === bill.invoiceNumber ? '...' : 'Del'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingBill && (
        <EditBillModalLazy bill={editingBill} onClose={() => setEditingBill(null)} />
      )}
    </>
  );
}

// Lazy import to avoid circular dependency
function EditBillModalLazy({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const [EditBillModal, setEditBillModal] = React.useState<React.ComponentType<{ bill: Bill; onClose: () => void }> | null>(null);

  React.useEffect(() => {
    import('./EditBillModal').then(mod => {
      setEditBillModal(() => mod.default);
    });
  }, []);

  if (!EditBillModal) return null;
  return <EditBillModal bill={bill} onClose={onClose} />;
}
