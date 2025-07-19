import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface GenerationResult {
  topic: string;
  subtopic: string;
  difficulty: string;
  status: 'success' | 'error';
  count?: number;
  error?: string;
}

interface BulkGenerationResponse {
  success: boolean;
  summary: {
    totalCombinations: number;
    successful: number;
    failed: number;
    questionsPerType: number;
  };
  results: GenerationResult[];
}

export const BulkQuestionGenerator = () => {
  const [questionsPerType, setQuestionsPerType] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BulkGenerationResponse | null>(null);
  const { toast } = useToast();

  const handleBulkGeneration = async () => {
    if (questionsPerType < 1 || questionsPerType > 1000) {
      toast({
        title: "Invalid number",
        description: "Please enter a number between 1 and 1000.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-generate-questions', {
        body: { questionsPerType }
      });

      if (error) {
        throw new Error(error.message);
      }

      setResults(data);
      
      if (data.success) {
        toast({
          title: "Bulk generation completed!",
          description: `Generated questions for ${data.summary.successful} topic combinations. ${data.summary.failed} failed.`,
        });
      } else {
        toast({
          title: "Generation failed",
          description: data.error || "An error occurred during bulk generation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk generation error:', error);
      toast({
        title: "Generation failed",
        description: "Failed to start bulk generation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Bulk Question Generator
          </CardTitle>
          <CardDescription>
            Generate questions for all existing topic/subtopic/difficulty combinations in your curriculum.
            This will populate your question database with AI-generated questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questions-per-type">Questions per Topic Combination</Label>
            <Input
              id="questions-per-type"
              type="number"
              min="1"
              max="1000"
              value={questionsPerType}
              onChange={(e) => setQuestionsPerType(parseInt(e.target.value) || 100)}
              disabled={isGenerating}
            />
            <p className="text-sm text-muted-foreground">
              This will generate {questionsPerType} questions for each unique topic/subtopic/difficulty combination.
            </p>
          </div>

          <Button
            onClick={handleBulkGeneration}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Start Bulk Generation"
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Generation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.summary.totalCombinations}</div>
                  <div className="text-sm text-muted-foreground">Total Combinations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{results.summary.successful}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{results.summary.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.summary.questionsPerType}</div>
                  <div className="text-sm text-muted-foreground">Per Type</div>
                </div>
              </div>
            )}

            {results.summary && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{results.summary.successful + results.summary.failed} / {results.summary.totalCombinations}</span>
                </div>
                <Progress 
                  value={((results.summary.successful + results.summary.failed) / results.summary.totalCombinations) * 100} 
                />
              </div>
            )}

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detailed Results:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        result.status === 'success' 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <span className="font-medium">
                        {result.topic} - {result.subtopic} ({result.difficulty})
                      </span>
                      <span>
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};