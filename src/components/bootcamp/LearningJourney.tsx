import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Users, User, Award, CheckCircle } from 'lucide-react';
import { ConceptIntroduction, GuidedPractice, IndependentPractice, Assessment } from './learning-stages';

interface Topic {
  id: string;
  name: string;
  module_id: string;
  difficulty: string;
  skills: string[];
  topic_order: number;
}

interface CurriculumContent {
  id: string;
  topic_id: string;
  stage_type: string;
  title: string;
  description: string;
  content: any;
  stage_order: number;
  estimated_time_minutes: number;
}

interface LearningJourneyProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STAGES = [
  {
    id: 'concept_introduction',
    name: 'Concept Introduction',
    icon: BookOpen,
    color: 'bg-blue-500',
  },
  {
    id: 'guided_practice',
    name: 'Guided Practice',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    id: 'independent_practice',
    name: 'Independent Practice',
    icon: User,
    color: 'bg-orange-500',
  },
  {
    id: 'assessment',
    name: 'Assessment',
    icon: Award,
    color: 'bg-purple-500',
  },
];

export function LearningJourney({ topic, isOpen, onClose, onComplete }: LearningJourneyProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [curriculumContent, setCurriculumContent] = useState<{ [key: string]: CurriculumContent }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic && isOpen) {
      loadCurriculumContent();
    }
  }, [topic, isOpen]);

  const loadCurriculumContent = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bootcamp_curriculum_content')
        .select('*')
        .eq('topic_id', topic.id)
        .order('stage_order');

      if (error) throw error;

      // Organize content by stage type
      const contentByStage: { [key: string]: CurriculumContent } = {};
      data?.forEach(item => {
        contentByStage[item.stage_type] = item;
      });

      setCurriculumContent(contentByStage);
    } catch (error) {
      console.error('Error loading curriculum content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageComplete = (stageIndex: number) => {
    if (!completedStages.includes(stageIndex)) {
      setCompletedStages(prev => [...prev, stageIndex]);
    }
  };

  const handleNext = () => {
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const handleJourneyComplete = () => {
    // Mark all stages as complete
    setCompletedStages([0, 1, 2, 3]);
    onComplete();
    onClose();
  };

  const getProgressPercentage = () => {
    return ((currentStage + 1) / STAGES.length) * 100;
  };

  const renderCurrentStage = () => {
    const stage = STAGES[currentStage];
    const content = curriculumContent[stage.id];

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading learning content...</p>
          </div>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="mb-4">
            <stage.icon className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <h3 className="font-semibold mb-2">{stage.name}</h3>
          <p>Content for this stage is being prepared.</p>
          <p className="text-sm">Please check back later for complete learning materials.</p>
          <div className="mt-4">
            <Button 
              onClick={() => {
                handleStageComplete(currentStage);
                if (currentStage < STAGES.length - 1) {
                  handleNext();
                } else {
                  handleJourneyComplete();
                }
              }}
              variant="outline"
            >
              Continue to Next Stage
            </Button>
          </div>
        </div>
      );
    }

    const commonProps = {
      content: content.content,
      onComplete: () => handleStageComplete(currentStage),
      onNext: handleNext,
      onPrevious: handlePrevious,
    };

    switch (stage.id) {
      case 'concept_introduction':
        return <ConceptIntroduction {...commonProps} />;
      case 'guided_practice':
        return <GuidedPractice {...commonProps} />;
      case 'independent_practice':
        return <IndependentPractice {...commonProps} />;
      case 'assessment':
        return <Assessment content={content.content} onComplete={handleJourneyComplete} onPrevious={handlePrevious} />;
      default:
        return <div>Unknown stage</div>;
    }
  };

  if (!topic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Learning Journey: {topic.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Stage {currentStage + 1} of {STAGES.length}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Stage Navigator */}
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((stage, index) => {
              const StageIcon = stage.icon;
              const isCompleted = completedStages.includes(index);
              const isCurrent = index === currentStage;
              const isAccessible = index <= currentStage;

              return (
                <Button
                  key={stage.id}
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  className={`p-3 h-auto flex-col gap-2 relative ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => isAccessible ? setCurrentStage(index) : undefined}
                  disabled={!isAccessible}
                >
                  <div className="flex items-center gap-2">
                    <StageIcon className="h-4 w-4" />
                    {isCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
                  </div>
                  <span className="text-xs text-center">{stage.name}</span>
                  {isCurrent && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                      Current
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Current Stage Content */}
          <div className="min-h-[400px]">
            {renderCurrentStage()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}