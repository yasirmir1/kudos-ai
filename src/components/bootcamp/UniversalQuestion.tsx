import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Lightbulb, GripVertical } from 'lucide-react';
import { RemediationSuggestion } from './RemediationSuggestion';
import { BootcampAPI, type BootcampQuestion } from '@/lib/bootcamp-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type QuestionType = 'multiple_choice' | 'written_answer' | 'drag_drop' | 'written_entry';

interface UniversalQuestionProps {
  question: BootcampQuestion & {
    question_type: QuestionType;
    drag_items?: string[];
    drop_zones?: { id: string; label: string; correct_items: string[] }[];
  };
  onAnswer: (response: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    confidence: number | null;
    misconception?: string;
    feedback: string;
  }) => void;
  questionNumber: number;
  totalQuestions: number;
  studentId: string;
  sessionId?: string;
}

interface DragItem {
  id: string;
  content: string;
  position: { x: number; y: number } | null;
  zone: string | null;
}

export const UniversalQuestion: React.FC<UniversalQuestionProps> = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
  studentId,
  sessionId
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const dragContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (question.question_type === 'drag_drop' && question.drag_items) {
      setDragItems(
        question.drag_items.map((item, index) => ({
          id: `item-${index}`,
          content: item,
          position: null,
          zone: null
        }))
      );
    }
  }, [question]);

  const handleAnswerSelect = async (answer: string) => {
    if (!selectedAnswer && !isSubmitting) {
      setIsSubmitting(true);
      setSelectedAnswer(answer);
      setShowDiagnostic(true);
      
      try {
        const response = await BootcampAPI.submitResponse({
          student_id: studentId,
          question_id: question.question_id,
          selected_answer: answer,
          time_taken_seconds: timeSpent,
          confidence_rating: confidence,
          session_id: sessionId
        });

        onAnswer({
          questionId: question.question_id,
          selectedAnswer: answer,
          isCorrect: response.is_correct,
          timeSpent,
          confidence,
          misconception: response.misconception,
          feedback: response.feedback
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleWrittenSubmit = async () => {
    if (writtenAnswer.trim() && !isSubmitting) {
      await handleAnswerSelect(writtenAnswer.trim());
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    setDragItems(items =>
      items.map(item =>
        item.id === draggedItem
          ? { ...item, zone: zoneId }
          : item
      )
    );
    setDraggedItem(null);
  };

  const handleDragDropSubmit = async () => {
    if (!question.drop_zones || isSubmitting) return;
    
    const result = question.drop_zones.map(zone => ({
      zone: zone.id,
      items: dragItems.filter(item => item.zone === zone.id).map(item => item.content),
      correct: zone.correct_items
    }));

    const isCorrect = result.every(zone => 
      zone.items.length === zone.correct.length &&
      zone.items.every(item => zone.correct.includes(item))
    );

    await handleAnswerSelect(JSON.stringify(result));
  };

  const getDiagnosticStyles = (option: any) => {
    if (!showDiagnostic) return 'border-border hover:border-border/60 hover:bg-muted/50';
    if (option.is_correct) return 'border-success bg-success/10';
    if (option.answer_option === selectedAnswer) return 'border-destructive bg-destructive/10';
    return 'border-border';
  };

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.bootcamp_answers?.map(option => {
        const isSelected = selectedAnswer === option.answer_option;
        
        return (
          <button
            key={option.answer_option}
            onClick={() => handleAnswerSelect(option.answer_option)}
            disabled={showDiagnostic || isSubmitting}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all",
              getDiagnosticStyles(option),
              showDiagnostic ? 'cursor-not-allowed' : 'cursor-pointer',
              !showDiagnostic && isSelected ? 'border-primary bg-primary/10' : ''
            )}
          >
            <div className="flex items-start space-x-3">
              <span className="font-medium text-muted-foreground mt-0.5">{option.answer_option}.</span>
              <div className="flex-1">
                <span className="text-foreground">{option.answer_value}</span>
                
                {showDiagnostic && isSelected && (
                  <div className="mt-3 space-y-2">
                    <div className={cn(
                      "flex items-start space-x-2 p-3 rounded-lg",
                      option.is_correct ? 'bg-success/10' : 'bg-destructive/10'
                    )}>
                      {option.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <p className={cn(
                        "text-sm",
                        option.is_correct ? 'text-success' : 'text-destructive'
                      )}>
                        {option.diagnostic_feedback}
                      </p>
                    </div>
                    
                    {!option.is_correct && option.misconception_type && (
                      <div className="flex items-start space-x-2 p-3 bg-warning/10 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-warning mb-1">
                            Misconception Detected: {option.misconception_type}
                          </p>
                          <p className="text-sm text-warning/80">
                            This error pattern has been identified for targeted practice.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderWrittenAnswer = () => (
    <div className="space-y-4">
      <Textarea
        value={writtenAnswer}
        onChange={(e) => setWrittenAnswer(e.target.value)}
        placeholder="Type your answer here..."
        disabled={showDiagnostic}
        className="min-h-[120px]"
      />
      {!showDiagnostic && (
        <Button 
          onClick={handleWrittenSubmit} 
          disabled={!writtenAnswer.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </Button>
      )}
      {showDiagnostic && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Your answer: {writtenAnswer}</p>
          <p className="text-sm mt-2">Answer submitted for review.</p>
        </div>
      )}
    </div>
  );

  const renderWrittenEntry = () => (
    <div className="space-y-4">
      <Input
        value={writtenAnswer}
        onChange={(e) => setWrittenAnswer(e.target.value)}
        placeholder="Enter your answer..."
        disabled={showDiagnostic}
        className="text-lg"
      />
      {!showDiagnostic && (
        <Button 
          onClick={handleWrittenSubmit} 
          disabled={!writtenAnswer.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </Button>
      )}
      {showDiagnostic && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Your answer: {writtenAnswer}</p>
          <p className="text-sm mt-2">Answer submitted for review.</p>
        </div>
      )}
    </div>
  );

  const renderDragDrop = () => (
    <div className="space-y-6" ref={dragContainerRef}>
      {/* Drag Items */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">Drag these items:</h4>
        <div className="flex flex-wrap gap-2">
          {dragItems.filter(item => !item.zone).map(item => (
            <div
              key={item.id}
              draggable={!showDiagnostic}
              onDragStart={(e) => handleDragStart(e, item.id)}
              className={cn(
                "px-3 py-2 bg-secondary text-secondary-foreground rounded-lg border cursor-move",
                "flex items-center space-x-2",
                showDiagnostic && "cursor-not-allowed opacity-60"
              )}
            >
              <GripVertical className="h-4 w-4" />
              <span>{item.content}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Drop zones:</h4>
        {question.drop_zones?.map(zone => (
          <div
            key={zone.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, zone.id)}
            className={cn(
              "min-h-[80px] p-4 border-2 border-dashed rounded-lg",
              "flex flex-wrap gap-2 items-start",
              showDiagnostic ? "border-border" : "border-muted-foreground/50 hover:border-primary/50"
            )}
          >
            <div className="w-full mb-2">
              <span className="text-sm font-medium">{zone.label}</span>
            </div>
            {dragItems.filter(item => item.zone === zone.id).map(item => (
              <div
                key={item.id}
                className="px-3 py-2 bg-primary/10 text-primary rounded-lg border"
              >
                {item.content}
              </div>
            ))}
          </div>
        ))}
      </div>

      {!showDiagnostic && dragItems.every(item => item.zone) && (
        <Button onClick={handleDragDropSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </Button>
      )}
    </div>
  );

  const renderQuestionContent = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'written_answer':
        return renderWrittenAnswer();
      case 'written_entry':
        return renderWrittenEntry();
      case 'drag_drop':
        return renderDragDrop();
      default:
        return renderMultipleChoice();
    }
  };

  const selectedOption = question.bootcamp_answers?.find(opt => opt.answer_option === selectedAnswer);

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              question.question_category === 'arithmetic' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-secondary/80 text-secondary-foreground'
            )}>
              {question.question_category}
            </span>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              question.difficulty === 'foundation' 
                ? 'bg-success/10 text-success' 
                : question.difficulty === 'intermediate'
                ? 'bg-warning/10 text-warning'
                : 'bg-destructive/10 text-destructive'
            )}>
              {question.difficulty}
            </span>
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
              {question.question_type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">
          {question.question_text}
        </h3>
        
        {question.visual_aid && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <img src={question.visual_aid} alt="Question visual" className="max-w-full h-auto" />
          </div>
        )}

        {!selectedAnswer && !showDiagnostic && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">How confident are you?</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(level => (
                <Button
                  key={level}
                  variant={confidence === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfidence(level)}
                  className="px-3 py-1"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        {renderQuestionContent()}
      </div>

      {showDiagnostic && selectedOption && !selectedOption.is_correct && selectedOption.misconception_type && (
        <RemediationSuggestion 
          misconception={{
            code: selectedOption.misconception_type,
            description: 'This misconception needs targeted practice'
          }}
          topic={question.topic_id}
        />
      )}
    </Card>
  );
};