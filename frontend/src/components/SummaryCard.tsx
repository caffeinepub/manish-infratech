import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '../utils/formatCurrency';
import { TrendingUp, Receipt, IndianRupee } from 'lucide-react';

interface SummaryCardProps {
  totalRevenue: number;
  cgst: number;
  sgst: number;
  totalGst: number;
}

export default function SummaryCard({ totalRevenue, cgst, sgst, totalGst }: SummaryCardProps) {
  const metrics = [
    {
      label: 'Total Revenue',
      value: formatAmount(totalRevenue),
      icon: TrendingUp,
      color: 'text-saffron',
      bg: 'bg-saffron/10',
      highlight: true,
    },
    {
      label: 'Total GST Collected',
      value: formatAmount(totalGst),
      icon: IndianRupee,
      color: 'text-navy',
      bg: 'bg-navy/10',
      highlight: false,
    },
    {
      label: 'CGST @ 9%',
      value: formatAmount(cgst),
      icon: Receipt,
      color: 'text-navy',
      bg: 'bg-navy/5',
      highlight: false,
    },
    {
      label: 'SGST @ 9%',
      value: formatAmount(sgst),
      icon: Receipt,
      color: 'text-navy',
      bg: 'bg-navy/5',
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {metrics.map(({ label, value, icon: Icon, color, bg, highlight }) => (
        <Card
          key={label}
          className={`border-border shadow-sm transition-shadow hover:shadow-md ${
            highlight ? 'border-saffron/30 bg-saffron/5' : ''
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
                <p className={`text-2xl font-bold ${highlight ? 'text-saffron' : 'text-navy'}`}>
                  {value}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
