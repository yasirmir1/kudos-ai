import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  // Transform trend data for the chart
  const chartData = kudosData.trend.map((score, index) => ({
    session: index + 1,
    score: score,
    date: new Date(Date.now() - (kudosData.trend.length - index - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

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

        {/* Time Series Chart */}
        {kudosData.trend.length > 1 ? (
          <div>
            <p className="text-sm font-medium mb-4">Score Trend Over Time</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="session" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [value, 'Kudos Score']}
                    labelFormatter={(label) => `Session ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Complete more sessions to see your progress trend!</p>
          </div>
        )}
      </div>
    </Card>
  );
};