import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import jsPDF from 'jspdf';

interface Question {
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

const TOPICS = [
  'Numbers and Operations',
  'Algebra',
  'Geometry',
  'Measurement',
  'Data Analysis',
  'Probability',
  'Fractions',
  'Decimals',
  'Percentages'
];

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
];

export const WorksheetGeneratorModal = () => {
  const { toast } = useToast();
  const { selectedAgeGroup } = useAgeGroup();
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Form state
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [worksheetTitle, setWorksheetTitle] = useState('Math Practice Worksheet');

  const generateWorksheet = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      toast({
        title: "Missing Information",
        description: "Please select both topic and difficulty level.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setProgress(0);
    setGeneratedQuestions([]);

    try {
      // Get existing questions from database first (filtered by age group)
      const { data: existingQuestions } = await supabase
        .from('curriculum')
        .select('*')
        .eq('topic', selectedTopic)
        .eq('difficulty', selectedDifficulty)
        .eq('age_group', selectedAgeGroup)
        .limit(questionCount);

      if (existingQuestions && existingQuestions.length >= questionCount) {
        // Use existing questions
        const formattedQuestions = existingQuestions.slice(0, questionCount).map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : 
                   typeof q.options === 'string' ? JSON.parse(q.options) : 
                   Object.values(q.options || {})
        }));
        setGeneratedQuestions(formattedQuestions);
        setProgress(100);
      } else {
        // Generate new questions via AI using streaming endpoint
        const subtopic = existingQuestions?.[0]?.subtopic || 'General';
        
        console.log('Making authenticated request to generate-questions...');
        
        // Get the session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        const response = await fetch('https://gqkfbxhuijpfcnjimlfj.functions.supabase.co/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa2ZieGh1aWpwZmNuamltbGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQxMTcsImV4cCI6MjA2ODQ5MDExN30.n-sE8DxhfmuZmNju-L3zy6hWshTGzr_cpFEeBB0JZIo',
          },
          body: JSON.stringify({
            topic: selectedTopic,
            subtopic: subtopic,
            difficulty: selectedDifficulty,
            count: questionCount,
            age_group: selectedAgeGroup,
            saveToDatabase: true
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to generate questions: ${response.status} ${errorText}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const newQuestions: Question[] = [];
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'question') {
                    const question = data.data;
                    const formattedQuestion: Question = {
                      ...question,
                      options: Array.isArray(question.options) ? question.options : 
                               typeof question.options === 'string' ? JSON.parse(question.options) : 
                               Object.values(question.options || {})
                    };
                    newQuestions.push(formattedQuestion);
                    setGeneratedQuestions([...newQuestions]);
                    setProgress((newQuestions.length / questionCount) * 100);
                  }
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          }
        }
      }

      toast({
        title: "Worksheet Generated!",
        description: `Created ${questionCount} questions for ${selectedTopic}.`,
      });
    } catch (error) {
      console.error('Error generating worksheet:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate worksheet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (generatedQuestions.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 30;

    // Colors based on your design system
    const primaryColor: [number, number, number] = [79, 70, 229]; // Primary blue
    const accentColor: [number, number, number] = [147, 197, 253]; // Light blue
    
    // Header with branding
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 25);
    
    // Kudos logo placeholder (you can replace with actual logo)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KUDOS', 15, 17);
    
    // Worksheet title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(worksheetTitle, pageWidth / 2, 40, { align: 'center' });
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const subtitle = `${selectedTopic} • ${selectedDifficulty} Level • ${questionCount} Questions`;
    pdf.text(subtitle, pageWidth / 2, 50, { align: 'center' });
    
    // Student info section
    yPosition = 70;
    pdf.setFontSize(10);
    pdf.text('Student Name: ________________________', 15, yPosition);
    pdf.text('Date: _______________', pageWidth - 80, yPosition);
    
    // Instructions
    yPosition += 20;
    pdf.setFillColor(...accentColor);
    pdf.rect(10, yPosition - 5, pageWidth - 20, 15);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Instructions: Circle the correct answer for each question.', 15, yPosition + 5);
    
    yPosition += 25;

    // Questions
    generatedQuestions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 30;
      }

      // Question number and text
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}.`, 15, yPosition);
      
      // Question text with word wrap
      pdf.setFont('helvetica', 'normal');
      const questionLines = pdf.splitTextToSize(question.example_question, pageWidth - 40);
      pdf.text(questionLines, 25, yPosition);
      yPosition += questionLines.length * 5 + 5;

      // Answer options
      question.options.forEach((option, optionIndex) => {
        const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D
        pdf.setFontSize(10);
        
        // Circle for selection
        pdf.circle(20, yPosition - 1, 2);
        pdf.text(`${optionLabel}) ${option}`, 30, yPosition);
        yPosition += 8;
      });
      
      yPosition += 5; // Space between questions
    });

    // Answer key on last page
    pdf.addPage();
    yPosition = 30;
    
    // Answer key header
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 25);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANSWER KEY', pageWidth / 2, 17, { align: 'center' });
    
    yPosition = 50;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    
    generatedQuestions.forEach((question, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const answerLetter = String.fromCharCode(65 + question.options.indexOf(question.correct_answer));
      pdf.text(`${index + 1}. ${answerLetter}) ${question.correct_answer}`, 15, yPosition);
      yPosition += 10;
    });

    // Footer
    const timestamp = new Date().toLocaleDateString();
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated by Kudos Education Platform - ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download the PDF
    const filename = `${worksheetTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${selectedDifficulty}_${timestamp.replace(/\//g, '-')}.pdf`;
    pdf.save(filename);

    toast({
      title: "PDF Downloaded!",
      description: `Worksheet saved as ${filename}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Generate Worksheets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Practice Worksheets - {selectedAgeGroup}</span>
          </DialogTitle>
          <DialogDescription>
            Create child-friendly PDF worksheets for {selectedAgeGroup} with custom topics and difficulty levels
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Worksheet Settings</CardTitle>
              <CardDescription>Configure your worksheet parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="worksheet-title">Worksheet Title</Label>
                <Input
                  id="worksheet-title"
                  value={worksheetTitle}
                  onChange={(e) => setWorksheetTitle(e.target.value)}
                  placeholder="Math Practice Worksheet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={diff.color} variant="secondary">
                            {diff.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions (5-50)</Label>
                <Input
                  id="count"
                  type="number"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                  placeholder="Enter between 5 and 50"
                />
                <p className="text-xs text-muted-foreground">Maximum 50 questions per worksheet</p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={generateWorksheet}
                  disabled={generating || !selectedTopic || !selectedDifficulty}
                  className="flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Worksheet
                    </>
                  )}
                </Button>
              </div>

              {generating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Worksheet Preview</CardTitle>
              <CardDescription>
                {generatedQuestions.length > 0 
                  ? `${generatedQuestions.length} questions ready for download`
                  : 'Questions will appear here after generation'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedQuestions.length > 0 ? (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {generatedQuestions.slice(0, 3).map((question, index) => (
                      <div key={question.question_id} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">Question {index + 1}</h4>
                          <Badge variant="outline" className="text-xs">
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm mb-3">{question.example_question}</p>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2 text-xs">
                              <span className="w-4 h-4 border rounded-full flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {generatedQuestions.length > 3 && (
                      <div className="text-center p-4 text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">
                          +{generatedQuestions.length - 3} more questions in full worksheet
                        </p>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={downloadPDF}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Worksheet
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure settings and generate questions to see preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};