import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  topic_name: string;
  difficulty: string;
  module_id: string;
  bootcamp_subtopics?: Array<{
    id: number;
    name: string;
    subtopic_order: number;
  }>;
}

interface GenerationResult {
  topic: string;
  examBoard: string;
  questionId: string;
  success: boolean;
  error?: string;
}

export const BulkCurriculumGenerator: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionsPerSubtopic, setQuestionsPerSubtopic] = useState(1);
  const [selectedExamBoards, setSelectedExamBoards] = useState<string[]>(['GL']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      // Fetch topics and subtopics separately due to relationship constraints
      const [topicsRes, subtopicsRes] = await Promise.all([
        supabase
          .from('bootcamp_curriculum_topics')
          .select('id, topic_name, difficulty, module_id')
          .order('topic_order'),
        supabase
          .from('bootcamp_subtopics')
          .select('id, name, topic_id, subtopic_order')
          .order('topic_id, subtopic_order')
      ]);

      if (topicsRes.error) throw topicsRes.error;
      if (subtopicsRes.error) throw subtopicsRes.error;

      // Group subtopics by topic
      const subtopicsByTopic = (subtopicsRes.data || []).reduce((acc, subtopic) => {
        if (!acc[subtopic.topic_id]) {
          acc[subtopic.topic_id] = [];
        }
        acc[subtopic.topic_id].push(subtopic);
        return acc;
      }, {} as Record<string, any[]>);

      // Merge topics with their subtopics
      const topicsWithSubtopics = (topicsRes.data || []).map(topic => ({
        ...topic,
        bootcamp_subtopics: subtopicsByTopic[topic.id] || []
      }));

      setTopics(topicsWithSubtopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch topics",
        variant: "destructive"
      });
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map(t => t.id));
    }
  };

  const handleExamBoardToggle = (board: string) => {
    setSelectedExamBoards(prev =>
      prev.includes(board)
        ? prev.filter(b => b !== board)
        : [...prev, board]
    );
  };

  const startGeneration = async () => {
    if (selectedTopics.length === 0) {
      toast({
        title: "No topics selected",
        description: "Please select at least one topic to generate questions for.",
        variant: "destructive"
      });
      return;
    }

    if (selectedExamBoards.length === 0) {
      toast({
        title: "No exam boards selected",
        description: "Please select at least one exam board style.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-generate-curriculum-questions', {
        body: {
          topicIds: selectedTopics,
          questionsPerSubtopic,
          examBoards: selectedExamBoards
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      setProgress(100);

      toast({
        title: "Generation Complete",
        description: `Successfully generated ${data.results?.length || 0} questions`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred during generation",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTopicsByModule = () => {
    const grouped = topics.reduce((acc, topic) => {
      if (!acc[topic.module_id]) {
        acc[topic.module_id] = [];
      }
      acc[topic.module_id].push(topic);
      return acc;
    }, {} as Record<string, Topic[]>);
    return grouped;
  };

  const topicsByModule = getTopicsByModule();
  
  // Calculate total subtopics
  const totalSubtopics = topics.reduce((sum, topic) => sum + (topic.bootcamp_subtopics?.length || 0), 0);
  const selectedTopicsData = topics.filter(t => selectedTopics.includes(t.id));
  const selectedSubtopics = selectedTopicsData.reduce((sum, topic) => sum + (topic.bootcamp_subtopics?.length || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive 11+ Question Generator</CardTitle>
          <CardDescription>
            Generate diagnostic questions covering ALL {totalSubtopics} subtopics across {topics.length} topics.
            {selectedSubtopics > 0 && (
              <span className="block mt-1 font-medium text-primary">
                Selected: {selectedSubtopics} subtopics from {selectedTopics.length} topics = {selectedSubtopics * selectedExamBoards.length} total questions
              </span>
            )}
            AI-powered questions with misconception-based distractors for GL Assessment and CEM examination styles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generation Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionsPerSubtopic">Questions per Subtopic</Label>
              <Input
                id="questionsPerSubtopic"
                type="number"
                min="1"
                max="5"
                value={questionsPerSubtopic}
                onChange={(e) => setQuestionsPerSubtopic(parseInt(e.target.value))}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label>Exam Board Styles</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedExamBoards.includes('GL')}
                    onCheckedChange={() => handleExamBoardToggle('GL')}
                    disabled={isGenerating}
                  />
                  <span>GL Assessment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedExamBoards.includes('CEM')}
                    onCheckedChange={() => handleExamBoardToggle('CEM')}
                    disabled={isGenerating}
                  />
                  <span>CEM</span>
                </label>
              </div>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Select Topics ({selectedTopics.length}/{topics.length})</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isGenerating}
              >
                {selectedTopics.length === topics.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
                <div key={moduleId} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Module: {moduleId}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {moduleTopics.map((topic) => (
                       <div key={topic.id} className="border rounded p-3 space-y-2">
                         <label className="flex items-center space-x-2 cursor-pointer">
                           <Checkbox
                             checked={selectedTopics.includes(topic.id)}
                             onCheckedChange={() => handleTopicToggle(topic.id)}
                             disabled={isGenerating}
                           />
                           <div className="flex-1">
                             <span className="text-sm font-medium">{topic.topic_name}</span>
                             <div className="flex items-center space-x-2 mt-1">
                               <Badge variant="secondary" className="text-xs">
                                 {topic.difficulty}
                               </Badge>
                               <Badge variant="outline" className="text-xs">
                                 {topic.bootcamp_subtopics?.length || 0} subtopics
                               </Badge>
                             </div>
                           </div>
                         </label>
                         
                         {/* Show subtopics if topic is selected */}
                         {selectedTopics.includes(topic.id) && topic.bootcamp_subtopics && topic.bootcamp_subtopics.length > 0 && (
                           <div className="mt-2 ml-6 pl-2 border-l-2 border-muted">
                             <div className="text-xs text-muted-foreground mb-1">Subtopics to be covered:</div>
                             <div className="grid grid-cols-1 gap-1">
                               {topic.bootcamp_subtopics.map((subtopic, idx) => (
                                 <div key={subtopic.id} className="text-xs text-muted-foreground">
                                   {subtopic.subtopic_order}. {subtopic.name}
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Generation Progress</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={startGeneration}
            disabled={isGenerating || selectedTopics.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating Questions...' : `Generate ${selectedSubtopics * selectedExamBoards.length} Questions (${selectedSubtopics} subtopics × ${selectedExamBoards.length} exam boards)`}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
            <CardDescription>
              {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm">{result.topic} ({result.examBoard})</span>
                  </div>
                  {result.success && (
                    <Badge variant="outline" className="text-xs">
                      {result.questionId}
                    </Badge>
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