import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react";

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
  
  // DeepSeek generation states
  const [isGeneratingDeepSeek, setIsGeneratingDeepSeek] = useState(false);
  const [deepSeekTopic, setDeepSeekTopic] = useState('');
  const [deepSeekDifficulty, setDeepSeekDifficulty] = useState('foundation');
  const [deepSeekCount, setDeepSeekCount] = useState(5);
  const [deepSeekResults, setDeepSeekResults] = useState<any>(null);
  
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

  const handleDeepSeekGeneration = async () => {
    if (!deepSeekTopic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for question generation.",
        variant: "destructive",
      });
      return;
    }

    if (deepSeekCount < 1 || deepSeekCount > 20) {
      toast({
        title: "Invalid count",
        description: "Please enter a number between 1 and 20.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDeepSeek(true);
    setDeepSeekResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-bootcamp-questions', {
        body: { 
          topic: deepSeekTopic,
          difficulty: deepSeekDifficulty,
          count: deepSeekCount
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setDeepSeekResults(data);
      
      if (data.success) {
        toast({
          title: "Questions generated successfully!",
          description: `Generated ${data.generated} questions for ${deepSeekTopic} at ${deepSeekDifficulty} level.`,
        });
      } else {
        toast({
          title: "Generation failed",
          description: data.error || "An error occurred during question generation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('DeepSeek generation error:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate questions with DeepSeek. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDeepSeek(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            DeepSeek AI Question Generator
          </CardTitle>
          <CardDescription>
            Generate high-quality questions for specific topics using DeepSeek AI.
            Perfect for targeting specific areas or creating custom practice sets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deepseek-topic">Topic</Label>
              <Input
                id="deepseek-topic"
                placeholder="e.g., Fractions, Place Value, Multiplication"
                value={deepSeekTopic}
                onChange={(e) => setDeepSeekTopic(e.target.value)}
                disabled={isGeneratingDeepSeek}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deepseek-difficulty">Difficulty Level</Label>
              <Select value={deepSeekDifficulty} onValueChange={setDeepSeekDifficulty} disabled={isGeneratingDeepSeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foundation">Foundation</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deepseek-count">Question Count</Label>
              <Input
                id="deepseek-count"
                type="number"
                min="1"
                max="20"
                value={deepSeekCount}
                onChange={(e) => setDeepSeekCount(parseInt(e.target.value) || 5)}
                disabled={isGeneratingDeepSeek}
              />
            </div>
          </div>

          <Button
            onClick={handleDeepSeekGeneration}
            disabled={isGeneratingDeepSeek}
            className="w-full"
          >
            {isGeneratingDeepSeek ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with DeepSeek AI...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Questions with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {deepSeekResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {deepSeekResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              DeepSeek Generation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deepSeekResults.success && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{deepSeekResults.generated}</div>
                  <div className="text-sm text-muted-foreground">Questions Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium">{deepSeekTopic}</div>
                  <div className="text-sm text-muted-foreground">Topic</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium capitalize">{deepSeekDifficulty}</div>
                  <div className="text-sm text-muted-foreground">Difficulty</div>
                </div>
              </div>
            )}
            
            {deepSeekResults.message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">{deepSeekResults.message}</p>
              </div>
            )}

            {deepSeekResults.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{deepSeekResults.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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