import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Calendar, Brain, Lightbulb } from 'lucide-react';
import { InteractiveInsights } from './InteractiveInsights';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface StudiedTopic {
  topic: string;
  subtopics: string[];
  total_questions: number;
  first_attempted: string;
  last_attempted: string;
  accuracy: number;
}

interface TopicsStudiedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopicsStudiedModal = ({ open, onOpenChange }: TopicsStudiedModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<StudiedTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadStudiedTopics();
      loadMisconceptionInsights();
    }
  }, [open, user]);

  const loadStudiedTopics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('topic, subtopic, is_correct, answered_at')
        .eq('student_id', user?.id);

      if (error) throw error;

      // Group by topic and calculate statistics
      const topicMap = new Map<string, any>();
      
      data?.forEach((answer) => {
        if (!topicMap.has(answer.topic)) {
          topicMap.set(answer.topic, {
            topic: answer.topic,
            subtopics: new Set(),
            total_questions: 0,
            correct_answers: 0,
            first_attempted: answer.answered_at,
            last_attempted: answer.answered_at,
          });
        }
        
        const topicData = topicMap.get(answer.topic);
        topicData.subtopics.add(answer.subtopic);
        topicData.total_questions++;
        if (answer.is_correct) topicData.correct_answers++;
        
        // Update date ranges
        if (new Date(answer.answered_at) < new Date(topicData.first_attempted)) {
          topicData.first_attempted = answer.answered_at;
        }
        if (new Date(answer.answered_at) > new Date(topicData.last_attempted)) {
          topicData.last_attempted = answer.answered_at;
        }
      });

      // Convert to array and calculate accuracy
      const studiedTopics: StudiedTopic[] = Array.from(topicMap.values()).map((topic) => ({
        ...topic,
        subtopics: Array.from(topic.subtopics),
        accuracy: topic.correct_answers / topic.total_questions,
      })).sort((a, b) => new Date(b.last_attempted).getTime() - new Date(a.last_attempted).getTime());

      setTopics(studiedTopics);
    } catch (error) {
      console.error('Error loading studied topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMisconceptionInsights = async () => {
    if (!user) return;
    
    setIsLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('explain-misconceptions', {
        body: { student_id: user.id }
      });

      if (error) throw error;

      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error getting explanation:', error);
      // Don't show error toast for automatic loading
      setShowExplanation(false);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.8) return <Badge className="bg-green-100 text-green-800">Mastered</Badge>;
    if (accuracy >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Learning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  const handleRefreshInsights = async () => {
    await loadMisconceptionInsights();
    toast({
      title: "Insights Refreshed",
      description: "Your learning insights have been updated!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Topics Studied & Learning Insights
              </DialogTitle>
              <DialogDescription>
                All the topics you've covered in your learning journey
              </DialogDescription>
            </div>
            {showExplanation && (
              <Button
                onClick={handleRefreshInsights}
                disabled={isLoadingExplanation}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                {isLoadingExplanation ? "Updating..." : "Refresh Insights"}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Topics Performance */}
          <div className="flex-1">
            <h3 className="font-medium mb-4">Performance Overview</h3>
            
            <ScrollArea className="h-[50vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No topics studied yet. Start practicing to see your learning progress!
            </div>
          ) : (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div
                    key={topic.topic}
                    className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{topic.topic}</h4>
                      </div>
                      {getAccuracyBadge(topic.accuracy)}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{topic.subtopics.length}</span> subtopics covered:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topic.subtopics.slice(0, 3).map((subtopic) => (
                          <Badge key={subtopic} variant="outline" className="text-xs">
                            {subtopic.length > 30 ? `${subtopic.substring(0, 30)}...` : subtopic}
                          </Badge>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{topic.subtopics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{topic.total_questions} questions answered</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Started {formatDate(topic.first_attempted)}</span>
                      </div>
                      <div className="col-span-2 text-xs">
                        Last practiced: {formatDate(topic.last_attempted)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </ScrollArea>
          </div>

          {/* AI Explanation Panel - Always show if available */}
          {(showExplanation || isLoadingExplanation) && (
            <div className="flex-1 border-l pl-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Learning Insights & Misconception Analysis
              </h3>
              
              {isLoadingExplanation ? (
                <div className="flex items-center justify-center h-[50vh]">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Analyzing your learning patterns...</p>
                  </div>
                </div>
              ) : explanation ? (
                <ScrollArea className="h-[50vh] pr-4">
                  <InteractiveInsights 
                    explanation={explanation}
                    onRefresh={handleRefreshInsights}
                    isRefreshing={isLoadingExplanation}
                  />
                </ScrollArea>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};