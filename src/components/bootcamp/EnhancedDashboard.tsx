import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  Play, 
  TrendingUp, 
  Clock, 
  Star, 
  BookOpen, 
  BarChart3,
  ChevronRight,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useBootcampDatabase } from '@/hooks/useBootcampDatabase';
import { ComprehensiveProgress } from './ComprehensiveProgress';
import { EnhancedQuestionInterface } from './EnhancedQuestionInterface';

interface EnhancedDashboardProps {
  setCurrentView: (view: string) => void;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ setCurrentView }) => {
  const { 
    student, 
    progress, 
    skills, 
    responses, 
    sessions, 
    recommendations, 
    achievements, 
    isLoading 
  } = useBootcampDatabase();

  const [showQuestions, setShowQuestions] = useState(false);
  const [sessionType, setSessionType] = useState<'practice' | 'diagnostic' | 'review' | 'challenge'>('practice');

  // Calculate dashboard stats
  const todayResponses = responses.filter(r => 
    new Date(r.timestamp).toDateString() === new Date().toDateString()
  );
  
  const weekResponses = responses.filter(r => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(r.timestamp) > oneWeekAgo;
  });

  const weeklyAccuracy = weekResponses.length > 0 
    ? Math.round((weekResponses.filter(r => r.is_correct).length / weekResponses.length) * 100)
    : 0;

  const masteredTopics = progress.filter(p => p.status === 'mastered').length;
  const activeRecommendations = recommendations.filter(r => !r.completed);

  // Calculate streak
  const uniqueDays = [...new Set(responses.map(r => 
    new Date(r.timestamp).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streakDays = 0;
  const today = new Date().toDateString();
  
  if (uniqueDays.includes(today)) {
    streakDays = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const currentDay = new Date(uniqueDays[i-1]);
      const prevDay = new Date(uniqueDays[i]);
      const dayDiff = (currentDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        streakDays++;
      } else {
        break;
      }
    }
  }

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points_awarded, 0);
  
  // Determine level based on progress
  const getStudentLevel = () => {
    if (masteredTopics >= 10 && weeklyAccuracy >= 85) return 'Advanced';
    if (masteredTopics >= 5 && weeklyAccuracy >= 75) return 'Intermediate';
    return 'Beginner';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showQuestions) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowQuestions(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <EnhancedQuestionInterface 
          sessionType={sessionType}
          questionCount={10}
          onSessionComplete={(results) => {
            console.log('Session completed:', results);
            setShowQuestions(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {student?.username || 'Student'}! 🎯
              </h1>
              <p className="text-muted-foreground">
                You're a {getStudentLevel()} learner. Keep up the great work!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Zap className="h-5 w-5 text-warning" />
                  <span className="text-2xl font-bold">{streakDays}</span>
                </div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{totalPoints}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Brain className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold">{todayResponses.length}</p>
              <p className="text-sm text-muted-foreground">Questions Today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{weeklyAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Weekly Accuracy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{masteredTopics}</p>
              <p className="text-sm text-muted-foreground">Topics Mastered</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{getStudentLevel()}</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quick Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => {
                setSessionType('practice');
                setShowQuestions(true);
              }}
              className="w-full justify-between"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Start Adaptive Practice
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSessionType('review');
                setShowQuestions(true);
              }}
              className="w-full justify-between"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Review Past Topics
              </div>
              <Badge variant="secondary">{weekResponses.filter(r => !r.is_correct).length} to review</Badge>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSessionType('challenge');
                setShowQuestions(true);
              }}
              className="w-full justify-between"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Take Challenge
              </div>
              <Badge variant="outline">Difficulty: Hard</Badge>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeRecommendations.length > 0 ? (
              <div className="space-y-3">
                {activeRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.recommendation_id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{rec.recommendation_type}</Badge>
                      <Badge variant="secondary">Priority {rec.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.recommendation_type === 'practice' && 'Practice more questions in your weak areas'}
                      {rec.recommendation_type === 'review' && 'Review previously learned topics'}
                      {rec.recommendation_type === 'remediation' && 'Work on addressing misconceptions'}
                      {rec.recommendation_type === 'challenge' && 'Try advanced problems to stretch yourself'}
                    </p>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setCurrentView('analytics')}
                >
                  View All Recommendations
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Complete more practice sessions to get personalized recommendations!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills at Risk */}
      {skills.some(s => s.active_misconceptions && s.active_misconceptions.length > 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Skills Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skills
                .filter(s => s.active_misconceptions && s.active_misconceptions.length > 0)
                .slice(0, 3)
                .map((skill) => (
                  <div key={skill.skill_id} className="flex items-center justify-between p-2 rounded bg-background">
                    <span className="font-medium">{skill.skill_name}</span>
                    <div className="flex gap-1">
                      {skill.active_misconceptions.map((misconception, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {misconception}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-3" 
              onClick={() => setCurrentView('progress')}
            >
              View Detailed Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {achievements.slice(0, 5).map((achievement) => (
                <div key={achievement.achievement_id} className="flex-none w-48 border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {achievement.badge_url ? (
                      <img src={achievement.badge_url} alt="Badge" className="w-8 h-8" />
                    ) : (
                      <Star className="h-8 w-8 text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{achievement.achievement_name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.points_awarded} points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <ComprehensiveProgress />
    </div>
  );
};