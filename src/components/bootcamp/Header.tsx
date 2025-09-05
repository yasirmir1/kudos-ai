import React from 'react';
import { Sun, School, Award, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentMode: 'daily' | 'bootcamp';
  onModeChange: (mode: 'daily' | 'bootcamp') => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onSignOut
}) => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-primary">KUDOS</h1>
          <div className="flex items-center bg-muted rounded-full p-1">
            <Button
              variant={currentMode === 'daily' ? 'ghost' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('daily')}
              className={`px-4 py-1 text-sm flex items-center rounded-full transition-colors ${
                currentMode === 'daily' 
                  ? 'text-muted-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="h-4 w-4 mr-2" />
              Daily Mode
            </Button>
            <Button
              variant={currentMode === 'bootcamp' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('bootcamp')}
              className={`px-4 py-1 text-sm flex items-center rounded-full transition-colors ${
                currentMode === 'bootcamp' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <School className="h-4 w-4 mr-2" />
              Bootcamp
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <a className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors" href="#">
            <Award className="h-4 w-4 mr-1" />
            Pass Plus
          </a>
          <a className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors" href="#">
            <User className="h-4 w-4 mr-1" />
            Profile
          </a>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};