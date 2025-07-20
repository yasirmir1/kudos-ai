import React, { useState } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";

interface CsvImportModalProps {
  children: React.ReactNode;
}

interface CsvRow {
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  question_type: string;
  options: string;
  correct_answer: string;
  difficulty: string;
  red_herring_tag?: string;
  red_herring_explanation?: string;
  pedagogical_notes?: string;
  year_level?: string;
  age_group?: string;
}

interface ImportResult {
  success: number;
  errors: number;
  details: string[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        question_id: "ALG001",
        topic: "Algebra",
        subtopic: "Linear Equations",
        example_question: "What is x if 2x + 5 = 11?",
        question_type: "multiple_choice",
        options: JSON.stringify(["x = 2", "x = 3", "x = 4", "x = 5"]),
        correct_answer: "x = 3",
        difficulty: "Medium",
        red_herring_tag: "substitution_error,arithmetic_error",
        red_herring_explanation: "Students might make substitution or arithmetic errors",
        pedagogical_notes: "Focus on isolating the variable step by step",
        year_level: "6",
        age_group: "11+"
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curriculum_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as CsvRow[];
          // Filter out empty rows
          const validData = data.filter(row => row.question_id && row.topic);
          setCsvData(validData);
          toast({
            title: "CSV Parsed",
            description: `Found ${validData.length} valid questions to import.`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      },
      header: true,
      skipEmptyLines: true,
      error: (error) => {
        toast({
          title: "Error",
          description: `CSV parsing error: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };

  const validateRow = (row: CsvRow): string[] => {
    const errors: string[] = [];
    
    if (!row.question_id) errors.push("Missing question_id");
    if (!row.topic) errors.push("Missing topic");
    if (!row.subtopic) errors.push("Missing subtopic");
    if (!row.example_question) errors.push("Missing example_question");
    if (!row.question_type) errors.push("Missing question_type");
    if (!row.correct_answer) errors.push("Missing correct_answer");
    if (!row.difficulty) errors.push("Missing difficulty");
    
    // Validate difficulty values
    if (row.difficulty && !['Easy', 'Medium', 'Hard'].includes(row.difficulty)) {
      errors.push("Invalid difficulty (must be Easy, Medium, or Hard)");
    }
    
    // Validate age group
    if (row.age_group && !['year 2-3', 'year 4-5', '11+'].includes(row.age_group)) {
      errors.push("Invalid age_group (must be 'year 2-3', 'year 4-5', or '11+')");
    }
    
    // Validate options for multiple choice questions
    if (row.question_type === 'multiple_choice' && row.options) {
      try {
        JSON.parse(row.options);
      } catch {
        errors.push("Invalid options format (must be valid JSON array)");
      }
    }
    
    return errors;
  };

  const processImport = async () => {
    if (csvData.length === 0) {
      toast({
        title: "Error",
        description: "No data to import",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const importResult: ImportResult = { success: 0, errors: 0, details: [] };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      setProgress((i / csvData.length) * 100);

      // Validate row
      const validationErrors = validateRow(row);
      if (validationErrors.length > 0) {
        importResult.errors++;
        importResult.details.push(`Row ${i + 1} (${row.question_id}): ${validationErrors.join(', ')}`);
        continue;
      }

      try {
        // Prepare data for insertion
        const insertData = {
          question_id: row.question_id,
          topic: row.topic,
          subtopic: row.subtopic,
          example_question: row.example_question,
          question_type: row.question_type,
          options: row.options ? JSON.parse(row.options) : null,
          correct_answer: row.correct_answer,
          difficulty: row.difficulty,
          red_herring_tag: row.red_herring_tag ? row.red_herring_tag.split(',').map(tag => tag.trim()) : null,
          red_herring_explanation: row.red_herring_explanation || null,
          pedagogical_notes: row.pedagogical_notes || null,
          year_level: row.year_level ? parseInt(row.year_level) : null,
          age_group: (row.age_group as "year 2-3" | "year 4-5" | "11+") || 'year 4-5'
        };

        const { error } = await supabase
          .from('curriculum')
          .insert(insertData);

        if (error) {
          importResult.errors++;
          importResult.details.push(`Row ${i + 1} (${row.question_id}): ${error.message}`);
        } else {
          importResult.success++;
        }
      } catch (error) {
        importResult.errors++;
        importResult.details.push(`Row ${i + 1} (${row.question_id}): ${error}`);
      }
    }

    setProgress(100);
    setIsProcessing(false);
    setResult(importResult);

    toast({
      title: "Import Complete",
      description: `Successfully imported ${importResult.success} questions. ${importResult.errors} errors.`,
      variant: importResult.errors > 0 ? "destructive" : "default",
    });
  };

  const resetModal = () => {
    setCsvData([]);
    setResult(null);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetModal();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Questions from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Template
              </CardTitle>
              <CardDescription>
                Download a CSV template with the correct format and sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Select your CSV file containing curriculum questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {csvData.length} questions ready to import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto">
                  {csvData.slice(0, 5).map((row, index) => (
                    <div key={index} className="flex items-center gap-2 py-2 border-b">
                      <Badge variant="outline">{row.question_id}</Badge>
                      <span className="text-sm">{row.topic} - {row.subtopic}</span>
                      <Badge variant="secondary">{row.difficulty}</Badge>
                    </div>
                  ))}
                  {csvData.length > 5 && (
                    <div className="text-sm text-muted-foreground py-2">
                      ... and {csvData.length - 5} more questions
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={processImport} 
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? "Importing..." : "Import Questions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing questions...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.errors === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.success}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>

                  {result.details.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">Import Details:</div>
                          <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                            {result.details.map((detail, index) => (
                              <div key={index}>{detail}</div>
                            ))}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};