import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface TopicCombination {
  topic: string;
  subtopic: string;
  difficulty: string;
}

type AgeGroup = "year 2-3" | "year 4-5" | "11+";

export const PerplexityQuestionGenerator = () => {
  const [availableCombinations, setAvailableCombinations] = useState<TopicCombination[]>([]);
  const [selectedCombinations, setSelectedCombinations] = useState<TopicCombination[]>([]);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("year 4-5");
  const [questionsPerCombination, setQuestionsPerCombination] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableCombinations();
  }, [ageGroup]); // Re-load when age group changes

  const loadAvailableCombinations = async () => {
    if (!ageGroup) return; // Don't load if no age group selected
    
    setLoading(true);
    try {
      // Get unique topic/subtopic/difficulty combinations from curriculum filtered by age group
      const { data, error } = await supabase
        .from('curriculum')
        .select('topic, subtopic, difficulty')
        .eq('age_group', ageGroup)
        .order('topic')
        .order('subtopic')
        .order('difficulty');

      if (error) throw error;

      // Create unique combinations
      const uniqueCombinations: TopicCombination[] = [];
      const seen = new Set<string>();

      data?.forEach((item) => {
        const key = `${item.topic}|${item.subtopic}|${item.difficulty}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCombinations.push({
            topic: item.topic,
            subtopic: item.subtopic,
            difficulty: item.difficulty
          });
        }
      });

      setAvailableCombinations(uniqueCombinations);
      // Select all by default for the current age group
      setSelectedCombinations(uniqueCombinations);

      console.log(`Loaded ${uniqueCombinations.length} combinations for age group: ${ageGroup}`);
    } catch (error) {
      console.error('Error loading combinations:', error);
      toast({
        title: "Error",
        description: `Failed to load topic combinations for ${ageGroup}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAllCombinations = (checked: boolean) => {
    setSelectedCombinations(checked ? availableCombinations : []);
  };

  const toggleCombination = (combination: TopicCombination, checked: boolean) => {
    if (checked) {
      setSelectedCombinations([...selectedCombinations, combination]);
    } else {
      setSelectedCombinations(selectedCombinations.filter(c => 
        !(c.topic === combination.topic && c.subtopic === combination.subtopic && c.difficulty === combination.difficulty)
      ));
    }
  };

  const isCombinationSelected = (combination: TopicCombination) => {
    return selectedCombinations.some(c => 
      c.topic === combination.topic && c.subtopic === combination.subtopic && c.difficulty === combination.difficulty
    );
  };

  const handleGenerate = async () => {
    if (selectedCombinations.length === 0) {
      toast({
        title: "No combinations selected",
        description: "Please select at least one topic combination.",
        variant: "destructive",
      });
      return;
    }

    if (!ageGroup) {
      toast({
        title: "Missing age group",
        description: "Please select an age group.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResults([]);

    const allResults: any[] = [];
    let successful = 0;
    let failed = 0;

    try {
      console.log(`Starting generation for ${selectedCombinations.length} combinations...`);
      
      // Process each combination
      for (let i = 0; i < selectedCombinations.length; i++) {
        const combination = selectedCombinations[i];
        console.log(`Processing ${i + 1}/${selectedCombinations.length}: ${combination.topic} - ${combination.subtopic} (${combination.difficulty})`);
        
        try {
          const response = await fetch('https://gqkfbxhuijpfcnjimlfj.supabase.co/functions/v1/generate-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa2ZieGh1aWpwZmNuamltbGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQxMTcsImV4cCI6MjA2ODQ5MDExN30.n-sE8DxhfmuZmNju-L3zy6hWshTGzr_cpFEeBB0JZIo`
            },
            body: JSON.stringify({
              topic: combination.topic,
              subtopic: combination.subtopic,
              difficulty: combination.difficulty,
              age_group: ageGroup,
              count: questionsPerCombination,
              saveToDatabase: true
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Since the response is a stream, we need to read it
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let generatedQuestions: any[] = [];
          let savedCount = 0;

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
                      if (data.type === 'question') {
                        generatedQuestions.push(data.data);
                      } else if (data.type === 'saved') {
                        savedCount++;
                      } else if (data.type === 'complete') {
                        console.log(`✓ Generated ${data.totalGenerated} questions for ${combination.topic} - ${combination.subtopic} (${combination.difficulty})`);
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

          allResults.push({
            combination,
            status: 'success',
            questions: generatedQuestions,
            savedCount
          });
          successful++;
          
        } catch (error) {
          console.error(`✗ Error generating for ${combination.topic} - ${combination.subtopic} (${combination.difficulty}):`, error);
          allResults.push({
            combination,
            status: 'error',
            error: error.message
          });
          failed++;
        }
      }

      setResults(allResults);
      
      toast({
        title: "Generation complete!",
        description: `Generated questions for ${successful} combinations. ${failed} failed.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && ageGroup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perplexity Question Generator</CardTitle>
          <CardDescription>Loading available combinations for {ageGroup}...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perplexity Question Generator</CardTitle>
          <CardDescription>
            Generate mathematics questions using Perplexity AI for selected topic combinations.
            {ageGroup && <span className="block mt-1 font-medium">Current Age Group: {ageGroup}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Age Group and Questions per Combination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age-group">Age Group *</Label>
              <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value as AgeGroup)} disabled={isGenerating}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select age group to load topics" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-md z-50">
                  <SelectItem value="year 2-3">Year 2-3 (Ages 6-8)</SelectItem>
                  <SelectItem value="year 4-5">Year 4-5 (Ages 8-10)</SelectItem>
                  <SelectItem value="11+">11+ (Ages 10+)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Topics will be filtered based on the selected age group
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="questions-per-combination">Questions per Combination</Label>
              <Input
                id="questions-per-combination"
                type="number"
                min="1"
                max="10"
                value={questionsPerCombination}
                onChange={(e) => setQuestionsPerCombination(parseInt(e.target.value) || 2)}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Topic Combinations Selection */}
          {ageGroup && availableCombinations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Topic Combinations for {ageGroup} ({selectedCombinations.length} selected)
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedCombinations.length === availableCombinations.length && availableCombinations.length > 0}
                    onCheckedChange={toggleAllCombinations}
                    disabled={isGenerating}
                  />
                  <Label htmlFor="select-all" className="text-sm">Select All</Label>
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2 bg-muted/30">
                {availableCombinations.map((combination, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={`combo-${index}`}
                      checked={isCombinationSelected(combination)}
                      onCheckedChange={(checked) => toggleCombination(combination, checked as boolean)}
                      disabled={isGenerating}
                    />
                    <Label htmlFor={`combo-${index}`} className="text-sm flex-1 cursor-pointer">
                      <span className="font-medium">{combination.topic}</span>
                      <span className="text-muted-foreground"> - {combination.subtopic}</span>
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                        {combination.difficulty}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message when no age group selected */}
          {!ageGroup && (
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">Please select an age group to load available topic combinations</p>
            </div>
          )}

          {/* Show message when age group selected but no combinations */}
          {ageGroup && !loading && availableCombinations.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">No topic combinations found for {ageGroup}</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different age group or add more curriculum data</p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedCombinations.length === 0 || !ageGroup}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              `Generate Questions for ${selectedCombinations.length} Combinations`
            )}
          </Button>
          
          {selectedCombinations.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              This will generate {selectedCombinations.length * questionsPerCombination} total questions 
              ({questionsPerCombination} per combination)
            </p>
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
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
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
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">{result.questions?.length || 0} questions</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">Failed</span>
                        </>
                      )}
                    </div>
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
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