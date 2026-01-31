import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Building2, 
  User, 
  Mail, 
  AlertCircle, 
  CheckCircle2,
  Brain,
  Infinity,
  Package
} from 'lucide-react';

// Candidate schema - just email and name
const candidateSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

// Employer schema - includes organization
const employerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name is required'),
});

type CandidateFormData = z.infer<typeof candidateSchema>;
type EmployerFormData = z.infer<typeof employerSchema>;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const { signUp } = useAuth();

  // Get payment details from URL
  const bundleType = searchParams.get('bundle_type') || '';
  const sessionId = searchParams.get('session_id') || '';
  
  const isEmployer = bundleType.startsWith('employer_');
  const isCandidate = bundleType === 'candidate_unlimited';

  // Bundle info display
  const getBundleInfo = () => {
    switch (bundleType) {
      case 'candidate_unlimited':
        return { name: 'Unlimited Practice Tests', icon: Infinity, price: '€14' };
      case 'employer_30':
        return { name: '30 Test Bundle', icon: Package, price: '€9' };
      case 'employer_100':
        return { name: '100 Test Bundle', icon: Package, price: '€29' };
      case 'employer_500':
        return { name: '500 Test Bundle', icon: Package, price: '€79' };
      default:
        return { name: 'Test Bundle', icon: Package, price: '' };
    }
  };

  const bundleInfo = getBundleInfo();
  const BundleIcon = bundleInfo.icon;

  // Candidate form
  const candidateForm = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      email: '',
      fullName: '',
    },
  });

  // Employer form
  const employerForm = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      organizationName: '',
    },
  });

  // Verify payment and get customer email on mount
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data?.email) {
          setCustomerEmail(data.email);
          candidateForm.setValue('email', data.email);
          employerForm.setValue('email', data.email);
        }

        // Send confirmation email in background
        if (data?.email && bundleType) {
          const signupUrl = window.location.href;
          supabase.functions.invoke('send-payment-confirmation', {
            body: {
              email: data.email,
              bundle_type: bundleType,
              signup_url: signupUrl,
            },
          }).catch((err) => {
            console.error('Failed to send confirmation email:', err);
          });
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setVerificationError('Failed to verify payment. Please contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, bundleType, candidateForm, employerForm]);

  const handleCandidateSignup = async (data: CandidateFormData) => {
    setIsLoading(true);
    setError(null);

    const { error } = await signUp(data.email, {
      full_name: data.fullName,
      role: 'candidate',
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSentEmail(data.email);
    setMagicLinkSent(true);
    setIsLoading(false);
  };

  const handleEmployerSignup = async (data: EmployerFormData) => {
    setIsLoading(true);
    setError(null);

    const { error } = await signUp(data.email, {
      full_name: data.fullName,
      role: 'employer',
      organization_name: data.organizationName,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSentEmail(data.email);
    setMagicLinkSent(true);
    setIsLoading(false);
  };

  // Loading state while verifying payment
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Verification error state
  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="relative max-w-md w-full">
          <div className="absolute -inset-4 bg-gradient-to-br from-destructive/30 via-destructive/10 to-destructive/30 rounded-3xl blur-2xl opacity-60" />
          <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-destructive/20 shadow-2xl p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-6">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">{verificationError}</p>
            <Button variant="hero" asChild>
              <Link to="/employer">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - magic link sent
  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="relative max-w-md w-full">
          {/* Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 rounded-3xl blur-2xl opacity-60" />
          
          {/* Card */}
          <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-success/10 text-success mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a magic link to <strong className="text-foreground">{sentEmail}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in your email to verify and access your account.
            </p>
            <Button 
              variant="hero" 
              onClick={() => {
                setMagicLinkSent(false);
                setSentEmail('');
                candidateForm.reset({ email: customerEmail, fullName: '' });
                employerForm.reset({ email: customerEmail, fullName: '', organizationName: '' });
              }}
            >
              Use a different email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="relative max-w-md w-full">
        {/* Background Glow Effects */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 rounded-3xl blur-2xl opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/40 rounded-full blur-3xl" />
        
        {/* Card */}
        <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pt-8 pb-6">
            {/* Success Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Payment Successful!
              </div>
            </div>
            
            {/* Bundle Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                  <BundleIcon className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-display font-bold text-center mb-1">
              {bundleInfo.name}
            </h3>
            <p className="text-center text-muted-foreground text-sm">
              {isEmployer ? 'Complete your account to access your tests' : 'Complete your account to start practicing'}
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isCandidate && (
              <form onSubmit={candidateForm.handleSubmit(handleCandidateSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="candidate-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      {...candidateForm.register('fullName')}
                    />
                  </div>
                  {candidateForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{candidateForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="candidate-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...candidateForm.register('email')}
                    />
                  </div>
                  {candidateForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{candidateForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send you a magic link to verify your email and complete signup.
                </p>
              </form>
            )}

            {isEmployer && (
              <form onSubmit={employerForm.handleSubmit(handleEmployerSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employer-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employer-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      {...employerForm.register('fullName')}
                    />
                  </div>
                  {employerForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{employerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer-email">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employer-email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10"
                      {...employerForm.register('email')}
                    />
                  </div>
                  {employerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{employerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer-org">Organization Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employer-org"
                      type="text"
                      placeholder="Acme Inc."
                      className="pl-10"
                      {...employerForm.register('organizationName')}
                    />
                  </div>
                  {employerForm.formState.errors.organizationName && (
                    <p className="text-sm text-destructive">{employerForm.formState.errors.organizationName.message}</p>
                  )}
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send you a magic link to verify your email and complete signup.
                </p>
              </form>
            )}

            {/* If no bundle type, show generic message */}
            {!isCandidate && !isEmployer && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Your payment was successful! Please sign in to access your account.
                </p>
                <Button variant="hero" asChild>
                  <Link to="/auth/employer">Go to Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              <span>CCAT Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}