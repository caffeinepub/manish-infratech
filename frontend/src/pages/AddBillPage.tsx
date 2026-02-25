import AddBillForm from '../components/AddBillForm';
import { PlusCircle } from 'lucide-react';

export default function AddBillPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Add New Bill</h1>
            <p className="text-sm text-muted-foreground">Create a new invoice with GST calculation</p>
          </div>
        </div>
      </div>

      <AddBillForm />
    </div>
  );
}
