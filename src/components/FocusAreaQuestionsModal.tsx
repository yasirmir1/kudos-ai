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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-50">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center space-x-3 text-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
              Let's Practice: {focusArea?.topic}
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mt-2">
              <p className="text-gray-700 font-medium">
                🎯 These are questions where you can improve! 
              </p>
              {focusArea && (
                <p className="text-sm text-gray-600 mt-1">
                  Your current score: <span className="font-bold text-orange-600">{Math.round(focusArea.accuracy * 100)}%</span> 
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
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mb-3"></div>
              <span className="text-orange-600 font-medium">Finding your practice questions...</span>
            </div>
          )}

          {!loading && questions.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-semibold text-lg mb-2">Amazing Work! 🎉</p>
                <p className="text-green-600">You haven't made any mistakes in this topic yet. Keep up the great work!</p>
              </div>
            </div>
          )}

          {!loading && questions.map((question, index) => (
            <Card key={question.question_id} className="border-2 border-orange-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-lg text-orange-800">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-200 rounded-full">
                      <span className="text-orange-700 font-bold">{index + 1}</span>
                    </div>
                    <span>Practice Question {index + 1}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs bg-red-50 border-red-200 text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Tried {question.attempts_count} time{question.attempts_count > 1 ? 's' : ''}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs bg-blue-50 border-blue-200 text-blue-700">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(question.avg_time_taken_seconds)}s</span>
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">{question.subtopic}</Badge>
                  </div>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Last tried on {new Date(question.latest_answered_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {question.curriculum && (
                  <>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                      <h4 className="font-bold mb-2 text-blue-800 flex items-center space-x-2">
                        <span>❓</span>
                        <span>The Question:</span>
                      </h4>
                      <p className="text-blue-900 font-medium">{question.curriculum.example_question}</p>
                    </div>

                    {question.curriculum.options && (
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                        <h4 className="font-bold mb-2 text-gray-800 flex items-center space-x-2">
                          <span>📝</span>
                          <span>Answer Choices:</span>
                        </h4>
                        <ul className="space-y-2">
                          {formatOptions(question.curriculum.options).map((option, optIndex) => (
                            <li 
                              key={optIndex}
                              className={`text-sm p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                                option === question.latest_answer_given 
                                  ? 'bg-red-100 text-red-800 border-red-300 shadow-sm' 
                                  : option === question.curriculum?.correct_answer
                                  ? 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {option === question.latest_answer_given && (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <X className="h-4 w-4" />
                                    <span className="text-xs font-bold">Your answer</span>
                                  </div>
                                )}
                                {option === question.curriculum?.correct_answer && (
                                  <div className="flex items-center space-x-1 text-green-600">
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
                      <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg">
                        <h4 className="font-bold mb-2 text-red-700 flex items-center space-x-2">
                          <span>❌</span>
                          <span>What You Picked:</span>
                        </h4>
                        <p className="text-red-800 font-medium bg-white p-2 rounded border">{question.latest_answer_given}</p>
                      </div>
                      <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg">
                        <h4 className="font-bold mb-2 text-green-700 flex items-center space-x-2">
                          <span>✅</span>
                          <span>The Right Answer:</span>
                        </h4>
                        <p className="text-green-800 font-medium bg-white p-2 rounded border">{question.curriculum.correct_answer}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-lg">
                      <h4 className="font-bold mb-3 text-purple-700 flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>🧠 Let's Learn From This!</span>
                      </h4>
                      
                      {generatingExplanations.has(question.question_id) && (
                        <div className="bg-white/70 p-4 rounded-lg border border-purple-200 flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-300 border-t-purple-600"></div>
                          <span className="text-purple-700 font-medium">Creating your explanation...</span>
                          <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
                        </div>
                      )}
                      
                      {question.aiExplanation && (
                        <div className="bg-white/80 p-4 rounded-lg border border-purple-200">
                          <div className="text-sm leading-relaxed text-purple-900 whitespace-pre-line [&>div]:mb-3 [&>p]:mb-3 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-purple-800">
                            {question.aiExplanation}
                          </div>
                        </div>
                      )}
                      
                      {!question.aiExplanation && !generatingExplanations.has(question.question_id) && (
                        <div className="bg-white/70 p-4 rounded-lg border border-purple-200 text-center">
                          <p className="text-purple-600 font-medium">Your personalized explanation is coming soon! 🌟</p>
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
