import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Zap, Shield, BarChart3, Infinity } from 'lucide-react';

interface CandidateBundleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateBundleModal({ open, onOpenChange }: CandidateBundleModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { bundle_type: 'candidate_unlimited' },
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
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
                    <Infinity className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-center mb-1">
                Unlimited Bundle
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Unlock your full potential
              </p>
            </div>

            {/* Price */}
            <div className="px-6 py-4 text-center border-b border-border/50">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-display font-bold text-primary">€14</span>
                <span className="text-muted-foreground">/lifetime</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">One-time payment, forever access</p>
            </div>

            {/* Features */}
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Infinity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Unlimited Practice Tests</p>
                  <p className="text-xs text-muted-foreground">Take as many tests as you need</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Detailed Analytics</p>
                  <p className="text-xs text-muted-foreground">Track your progress over time</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">All Question Categories</p>
                  <p className="text-xs text-muted-foreground">Cognitive, personality, skills & more</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Priority Support</p>
                  <p className="text-xs text-muted-foreground">Get help when you need it</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <Button 
                className="w-full h-12 text-base shadow-lg shadow-primary/20" 
                size="lg"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Unlimited Access
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
