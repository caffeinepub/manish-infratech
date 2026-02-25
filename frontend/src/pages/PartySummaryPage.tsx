import React, { useState } from 'react';
import { useGetPartySummaryByDateRange, useSavePartyGstNumber } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Users, Filter, Save, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function PartySummaryPage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [gstEdits, setGstEdits] = useState<Record<string, string>>({});
  const [savedGst, setSavedGst] = useState<Record<string, boolean>>({});

  const saveGstMutation = useSavePartyGstNumber();

  const fromNs = appliedFrom ? BigInt(new Date(appliedFrom).getTime()) * 1_000_000n : 0n;
  const toNs = appliedTo ? BigInt(new Date(appliedTo).getTime() + 86400000) * 1_000_000n : BigInt(Date.now() + 86400000 * 365) * 1_000_000n;

  const { data: partySummaries = [], isLoading } = useGetPartySummaryByDateRange(fromNs, toNs);

  const handleApplyFilter = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
    setAppliedFrom('');
    setAppliedTo('');
  };

  const handleSaveGst = async (partyName: string) => {
    const gstNumber = gstEdits[partyName] ?? '';
    try {
      await saveGstMutation.mutateAsync({ partyName, gstNumber });
      setSavedGst(prev => ({ ...prev, [partyName]: true }));
      setTimeout(() => setSavedGst(prev => ({ ...prev, [partyName]: false })), 2500);
    } catch (err) {
      console.error('Failed to save GST number', err);
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
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e3a8a',
    marginBottom: '4px',
  };

  const totalBilled = partySummaries.reduce((sum, p) => sum + p.totalBilled, 0);
  const totalPaid = partySummaries.reduce((sum, p) => sum + p.totalPaid, 0);
  const totalPending = partySummaries.reduce((sum, p) => sum + p.totalPending, 0);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ backgroundColor: '#1e3a8a', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              Party Summary
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Per-party billing overview and GST management
            </p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '18px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(30,58,138,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
              onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
              onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
            />
          </div>
          <button
            onClick={handleApplyFilter}
            style={{
              backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none',
              borderRadius: '7px', padding: '9px 18px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Filter size={14} />
            Apply Filter
          </button>
          {(appliedFrom || appliedTo) && (
            <button
              onClick={handleClearFilter}
              style={{
                backgroundColor: '#ffffff', color: '#64748b',
                border: '1.5px solid #cbd5e1', borderRadius: '7px',
                padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Totals */}
      {!isLoading && partySummaries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {[
            { label: 'Total Billed', value: formatINR(totalBilled), color: '#1e3a8a' },
            { label: 'Total Received', value: formatINR(totalPaid), color: '#16a34a' },
            { label: 'Total Pending', value: formatINR(totalPending), color: '#dc2626' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                backgroundColor: '#ffffff',
                border: `1.5px solid ${color}30`,
                borderLeft: `4px solid ${color}`,
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </p>
              <p style={{ color, fontSize: '20px', fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Party Table */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px' }}>
          <Loader2 size={24} color="#1e3a8a" className="animate-spin" />
          <span style={{ color: '#64748b', fontSize: '15px' }}>Loading party data...</span>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(30,58,138,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e3a8a' }}>
                  {['Party Name', 'GST Number', 'Bills', 'Total Billed', 'Total Paid', 'Pending', 'Actions'].map(header => (
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
                {partySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      No party data found for the selected date range.
                    </td>
                  </tr>
                ) : (
                  partySummaries.map((party, index) => (
                    <tr
                      key={party.partyName}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eff6ff',
                        borderBottom: '1px solid #dbeafe',
                      }}
                    >
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#1a1a2e', fontWeight: 600 }}>
                        {party.partyName}
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="text"
                            value={gstEdits[party.partyName] ?? party.gstNumber}
                            onChange={e => setGstEdits(prev => ({ ...prev, [party.partyName]: e.target.value }))}
                            placeholder="Enter GST No."
                            style={{
                              border: '1.5px solid #cbd5e1',
                              borderRadius: '5px',
                              padding: '5px 8px',
                              fontSize: '12px',
                              color: '#1a1a2e',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                              width: '140px',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                            onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
                          />
                          <button
                            onClick={() => handleSaveGst(party.partyName)}
                            disabled={saveGstMutation.isPending}
                            title="Save GST"
                            style={{
                              backgroundColor: savedGst[party.partyName] ? '#f0fdf4' : '#1e3a8a',
                              color: savedGst[party.partyName] ? '#16a34a' : '#ffffff',
                              border: savedGst[party.partyName] ? '1.5px solid #bbf7d0' : 'none',
                              borderRadius: '5px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            {savedGst[party.partyName] ? (
                              <>
                                <CheckCircle size={12} color="#16a34a" />
                                Saved
                              </>
                            ) : saveGstMutation.isPending ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <>
                                <Save size={12} />
                                Save
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151', textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                          {Number(party.billCount)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#1a1a2e', fontWeight: 600 }}>
                        {formatINR(party.totalBilled)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
                        {formatINR(party.totalPaid)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: party.totalPending > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {formatINR(party.totalPending)}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate({ to: '/company-report', search: { party: party.partyName } as any })}
                          style={{
                            backgroundColor: '#eff6ff', color: '#1e3a8a',
                            border: '1px solid #bfdbfe', borderRadius: '5px',
                            padding: '5px 10px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '12px', fontWeight: 600,
                            margin: '0 auto',
                          }}
                        >
                          <ExternalLink size={12} />
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
