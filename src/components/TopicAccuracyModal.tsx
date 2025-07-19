import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TopicAccuracy {
  topic: string;
  accuracy: number;
  total_attempts: number;
  correct_answers: number;
  avg_time_seconds: number;
  last_attempted: string;
}

interface TopicAccuracyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopicAccuracyModal = ({ open, onOpenChange }: TopicAccuracyModalProps) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<TopicAccuracy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadTopicAccuracy();
    }
  }, [open, user]);

  const loadTopicAccuracy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_performance')
        .select('*')
        .eq('student_id', user?.id)
        .order('accuracy', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topic accuracy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-600';
    if (accuracy >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 0.7) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (accuracy >= 0.5) return <Target className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Accuracy by Topic</DialogTitle>
          <DialogDescription>
            Your performance breakdown across different topics
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No performance data available yet. Start practicing to see your accuracy by topic!
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div
                  key={topic.topic}
                  className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getAccuracyIcon(topic.accuracy)}
                      <h3 className="font-medium">{topic.topic}</h3>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className={`text-lg font-bold ${getAccuracyColor(topic.accuracy)}`}>
                      {Math.round(topic.accuracy * 100)}%
                    </div>
                  </div>
                  
                  <Progress 
                    value={topic.accuracy * 100} 
                    className="h-2 mb-3"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">{topic.correct_answers}</span> / {topic.total_attempts} correct
                    </div>
                    <div>
                      Avg time: <span className="font-medium">{formatTime(topic.avg_time_seconds)}</span>
                    </div>
                    <div className="col-span-2">
                      Last practiced: <span className="font-medium">{formatDate(topic.last_attempted)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};