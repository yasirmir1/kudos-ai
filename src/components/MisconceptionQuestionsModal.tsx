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
import { AlertCircle, Clock, X, Sparkles, AlertTriangle } from 'lucide-react';

interface MisconceptionQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  misconception: {
    red_herring: string;
    frequency: number;
    topics: string[];
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

export function MisconceptionQuestionsModal({ 
  open, 
  onOpenChange, 
  misconception 
}: MisconceptionQuestionsModalProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingExplanations, setGeneratingExplanations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && misconception && user) {
      loadMisconceptionQuestions();
    }
  }, [open, misconception, user]);

  const loadMisconceptionQuestions = async () => {
    if (!misconception || !user) return;

    setLoading(true);
    try {
      // Get student answers that triggered this specific misconception
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
        .eq('is_correct', false)
        .contains('red_herring_triggered', [misconception.red_herring])
        .order('answered_at', { ascending: false });

      if (error) {
        console.error('Error fetching misconception questions:', error);
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
              generateKidFriendlyExplanation(question);
            }
          });
        } else {
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error loading misconception questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMisconceptionName = (redHerring: string) => {
    return redHerring
      ?.replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim() || 'Unknown Misconception';
  };

  const formatOptions = (options: any) => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'object') {
      return Object.values(options);
    }
    return [];
  };

  const generateKidFriendlyExplanation = async (question: QuestionAnswer) => {
    if (!question.curriculum || !misconception) return;

    console.log('🧠 Starting AI explanation generation for question:', question.question_id);
    console.log('📝 Misconception:', misconception.red_herring);

    setGeneratingExplanations(prev => new Set(prev).add(question.question_id));

    try {
      console.log('🔗 Calling explain-question-mistake edge function...');
      
      const { data, error } = await supabase.functions.invoke('explain-question-mistake', {
        body: {
          question: question.curriculum.example_question,
          student_answer: question.latest_answer_given,
          correct_answer: question.curriculum.correct_answer,
          misconception: misconception.red_herring,
          topic: question.topic
        }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        // Show a fallback message instead of failing silently
        setQuestions(prev => prev.map(q => 
          q.question_id === question.question_id ? { 
            ...q, 
            aiExplanation: "🤗 Oops! I'm having trouble creating your explanation right now. The main thing is to learn from this mistake and try a different approach next time!" 
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
        // Show fallback message
        setQuestions(prev => prev.map(q => 
          q.question_id === question.question_id ? { 
            ...q, 
            aiExplanation: "🤗 I'm working on your explanation! In the meantime, remember that making mistakes is how we learn. You're doing great!" 
          } : q
        ));
      }
    } catch (error) {
      console.error('💥 Exception during API call:', error);
      // Show fallback message for any unexpected errors
      setQuestions(prev => prev.map(q => 
        q.question_id === question.question_id ? { 
          ...q, 
          aiExplanation: "🌟 Every mistake is a step closer to getting it right! Keep practicing and you'll master this concept." 
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Misconception: {misconception ? formatMisconceptionName(misconception.red_herring) : ''}</span>
          </DialogTitle>
          <DialogDescription>
            Unique questions where you encountered this misconception pattern. 
            {misconception && <span className="font-semibold"> Occurred {misconception.frequency} times in: {misconception.topics.join(', ')}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm">Loading questions...</span>
            </div>
          )}

          {!loading && questions.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No specific questions found for this misconception.
            </div>
          )}

          {!loading && questions.map((question, index) => (
            <Card key={question.question_id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Question {index + 1}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{question.attempts_count} attempt{question.attempts_count > 1 ? 's' : ''}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(question.avg_time_taken_seconds)}s avg</span>
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{question.topic}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last answered on {new Date(question.latest_answered_at).toLocaleDateString()} • {question.subtopic}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {question.curriculum && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Question:</h4>
                      <p className="text-sm">{question.curriculum.example_question}</p>
                    </div>

                    {question.curriculum.options && (
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Options:</h4>
                        <ul className="space-y-1">
                          {formatOptions(question.curriculum.options).map((option, optIndex) => (
                            <li 
                              key={optIndex}
                              className={`text-sm p-1.5 rounded ${
                                option === question.latest_answer_given 
                                  ? 'bg-red-100 text-red-800 border border-red-300' 
                                  : option === question.curriculum?.correct_answer
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {option === question.latest_answer_given && <X className="inline h-3 w-3 mr-1" />}
                              {option === question.curriculum?.correct_answer && <span className="text-green-600 font-semibold mr-1">✓</span>}
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <h4 className="font-semibold mb-1 text-sm text-red-700">Your Latest Answer:</h4>
                        <p className="text-sm bg-red-50 p-1.5 rounded border">{question.latest_answer_given}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm text-green-700">Correct Answer:</h4>
                        <p className="text-sm bg-green-50 p-1.5 rounded border">{question.curriculum.correct_answer}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1 text-sm text-blue-700 flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Explanation</span>
                      </h4>
                      
                      {generatingExplanations.has(question.question_id) && (
                        <div className="bg-blue-50 p-2 rounded border flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-blue-700">Creating a fun explanation just for you...</span>
                        </div>
                      )}
                      
                      {question.aiExplanation && (
                        <div className="bg-blue-50 p-2 rounded border">
                          <div className="text-sm whitespace-pre-line leading-[1.4] [&>div]:mb-3 [&>p]:mb-3 [&_h4]:mb-2 [&_strong]:font-semibold [&>h1]:mb-3 [&>h2]:mb-3 [&>h3]:mb-3">{question.aiExplanation}</div>
                        </div>
                      )}
                      
                      {!question.aiExplanation && !generatingExplanations.has(question.question_id) && (
                        <div className="bg-gray-50 p-2 rounded border text-center">
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
