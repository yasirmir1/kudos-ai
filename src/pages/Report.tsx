import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Calendar, Brain, Lightbulb, BarChart3, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { InteractiveInsights } from '@/components/InteractiveInsights';

interface StudiedTopic {
  topic: string;
  subtopics: string[];
  total_questions: number;
  first_attempted: string;
  last_attempted: string;
  accuracy: number;
}

export default function Report() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<StudiedTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['mastered', 'learning', 'needs-work']));

  useEffect(() => {
    if (user) {
      loadStudiedTopics();
      loadMisconceptionInsights();
    }
  }, [user]);

  const loadStudiedTopics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('topic, subtopic, is_correct, answered_at')
        .eq('student_id', user?.id);

      if (error) throw error;

      // Group by topic and calculate statistics
      const topicMap = new Map<string, any>();
      
      data?.forEach((answer) => {
        if (!topicMap.has(answer.topic)) {
          topicMap.set(answer.topic, {
            topic: answer.topic,
            subtopics: new Set(),
            total_questions: 0,
            correct_answers: 0,
            first_attempted: answer.answered_at,
            last_attempted: answer.answered_at,
          });
        }
        
        const topicData = topicMap.get(answer.topic);
        topicData.subtopics.add(answer.subtopic);
        topicData.total_questions++;
        if (answer.is_correct) topicData.correct_answers++;
        
        // Update date ranges
        if (new Date(answer.answered_at) < new Date(topicData.first_attempted)) {
          topicData.first_attempted = answer.answered_at;
        }
        if (new Date(answer.answered_at) > new Date(topicData.last_attempted)) {
          topicData.last_attempted = answer.answered_at;
        }
      });

      // Convert to array and calculate accuracy
      const studiedTopics: StudiedTopic[] = Array.from(topicMap.values()).map((topic) => ({
        ...topic,
        subtopics: Array.from(topic.subtopics),
        accuracy: topic.correct_answers / topic.total_questions,
      })).sort((a, b) => new Date(b.last_attempted).getTime() - new Date(a.last_attempted).getTime());

      setTopics(studiedTopics);
    } catch (error) {
      console.error('Error loading studied topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMisconceptionInsights = async () => {
    if (!user) return;
    
    setIsLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('explain-misconceptions', {
        body: { student_id: user.id }
      });

      if (error) throw error;

      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setShowExplanation(false);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.8) return <Badge className="bg-green-100 text-green-800">Mastered</Badge>;
    if (accuracy >= 0.6) return <Badge className="bg-blue-100 text-blue-800">Learning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  const getAccuracyCategory = (accuracy: number): string => {
    if (accuracy >= 0.8) return 'mastered';
    if (accuracy >= 0.6) return 'learning';
    return 'needs-work';
  };

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const filteredTopics = topics.filter(topic => 
    activeFilters.has(getAccuracyCategory(topic.accuracy))
  );

  const handleRefreshInsights = async () => {
    await loadMisconceptionInsights();
    toast({
      title: "Insights Refreshed",
      description: "Your learning insights have been updated!",
    });
  };

  const getFilterButtonVariant = (filter: string) => {
    return activeFilters.has(filter) ? 'default' : 'outline';
  };

  const getFilterButtonClass = (filter: string) => {
    return activeFilters.has(filter) 
      ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
      : '';
  };

  const getFilterCount = (filter: string) => {
    return topics.filter(topic => getAccuracyCategory(topic.accuracy) === filter).length;
  };

  return (
    <div>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Learning Report
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of your learning journey and performance insights
          </p>
        </div>

        <div className="space-y-6">
          {/* AI Insights Panel - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Learning Insights & Misconception Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your learning patterns and areas for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveInsights 
                explanation={explanation || ''}
                onRefresh={handleRefreshInsights}
                isRefreshing={isLoadingExplanation}
              />
            </CardContent>
          </Card>
          
          {/* Topics Performance - Full Width */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>
                    All the topics you've covered in your learning journey
                  </CardDescription>
                </div>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFilter('mastered')}
                      className={`gap-1 ${getFilterButtonClass('mastered')}`}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Mastered ({getFilterCount('mastered')})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFilter('learning')}
                      className={`gap-1 ${getFilterButtonClass('learning')}`}
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Learning ({getFilterCount('learning')})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFilter('needs-work')}
                      className={`gap-1 ${getFilterButtonClass('needs-work')}`}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Needs Work ({getFilterCount('needs-work')})
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredTopics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {activeFilters.size === 0 
                      ? "No filters selected. Choose a performance level to view topics."
                      : "No topics found for the selected filters."
                    }
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTopics.map((topic) => (
                      <div
                        key={topic.topic}
                        className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <h4 className="font-medium">{topic.topic}</h4>
                          </div>
                          {getAccuracyBadge(topic.accuracy)}
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">{topic.subtopics.length}</span> subtopics covered:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {topic.subtopics.slice(0, 3).map((subtopic) => (
                              <Badge key={subtopic} variant="outline" className="text-xs">
                                {subtopic.length > 30 ? `${subtopic.substring(0, 30)}...` : subtopic}
                              </Badge>
                            ))}
                            {topic.subtopics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{topic.subtopics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{topic.total_questions} questions answered</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Started {formatDate(topic.first_attempted)}</span>
                          </div>
                          <div className="col-span-2 text-xs">
                            Last practiced: {formatDate(topic.last_attempted)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}