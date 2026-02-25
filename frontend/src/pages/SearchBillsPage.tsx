import { useState, useMemo } from 'react';
import { useGetAllBills } from '../hooks/useQueries';
import BillResultsTable from '../components/BillResultsTable';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchBillsPage() {
  const [keyword, setKeyword] = useState('');
  const { data: allBills = [], isLoading } = useGetAllBills();

  const filteredBills = useMemo(() => {
    if (!keyword.trim()) return allBills;
    const lower = keyword.toLowerCase();
    return allBills.filter(
      (bill) =>
        bill.partyName.toLowerCase().includes(lower) ||
        bill.invoiceNumber.toLowerCase().includes(lower)
    );
  }, [allBills, keyword]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Search Bills</h1>
            <p className="text-sm text-muted-foreground">
              {allBills.length} bill{allBills.length !== 1 ? 's' : ''} in total
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by party name or invoice number..."
          className="pl-10 pr-10 border-border focus-visible:ring-saffron/50"
        />
        {keyword && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setKeyword('')}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Results */}
      {keyword && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredBills.length} result{filteredBills.length !== 1 ? 's' : ''} for &quot;{keyword}&quot;
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <BillResultsTable
          bills={filteredBills}
          emptyMessage="No bills match your search."
        />
      )}
    </div>
  );
}
