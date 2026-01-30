import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, User, Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['employer', 'candidate']),
  organizationName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'employer') {
    return data.organizationName && data.organizationName.length >= 2;
  }
  return true;
}, {
  message: 'Organization name is required for employers',
  path: ['organizationName'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'candidate',
      organizationName: '',
    },
  });

  const watchRole = signupForm.watch('role');

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in.');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await signUp(data.email, data.password, {
      full_name: data.fullName,
      role: data.role,
      organization_name: data.role === 'employer' ? data.organizationName : undefined,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists.');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    setSuccessMessage('Account created! Please check your email to verify your account.');
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 card-elevated">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Welcome to CCAT</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm rounded-lg bg-success/10 text-success">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginForm.register('password')}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
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
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...signupForm.register('email')}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup
                  value={watchRole}
                  onValueChange={(value: 'employer' | 'candidate') => signupForm.setValue('role', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${watchRole === 'employer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                    <RadioGroupItem value="employer" id="employer" className="sr-only" />
                    <Building2 className="h-5 w-5 text-primary" />
                    <Label htmlFor="employer" className="cursor-pointer font-medium">Employer</Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${watchRole === 'candidate' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                    <RadioGroupItem value="candidate" id="candidate" className="sr-only" />
                    <User className="h-5 w-5 text-primary" />
                    <Label htmlFor="candidate" className="cursor-pointer font-medium">Candidate</Label>
                  </div>
                </RadioGroup>
              </div>

              {watchRole === 'employer' && (
                <div className="space-y-2 animate-fade-in">
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
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signupForm.register('password')}
                  />
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signupForm.register('confirmPassword')}
                  />
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
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
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
