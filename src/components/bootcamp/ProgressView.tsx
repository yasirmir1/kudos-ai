import React from 'react';
import { TrendingUp, Zap, Target, Award } from 'lucide-react';
import { PerformanceChart } from './PerformanceChart';

interface Skill {
  name: string;
  level: number;
  trend: 'up' | 'down' | 'stable';
}

interface Achievement {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  date: string;
}

export const ProgressView: React.FC = () => {
  const skillsData: Skill[] = [
    { name: 'Number Sense', level: 85, trend: 'up' },
    { name: 'Problem Solving', level: 72, trend: 'stable' },
    { name: 'Algebraic Thinking', level: 68, trend: 'up' },
    { name: 'Spatial Reasoning', level: 75, trend: 'down' },
    { name: 'Data Analysis', level: 80, trend: 'up' }
  ];

  const recentAchievements: Achievement[] = [
    { name: 'Speed Demon', description: 'Complete 20 questions in under 15 minutes', icon: Zap, date: '2 days ago' },
    { name: 'Accuracy Master', description: 'Achieve 95% accuracy in a session', icon: Target, date: '5 days ago' },
    { name: 'Week Warrior', description: '7-day practice streak', icon: Award, date: '1 week ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your improvement across all skill areas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Skill Development</h2>
          <div className="space-y-4">
            {skillsData.map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    {skill.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                    {skill.trend === 'down' && <TrendingUp className="h-3 w-3 text-destructive rotate-180" />}
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Achievements</h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <achievement.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{achievement.name}</p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PerformanceChart />
    </div>
  );
};