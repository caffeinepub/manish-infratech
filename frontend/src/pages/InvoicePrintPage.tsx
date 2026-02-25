import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBill, useGetPartyProfile, useGetCompanySettings } from '../hooks/useQueries';
import InvoicePrintView from '../components/InvoicePrintView';

export default function InvoicePrintPage() {
  const { invoiceNumber } = useParams({ from: '/invoice/$invoiceNumber' });
  const navigate = useNavigate();

  const { data: bill, isLoading: billLoading, error: billError } = useGetBill(invoiceNumber);
  const { data: partyProfile } = useGetPartyProfile(bill?.partyName ?? '');
  const { data: companySettings } = useGetCompanySettings();

  const handlePrint = () => {
    window.print();
  };

  if (billLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (billError || !bill) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Failed to load invoice. Please try again.
        </div>
      </div>
    );
  }

  // Resolve party GST: bill field takes priority, then party profile
  const resolvedPartyGstNo = bill.partyGstNo || partyProfile?.gstNumber || '';
  // Resolve party address from party profile
  const resolvedPartyAddress = partyProfile?.address || '';

  return (
    <div>
      {/* Print action buttons - hidden when printing */}
      <div className="no-print flex gap-3 justify-center py-4 bg-gray-100 border-b border-gray-200">
        <button
          onClick={() => navigate({ to: '/summary' })}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-brand-red text-white rounded-md text-sm font-medium hover:bg-red-700"
        >
          🖨️ Print Invoice
        </button>
      </div>

      <InvoicePrintView
        bill={bill}
        companySettings={companySettings}
        partyGstNo={resolvedPartyGstNo}
        partyAddress={resolvedPartyAddress}
        partyProfile={partyProfile}
      />
    </div>
  );
}
