import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AgeGroupProvider } from "./contexts/AgeGroupContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AppNavigation } from "./components/AppNavigation";
import { TrialProtectedRoute } from "./components/TrialProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Analytics from "./pages/Analytics";
import Curriculum from "./pages/Curriculum";
import Report from "./pages/Report";
import Bootcamp from "./pages/Bootcamp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component that conditionally shows navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showNavigation = !["/", "/auth"].includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {showNavigation && <AppNavigation />}
      {children}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AgeGroupProvider>
          <AccessibilityProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={
                    <TrialProtectedRoute requiredFeature="daily_mode">
                      <Dashboard />
                    </TrialProtectedRoute>
                  } />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/report" element={
                    <TrialProtectedRoute requiredFeature="daily_mode">
                      <Report />
                    </TrialProtectedRoute>
                  } />
                  
                  <Route path="/bootcamp" element={
                    <TrialProtectedRoute requiredFeature="bootcamp">
                      <Bootcamp />
                    </TrialProtectedRoute>
                  } />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </AccessibilityProvider>
        </AgeGroupProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
