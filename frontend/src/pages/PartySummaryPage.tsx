import React, { useState } from 'react';
import { useGetPartySummaryByDateRange, useSavePartyGstNumber, useSavePartyAddress } from '../hooks/useQueries';
import SummaryCard from '../components/SummaryCard';
import AddPartyModal from '../components/AddPartyModal';

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), 0, 1);
  const to = new Date(now.getFullYear(), 11, 31);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export default function PartySummaryPage() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [showAddParty, setShowAddParty] = useState(false);
  const [editingGst, setEditingGst] = useState<{ [key: string]: string }>({});
  const [editingAddress, setEditingAddress] = useState<{ [key: string]: string }>({});
  const [savingGst, setSavingGst] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState<string | null>(null);

  const fromMs = new Date(fromDate).getTime();
  const toMs = new Date(toDate).getTime() + 86400000 - 1;
  const fromNs = fromMs * 1_000_000;
  const toNs = toMs * 1_000_000;

  const { data: partySummaries = [], isLoading, refetch } = useGetPartySummaryByDateRange(fromNs, toNs);
  const saveGstMutation = useSavePartyGstNumber();
  const saveAddressMutation = useSavePartyAddress();

  const totalBilled = partySummaries.reduce((s, p) => s + p.totalBilled, 0);
  const totalPaid = partySummaries.reduce((s, p) => s + p.totalPaid, 0);
  const totalPending = partySummaries.reduce((s, p) => s + p.totalPending, 0);

  const handleSaveGst = async (partyName: string) => {
    const gst = editingGst[partyName] ?? '';
    setSavingGst(partyName);
    try {
      await saveGstMutation.mutateAsync({ partyName, gstNumber: gst });
      setEditingGst(prev => { const n = { ...prev }; delete n[partyName]; return n; });
      refetch();
    } catch {
      // ignore
    } finally {
      setSavingGst(null);
    }
  };

  const handleSaveAddress = async (partyName: string) => {
    const address = editingAddress[partyName] ?? '';
    setSavingAddress(partyName);
    try {
      await saveAddressMutation.mutateAsync({ partyName, address });
      setEditingAddress(prev => { const n = { ...prev }; delete n[partyName]; return n; });
      refetch();
    } catch {
      // ignore
    } finally {
      setSavingAddress(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Party Summary</h1>
          <p className="text-gray-600 text-sm mt-1">Overview of all parties and their billing</p>
        </div>
        <button
          onClick={() => setShowAddParty(true)}
          className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white font-semibold text-sm rounded transition-colors"
        >
          + Add Party
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-red"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Total Billed" value={formatCurrency(totalBilled)} highlight />
        <SummaryCard label="Total Paid" value={formatCurrency(totalPaid)} />
        <SummaryCard label="Total Pending" value={formatCurrency(totalPending)} />
      </div>

      {/* Party Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading party data...</div>
      ) : partySummaries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No party data found for the selected date range.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-red text-white">
                <th className="px-4 py-3 text-left">Party Name</th>
                <th className="px-4 py-3 text-left">GST Number</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-right">Bills</th>
                <th className="px-4 py-3 text-right">Total Billed</th>
                <th className="px-4 py-3 text-right">Total Paid</th>
                <th className="px-4 py-3 text-right">Pending</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {partySummaries.map((party) => {
                const isEditingGst = partyName => editingGst.hasOwnProperty(partyName);
                const isEditingAddr = partyName => editingAddress.hasOwnProperty(partyName);
                const gstValue = editingGst.hasOwnProperty(party.partyName) ? editingGst[party.partyName] : party.gstNumber;
                const addrValue = editingAddress.hasOwnProperty(party.partyName) ? editingAddress[party.partyName] : party.address;

                return (
                  <tr key={party.partyName} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{party.partyName}</td>
                    <td className="px-4 py-3">
                      {editingGst.hasOwnProperty(party.partyName) ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={gstValue}
                            onChange={(e) => setEditingGst(prev => ({ ...prev, [party.partyName]: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-brand-red w-36"
                          />
                          <button
                            onClick={() => handleSaveGst(party.partyName)}
                            disabled={savingGst === party.partyName}
                            className="px-2 py-1 bg-brand-red text-white text-xs rounded hover:bg-red-700 disabled:opacity-60"
                          >
                            {savingGst === party.partyName ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingGst(prev => { const n = { ...prev }; delete n[party.partyName]; return n; })}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-gray-700 cursor-pointer hover:text-brand-red"
                          onClick={() => setEditingGst(prev => ({ ...prev, [party.partyName]: party.gstNumber }))}
                          title="Click to edit"
                        >
                          {party.gstNumber || <span className="text-gray-400 italic">Click to add</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingAddress.hasOwnProperty(party.partyName) ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={addrValue}
                            onChange={(e) => setEditingAddress(prev => ({ ...prev, [party.partyName]: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-brand-red w-40"
                          />
                          <button
                            onClick={() => handleSaveAddress(party.partyName)}
                            disabled={savingAddress === party.partyName}
                            className="px-2 py-1 bg-brand-red text-white text-xs rounded hover:bg-red-700 disabled:opacity-60"
                          >
                            {savingAddress === party.partyName ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingAddress(prev => { const n = { ...prev }; delete n[party.partyName]; return n; })}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-gray-700 cursor-pointer hover:text-brand-red"
                          onClick={() => setEditingAddress(prev => ({ ...prev, [party.partyName]: party.address }))}
                          title="Click to edit"
                        >
                          {party.address || <span className="text-gray-400 italic">Click to add</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{String(party.billCount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(party.totalBilled)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{formatCurrency(party.totalPaid)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${party.totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(party.totalPending)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddPartyModal open={showAddParty} onClose={() => setShowAddParty(false)} />
    </div>
  );
}
