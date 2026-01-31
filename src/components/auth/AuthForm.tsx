import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Building2, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
  role: 'employer' | 'candidate';
}

export function AuthForm({ role }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { signInWithMagicLink, signUp } = useAuth();

  const isEmployer = role === 'employer';
  const isCandidate = role === 'candidate';

  const signInForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      fullName: '',
      organizationName: '',
    },
  });

  const handleSignIn = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await signInWithMagicLink(data.email);
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSentEmail(data.email);
    setMagicLinkSent(true);
    setIsLoading(false);
  };

  const handleSignUp = async (data: SignupFormData) => {
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

  // Magic link sent confirmation
  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md shadow-xl border-0 card-elevated">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-success/10 text-success mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent a magic link to <strong className="text-foreground">{sentEmail}</strong>
          </p>
          <Button 
            variant="hero" 
            onClick={() => {
              setMagicLinkSent(false);
              setSentEmail('');
              signInForm.reset();
              signupForm.reset();
            }}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Candidate: Sign in only (no signup tab)
  if (isCandidate) {
    return (
      <Card className="w-full max-w-md shadow-xl border-0 card-elevated">
        <CardContent className="pt-6">

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...signInForm.register('email')}
                />
              </div>
              {signInForm.formState.errors.email && (
                <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
              )}
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We'll email you a secure link to sign in — no password needed.
            </p>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Employer: Sign in and Sign up tabs
  return (
    <Card className="w-full max-w-md shadow-xl border-0 card-elevated">
      <CardContent className="pt-6">
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <TabsContent value="signin">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employer-signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employer-signin-email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    {...signInForm.register('email')}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We'll email you a secure link to sign in — no password needed.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    {...signupForm.register('fullName')}
                  />
                </div>
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    {...signupForm.register('email')}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="org-name"
                    type="text"
                    placeholder="Acme Inc."
                    className="pl-10"
                    {...signupForm.register('organizationName')}
                  />
                </div>
                {signupForm.formState.errors.organizationName && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.organizationName.message}</p>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
