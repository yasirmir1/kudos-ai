import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Clock, 
  Star, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useBootcampDatabase } from '@/hooks/useBootcampDatabase';
import { supabase } from '@/integrations/supabase/client';

interface TopicProgress {
  topic_id: string;
  topic_name: string;
  module_name: string;
  status: string;
  accuracy_percentage: number;
  mastery_score: number;
  questions_attempted: number;
  last_activity: string;
}

interface SkillSummary {
  skill_name: string;
  proficiency_level: number;
  questions_attempted: number;
  questions_correct: number;
  active_misconceptions: string[];
}

export const ComprehensiveProgress: React.FC = () => {
  const { 
    student, 
    progress, 
    skills, 
    responses, 
    sessions, 
    achievements, 
    isLoading 
  } = useBootcampDatabase();

  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [skillsSummary, setSkillsSummary] = useState<SkillSummary[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    questionsThisWeek: 0,
    accuracyThisWeek: 0,
    timeSpentMinutes: 0,
    streakDays: 0
  });

  useEffect(() => {
    if (progress.length > 0) {
      loadDetailedProgress();
    }
    if (skills.length > 0) {
      setSkillsSummary(skills.map(skill => ({
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level,
        questions_attempted: skill.questions_attempted,
        questions_correct: skill.questions_correct,
        active_misconceptions: skill.active_misconceptions || []
      })));
    }
    calculateWeeklyStats();
  }, [progress, skills, responses, sessions]);

  const loadDetailedProgress = async () => {
    try {
      // Get topic and module names for progress items
      const topicIds = progress.map(p => p.topic_id);
      
      const { data: topics } = await supabase
        .from('bootcamp_topics')
        .select(`
          id,
          name,
          module_id,
          bootcamp_modules!inner(name)
        `)
        .in('id', topicIds);

      if (topics) {
        const detailedProgress = progress.map(p => {
          const topic = topics.find(t => t.id === p.topic_id);
          return {
            topic_id: p.topic_id,
            topic_name: topic?.name || 'Unknown Topic',
            module_name: topic?.bootcamp_modules?.name || 'Unknown Module',
            status: p.status,
            accuracy_percentage: p.accuracy_percentage,
            mastery_score: p.mastery_score,
            questions_attempted: responses.filter(r => {
              // This is simplified - in practice you'd join with questions table
              return true; // Placeholder
            }).length,
            last_activity: p.last_activity
          };
        });

        setTopicProgress(detailedProgress);
      }
    } catch (error) {
      console.error('Error loading detailed progress:', error);
    }
  };

  const calculateWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekResponses = responses.filter(r => 
      new Date(r.responded_at) > oneWeekAgo
    );

    const thisWeekSessions = sessions.filter(s => 
      new Date(s.session_start) > oneWeekAgo
    );

    const correctThisWeek = thisWeekResponses.filter(r => r.is_correct).length;
    const accuracyThisWeek = thisWeekResponses.length > 0 
      ? Math.round((correctThisWeek / thisWeekResponses.length) * 100)
      : 0;

    const timeSpentMinutes = thisWeekSessions.reduce((total, session) => {
      if (session.session_end) {
        const duration = new Date(session.session_end).getTime() - new Date(session.session_start).getTime();
        return total + Math.floor(duration / (1000 * 60));
      }
      return total;
    }, 0);

    // Calculate streak days
    const uniqueDays = [...new Set(responses.map(r => 
      new Date(r.responded_at).toDateString()
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

    setWeeklyStats({
      questionsThisWeek: thisWeekResponses.length,
      accuracyThisWeek,
      timeSpentMinutes,
      streakDays
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold">{weeklyStats.questionsThisWeek}</p>
              <p className="text-sm text-muted-foreground">Questions This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{weeklyStats.accuracyThisWeek}%</p>
              <p className="text-sm text-muted-foreground">Weekly Accuracy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{Math.floor(weeklyStats.timeSpentMinutes / 60)}h {weeklyStats.timeSpentMinutes % 60}m</p>
              <p className="text-sm text-muted-foreground">Time This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{weeklyStats.streakDays}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">Topic Progress</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topic Mastery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicProgress.map((topic) => (
                  <div key={topic.topic_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(topic.status)}
                        <div>
                          <h3 className="font-semibold">{topic.topic_name}</h3>
                          <p className="text-sm text-muted-foreground">{topic.module_name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(topic.status)}>
                        {topic.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mastery Score</span>
                        <span>{Math.round(topic.mastery_score * 100)}%</span>
                      </div>
                      <Progress value={topic.mastery_score * 100} className="h-2" />
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Accuracy: {topic.accuracy_percentage}%</span>
                        <span>Questions: {topic.questions_attempted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skill Proficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillsSummary.map((skill, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{skill.skill_name}</h3>
                      <Badge variant={skill.proficiency_level >= 0.8 ? "default" : skill.proficiency_level >= 0.6 ? "secondary" : "outline"}>
                        {Math.round(skill.proficiency_level * 100)}% Proficient
                      </Badge>
                    </div>
                    
                    <Progress value={skill.proficiency_level * 100} className="h-2 mb-3" />
                    
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Correct: {skill.questions_correct}/{skill.questions_attempted}</span>
                      <span>Accuracy: {skill.questions_attempted > 0 ? Math.round((skill.questions_correct / skill.questions_attempted) * 100) : 0}%</span>
                    </div>

                    {skill.active_misconceptions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <div className="flex flex-wrap gap-1">
                          {skill.active_misconceptions.map((misconception, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {misconception}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.achievement_id} className="border rounded-lg p-4 flex items-center gap-3">
                      {achievement.badge_url ? (
                        <img src={achievement.badge_url} alt="Badge" className="w-12 h-12" />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Star className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.achievement_name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.achievement_type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{achievement.points_awarded} points</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No achievements yet. Keep practicing!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};