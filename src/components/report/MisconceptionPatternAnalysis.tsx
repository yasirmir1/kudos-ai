import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, Target, BarChart3, Loader2, Brain, Shield, Zap, Heart, Star, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getFriendlyMisconceptionName } from '@/lib/misconceptionLabels';

interface MisconceptionPattern {
  misconception_code: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern_type: 'emerging' | 'developing' | 'recurring' | 'persistent';
  topics: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface PatternAnalysis {
  patterns: MisconceptionPattern[];
  critical_patterns: MisconceptionPattern[];
  emerging_patterns: MisconceptionPattern[];
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: number;
  }>;
  problematic_topics: Array<{
    topic: string;
    misconception_count: number;
    total_frequency: number;
  }>;
  analysis_summary: {
    total_patterns: number;
    critical_count: number;
    emerging_count: number;
    most_problematic_topic: string | null;
  };
}

interface MisconceptionPatternAnalysisProps {
  studentId: string | null;
}

export const MisconceptionPatternAnalysis: React.FC<MisconceptionPatternAnalysisProps> = ({
  studentId
}) => {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzePatterns = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-misconception-patterns', {
        body: { student_id: studentId, threshold: 2 }
      });

      if (error) {
        throw new Error(error.message);
      }

      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "Error",
        description: "Failed to analyze misconception patterns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      analyzePatterns();
    }
  }, [studentId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Needs Focus';
      case 'high': return 'Working On It';
      case 'medium': return 'Learning';
      default: return 'Improving';
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'persistent': return AlertTriangle;
      case 'recurring': return TrendingUp;
      case 'developing': return Target;
      default: return BarChart3;
    }
  };

  const getSeverityProgress = (severity: string) => {
    switch (severity) {
      case 'critical': return 100;
      case 'high': return 75;
      case 'medium': return 50;
      default: return 25;
    }
  };


  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return Zap;
      case 'medium': return Target;
      default: return Shield;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Your Child's Learning Journey
            </CardTitle>
            <CardDescription>Understanding how your child learns and grows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Analyzing your child's learning journey...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis || analysis.patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Wonderful News!
          </CardTitle>
          <CardDescription>Your child is doing brilliantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Your child is making excellent progress! 🌟</h3>
            <p className="text-muted-foreground">
              We haven't found any concerning learning patterns. Your child is building strong foundations and developing great mathematical understanding. Keep encouraging their curiosity!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pattern Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Your Child's Learning Insights
            <Badge variant="outline" className="ml-auto">
              {analysis.patterns.length} areas to explore
            </Badge>
          </CardTitle>
          <CardDescription>
            Understanding how your child learns best and where they might need a little extra support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">{analysis.analysis_summary.total_patterns}</div>
              <div className="text-sm text-muted-foreground">Learning Areas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{analysis.analysis_summary.critical_count}</div>
              <div className="text-sm text-red-600">Need Focus</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{analysis.analysis_summary.emerging_count}</div>
              <div className="text-sm text-orange-600">Getting Better</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.problematic_topics.length}
              </div>
              <div className="text-sm text-blue-600">Subjects to Review</div>
            </div>
          </div>

          {/* Critical Alerts */}
          {analysis.critical_patterns.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Heart className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>Gentle reminder:</strong> Your child might benefit from some extra practice in {analysis.critical_patterns.length} area{analysis.critical_patterns.length > 1 ? 's' : ''}. A little focused attention can make a big difference! 💪
              </AlertDescription>
            </Alert>
          )}

          {/* Parent-Friendly Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Helpful Suggestions for You
              </h4>
              {analysis.recommendations.map((rec, index) => (
                <Alert key={index} className={rec.priority === 1 ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>{rec.title.replace('Critical', 'Important').replace('Patterns', 'Learning Areas')}:</strong> {rec.description.replace('misconceptions', 'concepts your child is working on').replace('intervention', 'extra practice')}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Pattern Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequent Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Learning Challenges
            </CardTitle>
            <CardDescription>Areas where your child is building understanding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.patterns.slice(0, 6).map((pattern, index) => {
              const Icon = getPatternIcon(pattern.pattern_type);
              const SeverityIcon = getSeverityIcon(pattern.severity);
              return (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                     <div className="flex items-center gap-2 flex-1">
                       <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                       <span className="text-sm font-medium leading-tight">
                         {getFriendlyMisconceptionName(pattern.misconception_code)}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${getSeverityColor(pattern.severity)}`}>
                        {getSeverityLabel(pattern.severity)}
                      </Badge>
                      {pattern.trend === 'increasing' && (
                        <TrendingUp className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Seen {pattern.frequency} times
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {pattern.pattern_type}
                    </span>
                  </div>
                  
                  <Progress 
                    value={getSeverityProgress(pattern.severity)} 
                    className="h-1"
                  />
                  
                  {pattern.topics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pattern.topics.slice(0, 2).map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="outline" className="text-xs">
                          {topic.length > 20 ? `${topic.substring(0, 20)}...` : topic}
                        </Badge>
                      ))}
                      {pattern.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{pattern.topics.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Problematic Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Subjects to Practice Together
            </CardTitle>
            <CardDescription>Areas where your child would benefit from extra support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.problematic_topics.length > 0 ? (
              analysis.problematic_topics.map((topic, index) => (
                <div key={index} className="p-3 rounded-lg border bg-orange-50/50 border-orange-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-purple-900 leading-tight">
                      {topic.topic}
                    </h4>
                    <Badge variant="outline" className="text-purple-700 border-purple-300 flex-shrink-0">
                      {topic.misconception_count} patterns
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600">
                      Practice opportunities: {topic.total_frequency}
                    </span>
                    <Progress
                      value={Math.min((topic.total_frequency / 20) * 100, 100)} 
                      className="h-1 w-20"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm">Your child is doing well across all subjects! 🌟</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={analyzePatterns}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating insights...
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" />
              Refresh Learning Insights
            </>
          )}
        </Button>
      </div>
    </div>
  );
};