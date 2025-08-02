import React from 'react';
import { Brain, Target, Shield, Award, Play, RefreshCw, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { WeeklyProgressChart } from './WeeklyProgressChart';

interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
}

interface DashboardProps {
  user: User;
  setCurrentView: (view: string) => void;
}

interface QuickStat {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentTopic {
  name: string;
  accuracy: number;
  questions: number;
  status: 'improving' | 'stable' | 'needs-work';
}

export const Dashboard: React.FC<DashboardProps> = ({ user, setCurrentView }) => {
  const quickStats: QuickStat[] = [
    { label: 'Questions Today', value: user.questionsToday.toString(), icon: Brain, color: 'primary' },
    { label: 'Accuracy', value: `${user.accuracy}%`, icon: Target, color: 'success' },
    { label: 'Current Level', value: user.level, icon: Shield, color: 'secondary' },
    { label: 'Weekly Goal', value: '85%', icon: Award, color: 'warning' }
  ];

  const recentTopics: RecentTopic[] = [
    { name: 'Fractions', accuracy: 82, questions: 25, status: 'improving' },
    { name: 'Algebra', accuracy: 75, questions: 18, status: 'stable' },
    { name: 'Geometry', accuracy: 68, questions: 12, status: 'needs-work' }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-success';
      case 'secondary': return 'text-secondary-foreground';
      case 'warning': return 'text-warning';
      default: return 'text-primary';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-success';
    if (accuracy >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back, {user.name}! 🎯
        </h1>
        <p className="text-muted-foreground">You're making great progress. Keep up the momentum!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${getColorClasses(stat.color)}`} />
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}/10 ${getColorClasses(stat.color)}`}>
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Practice</h2>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('practice')}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 flex items-center justify-between hover:from-primary/90 hover:to-primary/70 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Play className="h-5 w-5" />
                <span className="font-medium">Start Daily Challenge</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button className="w-full bg-muted text-muted-foreground rounded-lg p-4 flex items-center justify-between hover:bg-muted/80 transition-colors">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5" />
                <span className="font-medium">Review Mistakes</span>
              </div>
              <span className="text-sm text-muted-foreground">8 questions</span>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Topics</h2>
          <div className="space-y-3">
            {recentTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">{topic.questions} questions</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                    {topic.accuracy}%
                  </span>
                  {topic.status === 'improving' && <TrendingUp className="h-4 w-4 text-success" />}
                  {topic.status === 'needs-work' && <AlertCircle className="h-4 w-4 text-warning" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WeeklyProgressChart />
    </div>
  );
};