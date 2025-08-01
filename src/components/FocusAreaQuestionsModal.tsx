import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Target, Clock, X, Sparkles, AlertTriangle, CheckCircle, Star } from 'lucide-react';

interface FocusAreaQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusArea: {
    topic: string;
    accuracy: number;
    attempts: number;
  } | null;
}

interface QuestionAnswer {
  question_id: string;
  latest_answer_given: string;
  latest_answered_at: string;
  avg_time_taken_seconds: number;
  topic: string;
  subtopic: string;
  attempts_count: number;
  curriculum: {
    example_question: string;
    options: any;
    correct_answer: string;
    red_herring_explanation: string;
  } | null;
  aiExplanation?: string;
}

export function FocusAreaQuestionsModal({ 
  open, 
  onOpenChange, 
  focusArea 
}: FocusAreaQuestionsModalProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingExplanations, setGeneratingExplanations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && focusArea && user) {
      loadFocusAreaQuestions();
    }
  }, [open, focusArea, user]);

  const loadFocusAreaQuestions = async () => {
    if (!focusArea || !user) return;

    setLoading(true);
    try {
      // Get all incorrect answers for this topic
      const { data: answersData, error } = await supabase
        .from('student_answers')
        .select(`
          question_id,
          answer_given,
          answered_at,
          time_taken_seconds,
          topic,
          subtopic
        `)
        .eq('student_id', user.id)
        .eq('topic', focusArea.topic)
        .eq('is_correct', false)
        .order('answered_at', { ascending: false });

      if (error) {
        console.error('Error fetching focus area questions:', error);
        return;
      }

      if (answersData && answersData.length > 0) {
        // Group by question_id to get unique questions with counts
        const uniqueQuestions = new Map();
        answersData.forEach(answer => {
          if (!uniqueQuestions.has(answer.question_id)) {
            uniqueQuestions.set(answer.question_id, {
              question_id: answer.question_id,
              latest_answer_given: answer.answer_given,
              latest_answered_at: answer.answered_at,
              avg_time_taken_seconds: answer.time_taken_seconds,
              topic: answer.topic,
              subtopic: answer.subtopic,
              attempts_count: 1,
              curriculum: null
            });
          } else {
            const existing = uniqueQuestions.get(answer.question_id);
            existing.attempts_count += 1;
            // Keep the latest answer as the primary one
            if (new Date(answer.answered_at) > new Date(existing.latest_answered_at)) {
              existing.latest_answer_given = answer.answer_given;
              existing.latest_answered_at = answer.answered_at;
            }
          }
        });

        const processedData = Array.from(uniqueQuestions.values()).slice(0, 10);

        if (processedData.length > 0) {
          // Get the curriculum data for these questions
          const questionIds = processedData.map(q => q.question_id);
          const { data: curriculumData } = await supabase
            .from('curriculum')
            .select('question_id, example_question, options, correct_answer, red_herring_explanation')
            .in('question_id', questionIds);

          // Combine the data
          const questionsWithCurriculum = processedData.map(question => ({
            ...question,
            curriculum: curriculumData?.find(q => q.question_id === question.question_id) || null
          }));

          setQuestions(questionsWithCurriculum);
          
          // Automatically generate AI explanations for all questions
          questionsWithCurriculum.forEach(question => {
            if (question.curriculum) {
              generateQuestionExplanation(question);
            }
          });
        } else {
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error loading focus area questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionExplanation = async (question: QuestionAnswer) => {
    if (!question.curriculum || !focusArea) return;

    console.log('🧠 Starting AI explanation generation for focus area question:', question.question_id);

    setGeneratingExplanations(prev => new Set(prev).add(question.question_id));

    try {
      console.log('🔗 Calling explain-question-mistake edge function...');
      
      const { data, error } = await supabase.functions.invoke('explain-question-mistake', {
        body: {
          question: question.curriculum.example_question,
          student_answer: question.latest_answer_given,
          correct_answer: question.curriculum.correct_answer,
          misconception: 'focus_area_improvement',
          topic: question.topic
        }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        setQuestions(prev => prev.map(q => 
          q.question_id === question.question_id ? { 
            ...q, 
            aiExplanation: "Having trouble creating your explanation right now. The main thing is to learn from this mistake and try a different approach next time!"
          } : q
        ));
        return;
      }

      if (data?.explanation) {
        setQuestions(prev => prev.map(q => 
          q.question_id === question.question_id ? { ...q, aiExplanation: data.explanation } : q
        ));
        console.log('✅ Successfully received AI explanation');
      } else {
        console.log('❌ No explanation in API response:', data);
        setQuestions(prev => prev.map(q => 
          q.question_id === question.question_id ? { 
            ...q, 
            aiExplanation: "Working on your explanation! Making mistakes is how we learn." 
          } : q
        ));
      }
    } catch (error) {
      console.error('💥 Exception during API call:', error);
      setQuestions(prev => prev.map(q => 
        q.question_id === question.question_id ? { 
          ...q, 
          aiExplanation: "Every mistake is a step closer to getting it right! Keep practicing." 
        } : q
      ));
    } finally {
      setGeneratingExplanations(prev => {
        const newSet = new Set(prev);
        newSet.delete(question.question_id);
        return newSet;
      });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-background">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center space-x-3 text-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="text-foreground font-bold">
              Let's Practice: {focusArea?.topic}
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-center">
            <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 mt-2 border border-border/50">
              <p className="text-foreground font-medium">
                🎯 These are questions where you can improve! 
              </p>
              {focusArea && (
                <p className="text-sm text-muted-foreground mt-1">
                  Your current score: <span className="font-bold text-primary">{Math.round(focusArea.accuracy * 100)}%</span> 
                  {' '}• You've tried <span className="font-bold">{focusArea.attempts}</span> questions
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Questions Section */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary mb-3"></div>
              <span className="text-primary font-medium">Finding your practice questions...</span>
            </div>
          )}

          {!loading && questions.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-primary font-semibold text-lg mb-2">Amazing Work! 🎉</p>
                <p className="text-primary/70">You haven't made any mistakes in this topic yet. Keep up the great work!</p>
              </div>
            </div>
          )}

          {!loading && questions.map((question, index) => (
            <Card key={question.question_id} className="border border-border bg-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3 bg-muted/20 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-lg text-primary">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <span>Practice Question {index + 1}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Tried {question.attempts_count} time{question.attempts_count > 1 ? 's' : ''}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(question.avg_time_taken_seconds)}s</span>
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{question.subtopic}</Badge>
                  </div>
                </div>
                <p className="text-xs text-primary/70 mt-1">
                  Last tried on {new Date(question.latest_answered_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {question.curriculum && (
                  <>
                    <div className="bg-muted/20 border-l-4 border-primary p-3 rounded-r-lg">
                      <h4 className="font-bold mb-2 text-foreground flex items-center space-x-2">
                        <span>❓</span>
                        <span>The Question:</span>
                      </h4>
                      <p className="text-foreground font-medium">{question.curriculum.example_question}</p>
                    </div>

                    {question.curriculum.options && (
                      <div className="bg-muted border border-border p-3 rounded-lg">
                        <h4 className="font-bold mb-2 text-foreground flex items-center space-x-2">
                          <span>📝</span>
                          <span>Answer Choices:</span>
                        </h4>
                        <ul className="space-y-2">
                          {formatOptions(question.curriculum.options).map((option, optIndex) => (
                            <li 
                              key={optIndex}
                              className={`text-sm p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                                option === question.latest_answer_given 
                                  ? 'bg-muted text-foreground border-muted-foreground/40 shadow-sm' 
                                  : option === question.curriculum?.correct_answer
                                  ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                                  : 'bg-card border-border text-foreground'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {option === question.latest_answer_given && (
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="text-xs font-bold">Your answer</span>
                                  </div>
                                )}
                                {option === question.curriculum?.correct_answer && (
                                  <div className="flex items-center space-x-1 text-primary">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs font-bold">Correct answer</span>
                                  </div>
                                )}
                                <span className="flex-1">{option}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-muted/20 border p-3 rounded-lg">
                        <h4 className="font-bold mb-2 text-foreground flex items-center space-x-2">
                          <span>❌</span>
                          <span>What You Picked:</span>
                        </h4>
                        <p className="text-foreground font-medium bg-card p-2 rounded border">{question.latest_answer_given}</p>
                      </div>
                      <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg">
                        <h4 className="font-bold mb-2 text-primary flex items-center space-x-2">
                          <span>✅</span>
                          <span>The Right Answer:</span>
                        </h4>
                        <p className="text-primary font-medium bg-card p-2 rounded border">{question.curriculum.correct_answer}</p>
                      </div>
                    </div>

                    <div className="bg-muted/20 border p-4 rounded-lg">
                      <h4 className="font-bold mb-3 text-foreground flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>🧠 Let's Learn From This!</span>
                      </h4>
                      
                      {generatingExplanations.has(question.question_id) && (
                        <div className="bg-card/70 p-4 rounded-lg border border-border flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/30 border-t-primary"></div>
                          <span className="text-primary font-medium">Creating your explanation...</span>
                          <Star className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                      )}
                      
                      {question.aiExplanation && (
                        <div className="bg-card/80 p-4 rounded-lg border border-border">
                          <div className="text-sm leading-relaxed text-foreground whitespace-pre-line [&>div]:mb-3 [&>p]:mb-3 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-primary">
                            {question.aiExplanation}
                          </div>
                        </div>
                      )}
                      
                      {!question.aiExplanation && !generatingExplanations.has(question.question_id) && (
                        <div className="bg-card/70 p-4 rounded-lg border border-border text-center">
                          <p className="text-muted-foreground font-medium">Your personalized explanation is coming soon! 🌟</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
