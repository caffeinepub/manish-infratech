import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShieldX, Building2 } from 'lucide-react';

export default function AccessDeniedScreen() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy mb-5 shadow-lg">
          <Building2 className="w-10 h-10 text-saffron" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">MANISH INFRATECH</h1>

        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 mt-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="w-7 h-7 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Your account is not authorized to access this application.
          </p>
          <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted/50 rounded px-2 py-1 break-all">
            {identity?.getPrincipal().toString()}
          </p>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Logout & Try Another Account
          </Button>
        </div>
      </div>
    </div>
  );
}
