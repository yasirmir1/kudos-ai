import React, { useState } from 'react';
import { Calendar, Target, CheckCircle, AlertCircle, Download, Share2, TrendingUp, Brain, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface SessionData {
  date: string;
  duration: string;
  questionsCompleted: number;
  accuracy: number;
  topicsCovered: string[];
  strengths: string[];
  improvements: string[];
  misconceptions: Array<{
    code: string;
    description: string;
    occurrences: number;
  }>;
  recommendedActions: string[];
  pointsEarned: number;
  streakDays: number;
}

interface PracticeReportProps {
  sessionData?: SessionData;
}

const defaultSessionData: SessionData = {
  date: '2024-01-15',
  duration: '32 minutes',
  questionsCompleted: 25,
  accuracy: 84,
  topicsCovered: ['Fractions', 'Decimals', 'Percentages'],
  strengths: ['Quick mental calculations', 'Fraction simplification', 'Pattern recognition'],
  improvements: ['Decimal to percentage conversion', 'Multi-step problems', 'Word problem comprehension'],
  misconceptions: [
    { code: 'FR1', description: 'Adding denominators instead of finding common denominators', occurrences: 2 },
    { code: 'PC1', description: 'Converting percentages incorrectly', occurrences: 1 }
  ],
  recommendedActions: [
    'Review decimal to percentage conversion with video tutorial',
    'Practice 10 multi-step word problems',
    'Complete fraction addition remediation exercise'
  ],
  pointsEarned: 125,
  streakDays: 5
};

const PracticeReport: React.FC<PracticeReportProps> = ({ sessionData = defaultSessionData }) => {
  const [reportType, setReportType] = useState('summary');
  const [shareMethod, setShareMethod] = useState<string | null>(null);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 75) return 'text-primary';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return { text: 'Excellent', variant: 'default' as const };
    if (accuracy >= 75) return { text: 'Good', variant: 'secondary' as const };
    if (accuracy >= 60) return { text: 'Fair', variant: 'outline' as const };
    return { text: 'Needs Work', variant: 'destructive' as const };
  };

  const badge = getAccuracyBadge(sessionData.accuracy);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">Practice Report</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="parent">Parent View</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareMethod('download')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareMethod('share')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReportCard
              icon={Calendar}
              label="Session Date"
              value={sessionData.date}
              subtext={sessionData.duration}
            />
            <ReportCard
              icon={Target}
              label="Accuracy"
              value={`${sessionData.accuracy}%`}
              subtext={`${sessionData.questionsCompleted} questions`}
              valueColor={getAccuracyColor(sessionData.accuracy)}
            />
            <ReportCard
              icon={Award}
              label="Points Earned"
              value={sessionData.pointsEarned.toString()}
              subtext={`${sessionData.streakDays} day streak`}
            />
            <ReportCard
              icon={Brain}
              label="Topics"
              value={sessionData.topicsCovered.length.toString()}
              subtext="areas covered"
            />
          </div>

          <Separator />

          {/* Performance Summary */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Performance Summary</h3>
              <Badge variant={badge.variant}>{badge.text}</Badge>
            </div>
            <Progress value={sessionData.accuracy} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              You answered {sessionData.questionsCompleted} questions with {sessionData.accuracy}% accuracy
            </p>
          </div>

          {/* Topics Covered */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Topics Covered</h3>
            <div className="flex flex-wrap gap-2">
              {sessionData.topicsCovered.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {sessionData.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {sessionData.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Misconceptions */}
          {sessionData.misconceptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                Misconceptions Identified
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="space-y-3">
                  {sessionData.misconceptions.map((misc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          {misc.description}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Code: {misc.code}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                        {misc.occurrences} {misc.occurrences === 1 ? 'time' : 'times'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Recommended Next Steps</h3>
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-primary mb-3">
                Based on today's performance, we recommend:
              </p>
              <ol className="space-y-2 text-sm text-foreground">
                {sessionData.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2 font-medium">{index + 1}.</span>
                    {action}
                  </li>
                ))}
              </ol>
              <Button className="mt-4 w-full">
                Start Recommended Practice
              </Button>
            </div>
          </div>

          {/* Time Analysis (if detailed view) */}
          {reportType === 'detailed' && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Time Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Avg. per Question</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">1.3 min</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Fastest Topic</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">Fractions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Slowest Topic</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">Percentages</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ReportCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  valueColor?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ icon: Icon, label, value, subtext, valueColor = 'text-foreground' }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        {subtext && <p className="text-sm text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
};

export default PracticeReport;