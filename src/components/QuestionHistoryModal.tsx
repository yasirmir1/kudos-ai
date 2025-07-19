import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuestionHistory {
  id: number;
  question_id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  answer_given: string;
  is_correct: boolean;
  time_taken_seconds: number;
  answered_at: string;
}

interface QuestionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuestionHistoryModal = ({ open, onOpenChange }: QuestionHistoryModalProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadQuestionHistory();
    }
  }, [open, user]);

  const loadQuestionHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('*')
        .eq('student_id', user?.id)
        .order('answered_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading question history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Question History</DialogTitle>
          <DialogDescription>
            All questions you've answered, showing your performance and timing
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions answered yet. Start practicing to see your history here!
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    question.is_correct 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {question.is_correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {question.topic}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium">{question.subtopic}</p>
                        <p className="text-muted-foreground mt-1">
                          Your answer: <span className="font-medium">{question.answer_given}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(question.time_taken_seconds)}</span>
                      </div>
                      <div>{formatDate(question.answered_at)}</div>
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