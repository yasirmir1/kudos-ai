import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BootcampAPI } from '@/lib/bootcamp-api';
import { useToast } from '@/hooks/use-toast';

interface LearningExperienceProps {
  studentId: string;
  onComplete?: () => void;
}

interface Topic {
  id: string;
  name: string;
  difficulty: string;
  skills: string[];
  topic_order: number;
  progress: {
    status: string;
    accuracy_percentage: number;
    mastery_score: number;
  };
}

interface LearningSession {
  session_id: string;
  session_type: string;
  session_start: string;
}

export function LearningExperience({ studentId, onComplete }: LearningExperienceProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [topicProgress, setTopicProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadLearningPath();
  }, [studentId]);

  const loadLearningPath = async () => {
    try {
      setIsLoading(true);
      const learningPath = await BootcampAPI.getLearningPath(studentId);
      setTopics(learningPath);
      
      // Find the first incomplete topic
      const firstIncomplete = learningPath.findIndex(
        topic => topic.progress.status === 'not_started' || topic.progress.status === 'in_progress'
      );
      
      if (firstIncomplete !== -1) {
        setCurrentTopicIndex(firstIncomplete);
      }
    } catch (error) {
      console.error('Error loading learning path:', error);
      toast({
        title: "Error",
        description: "Failed to load learning path",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startLearningSession = async () => {
    try {
      const session = await BootcampAPI.startLearningSession(studentId, 'learning');
      setCurrentSession(session);
      
      toast({
        title: "Learning Session Started",
        description: "Your progress will be tracked throughout this session.",
      });
    } catch (error) {
      console.error('Error starting learning session:', error);
      toast({
        title: "Error",
        description: "Failed to start learning session",
        variant: "destructive"
      });
    }
  };

  const completeTopicStep = async (topicId: string, stepProgress: number) => {
    setTopicProgress(prev => ({
      ...prev,
      [topicId]: stepProgress
    }));

    // If topic is complete (100%), update progress in database
    if (stepProgress >= 100) {
      try {
        await BootcampAPI.updateStudentProgress(studentId, topicId, 85, 45); // Mock values for demo
        
        // Move to next topic
        if (currentTopicIndex < topics.length - 1) {
          setCurrentTopicIndex(currentTopicIndex + 1);
        } else {
          // All topics completed
          if (currentSession) {
            await BootcampAPI.endLearningSession(
              currentSession.session_id, 
              topics.length, 
              topics.length, 
              topics.map(t => t.id)
            );
          }
          
          toast({
            title: "Congratulations!",
            description: "You've completed the entire learning path!",
          });
          
          onComplete?.();
        }
        
        // Reload learning path to get updated progress
        await loadLearningPath();
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'in_progress': return 'text-orange-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <Award className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentTopic = topics[currentTopicIndex];

  return (
    <div className="space-y-6">
      {/* Learning Path Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {currentTopicIndex} of {topics.length} topics</span>
              <span>{Math.round((currentTopicIndex / topics.length) * 100)}% Complete</span>
            </div>
            <Progress value={(currentTopicIndex / topics.length) * 100} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {topics.map((topic, index) => (
                <Card 
                  key={topic.id} 
                  className={`transition-all ${
                    index === currentTopicIndex 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : index < currentTopicIndex 
                        ? 'bg-green-50 dark:bg-green-950/20' 
                        : 'opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(topic.progress.status)}
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {topic.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={topicProgress[topic.id] || (topic.progress.mastery_score * 100)} 
                        className="h-1" 
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={getProgressColor(topic.progress.status)}>
                          {topic.progress.status.replace('_', ' ')}
                        </span>
                        <span>{Math.round(topicProgress[topic.id] || (topic.progress.mastery_score * 100))}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Topic Focus */}
      {currentTopic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Currently Learning: {currentTopic.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{currentTopic.difficulty}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Skills: {currentTopic.skills.join(', ')}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Learning Steps</h4>
                <div className="space-y-2">
                  {['Concept Introduction', 'Guided Practice', 'Independent Practice', 'Assessment'].map((step, index) => {
                    const stepProgress = ((topicProgress[currentTopic.id] || 0) / 100) * 4;
                    const isCompleted = stepProgress > index;
                    const isCurrent = Math.floor(stepProgress) === index;
                    
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <span className={`flex-1 ${isCompleted ? 'text-green-600 line-through' : isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                          {step}
                        </span>
                        {isCurrent && (
                          <Button 
                            size="sm" 
                            onClick={() => completeTopicStep(currentTopic.id, (index + 1) * 25)}
                          >
                            Complete Step
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {!currentSession && (
                <Button onClick={startLearningSession} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Start Learning Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skill Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Arithmetic', 'Problem Solving', 'Pattern Recognition', 'Logical Reasoning'].map((skill) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill}</span>
                  <span className="text-muted-foreground">
                    {Math.floor(Math.random() * 40 + 60)}%
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 40 + 60)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}