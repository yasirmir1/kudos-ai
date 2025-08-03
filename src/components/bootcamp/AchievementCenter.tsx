import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Calendar, Lock, Gift, Medal, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBootcampData } from '@/hooks/useBootcampData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
// Achievement templates - keeping the same content but making them dynamic
const achievementTemplates: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [{
  id: 'first-steps',
  title: 'First Steps',
  description: 'Complete your first practice session',
  category: 'practice',
  icon: Target,
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
  maxProgress: 12,
  rarity: 'legendary',
  reward: {
    type: 'unlock',
    value: 'Advanced Practice Mode'
  }
}, {
  id: 'question-master',
  title: 'Question Master',
  description: 'Complete 100+ practice questions',
  category: 'practice',
  icon: Medal,
  maxProgress: 100,
  rarity: 'rare',
  reward: {
    type: 'points',
    value: 500
  }
}, {
  id: 'accuracy-master',
  title: 'Accuracy Master',
  description: 'Achieve 95% overall accuracy',
  category: 'accuracy',
  icon: Target,
  maxProgress: 95,
  rarity: 'epic',
  reward: {
    type: 'badge',
    value: 'Precision Expert'
  }
}];

const AchievementCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const { user } = useAuth();
  const { stats, student, progress } = useBootcampData();

  useEffect(() => {
    if (user && student) {
      loadUserAchievements();
    }
  }, [user, student, stats]);

  const loadUserAchievements = async () => {
    if (!student) return;

    try {
      // Fetch user's unlocked achievements from database
      const { data: userAchievements, error } = await supabase
        .from('bootcamp_achievements')
        .select('*')
        .eq('student_id', student.student_id);

      if (error) {
        console.error('Error fetching achievements:', error);
        setUnlockedAchievements([]);
      } else {
        setUnlockedAchievements(userAchievements || []);
      }

      // Calculate dynamic achievements based on current stats and progress
      const dynamicAchievements = calculateAchievements();
      setAchievements(dynamicAchievements);
      
      // Check for newly earned achievements
      await checkAndAwardNewAchievements(dynamicAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const calculateAchievements = (): Achievement[] => {
    return achievementTemplates.map(template => {
      const userAchievement = unlockedAchievements.find(ua => ua.achievement_type === template.id);
      const unlocked = !!userAchievement;
      
      let currentProgress = 0;
      
      // Calculate progress based on achievement type
      switch (template.id) {
        case 'first-steps':
          currentProgress = stats.totalQuestions > 0 ? 1 : 0;
          break;
        case 'question-master':
          currentProgress = stats.totalQuestions;
          break;
        case 'perfect-ten':
          // This would need streak tracking - simplified for now
          currentProgress = stats.accuracy >= 90 ? 10 : Math.floor(stats.accuracy / 10);
          break;
        case 'week-warrior':
          currentProgress = stats.streakDays;
          break;
        case 'accuracy-master':
          currentProgress = stats.accuracy;
          break;
        case 'math-master':
          currentProgress = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
          break;
        default:
          currentProgress = 0;
      }

      const maxProgress = template.maxProgress || 1;
      const isComplete = currentProgress >= maxProgress;
      
      return {
        ...template,
        unlocked: unlocked || isComplete,
        progress: !unlocked && !isComplete ? currentProgress : undefined,
        unlockedAt: userAchievement?.earned_at || (isComplete && !unlocked ? new Date().toISOString() : undefined)
      };
    });
  };

  const checkAndAwardNewAchievements = async (currentAchievements: Achievement[]) => {
    if (!student) return;

    for (const achievement of currentAchievements) {
      const alreadyAwarded = unlockedAchievements.some(ua => ua.achievement_type === achievement.id);
      
      if (achievement.unlocked && !alreadyAwarded) {
        // Award new achievement
        try {
          await supabase
            .from('bootcamp_achievements')
            .insert({
              student_id: student.student_id,
              achievement_type: achievement.id,
              achievement_name: achievement.title,
              points_awarded: typeof achievement.reward?.value === 'number' ? achievement.reward.value : 0,
              earned_at: new Date().toISOString()
            });

          console.log(`New achievement earned: ${achievement.title}`);
        } catch (error) {
          console.error('Error awarding achievement:', error);
        }
      }
    }
  };

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

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Achievement Center</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">
                {unlockedCount} of {totalCount} Unlocked
              </p>
              <Progress value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0} className="w-48 mt-1" />
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
            {filteredAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
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