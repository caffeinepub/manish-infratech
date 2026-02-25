import React, { useState, useEffect } from 'react';
import { useGetAllBills, useGetCompanyReport } from '../hooks/useQueries';
import { Building2, Download, Filter, Loader2 } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const formatDate = (billDate: bigint): string => {
  const ms = Number(billDate / 1_000_000n);
  const date = new Date(ms);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function CompanyReportPage() {
  const [selectedParty, setSelectedParty] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedParty, setAppliedParty] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const { data: allBills = [] } = useGetAllBills();
  const partyNames = Array.from(new Set(allBills.map(b => b.partyName))).sort();

  const fromNs = appliedFrom ? BigInt(new Date(appliedFrom).getTime()) * 1_000_000n : 0n;
  const toNs = appliedTo ? BigInt(new Date(appliedTo).getTime() + 86400000) * 1_000_000n : BigInt(Date.now() + 86400000 * 365) * 1_000_000n;

  const { data: report, isLoading } = useGetCompanyReport(appliedParty, fromNs, toNs);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partyParam = params.get('party');
    if (partyParam) {
      setSelectedParty(partyParam);
      setAppliedParty(partyParam);
    }
  }, []);

  const handleGenerateReport = () => {
    setAppliedParty(selectedParty);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    const headers = ['Invoice No.', 'Date', 'Base Amount', 'GST', 'Total Amount', 'Paid', 'Pending'];
    const rows = report.bills.map(b => [
      b.invoiceNumber,
      formatDate(b.billDate),
      b.baseAmount.toFixed(2),
      b.totalGst.toFixed(2),
      b.finalAmount.toFixed(2),
      b.amountPaid.toFixed(2),
      b.pendingAmount.toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appliedParty}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ backgroundColor: '#1e3a8a', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              Company Report
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Detailed billing report for a specific party
            </p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '18px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(30,58,138,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Select Party *</label>
            <select
              value={selectedParty}
              onChange={e => setSelectedParty(e.target.value)}
              style={{ ...inputStyle, minWidth: '200px', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
              onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
            >
              <option value="">-- Select Party --</option>
              {partyNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
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
            onClick={handleGenerateReport}
            disabled={!selectedParty}
            style={{
              backgroundColor: !selectedParty ? '#94a3b8' : '#1e3a8a',
              color: '#ffffff', border: 'none',
              borderRadius: '7px', padding: '9px 18px', fontSize: '13px',
              fontWeight: 600, cursor: !selectedParty ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Filter size={14} />
            Generate Report
          </button>
          {report && report.bills.length > 0 && (
            <button
              onClick={handleDownloadCSV}
              style={{
                backgroundColor: '#ffffff', color: '#1e3a8a',
                border: '1.5px solid #1e3a8a', borderRadius: '7px',
                padding: '9px 18px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Download size={14} />
              Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px' }}>
          <Loader2 size={24} color="#1e3a8a" className="animate-spin" />
          <span style={{ color: '#64748b', fontSize: '15px' }}>Generating report...</span>
        </div>
      ) : appliedParty && report ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Billed', value: formatINR(report.totalServiceAmount), color: '#1e3a8a' },
              { label: 'Total Received', value: formatINR(report.totalReceived), color: '#16a34a' },
              { label: 'Total Pending', value: formatINR(report.totalPending), color: '#dc2626' },
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

          {/* Bills Table */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(30,58,138,0.06)' }}>
            <div style={{ backgroundColor: '#1e3a8a', padding: '12px 16px' }}>
              <h3 style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                Bills for {appliedParty} ({report.bills.length})
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eff6ff' }}>
                    {['Invoice No.', 'Date', 'Base Amount', 'GST (18%)', 'Total Amount', 'Paid', 'Pending'].map(header => (
                      <th
                        key={header}
                        style={{
                          color: '#1e3a8a',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textAlign: 'left',
                          borderBottom: '2px solid #bfdbfe',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.bills.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        No bills found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    report.bills.map((bill, index) => (
                      <tr
                        key={bill.invoiceNumber}
                        style={{
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#eff6ff',
                          borderBottom: '1px solid #dbeafe',
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: '#1e3a8a', fontWeight: 600 }}>
                          {bill.invoiceNumber}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: '#374151' }}>
                          {formatDate(bill.billDate)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: '#374151' }}>
                          {formatINR(bill.baseAmount)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: '#374151' }}>
                          {formatINR(bill.totalGst)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: '#1a1a2e', fontWeight: 700 }}>
                          {formatINR(bill.finalAmount)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
                          {formatINR(bill.amountPaid)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: bill.pendingAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                          {formatINR(bill.pendingAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
          <Building2 size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
            Select a party and click "Generate Report" to view the billing report.
          </p>
        </div>
      )}
    </div>
  );
}
