import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Award, 
  Brain,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useBootcampDatabase } from '@/hooks/useBootcampDatabase';
import { supabase } from '@/integrations/supabase/client';

interface ConfidenceTrend {
  topic_id: string;
  topic_name: string;
  confidence_trend: number[];
  weak_misconceptions: string[];
  accuracy_percentage: number;
  last_activity: string;
}

interface MisconceptionPattern {
  misconception_id: string;
  misconception_name: string;
  frequency: number;
  severity: string;
  intervention_type: string;
  topics_affected: string[];
}

interface AdaptiveRecommendation {
  type: 'skip_ahead' | 'extra_practice' | 'review' | 'confidence_building';
  title: string;
  description: string;
  topic_id: string;
  confidence: number;
  accuracy: number;
}

export const EnhancedProgressInsights: React.FC = () => {
  const { student, progress } = useBootcampDatabase();
  const [confidenceTrends, setConfidenceTrends] = useState<ConfidenceTrend[]>([]);
  const [misconceptionPatterns, setMisconceptionPatterns] = useState<MisconceptionPattern[]>([]);
  const [adaptiveRecommendations, setAdaptiveRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadAnalyticsData();
    }
  }, [student, progress]);

  const loadAnalyticsData = async () => {
    if (!student) return;

    try {
      setIsLoading(true);
      
      // Load confidence trends - simplified for now using existing columns
      const { data: trends } = await supabase
        .from('bootcamp_student_progress')
        .select(`
          topic_id,
          accuracy_percentage,
          last_activity
        `)
        .eq('student_id', student.student_id);

      let formattedTrends: ConfidenceTrend[] = [];
      
      if (trends) {
        formattedTrends = trends.map(trend => ({
          topic_id: trend.topic_id,
          topic_name: `Topic ${trend.topic_id}`, // Simplified for now
          confidence_trend: [0.5, 0.6, 0.7], // Mock data for now
          weak_misconceptions: [],
          accuracy_percentage: trend.accuracy_percentage || 0,
          last_activity: trend.last_activity || ''
        }));
        setConfidenceTrends(formattedTrends);
      }

      // Load misconception patterns - simplified
      const { data: misconceptions } = await supabase
        .from('bootcamp_student_responses')
        .select(`
          misconception_detected
        `)
        .eq('student_id', student.student_id)
        .not('misconception_detected', 'is', null);

      if (misconceptions) {
        const misconceptionGroups = misconceptions.reduce((acc, item) => {
          const misconceptionId = item.misconception_detected;
          if (!misconceptionId) return acc;

          if (!acc[misconceptionId]) {
            acc[misconceptionId] = {
              misconception_id: misconceptionId,
              misconception_name: misconceptionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              frequency: 0,
              severity: 'medium', // Default severity
              intervention_type: 'explanation',
              topics_affected: ['Math']
            };
          }
          
          acc[misconceptionId].frequency++;
          
          return acc;
        }, {} as Record<string, MisconceptionPattern>);

        setMisconceptionPatterns(Object.values(misconceptionGroups));
      }

      // Generate adaptive recommendations
      generateAdaptiveRecommendations(formattedTrends);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdaptiveRecommendations = (trends: ConfidenceTrend[]) => {
    const recommendations: AdaptiveRecommendation[] = [];

    trends.forEach(trend => {
      const avgConfidence = trend.confidence_trend.length > 0 
        ? trend.confidence_trend.reduce((a, b) => a + b, 0) / trend.confidence_trend.length 
        : 0.5;
      
      const accuracy = trend.accuracy_percentage / 100;

      // Skip ahead recommendation (high performance)
      if (accuracy > 0.85 && avgConfidence > 0.8) {
        recommendations.push({
          type: 'skip_ahead',
          title: `Ready to advance in ${trend.topic_name}`,
          description: 'Strong performance suggests you can move to more challenging topics',
          topic_id: trend.topic_id,
          confidence: avgConfidence,
          accuracy
        });
      }

      // Extra practice recommendation (struggling)
      if (accuracy < 0.6 || avgConfidence < 0.4) {
        recommendations.push({
          type: 'extra_practice',
          title: `Extra practice needed: ${trend.topic_name}`,
          description: 'Additional practice will help build confidence and accuracy',
          topic_id: trend.topic_id,
          confidence: avgConfidence,
          accuracy
        });
      }

      // Confidence building (good accuracy, low confidence)
      if (accuracy > 0.7 && avgConfidence < 0.6) {
        recommendations.push({
          type: 'confidence_building',
          title: `Build confidence in ${trend.topic_name}`,
          description: 'You know this well but lack confidence. Practice with easier questions.',
          topic_id: trend.topic_id,
          confidence: avgConfidence,
          accuracy
        });
      }

      // Review recommendation (declining trend)
      if (trend.confidence_trend.length >= 3) {
        const recentTrend = trend.confidence_trend.slice(-3);
        const isDecreasing = recentTrend[0] > recentTrend[1] && recentTrend[1] > recentTrend[2];
        
        if (isDecreasing) {
          recommendations.push({
            type: 'review',
            title: `Review ${trend.topic_name}`,
            description: 'Confidence has been declining. A review session would help.',
            topic_id: trend.topic_id,
            confidence: avgConfidence,
            accuracy
          });
        }
      }
    });

    setAdaptiveRecommendations(recommendations);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'skip_ahead': return TrendingUp;
      case 'extra_practice': return Target;
      case 'confidence_building': return Brain;
      case 'review': return BarChart3;
      default: return Lightbulb;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'skip_ahead': return 'text-success';
      case 'extra_practice': return 'text-warning';
      case 'confidence_building': return 'text-primary';
      case 'review': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendDirection = (trend: number[]) => {
    if (trend.length < 2) return 'stable';
    const recent = trend.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlier = trend.slice(-6, -3);
    const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : avg;
    
    if (avg > earlierAvg + 0.1) return 'up';
    if (avg < earlierAvg - 0.1) return 'down';
    return 'stable';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidence Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Confidence Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {confidenceTrends.map((trend) => {
              const direction = getTrendDirection(trend.confidence_trend);
              const avgConfidence = trend.confidence_trend.length > 0 
                ? trend.confidence_trend.reduce((a, b) => a + b, 0) / trend.confidence_trend.length 
                : 0;

              return (
                <div key={trend.topic_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{trend.topic_name}</span>
                      {direction === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
                      {direction === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Confidence: {Math.round(avgConfidence * 100)}%</span>
                      <span>Accuracy: {Math.round(trend.accuracy_percentage)}%</span>
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress value={avgConfidence * 100} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Misconception Patterns */}
      {misconceptionPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Common Mistake Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {misconceptionPatterns
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5)
                .map((pattern) => (
                <div key={pattern.misconception_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{pattern.misconception_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Occurred {pattern.frequency} times • Topics: {pattern.topics_affected.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={pattern.severity === 'high' ? 'destructive' : 
                              pattern.severity === 'medium' ? 'secondary' : 'outline'}
                    >
                      {pattern.severity === 'high' || pattern.severity === 'critical' ? 'Needs Focus' :
                       pattern.severity === 'medium' ? 'Working On It' : 'Getting Better'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptive Recommendations */}
      {adaptiveRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adaptiveRecommendations
                .sort((a, b) => {
                  const priority = { skip_ahead: 1, confidence_building: 2, review: 3, extra_practice: 4 };
                  return priority[a.type] - priority[b.type];
                })
                .slice(0, 3)
                .map((rec, index) => {
                  const Icon = getRecommendationIcon(rec.type);
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Icon className={`h-5 w-5 mt-0.5 ${getRecommendationColor(rec.type)}`} />
                      <div className="flex-1">
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">{rec.description}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                          <span>Accuracy: {Math.round(rec.accuracy * 100)}%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        Start
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};