import React from 'react';
import { Target, Zap, Calendar, Star, Award, Trophy } from 'lucide-react';
import { achievementSystem } from '@/lib/bootcamp-data';

interface Badge {
  name: string;
  description: string;
  earned: boolean;
  progress?: number;
  earnedDate?: string;
}

interface AchievementBadgesProps {
  userBadges: Badge[];
}

const iconMap = {
  target: Target,
  crosshair: Target,
  shield: Star,
  zap: Zap,
  clock: Target,
  timer: Target,
  flame: Zap,
  calendar: Calendar,
  crown: Star,
  star: Star,
  award: Award,
  trophy: Trophy
};

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ userBadges }) => {
  const allBadges = [
    ...achievementSystem.badges.accuracy_badges,
    ...achievementSystem.badges.speed_badges,
    ...achievementSystem.badges.streak_badges,
    ...achievementSystem.badges.mastery_badges
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Achievement Badges</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allBadges.map((badge, index) => {
          const userBadge = userBadges.find(ub => ub.name === badge.name);
          const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Star;
          const isEarned = userBadge?.earned || false;
          
          return (
            <div 
              key={index} 
              className={`text-center p-4 rounded-lg border transition-all ${
                isEarned 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                isEarned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <IconComponent className="h-6 w-6" />
              </div>
              
              <h4 className={`text-sm font-medium mb-1 ${
                isEarned ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {badge.name}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-2">
                {badge.requirement}
              </p>
              
              {userBadge?.progress !== undefined && !isEarned && (
                <div className="w-full bg-muted rounded-full h-1 mb-2">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${userBadge.progress}%` }}
                  />
                </div>
              )}
              
              {isEarned && userBadge?.earnedDate && (
                <p className="text-xs text-success">
                  Earned {userBadge.earnedDate}
                </p>
              )}
              
              {!isEarned && userBadge?.progress !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {userBadge.progress}% complete
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Points System</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
          <div>
            <div className="font-semibold text-foreground">+{achievementSystem.points_system.correct_answer}</div>
            <div className="text-muted-foreground">Correct Answer</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">+{achievementSystem.points_system.speed_bonus}</div>
            <div className="text-muted-foreground">Speed Bonus</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">x{achievementSystem.points_system.streak_multiplier.max}</div>
            <div className="text-muted-foreground">Max Streak</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">+{achievementSystem.points_system.challenge_completion}</div>
            <div className="text-muted-foreground">Challenge</div>
          </div>
        </div>
      </div>
    </div>
  );
};