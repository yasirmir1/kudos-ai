import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wand2, 
  Download, 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Sparkles,
  Eye,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedQuestion {
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  red_herring_tag?: string[];
  red_herring_explanation?: string;
  pedagogical_notes?: string;
}

interface GenerationEvent {
  type: 'question' | 'saved' | 'error' | 'complete';
  data?: GeneratedQuestion;
  index?: number;
  total?: number;
  message?: string;
  questionId?: string;
  totalGenerated?: number;
  apiUsed?: string;
  saved?: boolean;
}

export const QuestionGeneratorModal = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    subtopic: '',
    difficulty: '',
    count: 5,
    saveToDatabase: true
  });
  
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');
  const [previewQuestion, setPreviewQuestion] = useState<GeneratedQuestion | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<Set<string>>(new Set());
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  
  const commonTopics = [
    'Number - Number and Place Value',
    'Number - Addition, Subtraction, Multiplication and Division',
    'Number - Fractions (including decimals and percentages)',
    'Algebra',
    'Geometry - Properties of shapes',
    'Geometry - Position and direction',
    'Measurement',
    'Statistics'
  ];

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!formData.topic || !formData.subtopic || !formData.difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);
    setProgress(0);
    setSavedQuestions(new Set());
    setCurrentStatus('Initializing AI generation...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: formData
      });

      if (error) {
        throw error;
      }

      // The response should be a ReadableStream for SSE
      const response = await fetch(`https://gqkfbxhuijpfcnjimlfj.supabase.co/functions/v1/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa2ZieGh1aWpwZmNuamltbGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQxMTcsImV4cCI6MjA2ODQ5MDExN30.n-sE8DxhfmuZmNju-L3zy6hWshTGzr_cpFEeBB0JZIo'}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData: GenerationEvent = JSON.parse(line.slice(6));
              
              switch (eventData.type) {
                case 'question':
                  if (eventData.data && eventData.index && eventData.total) {
                    setGeneratedQuestions(prev => [...prev, eventData.data!]);
                    setProgress((eventData.index / eventData.total) * 100);
                    setCurrentStatus(`Generated question ${eventData.index} of ${eventData.total}`);
                  }
                  break;
                  
                case 'saved':
                  if (eventData.questionId) {
                    setSavedQuestions(prev => new Set(prev).add(eventData.questionId!));
                    setCurrentStatus(`Saved question ${eventData.index} to database`);
                  }
                  break;
                  
                case 'error':
                  console.error('Generation error:', eventData.message);
                  toast({
                    title: "Generation Error",
                    description: eventData.message,
                    variant: "destructive"
                  });
                  break;
                  
                case 'complete':
                  setProgress(100);
                  setCurrentStatus(`Complete! Generated ${eventData.totalGenerated} questions using ${eventData.apiUsed?.toUpperCase()}`);
                  toast({
                    title: "Generation Complete",
                    description: `Successfully generated ${eventData.totalGenerated} questions${eventData.saved ? ' and saved to database' : ''}`,
                  });
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIndividualQuestion = async (question: GeneratedQuestion) => {
    try {
      const { error } = await supabase
        .from('curriculum')
        .insert(question);

      if (error) {
        throw error;
      }

      setSavedQuestions(prev => new Set(prev).add(question.question_id));
      toast({
        title: "Question Saved",
        description: `Question "${question.question_id}" saved to database`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save question',
        variant: "destructive"
      });
    }
  };

  const downloadQuestions = () => {
    const dataStr = JSON.stringify(generatedQuestions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `questions_${formData.topic.replace(/\s+/g, '_')}_${formData.subtopic.replace(/\s+/g, '_')}_${formData.difficulty}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Wand2 className="h-4 w-4" />
          <span>Generate Questions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Question Generator</span>
          </DialogTitle>
          <DialogDescription>
            Generate high-quality multiple choice questions using AI, based on your existing curriculum structure
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Select value={formData.topic} onValueChange={(value) => setFormData(prev => ({...prev, topic: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTopics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subtopic">Subtopic</Label>
                <Input
                  id="subtopic"
                  value={formData.subtopic}
                  onChange={(e) => setFormData(prev => ({...prev, subtopic: e.target.value}))}
                  placeholder="e.g., Place Value to 1000"
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({...prev, difficulty: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.count}
                  onChange={(e) => setFormData(prev => ({...prev, count: parseInt(e.target.value) || 5}))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="saveToDatabase"
                  checked={formData.saveToDatabase}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, saveToDatabase: checked}))}
                />
                <Label htmlFor="saveToDatabase">Auto-save to database</Label>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{currentStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Generated Questions ({generatedQuestions.length})</CardTitle>
              {generatedQuestions.length > 0 && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadQuestions}>
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {generatedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generated questions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedQuestions.map((question, index) => (
                      <Card key={question.question_id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="secondary">{question.difficulty}</Badge>
                                <Badge variant="outline">{question.subtopic}</Badge>
                                {savedQuestions.has(question.question_id) && (
                                  <Badge variant="default" className="bg-green-600">
                                    <Database className="h-3 w-3 mr-1" />
                                    Saved
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium mb-2">{question.example_question}</p>
                              <p className="text-sm text-muted-foreground">
                                Correct Answer: {question.correct_answer}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewQuestion(question)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!savedQuestions.has(question.question_id) && !formData.saveToDatabase && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => saveIndividualQuestion(question)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Question Preview Modal */}
        {previewQuestion && (
          <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Question Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Question:</h4>
                  <p>{previewQuestion.example_question}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Options:</h4>
                  <div className="space-y-2">
                    {previewQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border ${
                          option === previewQuestion.correct_answer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {option === previewQuestion.correct_answer && (
                          <CheckCircle className="inline h-4 w-4 text-green-600 mr-2" />
                        )}
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                {previewQuestion.red_herring_explanation && (
                  <div>
                    <h4 className="font-semibold mb-2">Red Herring Explanation:</h4>
                    <p className="text-sm">{previewQuestion.red_herring_explanation}</p>
                  </div>
                )}

                {previewQuestion.pedagogical_notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Teaching Notes:</h4>
                    <p className="text-sm">{previewQuestion.pedagogical_notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};