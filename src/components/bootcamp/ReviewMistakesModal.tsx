import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBootcampDatabase } from '@/hooks/useBootcampDatabase';

interface WrongAnswer {
  question_id: string;
  question_text: string;
  student_answer: string;
  correct_answer: string;
  explanation?: string;
  responded_at: string;
  time_taken_seconds: number;
  topic?: string;
  difficulty?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
}

interface ReviewMistakesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'practice' | 'mock_test';
}

export const ReviewMistakesModal: React.FC<ReviewMistakesModalProps> = ({
  open,
  onOpenChange,
  initialTab = 'practice'
}) => {
  const { student } = useBootcampDatabase();
  const [practiceWrongAnswers, setPracticeWrongAnswers] = useState<WrongAnswer[]>([]);
  const [mockTestWrongAnswers, setMockTestWrongAnswers] = useState<WrongAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && student) {
      loadWrongAnswers();
    }
  }, [open, student]);

  const loadWrongAnswers = async () => {
    if (!student) return;
    
    setIsLoading(true);
    try {
      // Load practice wrong answers with separate question lookup
      const { data: practiceResponsesData, error: practiceError } = await supabase
        .from('bootcamp_student_responses')
        .select(`
          question_id,
          selected_answer,
          responded_at,
          time_taken
        `)
        .eq('student_id', student.student_id)
        .eq('is_correct', false)
        .order('responded_at', { ascending: false })
        .limit(20);

      if (practiceError) throw practiceError;

      // Get question details for practice responses
      const practiceQuestionIds = practiceResponsesData?.map(r => r.question_id) || [];
      let practiceQuestionsData: any[] = [];
      
      if (practiceQuestionIds.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('bootcamp_questions')
          .select(`
            question_id,
            question_text,
            correct_answer,
            explanation,
            option_a,
            option_b,
            option_c,
            option_d,
            difficulty,
            topic_id
          `)
          .in('question_id', practiceQuestionIds);

        if (questionsError) throw questionsError;
        practiceQuestionsData = questionsData || [];
      }

      // Get topic names
      const topicIds = practiceQuestionsData.map(q => q.topic_id).filter(Boolean);
      let topicsData: any[] = [];
      
      if (topicIds.length > 0) {
        const { data: topics, error: topicsError } = await supabase
          .from('bootcamp_topics')
          .select('id, name')
          .in('id', topicIds);

        if (topicsError) throw topicsError;
        topicsData = topics || [];
      }

      // Load mock test wrong answers
      const { data: mockResponsesData, error: mockError } = await supabase
        .from('bootcamp_mock_test_answers')
        .select(`
          question_id,
          student_answer,
          answered_at,
          time_taken_seconds
        `)
        .eq('is_correct', false)
        .order('answered_at', { ascending: false })
        .limit(20);

      if (mockError) throw mockError;

      // Get question details for mock test responses
      const mockQuestionIds = mockResponsesData?.map(r => r.question_id) || [];
      let mockQuestionsData: any[] = [];
      
      if (mockQuestionIds.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('mock_test_questions')
          .select(`
            question_id,
            question_text,
            correct_answer,
            explanation,
            option_a,
            option_b,
            option_c,
            option_d,
            difficulty,
            topic
          `)
          .in('question_id', mockQuestionIds);

        if (questionsError) throw questionsError;
        mockQuestionsData = questionsData || [];
      }

      // Transform practice data
      const transformedPracticeData: WrongAnswer[] = (practiceResponsesData || []).map(response => {
        const question = practiceQuestionsData.find(q => q.question_id === response.question_id);
        const topic = topicsData.find(t => t.id === question?.topic_id);
        
        return {
          question_id: response.question_id,
          question_text: question?.question_text || 'Question not found',
          student_answer: response.selected_answer,
          correct_answer: question?.correct_answer || '',
          explanation: question?.explanation,
          responded_at: response.responded_at,
          time_taken_seconds: response.time_taken,
          topic: topic?.name,
          difficulty: question?.difficulty,
          option_a: question?.option_a,
          option_b: question?.option_b,
          option_c: question?.option_c,
          option_d: question?.option_d,
        };
      });

      // Transform mock test data
      const transformedMockData: WrongAnswer[] = (mockResponsesData || []).map(response => {
        const question = mockQuestionsData.find(q => q.question_id === response.question_id);
        
        return {
          question_id: response.question_id,
          question_text: question?.question_text || 'Question not found',
          student_answer: response.student_answer,
          correct_answer: question?.correct_answer || '',
          explanation: question?.explanation,
          responded_at: response.answered_at,
          time_taken_seconds: response.time_taken_seconds,
          topic: question?.topic,
          difficulty: question?.difficulty,
          option_a: question?.option_a,
          option_b: question?.option_b,
          option_c: question?.option_c,
          option_d: question?.option_d,
        };
      });

      setPracticeWrongAnswers(transformedPracticeData);
      setMockTestWrongAnswers(transformedMockData);
    } catch (error) {
      console.error('Error loading wrong answers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnswerOption = (letter: string, text: string) => {
    return `${letter}. ${text}`;
  };

  const getAnswerText = (answer: WrongAnswer, answerLetter: string) => {
    switch (answerLetter.toUpperCase()) {
      case 'A': return answer.option_a;
      case 'B': return answer.option_b;
      case 'C': return answer.option_c;
      case 'D': return answer.option_d;
      default: return answerLetter;
    }
  };

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const QuestionCard = ({ answer, type }: { answer: WrongAnswer; type: string }) => (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-2">{answer.question_text}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {answer.topic && (
              <Badge variant="secondary" className="text-xs">
                {answer.topic}
              </Badge>
            )}
            {answer.difficulty && (
              <Badge variant="outline" className="text-xs">
                {answer.difficulty}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeSpent(answer.time_taken_seconds)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(answer.responded_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Answer Options */}
      {answer.option_a && (
        <div className="space-y-2">
          <div className="grid gap-2">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionText = getAnswerText(answer, letter);
              if (!optionText) return null;
              
              const isStudentAnswer = answer.student_answer.toUpperCase() === letter;
              const isCorrectAnswer = answer.correct_answer.toUpperCase() === letter;
              
              return (
                <div
                  key={letter}
                  className={`p-2 rounded border text-sm ${
                    isCorrectAnswer
                      ? 'bg-success/10 border-success text-success'
                      : isStudentAnswer
                      ? 'bg-destructive/10 border-destructive text-destructive'
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  {formatAnswerOption(letter, optionText)}
                  {isStudentAnswer && !isCorrectAnswer && (
                    <span className="ml-2 text-xs">(Your answer)</span>
                  )}
                  {isCorrectAnswer && (
                    <span className="ml-2 text-xs">(Correct)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation */}
      {answer.explanation && (
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-1">Explanation:</h4>
          <p className="text-sm text-muted-foreground">{answer.explanation}</p>
        </div>
      )}
    </div>
  );

  const renderQuestionsList = (questions: WrongAnswer[], type: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading questions...</span>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No incorrect answers found for {type.toLowerCase()}.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? 's' : ''} to review
          </h3>
        </div>
        {questions.map((answer, index) => (
          <QuestionCard key={`${answer.question_id}-${index}`} answer={answer} type={type} />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Review Mistakes
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="practice">Practice Questions</TabsTrigger>
            <TabsTrigger value="mock_test">Mock Tests</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="practice" className="mt-0">
              {renderQuestionsList(practiceWrongAnswers, 'Practice')}
            </TabsContent>

            <TabsContent value="mock_test" className="mt-0">
              {renderQuestionsList(mockTestWrongAnswers, 'Mock Test')}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};