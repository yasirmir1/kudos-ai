import React, { useState } from 'react';
import { Trophy, Star, Target, Calendar, Lock, Gift, Medal, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'practice' | 'accuracy' | 'streak' | 'special';
  icon: React.ComponentType<{
    className?: string;
  }>;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward?: {
    type: 'points' | 'badge' | 'unlock';
    value: number | string;
  };
}
const achievements: Achievement[] = [{
  id: 'first-steps',
  title: 'First Steps',
  description: 'Complete your first practice session',
  category: 'practice',
  icon: Target,
  unlocked: true,
  unlockedAt: '2024-01-10',
  rarity: 'common',
  reward: {
    type: 'points',
    value: 50
  }
}, {
  id: 'perfect-ten',
  title: 'Perfect Ten',
  description: 'Get 10 questions correct in a row',
  category: 'accuracy',
  icon: Star,
  unlocked: true,
  unlockedAt: '2024-01-12',
  rarity: 'rare',
  reward: {
    type: 'points',
    value: 200
  }
}, {
  id: 'week-warrior',
  title: 'Week Warrior',
  description: 'Practice for 7 days in a row',
  category: 'streak',
  icon: Calendar,
  unlocked: false,
  progress: 4,
  maxProgress: 7,
  rarity: 'epic',
  reward: {
    type: 'badge',
    value: 'Dedicated Learner'
  }
}, {
  id: 'math-master',
  title: 'Math Master',
  description: 'Complete all topic modules',
  category: 'special',
  icon: Crown,
  unlocked: false,
  progress: 8,
  maxProgress: 12,
  rarity: 'legendary',
  reward: {
    type: 'unlock',
    value: 'Advanced Practice Mode'
  }
}];
const AchievementCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const getRarityStyle = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-muted text-muted-foreground';
      case 'rare':
        return 'bg-primary/10 text-primary';
      case 'epic':
        return 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground';
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const filteredAchievements = achievements.filter(achievement => selectedCategory === 'all' || achievement.category === selectedCategory);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  return <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Achievement Center</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">
                {unlockedCount} of {totalCount} Unlocked
              </p>
              <Progress value={unlockedCount / totalCount * 100} className="w-48 mt-1" />
            </div>
          </div>
          
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map(achievement => <AchievementCard key={achievement.id} achievement={achievement} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
interface AchievementCardProps {
  achievement: Achievement;
}
const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement
}) => {
  const {
    icon: Icon,
    unlocked,
    progress,
    maxProgress,
    rarity
  } = achievement;
  const getRarityStyle = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-muted text-muted-foreground';
      case 'rare':
        return 'bg-primary/10 text-primary';
      case 'epic':
        return 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground';
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  return <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${unlocked ? 'bg-card' : 'bg-muted/30'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`h-6 w-6 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <Badge className={getRarityStyle(rarity)}>
            {rarity}
          </Badge>
        </div>
        <CardTitle className={`text-lg ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
          {achievement.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className={`text-sm mb-4 ${unlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
          {achievement.description}
        </p>

        {!unlocked && progress !== undefined && maxProgress && <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}/{maxProgress}</span>
            </div>
            <Progress value={progress / maxProgress * 100} className="h-2" />
          </div>}

        {unlocked && achievement.unlockedAt && <p className="text-xs text-muted-foreground mb-3">
            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>}

        {achievement.reward && <div className="bg-accent rounded-lg p-3">
            <p className="text-sm font-medium text-accent-foreground">Reward:</p>
            <p className="text-sm text-accent-foreground/80">
              {achievement.reward.type === 'points' && `${achievement.reward.value} points`}
              {achievement.reward.type === 'badge' && achievement.reward.value}
              {achievement.reward.type === 'unlock' && achievement.reward.value}
            </p>
          </div>}

        {!unlocked && <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>}
      </CardContent>
    </Card>;
};
export default AchievementCenter;