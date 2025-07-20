import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

export const PerplexityQuestionGenerator = () => {
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic || !subtopic || !difficulty || !ageGroup) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          topic,
          subtopic,
          difficulty,
          age_group: ageGroup,
          count,
          saveToDatabase: true
        }
      });

      if (error) {
        throw error;
      }

      // The function returns a stream, but we can handle the final result
      setGeneratedQuestions(data?.questions || []);
      
      toast({
        title: "Questions generated!",
        description: `Successfully generated ${count} questions and saved them to the curriculum.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate questions. Please try again.",
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
          <CardTitle>Perplexity Question Generator</CardTitle>
          <CardDescription>
            Generate mathematics questions using Perplexity AI and save them to your curriculum.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Number - Addition and Subtraction"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtopic">Subtopic</Label>
              <Input
                id="subtopic"
                placeholder="e.g., Add and subtract numbers mentally"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Very Hard">Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age-group">Age Group</Label>
              <Select value={ageGroup} onValueChange={setAgeGroup} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year 2-3">Year 2-3</SelectItem>
                  <SelectItem value="year 4-5">Year 4-5</SelectItem>
                  <SelectItem value="11+">11+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic || !subtopic || !difficulty || !ageGroup}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Generate Questions"
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Questions ({generatedQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Question {index + 1}: {question.question_id}</h4>
                  <p className="mb-2">{question.example_question}</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {question.options?.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded text-sm ${
                          option === question.correct_answer
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-50 border'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Correct:</strong> {question.correct_answer}
                  </p>
                  {question.pedagogical_notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Notes:</strong> {question.pedagogical_notes}
                    </p>
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