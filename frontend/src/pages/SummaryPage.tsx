import { useGetAggregate } from '../hooks/useQueries';
import SummaryCard from '../components/SummaryCard';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function SummaryPage() {
  const { data, isLoading, refetch, isFetching } = useGetAggregate();

  const totalRevenue = data?.totalAmount ?? 0;
  const totalGst = data?.totalGst ?? 0;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Financial Summary</h1>
            <p className="text-sm text-muted-foreground">Overall revenue and GST breakdown</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-navy/20 text-navy hover:bg-navy hover:text-white gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <SummaryCard
          totalRevenue={totalRevenue}
          cgst={cgst}
          sgst={sgst}
          totalGst={totalGst}
        />
      )}

      {/* Info note */}
      <div className="mt-8 bg-navy/5 border border-navy/10 rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-navy mb-1">About GST Calculation</p>
        <p>All bills use 18% GST split equally as CGST (9%) + SGST (9%). Round-off adjustments are included in the final amounts.</p>
      </div>
    </div>
  );
}
