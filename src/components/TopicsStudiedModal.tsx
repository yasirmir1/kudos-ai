import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const [topics, setTopics] = useState<StudiedTopic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadStudiedTopics();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Topics Studied</DialogTitle>
          <DialogDescription>
            All the topics you've covered in your learning journey
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
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
                      <h3 className="font-medium">{topic.topic}</h3>
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
      </DialogContent>
    </Dialog>
  );
};