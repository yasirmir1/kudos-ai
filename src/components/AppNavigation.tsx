import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, User, GraduationCap, FileText, Play, Target } from 'lucide-react';
import { AgeGroupSelector } from './AgeGroupSelector';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAgeGroup } = useAgeGroup();
  const { user } = useAuth();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: GraduationCap },
    { path: '/practice', label: 'Practice', icon: Play },
    { path: '/bootcamp', label: 'Bootcamp', icon: Target },
    { path: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/report', label: 'Report', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left section - Back button or Logo */}
          <div className="flex items-center space-x-4">
            {showBackButton ? (
              <Button variant="ghost" onClick={() => navigate(backButtonPath)}>
                {backButtonText}
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/343d37bc-a8af-452f-b2b9-250214aa6175.png" 
                  alt="Kudos Academy" 
                  className="h-16 w-auto"
                />
              </div>
            )}
          </div>

          {/* Center section - Title/Subtitle if provided */}
          {(title || subtitle) && (
            <div className="flex items-center space-x-3">
              <div>
                {title && <h1 className="text-xl font-bold">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
          )}

          {/* Right section - Navigation and Age Group Selector */}
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center justify-between flex-1 max-w-3xl mr-8 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center justify-start space-x-1 flex-1 max-w-32 pr-4",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Mobile Navigation Dropdown */}
            <div className="md:hidden">
              <select
                value={location.pathname}
                onChange={(e) => navigate(e.target.value)}
                className="px-3 py-2 text-sm border rounded-md bg-background"
              >
                {navigationItems.map((item) => (
                  <option key={item.path} value={item.path}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Group Selector */}
            <AgeGroupSelector />
          </div>
        </div>
      </div>
    </header>
  );
};