import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, ShieldCheck } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-saffron/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-navy/5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy mb-5 shadow-lg">
            <Building2 className="w-10 h-10 text-saffron" />
          </div>
          <h1 className="text-3xl font-bold text-navy tracking-tight">MANISH INFRATECH</h1>
          <p className="text-muted-foreground mt-2 text-sm">Billing & Invoice Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-saffron" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Secure Access</h2>
              <p className="text-xs text-muted-foreground">Owner-only application</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            This application is restricted to the registered owner. Please log in with your Internet Identity to continue.
          </p>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-navy hover:bg-navy-dark text-white font-semibold py-3 rounded-xl transition-all"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by Internet Computer · Decentralized & Secure
        </p>
      </div>
    </div>
  );
}
