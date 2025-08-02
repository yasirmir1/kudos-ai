import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target, Award, Loader2 } from 'lucide-react';
import { PerformanceChart } from './PerformanceChart';
import { useAuth } from '../../hooks/useAuth';
import { BootcampAPI } from '../../lib/bootcamp-api';

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
  const { user } = useAuth();
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceSummary, setPerformanceSummary] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (studentProfile) {
        const [progress, summary] = await Promise.all([
          BootcampAPI.getStudentProgress(studentProfile.student_id),
          BootcampAPI.getStudentPerformanceSummary(studentProfile.student_id)
        ]);

        // Map progress to skills data
        const skills: Skill[] = progress.map((p: any) => ({
          name: p.bootcamp_enhanced_topics?.topic_name || p.topic_id,
          level: Math.round(p.accuracy_percentage || 0),
          trend: (p.accuracy_percentage >= 80 ? 'up' : 
                 p.accuracy_percentage >= 60 ? 'stable' : 'down') as 'up' | 'down' | 'stable'
        })).slice(0, 5);

        setSkillsData(skills);
        setPerformanceSummary(summary);

        // Generate achievements based on performance
        const achievements: Achievement[] = [];
        if (summary?.overall_accuracy >= 95) {
          achievements.push({ 
            name: 'Accuracy Master', 
            description: 'Achieve 95% overall accuracy', 
            icon: Target, 
            date: 'Recently' 
          });
        }
        if (summary?.total_questions_attempted >= 100) {
          achievements.push({ 
            name: 'Question Master', 
            description: 'Complete 100+ practice questions', 
            icon: Zap, 
            date: 'Recently' 
          });
        }
        if (summary?.active_days >= 7) {
          achievements.push({ 
            name: 'Week Warrior', 
            description: '7+ days of active practice', 
            icon: Award, 
            date: 'Recently' 
          });
        }

        setRecentAchievements(achievements);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

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
            {skillsData.length > 0 ? skillsData.map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    {skill.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                    {skill.trend === 'down' && <TrendingUp className="h-3 w-3 text-destructive rotate-180" />}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">
                Start practicing to see your skill development!
              </p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Achievements</h2>
          <div className="space-y-3">
            {recentAchievements.length > 0 ? recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <achievement.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{achievement.name}</p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">
                Complete more practice sessions to unlock achievements!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Performance Overview</h2>
        <PerformanceChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm border p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Questions Attempted</h3>
          <p className="text-3xl font-bold text-primary">
            {performanceSummary?.total_questions_attempted || 0}
          </p>
          <p className="text-sm text-muted-foreground">total questions</p>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Overall Accuracy</h3>
          <p className="text-3xl font-bold text-success">
            {Math.round(performanceSummary?.overall_accuracy || 0)}%
          </p>
          <p className="text-sm text-muted-foreground">correct answers</p>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Active Days</h3>
          <p className="text-3xl font-bold text-warning">
            {performanceSummary?.active_days || 0}
          </p>
          <p className="text-sm text-muted-foreground">days practicing</p>
        </div>
      </div>
    </div>
  );
};