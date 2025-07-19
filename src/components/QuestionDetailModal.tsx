import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string | null;
  studentAnswer: {
    id: number;
    question_id: string;
    topic: string;
    subtopic: string;
    difficulty: string;
    answer_given: string;
    is_correct: boolean;
    time_taken_seconds: number;
    answered_at: string;
    red_herring_triggered?: string[];
  } | null;
}

interface CurriculumData {
  example_question: string;
  options: any;
  correct_answer: string;
  red_herring_explanation?: string;
  pedagogical_notes?: string;
}

export const QuestionDetailModal = ({ 
  open, 
  onOpenChange, 
  questionId, 
  studentAnswer 
}: QuestionDetailModalProps) => {
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [generatingExplanation, setGeneratingExplanation] = useState(false);

  useEffect(() => {
    if (open && questionId) {
      loadQuestionDetails();
    }
  }, [open, questionId]);

  const loadQuestionDetails = async () => {
    if (!questionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum')
        .select('example_question, options, correct_answer, red_herring_explanation, pedagogical_notes')
        .eq('question_id', questionId)
        .single();

      if (error) throw error;
      setCurriculumData(data);

      // Generate AI explanation if answer was incorrect
      if (studentAnswer && !studentAnswer.is_correct && data) {
        generateAiExplanation(data, studentAnswer);
      }
    } catch (error) {
      console.error('Error loading question details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAiExplanation = async (curriculum: CurriculumData, answer: any) => {
    setGeneratingExplanation(true);
    setAiExplanation('');

    try {
      const { data, error } = await supabase.functions.invoke('explain-question-mistake', {
        body: {
          question: curriculum.example_question,
          student_answer: answer.answer_given,
          correct_answer: curriculum.correct_answer,
          misconception: answer.red_herring_triggered?.[0] || 'general_mistake',
          topic: answer.topic
        }
      });

      if (error) {
        console.error('Error generating explanation:', error);
        setAiExplanation("I'm having trouble creating your explanation right now. The main thing is to learn from this mistake and try a different approach next time!");
        return;
      }

      if (data?.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation("I'm working on your explanation! In the meantime, remember that making mistakes is how we learn. You're doing great!");
      }
    } catch (error) {
      console.error('Exception during AI explanation:', error);
      setAiExplanation("Every mistake is a step closer to getting it right! Keep practicing and you'll master this concept.");
    } finally {
      setGeneratingExplanation(false);
    }
  };

  const formatOptions = (options: any) => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'object') {
      return Object.values(options);
    }
    return [];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  if (!studentAnswer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {studentAnswer.is_correct ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <span>Question Details</span>
          </DialogTitle>
          <DialogDescription>
            Answered on {formatDate(studentAnswer.answered_at)} • {studentAnswer.subtopic}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">{studentAnswer.topic}</Badge>
              <Badge variant="outline">{studentAnswer.difficulty}</Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(studentAnswer.time_taken_seconds)}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading question details...</span>
            </div>
          ) : curriculumData ? (
            <>
              {/* Question */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed">{curriculumData.example_question}</p>
                </CardContent>
              </Card>

              {/* Options and Answers */}
              {curriculumData.options && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Answer Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formatOptions(curriculumData.options).map((option, index) => {
                        const isStudentAnswer = option === studentAnswer.answer_given;
                        const isCorrectAnswer = option === curriculumData.correct_answer;
                        
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              isStudentAnswer && isCorrectAnswer
                                ? 'border-green-500 bg-green-50 text-green-900'
                                : isStudentAnswer
                                ? 'border-red-500 bg-red-50 text-red-900'
                                : isCorrectAnswer
                                ? 'border-green-500 bg-green-50 text-green-900'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              <div className="flex space-x-2">
                                {isStudentAnswer && (
                                  <Badge variant={isCorrectAnswer ? "default" : "destructive"} className="text-xs">
                                    Your Answer
                                  </Badge>
                                )}
                                {isCorrectAnswer && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Explanation for incorrect answers */}
              {!studentAnswer.is_correct && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Explanation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatingExplanation && (
                      <div className="bg-blue-50 p-4 rounded border flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-blue-700">Creating a helpful explanation just for you...</span>
                      </div>
                    )}
                    
                    {aiExplanation && (
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="text-sm whitespace-pre-line leading-[1.4] [&>div]:mb-6 [&>p]:mb-6 [&_h4]:mb-4">{aiExplanation}</div>
                      </div>
                    )}
                    
                    {!aiExplanation && !generatingExplanation && (
                      <div className="bg-gray-50 p-4 rounded border text-center">
                        <p className="text-sm text-gray-600">Explanation will appear here automatically</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Static explanations for correct answers or general info */}
              {(curriculumData.red_herring_explanation || curriculumData.pedagogical_notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {curriculumData.red_herring_explanation && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Why other answers might seem tempting:</h4>
                        <p className="text-sm leading-relaxed">{curriculumData.red_herring_explanation}</p>
                      </div>
                    )}
                    {curriculumData.pedagogical_notes && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Learning tip:</h4>
                        <p className="text-sm leading-relaxed">{curriculumData.pedagogical_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Question details not found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};