import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Package, Building2, CheckCircle } from 'lucide-react';

interface EmployerBundleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const employerBundles = [
  { tests: 30, price: 9, perTest: '€0.30', bundleType: 'employer_30' },
  { tests: 100, price: 29, perTest: '€0.29', popular: true, bundleType: 'employer_100' },
  { tests: 500, price: 79, perTest: '€0.16', bundleType: 'employer_500' },
];

export function EmployerBundleModal({ open, onOpenChange }: EmployerBundleModalProps) {
  const [selectedBundle, setSelectedBundle] = useState<number | null>(1); // Default to best value
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (selectedBundle === null) {
      toast.error('Please select a bundle');
      return;
    }

    setIsLoading(true);
    try {
      const bundle = employerBundles[selectedBundle];
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { bundle_type: bundle.bundleType },
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div className="relative">
          {/* Background Glow Effects */}
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 rounded-3xl blur-2xl opacity-60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/40 rounded-full blur-3xl" />

          {/* Card */}
          <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Header Gradient */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pt-8 pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Building2 className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-center mb-1">
                Test Bundles
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Purchase tests in bulk and save
              </p>
            </div>

            {/* Bundles */}
            <div className="px-6 py-6 space-y-3">
              {employerBundles.map((bundle, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedBundle(index)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                    selectedBundle === index
                      ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10 ring-2 ring-primary/30'
                      : 'bg-muted/30 border-border/50 hover:border-primary/20'
                  }`}
                >
                  {bundle.popular && (
                    <span className="absolute -top-2 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wider rounded-full">
                      Best Value
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedBundle === index ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <Package className={`h-5 w-5 ${selectedBundle === index ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{bundle.tests} Tests</p>
                        <p className="text-xs text-muted-foreground">{bundle.perTest} per test</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-primary">€{bundle.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Never expires
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Full analytics
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Team access
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <Button
                className="w-full h-12 text-base shadow-lg shadow-primary/20"
                size="lg"
                onClick={handleCheckout}
                disabled={isLoading || selectedBundle === null}
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Checkout
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Secure checkout • Opens in new tab
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
