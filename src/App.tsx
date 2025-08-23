import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AgeGroupProvider } from "./contexts/AgeGroupContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { TrialModalProvider, useTrialModal } from "./contexts/TrialModalContext";
import { SubscriptionOverlayProvider } from "./contexts/SubscriptionOverlayContext";
import { AppNavigation } from "./components/AppNavigation";
import { SubscriptionOverlay } from "./components/SubscriptionOverlay";
import { UnifiedTrialModal } from "./components/UnifiedTrialModal";
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
import Tutorial from "./pages/Tutorial";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Session persistence tracker component
const SessionTracker = () => {
  const { user, session, loading } = useAuth();
  
  useEffect(() => {
    // Add global data attributes to track auth state
    const isAuthenticated = !!(user && session && !loading);
    document.documentElement.setAttribute('data-user-authenticated', isAuthenticated.toString());
    
    if (user) {
      document.documentElement.setAttribute('data-user-id', user.id);
    } else {
      document.documentElement.removeAttribute('data-user-id');
    }
  }, [user, session, loading]);
  
  return null;
};

// Layout component that conditionally shows navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showNavigation = !["/", "/auth"].includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <SessionTracker />
      {showNavigation && <AppNavigation />}
      {children}
      <TrialModalManager />
    </div>
  );
};

const TrialModalManager = () => {
  const { isOpen, closeTrialModal, planId, requiredFeature, mode } = useTrialModal();
  
  return (
    <UnifiedTrialModal 
      isOpen={isOpen}
      onClose={closeTrialModal}
      planId={planId}
      requiredFeature={requiredFeature}
      mode={mode}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionOverlayProvider>
          <TrialModalProvider>
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
                    <SubscriptionOverlay requiredFeature="daily_mode">
                      <Dashboard />
                    </SubscriptionOverlay>
                  } />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/report" element={
                    <SubscriptionOverlay requiredFeature="daily_mode">
                      <Report />
                    </SubscriptionOverlay>
                  } />
                  <Route path="/practice" element={
                    <SubscriptionOverlay requiredFeature="daily_mode">
                      <Practice />
                    </SubscriptionOverlay>
                  } />
                  <Route path="/analytics" element={
                    <SubscriptionOverlay requiredFeature="daily_mode">
                      <Analytics />
                    </SubscriptionOverlay>
                  } />
                  <Route path="/curriculum" element={
                    <SubscriptionOverlay requiredFeature="daily_mode">
                      <Curriculum />
                    </SubscriptionOverlay>
                  } />
                  
                  <Route path="/bootcamp" element={
                    <SubscriptionOverlay requiredFeature="bootcamp">
                      <Bootcamp />
                    </SubscriptionOverlay>
                  } />
                  
                  <Route path="/tutorial" element={<Tutorial />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
              </AccessibilityProvider>
            </AgeGroupProvider>
          </TrialModalProvider>
        </SubscriptionOverlayProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
