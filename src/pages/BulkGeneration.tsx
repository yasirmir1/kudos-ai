import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const BulkGeneration = () => {
  const [questionsPerCombination, setQuestionsPerCombination] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [stats, setStats] = useState({ successful: 0, failed: 0, totalGenerated: 0 });
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    setResults([]);
    setProgress({ current: 0, total: 0 });
    setStats({ successful: 0, failed: 0, totalGenerated: 0 });

    try {
      const response = await fetch('https://gqkfbxhuijpfcnjimlfj.supabase.co/functions/v1/bulk-generate-all-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa2ZieGh1aWpwZmNuamltbGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQxMTcsImV4cCI6MjA2ODQ5MDExN30.n-sE8DxhfmuZmNju-L3zy6hWshTGzr_cpFEeBB0JZIo`
        },
        body: JSON.stringify({
          questionsPerCombination
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'start') {
                    setProgress({ current: 0, total: data.totalCombinations });
                    toast({
                      title: "Bulk generation started",
                      description: `Processing ${data.totalCombinations} combinations with ${data.questionsPerCombination} questions each`,
                    });
                  } else if (data.type === 'progress') {
                    setProgress({ current: data.current, total: data.total });
                  } else if (data.type === 'combination_complete') {
                    setResults(prev => [...prev, { ...data, status: 'success' }]);
                    setStats(prev => ({ 
                      ...prev, 
                      successful: prev.successful + 1,
                      totalGenerated: prev.totalGenerated + data.generated
                    }));
                  } else if (data.type === 'combination_error') {
                    setResults(prev => [...prev, { ...data, status: 'error' }]);
                    setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
                  } else if (data.type === 'complete') {
                    toast({
                      title: "Bulk generation complete!",
                      description: `Generated ${data.totalGenerated} questions. ${data.successful} successful, ${data.failed} failed.`,
                    });
                  } else if (data.type === 'error') {
                    toast({
                      title: "Generation error",
                      description: data.message,
                      variant: "destructive",
                    });
                  }
                } catch (e) {
                  // Ignore JSON parsing errors for incomplete chunks
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
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

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Bulk Question Generation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Questions for All Curriculum Combinations</CardTitle>
          <CardDescription>
            This will automatically generate questions for all unique topic/subtopic/difficulty/age-group combinations 
            found in your curriculum database using Perplexity AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questions-per-combination">Questions per Combination</Label>
            <Input
              id="questions-per-combination"
              type="number"
              min="1"
              max="10"
              value={questionsPerCombination}
              onChange={(e) => setQuestionsPerCombination(parseInt(e.target.value) || 5)}
              disabled={isGenerating}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              How many questions to generate for each unique combination
            </p>
          </div>

          <Button
            onClick={handleBulkGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              `Start Bulk Generation`
            )}
          </Button>

          {/* Progress indicator during generation */}
          {isGenerating && progress.total > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress: {progress.current}/{progress.total} combinations</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalGenerated}</div>
                  <div className="text-sm text-blue-700">Questions Generated</div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Using Perplexity AI with your API credits
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generation Results ({results.length} combinations processed)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-sm ${
                    result.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{result.combination.topic}</span>
                      <span className="text-muted-foreground"> - {result.combination.subtopic}</span>
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                        {result.combination.difficulty}
                      </span>
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-secondary/10 text-secondary-foreground">
                        {result.combination.age_group}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">{result.generated || 0} questions</span>
                          {result.apiUsed && (
                            <span className="text-xs text-muted-foreground">({result.apiUsed})</span>
                          )}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-700">Failed</span>
                        </>
                      )}
                    </div>
                  </div>
                  {result.error && (
                    <p className="text-red-600 mt-1 text-xs">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};