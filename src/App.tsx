import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SendInvitation from "./pages/SendInvitation";
import TestLibrary from "./pages/TestLibrary";
import Practice from "./pages/Practice";
import StartPracticeTest from "./pages/StartPracticeTest";
import PracticeSession from "./pages/PracticeSession";
import PracticeResults from "./pages/PracticeResults";
import TakeTest from "./pages/TakeTest";
import TestSession from "./pages/TestSession";
import TestResults from "./pages/TestResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to employer landing */}
            <Route path="/" element={<Navigate to="/employer" replace />} />
            
            {/* Landing pages - redirect to dashboard if logged in */}
            <Route path="/employer" element={<PublicRoute><Index /></PublicRoute>} />
            <Route path="/candidate" element={<PublicRoute><Practice /></PublicRoute>} />
            
            {/* Auth routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/:role" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Candidate practice test flow (doesn't require auth) */}
            <Route path="/candidate/start" element={<StartPracticeTest />} />
            <Route path="/candidate/session/:sessionId" element={<PracticeSession />} />
            <Route path="/candidate/results/:sessionId" element={<PracticeResults />} />
            
            {/* Invited test-taking routes (anonymous) */}
            <Route path="/test/:token" element={<TakeTest />} />
            <Route path="/test/:token/session/:sessionId" element={<TestSession />} />
            <Route path="/test/:token/results/:sessionId" element={<TestResults />} />
            
            {/* Protected routes - single dashboard route that renders based on role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invite" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <SendInvitation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tests" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <TestLibrary />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
