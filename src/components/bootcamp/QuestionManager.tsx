import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  BarChart,
  Target
} from 'lucide-react';

interface Question {
  id: number;
  question_id: string;
  topic_id: string;
  subtopic_id: string;
  module_id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  cognitive_level: string;
  marks: number;
  time_seconds: number;
  prerequisite_skills: string[];
  exam_boards: string[];
}

interface Answer {
  answer_id: string;
  question_id: string;
  answer_value: string;
  is_correct: boolean;
  misconception_type: string;
  error_category: string;
  diagnostic_feedback: string;
  remedial_topic: string;
}

interface StudentResponse {
  response_id: string;
  student_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken: number;
  misconception_detected: string;
  responded_at: string;
}

interface QuestionType {
  id: string;
  name: string;
  format: string;
  timing: string;
  boards: string[];
}

interface DifficultyLevel {
  level_name: string;
  description: string;
  score_range_min: number;
  score_range_max: number;
  typical_age: string;
  color: string;
}

interface TopicAnalysis {
  topic_id: string;
  topic_name: string;
  difficulty: string;
  question_count: number;
  success_rate: number;
  avg_time: number;
  students_attempted: number;
}

export const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestionData();
  }, []);

  const loadQuestionData = async () => {
    try {
      setLoading(true);
      
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('bootcamp_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (questionsError && questionsError.code !== 'PGRST116') {
        console.warn('Questions not available:', questionsError);
      }

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from('bootcamp_answers')
        .select('*')
        .limit(200);

      if (answersError && answersError.code !== 'PGRST116') {
        console.warn('Answers not available:', answersError);
      }

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('bootcamp_student_responses')
        .select('*')
        .order('responded_at', { ascending: false })
        .limit(100);

      if (responsesError && responsesError.code !== 'PGRST116') {
        console.warn('Responses not available:', responsesError);
      }

      // Fetch question types
      const { data: typesData, error: typesError } = await supabase
        .from('bootcamp_question_types')
        .select('*');

      if (typesError && typesError.code !== 'PGRST116') {
        console.warn('Question types not available:', typesError);
      }

      // Fetch difficulty levels
      const { data: difficultyData, error: difficultyError } = await supabase
        .from('bootcamp_difficulty_levels')
        .select('*')
        .order('score_range_min');

      if (difficultyError && difficultyError.code !== 'PGRST116') {
        console.warn('Difficulty levels not available:', difficultyError);
      }

      // Skip topic analysis for now - table doesn't exist
      
      setQuestions(questionsData || []);
      setAnswers(answersData || []);
      setResponses(responsesData || []);
      setQuestionTypes(typesData || []);
      setDifficultyLevels(difficultyData || []);
      setTopicAnalysis([]);

    } catch (err) {
      console.error('Error loading question data:', err);
      setError('Failed to load question management data');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'foundation': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionAnswers = (questionId: string) => {
    return answers.filter(answer => answer.question_id === questionId);
  };

  const getQuestionResponses = (questionId: string) => {
    return responses.filter(response => response.question_id === questionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading question data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Question Management</h1>
        <p className="text-muted-foreground">Manage questions, analyze performance, and track student responses</p>
      </div>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analysis">Topic Analysis</TabsTrigger>
          <TabsTrigger value="types">Question Types</TabsTrigger>
          <TabsTrigger value="difficulty">Difficulty Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {questions.length > 0 ? questions.map((question) => {
              const questionAnswers = getQuestionAnswers(question.question_id);
              const questionResponses = getQuestionResponses(question.question_id);
              const accuracy = questionResponses.length > 0 
                ? (questionResponses.filter(r => r.is_correct).length / questionResponses.length) * 100 
                : 0;
              
              return (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{question.question_id}</CardTitle>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.question_type}</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedQuestion(question)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{question.question_text}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Topic:</span>
                        <br />
                        <span>{question.topic_id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Marks:</span>
                        <br />
                        <span>{question.marks}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Time:</span>
                        <br />
                        <span>{question.time_seconds}s</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Responses:</span>
                        <br />
                        <span>{questionResponses.length}</span>
                      </div>
                    </div>

                    {questionResponses.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Success Rate</span>
                          <span>{Math.round(accuracy)}%</span>
                        </div>
                        <Progress value={accuracy} className="h-2" />
                      </div>
                    )}

                    {question.prerequisite_skills && question.prerequisite_skills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Prerequisites:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.prerequisite_skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Questions Available</h3>
                  <p className="text-muted-foreground">
                    Generate some questions to start managing the question bank.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {responses.length > 0 ? responses.map((response) => (
              <Card key={response.response_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {response.is_correct ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">Question {response.question_id}</span>
                    </div>
                    <Badge variant={response.is_correct ? "default" : "destructive"}>
                      {response.is_correct ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Answer:</span> {response.selected_answer}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {response.time_taken}s
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(response.responded_at).toLocaleDateString()}
                    </div>
                    {response.misconception_detected && (
                      <div>
                        <span className="font-medium">Misconception:</span> {response.misconception_detected}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Responses Yet</h3>
                  <p className="text-muted-foreground">
                    Student responses will appear here once they start practicing.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicAnalysis.map((topic) => (
              <Card key={topic.topic_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{topic.topic_name}</CardTitle>
                    <Badge className={getDifficultyColor(topic.difficulty)}>
                      {topic.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Questions:</span>
                      <br />
                      <span className="text-lg font-bold">{topic.question_count}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Students:</span>
                      <br />
                      <span className="text-lg font-bold">{topic.students_attempted}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{Math.round(topic.success_rate)}%</span>
                    </div>
                    <Progress value={topic.success_rate} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Avg Time: {Math.round(topic.avg_time)}s</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Format:</span>
                    <p className="text-sm">{type.format}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Timing:</span>
                    <p className="text-sm">{type.timing}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Exam Boards:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {type.boards.map((board, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {board}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="difficulty" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {difficultyLevels.map((level) => (
              <Card key={level.level_name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{level.level_name}</CardTitle>
                    <Badge style={{ backgroundColor: level.color, color: 'white' }}>
                      {level.score_range_min}-{level.score_range_max}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{level.description}</p>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Typical Age:</span>
                    <p className="text-sm">{level.typical_age}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Score Range:</span>
                    <p className="text-sm">{level.score_range_min} - {level.score_range_max}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};