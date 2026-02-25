import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
}

export default function SummaryCard({ label, value, highlight = false, subtext }: SummaryCardProps) {
  return (
    <div className={`rounded-lg shadow p-5 ${highlight ? 'bg-brand-red text-white' : 'bg-white'}`}>
      <div className={`text-sm font-medium mb-1 ${highlight ? 'text-red-100' : 'text-gray-600'}`}>
        {label}
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      {subtext && (
        <div className={`text-xs mt-1 ${highlight ? 'text-red-200' : 'text-gray-500'}`}>
          {subtext}
        </div>
      )}
    </div>
  );
}
