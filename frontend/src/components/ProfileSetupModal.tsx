import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile({ name: name.trim() });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-saffron" />
          </div>
          <h1 className="text-2xl font-bold text-navy">Welcome to Manish Infratech</h1>
          <p className="text-muted-foreground text-sm mt-1">Set up your owner profile to get started</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Your Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="border-border focus:border-saffron"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="w-full bg-navy hover:bg-navy-dark text-white font-semibold rounded-xl"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to App'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
