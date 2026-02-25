import React from 'react';
import { TrendingUp, Receipt, DollarSign, PieChart } from 'lucide-react';

interface SummaryCardProps {
  totalRevenue: number;
  totalGst: number;
  cgst: number;
  sgst: number;
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function SummaryCard({ totalRevenue, totalGst, cgst, sgst }: SummaryCardProps) {
  const cards = [
    {
      label: 'Total Revenue',
      value: formatINR(totalRevenue),
      icon: TrendingUp,
      bg: '#1e3a8a',
      iconColor: '#ffffff',
      textColor: '#ffffff',
      subColor: 'rgba(255,255,255,0.75)',
      highlight: true,
    },
    {
      label: 'Total GST (18%)',
      value: formatINR(totalGst),
      icon: Receipt,
      bg: '#ffffff',
      iconColor: '#1e3a8a',
      textColor: '#1a1a2e',
      subColor: '#64748b',
      highlight: false,
    },
    {
      label: 'CGST (9%)',
      value: formatINR(cgst),
      icon: DollarSign,
      bg: '#ffffff',
      iconColor: '#dc2626',
      textColor: '#1a1a2e',
      subColor: '#64748b',
      highlight: false,
    },
    {
      label: 'SGST (9%)',
      value: formatINR(sgst),
      icon: PieChart,
      bg: '#ffffff',
      iconColor: '#dc2626',
      textColor: '#1a1a2e',
      subColor: '#64748b',
      highlight: false,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {cards.map(({ label, value, icon: Icon, bg, iconColor, textColor, subColor, highlight }) => (
        <div
          key={label}
          style={{
            backgroundColor: bg,
            border: highlight ? 'none' : '1.5px solid #bfdbfe',
            borderRadius: '10px',
            padding: '18px',
            boxShadow: highlight ? '0 4px 12px rgba(30,58,138,0.2)' : '0 1px 4px rgba(30,58,138,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: subColor, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </span>
            <div style={{ backgroundColor: highlight ? 'rgba(255,255,255,0.15)' : '#eff6ff', borderRadius: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
              <Icon size={16} color={iconColor} />
            </div>
          </div>
          <p style={{ color: textColor, fontSize: '22px', fontWeight: 800, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
