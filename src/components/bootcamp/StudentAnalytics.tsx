import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  User, 
  Brain, 
  Target, 
  Clock,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface StudentProfile {
  student_id: string;
  username: string;
  email: string;
  created_at: string;
  last_active: string;
  school_year: number;
  subscription_tier: string;
}

interface PerformanceSummary {
  student_id: string;
  username: string;
  total_questions_attempted: number;
  total_correct: number;
  overall_accuracy: number;
  avg_response_time: number;
  unique_misconceptions: number;
  active_days: number;
}

interface SkillProficiency {
  skill_name: string;
  skill_category: string;
  proficiency_level: number;
  questions_attempted: number;
  questions_correct: number;
  accuracy_percentage: number;
  average_time_seconds: number;
  active_misconception_count: number;
}

interface Misconception {
  misconception_id: string;
  misconception_name: string;
  category: string;
  description: string;
  remediation_strategy: string;
  common_indicators: string[];
  related_topics: string[];
}

interface Skill {
  skill_name: string;
  category: string;
  skill_order: number;
}

export const StudentAnalytics: React.FC = () => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [skillsProficiency, setSkillsProficiency] = useState<SkillProficiency[]>([]);
  const [misconceptions, setMisconceptions] = useState<Misconception[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentAnalytics();
  }, []);

  const loadStudentAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Please log in to view analytics');
        return;
      }

      // Fetch student profile
      const { data: profileData, error: profileError } = await supabase
        .from('bootcamp_students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch performance summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('bootcamp_student_performance_summary')
        .select('*')
        .eq('student_id', profileData?.student_id)
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.warn('Performance summary not available:', summaryError);
      }

      // Fetch skills proficiency
      const { data: skillsData, error: skillsError } = await supabase
        .from('bootcamp_student_skills_proficiency')
        .select('*')
        .eq('student_id', profileData?.student_id)
        .order('proficiency_level', { ascending: false });

      if (skillsError && skillsError.code !== 'PGRST116') {
        console.warn('Skills proficiency not available:', skillsError);
      }

      // Fetch misconceptions catalog
      const { data: misconceptionsData, error: misconceptionsError } = await supabase
        .from('bootcamp_misconceptions_catalog')
        .select('*')
        .order('category');

      if (misconceptionsError) {
        console.warn('Misconceptions not available:', misconceptionsError);
      }

      // Fetch all skills
      const { data: allSkillsData, error: allSkillsError } = await supabase
        .from('bootcamp_skills')
        .select('*')
        .order('skill_order');

      if (allSkillsError) {
        console.warn('Skills catalog not available:', allSkillsError);
      }

      setStudentProfile(profileData);
      setPerformanceSummary(summaryData);
      setSkillsProficiency(skillsData || []);
      setMisconceptions(misconceptionsData || []);
      setAllSkills(allSkillsData || []);

    } catch (err) {
      console.error('Error loading student analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getSkillCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'number': return 'bg-blue-100 text-blue-800';
      case 'algebra': return 'bg-purple-100 text-purple-800';
      case 'geometry': return 'bg-green-100 text-green-800';
      case 'statistics': return 'bg-orange-100 text-orange-800';
      case 'problem solving': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProficiencyLevel = (level: number) => {
    if (level >= 0.8) return { label: 'Mastered', color: 'text-green-600', icon: CheckCircle };
    if (level >= 0.6) return { label: 'Developing', color: 'text-yellow-600', icon: TrendingUp };
    return { label: 'Needs Work', color: 'text-red-600', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!studentProfile) {
    return (
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          Student profile not found. Please complete your registration in the bootcamp system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Student Analytics</h1>
        <p className="text-muted-foreground">Comprehensive analysis of your learning progress and performance</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="misconceptions">Misconceptions</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceSummary?.total_questions_attempted || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Questions attempted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(performanceSummary?.overall_accuracy || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Correct answers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(performanceSummary?.avg_response_time || 0)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Per question
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Days</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceSummary?.active_days || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days practiced
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-muted-foreground">Username</h4>
                  <p>{studentProfile.username}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">School Year</h4>
                  <p>Year {studentProfile.school_year || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Subscription</h4>
                  <Badge variant="outline">{studentProfile.subscription_tier}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Last Active</h4>
                  <p>{new Date(studentProfile.last_active || studentProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {skillsProficiency.length > 0 ? (
              skillsProficiency.map((skill) => {
                const proficiency = getProficiencyLevel(skill.proficiency_level);
                const IconComponent = proficiency.icon;
                
                return (
                  <Card key={skill.skill_name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${proficiency.color}`} />
                          <h4 className="font-medium">{skill.skill_name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSkillCategoryColor(skill.skill_category)}>
                            {skill.skill_category}
                          </Badge>
                          <Badge variant="outline" className={proficiency.color}>
                            {proficiency.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Proficiency</span>
                          <span>{Math.round(skill.proficiency_level * 100)}%</span>
                        </div>
                        <Progress value={skill.proficiency_level * 100} className="h-2" />
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">{skill.questions_attempted}</span>
                            <br />Questions
                          </div>
                          <div>
                            <span className="font-medium">{Math.round(skill.accuracy_percentage || 0)}%</span>
                            <br />Accuracy
                          </div>
                          <div>
                            <span className="font-medium">{Math.round(skill.average_time_seconds || 0)}s</span>
                            <br />Avg Time
                          </div>
                        </div>
                        
                        {skill.active_misconception_count > 0 && (
                          <div className="flex items-center gap-2 text-sm text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{skill.active_misconception_count} active misconceptions</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Skills Data Available</h3>
                  <p className="text-muted-foreground">
                    Start practicing questions to see your skills analysis here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="misconceptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misconceptions.map((misconception) => (
              <Card key={misconception.misconception_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{misconception.misconception_name}</CardTitle>
                    <Badge className={getSkillCategoryColor(misconception.category)}>
                      {misconception.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {misconception.description}
                  </p>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Common Indicators:</h5>
                    <div className="flex flex-wrap gap-1">
                      {misconception.common_indicators.map((indicator, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Related Topics:</h5>
                    <div className="flex flex-wrap gap-1">
                      {misconception.related_topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded">
                    <h5 className="font-medium text-sm mb-1">Remediation Strategy:</h5>
                    <p className="text-xs text-muted-foreground">
                      {misconception.remediation_strategy}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSkills.map((skill) => (
              <Card key={skill.skill_name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{skill.skill_name}</h4>
                    <Badge className={getSkillCategoryColor(skill.category)}>
                      {skill.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Skill #{skill.skill_order} in {skill.category}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};