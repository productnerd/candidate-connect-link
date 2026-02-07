import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Package, Users, Zap, Check } from 'lucide-react';

interface EmployerBundleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bundles = [
  {
    type: 'employer_30',
    name: 'Starter',
    tests: 30,
    price: '€9',
    perTest: '€0.30',
    popular: false,
  },
  {
    type: 'employer_100',
    name: 'Professional',
    tests: 100,
    price: '€29',
    perTest: '€0.29',
    popular: true,
  },
  {
    type: 'employer_500',
    name: 'Enterprise',
    tests: 500,
    price: '€79',
    perTest: '€0.16',
    popular: false,
  },
];

export function EmployerBundleModal({ open, onOpenChange }: EmployerBundleModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCheckout = async (bundleType: string) => {
    setIsLoading(bundleType);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { bundle_type: bundleType },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 rounded-3xl blur-2xl opacity-60" />
          
          <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pt-8 pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Package className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-center mb-1">
                Test Bundles
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Purchase test credits for your team
              </p>
            </div>

            {/* Bundle Options */}
            <div className="px-6 py-6 space-y-3">
              {bundles.map((bundle) => (
                <div
                  key={bundle.type}
                  className={`relative rounded-xl border p-4 transition-all ${
                    bundle.popular
                      ? 'border-primary/40 bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border/60 bg-card/50 hover:border-primary/20'
                  }`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{bundle.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bundle.tests} tests • {bundle.perTest}/test
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-display font-bold text-primary">{bundle.price}</span>
                      <Button
                        size="sm"
                        variant={bundle.popular ? 'default' : 'outline'}
                        onClick={() => handleCheckout(bundle.type)}
                        disabled={isLoading !== null}
                      >
                        {isLoading === bundle.type ? 'Processing...' : 'Buy'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <p className="text-center text-xs text-muted-foreground">
                Secure checkout • Opens in new tab
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
