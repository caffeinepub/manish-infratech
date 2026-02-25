import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetPartySummary,
  useGetPartySummaryByDateRange,
  useSavePartyGstNumber,
} from '../hooks/useQueries';
import type { PartySummary } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatAmount } from '../utils/formatCurrency';
import {
  Users,
  CalendarRange,
  Pencil,
  Check,
  X,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

function dateToNanoseconds(dateStr: string): bigint {
  if (!dateStr) return BigInt(0);
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

interface GstEditState {
  partyName: string;
  value: string;
}

export default function PartySummaryPage() {
  const navigate = useNavigate();

  // Date filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterFrom, setFilterFrom] = useState<bigint | null>(null);
  const [filterTo, setFilterTo] = useState<bigint | null>(null);
  const isFiltered = filterFrom !== null || filterTo !== null;

  // GST edit state
  const [gstEdit, setGstEdit] = useState<GstEditState | null>(null);

  const { data: allSummary, isLoading: allLoading, refetch: refetchAll, isFetching: allFetching } = useGetPartySummary();
  const { data: filteredSummary, isLoading: filteredLoading, isFetching: filteredFetching } = useGetPartySummaryByDateRange(
    filterFrom,
    filterTo,
  );

  const { mutate: saveGst, isPending: savingGst } = useSavePartyGstNumber();

  const summaryData: PartySummary[] = isFiltered ? (filteredSummary ?? []) : (allSummary ?? []);
  const isLoading = isFiltered ? filteredLoading : allLoading;
  const isFetching = isFiltered ? filteredFetching : allFetching;

  const handleApplyFilter = () => {
    const from = fromDate ? dateToNanoseconds(fromDate) : null;
    const to = toDate ? dateToNanoseconds(toDate + 'T23:59:59') : null;
    setFilterFrom(from);
    setFilterTo(to);
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
    setFilterFrom(null);
    setFilterTo(null);
  };

  const handleSaveGst = (partyName: string) => {
    if (!gstEdit || gstEdit.partyName !== partyName) return;
    saveGst(
      { partyName, gstNumber: gstEdit.value.trim() },
      {
        onSuccess: () => {
          toast.success(`GST number saved for ${partyName}`);
          setGstEdit(null);
          refetchAll();
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Failed to save GST number';
          toast.error(msg);
        },
      }
    );
  };

  const handleViewReport = (partyName: string) => {
    navigate({ to: '/company-report', search: { party: partyName } });
  };

  // Totals
  const totalBilled = summaryData.reduce((s, p) => s + p.totalBilled, 0);
  const totalPaid = summaryData.reduce((s, p) => s + p.totalPaid, 0);
  const totalPending = summaryData.reduce((s, p) => s + p.totalPending, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Party Summary</h1>
            <p className="text-sm text-muted-foreground">Company-wise billing overview with payment status</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchAll()}
          disabled={isFetching}
          className="border-navy/20 text-navy hover:bg-navy hover:text-white gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Date Filter */}
      <div className="bg-navy/5 border border-navy/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarRange className="w-4 h-4 text-navy" />
          <span className="text-sm font-medium text-navy">Filter by Date Range</span>
          {isFiltered && (
            <Badge variant="secondary" className="bg-saffron/20 text-saffron border-0 text-xs">
              Filtered
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 text-sm border-navy/20 focus-visible:ring-saffron/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 text-sm border-navy/20 focus-visible:ring-saffron/40"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleApplyFilter}
              className="bg-navy hover:bg-navy-dark text-white flex-1"
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearFilter}
              className="border-navy/20 text-navy hover:bg-navy/5"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Totals */}
      {!isLoading && summaryData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-navy/5 border border-navy/10 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
            <p className="text-xl font-bold text-navy">{formatAmount(totalBilled)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-600 mb-1">Total Paid</p>
            <p className="text-xl font-bold text-green-700">{formatAmount(totalPaid)}</p>
          </div>
          <div className={`border rounded-xl p-4 ${totalPending > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-xs mb-1 ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>Total Pending</p>
            <p className={`text-xl font-bold ${totalPending > 0 ? 'text-red-700' : 'text-green-700'}`}>{formatAmount(totalPending)}</p>
          </div>
        </div>
      )}

      {/* Party Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : summaryData.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No party data found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add bills to see party summaries here</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy/5 hover:bg-navy/5">
                <TableHead className="font-semibold text-navy whitespace-nowrap">Party Name</TableHead>
                <TableHead className="font-semibold text-navy whitespace-nowrap">GST Number</TableHead>
                <TableHead className="font-semibold text-navy text-center whitespace-nowrap">Bills</TableHead>
                <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Total Billed</TableHead>
                <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Paid</TableHead>
                <TableHead className="font-semibold text-navy text-right whitespace-nowrap">Pending</TableHead>
                <TableHead className="font-semibold text-navy text-center whitespace-nowrap">Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((party, idx) => (
                <TableRow
                  key={party.partyName}
                  className={idx % 2 === 0 ? 'bg-background' : 'bg-navy/[0.02]'}
                >
                  <TableCell className="font-medium text-navy whitespace-nowrap">
                    {party.partyName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {gstEdit?.partyName === party.partyName ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={gstEdit.value}
                          onChange={(e) => setGstEdit({ ...gstEdit, value: e.target.value })}
                          className="h-7 text-xs w-40 border-saffron/50 focus-visible:ring-saffron/40"
                          placeholder="Enter GST number"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:bg-green-50"
                          onClick={() => handleSaveGst(party.partyName)}
                          disabled={savingGst}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:bg-muted"
                          onClick={() => setGstEdit(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-mono ${party.gstNumber ? 'text-navy' : 'text-muted-foreground/50 italic'}`}>
                          {party.gstNumber || 'Not set'}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground hover:text-saffron hover:bg-saffron/10"
                          onClick={() => setGstEdit({ partyName: party.partyName, value: party.gstNumber })}
                          title="Edit GST number"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {Number(party.billCount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-navy whitespace-nowrap">
                    {formatAmount(party.totalBilled)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-700 whitespace-nowrap">
                    {formatAmount(party.totalPaid)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold whitespace-nowrap ${party.totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {party.totalPending > 0 ? formatAmount(party.totalPending) : '✓ Settled'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReport(party.partyName)}
                      className="h-7 text-xs border-navy/20 text-navy hover:bg-navy hover:text-white gap-1"
                    >
                      <Building2 className="w-3 h-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
