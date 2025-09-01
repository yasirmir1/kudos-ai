import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, AlertTriangle, Target, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
}

interface MisconceptionPatternsCardProps {
  studentId: string | null;
}

export const MisconceptionPatternsCard: React.FC<MisconceptionPatternsCardProps> = ({
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
        body: { student_id: studentId, threshold: 3 }
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

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Needs Focus';
      case 'high': return 'Needs Focus';
      case 'medium': return 'Working On It';
      case 'low': return 'Getting Better';
      default: return 'Working On It';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pattern Analysis
          </CardTitle>
          <CardDescription>Identifying repeated misconception patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing patterns...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pattern Analysis
          </CardTitle>
          <CardDescription>No significant patterns detected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Keep practicing! No concerning misconception patterns found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Pattern Analysis
          <Badge variant="outline" className="ml-auto">
            {analysis.patterns.length} patterns
          </Badge>
        </CardTitle>
        <CardDescription>
          Automated detection of repeated misconception patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {analysis.critical_patterns.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{analysis.critical_patterns.length} critical patterns</strong> require immediate attention
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {analysis.recommendations.map((rec, index) => (
          <Alert key={index} variant={rec.priority === 1 ? "destructive" : "default"}>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>{rec.title}:</strong> {rec.description}
            </AlertDescription>
          </Alert>
        ))}

        {/* Top Patterns */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Most Frequent Patterns</h4>
          {analysis.patterns.slice(0, 5).map((pattern, index) => {
            const Icon = getPatternIcon(pattern.pattern_type);
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {pattern.misconception_code.replace(/[[\]"]/g, '')}
                  </span>
                  <Badge variant={getSeverityColor(pattern.severity)} className="text-xs">
                    {getSeverityLabel(pattern.severity)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {pattern.frequency}x
                  </span>
                  {pattern.trend === 'increasing' && (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Problematic Topics */}
        {analysis.problematic_topics.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Topics Needing Focus</h4>
            {analysis.problematic_topics.slice(0, 3).map((topic, index) => (
              <div key={index} className="p-2 rounded-lg border bg-orange-50/50 border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">
                    {topic.topic}
                  </span>
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {topic.misconception_count} patterns
                  </Badge>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Total frequency: {topic.total_frequency}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={analyzePatterns}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-3 w-3" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};