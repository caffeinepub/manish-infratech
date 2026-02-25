import React, { useState } from 'react';
import { useGetAllBills } from '../hooks/useQueries';
import SummaryCard from '../components/SummaryCard';
import BillResultsTable from '../components/BillResultsTable';
import { BarChart2, Download, Filter, Loader2 } from 'lucide-react';

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

export default function SummaryPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const { data: allBills = [], isLoading } = useGetAllBills();

  const filteredBills = allBills.filter(bill => {
    if (!appliedFrom && !appliedTo) return true;
    const billMs = Number(bill.billDate / 1_000_000n);
    const fromMs = appliedFrom ? new Date(appliedFrom).getTime() : 0;
    const toMs = appliedTo ? new Date(appliedTo).getTime() + 86400000 : Infinity;
    return billMs >= fromMs && billMs <= toMs;
  });

  const totalRevenue = filteredBills.reduce((sum, b) => sum + b.finalAmount, 0);
  const totalGst = filteredBills.reduce((sum, b) => sum + b.totalGst, 0);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const totalReceived = filteredBills.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalPending = filteredBills.reduce((sum, b) => sum + b.pendingAmount, 0);

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

  const handleDownloadCSV = () => {
    const headers = ['Invoice No.', 'Party Name', 'Date', 'Base Amount', 'GST', 'Total Amount', 'Paid', 'Pending'];
    const rows = filteredBills.map(b => [
      b.invoiceNumber,
      b.partyName,
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
    a.download = 'summary.csv';
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
            <BarChart2 size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              Financial Summary
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Overview of all billing activity
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
          <button
            onClick={handleDownloadCSV}
            style={{
              backgroundColor: '#ffffff', color: '#1e3a8a',
              border: '1.5px solid #1e3a8a', borderRadius: '7px',
              padding: '9px 18px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              marginLeft: 'auto',
            }}
          >
            <Download size={14} />
            Download CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px' }}>
          <Loader2 size={24} color="#1e3a8a" className="animate-spin" />
          <span style={{ color: '#64748b', fontSize: '15px' }}>Loading summary...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ marginBottom: '20px' }}>
            <SummaryCard totalRevenue={totalRevenue} totalGst={totalGst} cgst={cgst} sgst={sgst} />
          </div>

          {/* P&L Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Billed', value: formatINR(totalRevenue), color: '#1e3a8a' },
              { label: 'Total Received', value: formatINR(totalReceived), color: '#16a34a' },
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

          {/* Bills Table */}
          <div>
            <h3 style={{ color: '#1e3a8a', fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', fontFamily: 'Poppins, sans-serif' }}>
              Bills ({filteredBills.length})
            </h3>
            <BillResultsTable bills={filteredBills} />
          </div>
        </>
      )}
    </div>
  );
}
