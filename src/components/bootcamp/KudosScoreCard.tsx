import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, Target, Clock } from 'lucide-react';
import { useKudosScore } from '@/hooks/useKudosScore';

export const KudosScoreCard: React.FC = () => {
  const { kudosData, loading } = useKudosScore();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!kudosData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Complete some practice questions to see your Kudos Score!</p>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 150) return 'text-success';
    if (score >= 100) return 'text-primary';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 200) return { label: 'Exceptional', variant: 'default' as const };
    if (score >= 150) return { label: 'Advanced', variant: 'secondary' as const };
    if (score >= 100) return { label: 'Proficient', variant: 'outline' as const };
    if (score >= 75) return { label: 'Developing', variant: 'outline' as const };
    return { label: 'Emerging', variant: 'destructive' as const };
  };

  const scoreBadge = getScoreBadge(kudosData.current_score);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Kudos Score</h3>
          <p className="text-sm text-muted-foreground">
            Difficulty & speed adjusted performance
          </p>
        </div>
        <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
      </div>

      <div className="space-y-6">
        {/* Current Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(kudosData.current_score)}`}>
            {kudosData.current_score}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Current Score</p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {kudosData.performance_improvement >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div className={`font-semibold ${
              kudosData.performance_improvement >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {kudosData.performance_improvement >= 0 ? '+' : ''}{kudosData.performance_improvement}%
            </div>
            <p className="text-xs text-muted-foreground">Improvement</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <div className={`font-semibold ${
              kudosData.difficulty_progression >= 0 ? 'text-success' : 'text-muted-foreground'
            }`}>
              {kudosData.difficulty_progression >= 0 ? '+' : ''}{kudosData.difficulty_progression}%
            </div>
            <p className="text-xs text-muted-foreground">Difficulty</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className={`font-semibold ${
              kudosData.speed_efficiency >= 100 ? 'text-success' : 'text-muted-foreground'
            }`}>
              {kudosData.speed_efficiency}%
            </div>
            <p className="text-xs text-muted-foreground">Speed</p>
          </div>
        </div>

        {/* Trend Visualization */}
        {kudosData.trend.length > 1 && (
          <div>
            <p className="text-sm font-medium mb-2">Score Trend</p>
            <div className="flex items-end space-x-1 h-8">
              {kudosData.trend.map((score, index) => (
                <div
                  key={index}
                  className="bg-primary/20 flex-1 rounded-t"
                  style={{
                    height: `${Math.max(10, (score / Math.max(...kudosData.trend)) * 100)}%`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};