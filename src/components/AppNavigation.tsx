import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, User, GraduationCap, FileText, Play, Target, Calendar, CreditCard, LogOut, Clock, Crown, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialModal } from '@/contexts/TrialModalContext';
import { cn } from '@/lib/utils';
import HelpCenter from '@/components/bootcamp/HelpCenter';
interface AppNavigationProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}
export const AppNavigation: React.FC<AppNavigationProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonText = "Back",
  backButtonPath = "/dashboard"
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    signOut
  } = useAuth();
  const {
    userState,
    loading,
    isTrialActive,
    trialDaysRemaining,
    isTrialExpired,
    hasAccessTo
  } = useSubscription();
  const { openTrialModal } = useTrialModal();
  const handleLogout = async () => {
    const {
      error
    } = await signOut();
    if (!error) {
      navigate('/auth');
    }
  };

  // Determine which navigation items to show based on current route
  const isBootcampRoute = location.pathname.startsWith('/bootcamp');

  // Check if trial is expired and require payment
  const shouldShowUpgrade = isTrialExpired || userState === 'pass' && isBootcampRoute;
  const handleUpgradeClick = () => {
    const planId = isBootcampRoute ? 'pass_plus' : 'pass';
    const requiredFeature = isBootcampRoute ? 'bootcamp' : 'daily_mode';
    openTrialModal({
      planId,
      requiredFeature,
      mode: 'upgrade'
    });
  };
  // Remove help from navigation items and handle it separately
  const mainAppItems = [
    {
      path: '/profile',
      label: 'Profile',
      icon: User
    }
  ];
  const bootcampItems = [
    {
      path: '/profile',
      label: 'Profile',
      icon: User
    }
  ];

  // Show bootcamp items when in bootcamp, main app items otherwise
  const navigationItems = isBootcampRoute ? bootcampItems : mainAppItems;

  // Get plan display info
  const getPlanDisplay = () => {
    // Check if user is in trial period
    if (isTrialActive) {
      const daysText = trialDaysRemaining === 1 ? 'day' : 'days';
      return {
        text: `Trial: ${trialDaysRemaining} ${daysText} left`,
        variant: 'secondary' as const,
        icon: Clock
      };
    }

    // Check subscription state from database
    switch (userState) {
      case 'pass':
        return {
          text: 'Pass',
          variant: 'default' as const,
          icon: Calendar
        };
      case 'pass_plus':
        return {
          text: 'Pass Plus',
          variant: 'default' as const,
          icon: Crown
        };
      case 'expired':
        return {
          text: 'Trial Expired',
          variant: 'destructive' as const,
          icon: Clock
        };
      default:
        // Default to Trial for any other state
        return {
          text: 'Trial',
          variant: 'secondary' as const,
          icon: Clock
        };
    }
  };
  const planDisplay = getPlanDisplay();

  // Add a system switcher button
  const switchToOtherSystem = () => {
    if (isBootcampRoute) {
      navigate('/dashboard');
    } else {
      navigate('/bootcamp');
    }
  };
  const isActivePath = (path: string) => location.pathname === path;
  return <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-0 py-[15px] pr-12">
        <div className="flex justify-between items-center">
          {/* Left section - Back button or Logo */}
          <div className="flex items-center space-x-4">
            {showBackButton ? <Button variant="ghost" onClick={() => navigate(backButtonPath)}>
                {backButtonText}
              </Button> : <button 
                onClick={() => navigate('/')} 
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <img src="/lovable-uploads/343d37bc-a8af-452f-b2b9-250214aa6175.png" alt="Kudos Academy" className="h-16 w-auto" />
              </button>}
          </div>

          {/* Center section - Mode Toggle or Title/Subtitle */}
          <div className="flex-1 flex justify-center items-center">
            {/* Mode Toggle Switch - Always centered */}
            <div className="bg-muted p-1 rounded-full flex items-center">
              <Button 
                variant={!isBootcampRoute ? "default" : "ghost"} 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  !isBootcampRoute 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Daily Mode</span>
              </Button>
              <Button 
                variant={isBootcampRoute ? "default" : "ghost"} 
                size="sm" 
                onClick={() => navigate('/bootcamp')}
                className={cn(
                  "flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  isBootcampRoute 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Target className="h-4 w-4" />
                <span>Bootcamp</span>
              </Button>
            </div>
            
            {/* Title/Subtitle if provided - will be below toggle */}
            {(title || subtitle) && <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
                {title && <h1 className="text-xl font-bold">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>}
          </div>

          {/* Right section - Navigation and Trial Indicator */}
          <div className="flex items-center space-x-3">
            {/* Upgrade Button for limited access */}
            {shouldShowUpgrade && <Button variant="destructive" size="sm" onClick={handleUpgradeClick} className="flex items-center space-x-2 px-4 py-2">
                <CreditCard className="h-4 w-4" />
                <span>{isTrialExpired ? 'Upgrade Now' : 'Upgrade to Plus'}</span>
              </Button>}

            {/* Plan Status Indicator - Always show */}
            <div className="hidden md:flex items-center">
              <Badge variant={planDisplay.variant} className="flex items-center space-x-1 px-3 py-1">
                <planDisplay.icon className="h-3 w-3" />
                <span className="text-xs font-medium">{planDisplay.text}</span>
              </Badge>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return <Button key={item.path} variant={isActive ? "default" : "ghost"} size="sm" onClick={() => navigate(item.path)} className={cn("flex items-center space-x-2 px-4 py-2 min-w-[100px] justify-center", isActive && "bg-primary text-primary-foreground")}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>;
            })}
              
              {/* Logout Button - Icon only */}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center justify-center px-3 py-2 w-auto" title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>

            {/* Mobile Navigation Dropdown */}
            <div className="md:hidden">
              <select value={location.pathname} onChange={e => {
              if (e.target.value === 'logout') {
                handleLogout();
              } else {
                navigate(e.target.value);
              }
            }} className="px-3 py-2 text-sm border rounded-md bg-background">
                {navigationItems.map(item => <option key={item.path} value={item.path}>
                    {item.label}
                  </option>)}
                <option value="logout">Logout</option>
              </select>
            </div>

          </div>
        </div>
      </div>
      
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsHelpOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[90vh]">
            <HelpCenter />
          </div>
        </DialogContent>
      </Dialog>
    </header>;
};