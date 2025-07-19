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
import { Target, Clock, X, Sparkles } from 'lucide-react';

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
  id: number;
  question_id: string;
  answer_given: string;
  answered_at: string;
  time_taken_seconds: number;
  topic: string;
  subtopic: string;
  is_correct: boolean;
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
  const [generatingExplanations, setGeneratingExplanations] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && focusArea && user) {
      loadFocusAreaQuestions();
    }
  }, [open, focusArea, user]);

  const loadFocusAreaQuestions = async () => {
    if (!focusArea || !user) return;

    setLoading(true);
    try {
      // Get incorrect answers for this topic
      const { data: answersData, error } = await supabase
        .from('student_answers')
        .select(`
          id,
          question_id,
          answer_given,
          answered_at,
          time_taken_seconds,
          topic,
          subtopic,
          is_correct
        `)
        .eq('student_id', user.id)
        .eq('topic', focusArea.topic)
        .eq('is_correct', false)
        .order('answered_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching focus area questions:', error);
        return;
      }

      if (answersData && answersData.length > 0) {
        // Get the curriculum data for these questions
        const questionIds = answersData.map(answer => answer.question_id);
        const { data: curriculumData } = await supabase
          .from('curriculum')
          .select('question_id, example_question, options, correct_answer, red_herring_explanation')
          .in('question_id', questionIds);

        // Combine the data
        const questionsWithCurriculum = answersData.map(answer => ({
          ...answer,
          curriculum: curriculumData?.find(q => q.question_id === answer.question_id) || null
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
    } catch (error) {
      console.error('Error loading focus area questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionExplanation = async (question: QuestionAnswer) => {
    if (!question.curriculum || !focusArea) return;

    console.log('🧠 Starting AI explanation generation for focus area question:', question.question_id);

    setGeneratingExplanations(prev => new Set(prev).add(question.id));

    try {
      console.log('🔗 Calling explain-question-mistake edge function...');
      
      const { data, error } = await supabase.functions.invoke('explain-question-mistake', {
        body: {
          question: question.curriculum.example_question,
          student_answer: question.answer_given,
          correct_answer: question.curriculum.correct_answer,
          misconception: 'focus_area_improvement',
          topic: question.topic
        }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { 
            ...q, 
            aiExplanation: "Having trouble creating your explanation right now. The main thing is to learn from this mistake and try a different approach next time!"
          } : q
        ));
        return;
      }

      if (data?.explanation) {
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { ...q, aiExplanation: data.explanation } : q
        ));
        console.log('✅ Successfully received AI explanation');
      } else {
        console.log('❌ No explanation in API response:', data);
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { 
            ...q, 
            aiExplanation: "Working on your explanation! Making mistakes is how we learn." 
          } : q
        ));
      }
    } catch (error) {
      console.error('💥 Exception during API call:', error);
      setQuestions(prev => prev.map(q => 
        q.id === question.id ? { 
          ...q, 
          aiExplanation: "Every mistake is a step closer to getting it right! Keep practicing." 
        } : q
      ));
    } finally {
      setGeneratingExplanations(prev => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <span>Focus Area: {focusArea?.topic}</span>
          </DialogTitle>
          <DialogDescription>
            Questions you answered incorrectly in this topic. 
            {focusArea && (
              <span className="font-semibold">
                {' '}Current accuracy: {Math.round(focusArea.accuracy * 100)}% ({focusArea.attempts} attempts)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Questions Section */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading questions...</span>
            </div>
          )}

          {!loading && questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No incorrect questions found for this topic. Keep practicing to improve!
            </div>
          )}

          {!loading && questions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{question.time_taken_seconds}s</span>
                    </Badge>
                    <Badge variant="secondary">{question.subtopic}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Answered on {new Date(question.answered_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.curriculum && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Question:</h4>
                      <p className="text-sm">{question.curriculum.example_question}</p>
                    </div>

                    {question.curriculum.options && (
                      <div>
                        <h4 className="font-semibold mb-2">Options:</h4>
                        <ul className="space-y-1">
                          {formatOptions(question.curriculum.options).map((option, optIndex) => (
                            <li 
                              key={optIndex}
                              className={`text-sm p-2 rounded ${
                                option === question.answer_given 
                                  ? 'bg-red-100 text-red-800 border border-red-300' 
                                  : option === question.curriculum?.correct_answer
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {option === question.answer_given && <X className="inline h-3 w-3 mr-1" />}
                              {option === question.curriculum?.correct_answer && <span className="text-green-600 font-semibold mr-1">✓</span>}
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-red-700">Your Answer:</h4>
                        <p className="text-sm bg-red-50 p-2 rounded border">{question.answer_given}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-green-700">Correct Answer:</h4>
                        <p className="text-sm bg-green-50 p-2 rounded border">{question.curriculum.correct_answer}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-blue-700 flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Explanation</span>
                      </h4>
                      
                      {generatingExplanations.has(question.id) && (
                        <div className="bg-blue-50 p-3 rounded border flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-blue-700">Creating your explanation...</span>
                        </div>
                      )}
                      
                      {question.aiExplanation && (
                        <div className="bg-blue-50 p-3 rounded border">
                          <div className="text-sm whitespace-pre-line leading-relaxed [&>p]:mb-4 [&>div]:mb-4">{question.aiExplanation}</div>
                        </div>
                      )}
                      
                      {!question.aiExplanation && !generatingExplanations.has(question.id) && (
                        <div className="bg-gray-50 p-3 rounded border text-center">
                          <p className="text-sm text-gray-600">Explanation will appear here automatically</p>
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