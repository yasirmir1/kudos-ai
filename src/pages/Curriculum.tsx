import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Target, Users, ArrowLeft, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CurriculumItem {
  id: number;
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  difficulty: string;
  year_level: number;
  age_group: string;
  pedagogical_notes: string;
}

const Curriculum = () => {
  const navigate = useNavigate();
  const [curriculumData, setCurriculumData] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2');

  useEffect(() => {
    loadCurriculumData();
  }, []);

  const loadCurriculumData = async () => {
    try {
      const { data, error } = await supabase
        .from('curriculum')
        .select('*')
        .in('year_level', [2, 3, 4, 5, 6])
        .not('year_level', 'is', null)
        .order('year_level', { ascending: true })
        .order('topic', { ascending: true })
        .order('subtopic', { ascending: true });

      if (error) {
        console.error('Error loading curriculum:', error);
        return;
      }

      setCurriculumData(data || []);
    } catch (error) {
      console.error('Error loading curriculum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByYearAndTopic = (data: CurriculumItem[]) => {
    const grouped: { [year: number]: { [topic: string]: CurriculumItem[] } } = {};
    
    data.forEach(item => {
      if (!grouped[item.year_level]) {
        grouped[item.year_level] = {};
      }
      if (!grouped[item.year_level][item.topic]) {
        grouped[item.year_level][item.topic] = [];
      }
      grouped[item.year_level][item.topic].push(item);
    });
    
    return grouped;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgeGroupInfo = (year: number) => {
    if (year <= 3) return { label: `Year ${year}` };
    if (year <= 5) return { label: `Year ${year}` };
    return { label: `Year ${year}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-12 w-auto mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  const groupedData = groupByYearAndTopic(curriculumData);
  const availableYears = Object.keys(groupedData).sort();

  return (
    <div>

      {/* Page Title Section */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mathematics Curriculum</h1>
            <p className="text-sm text-muted-foreground">Mathematics Learning Objectives</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(groupedData).reduce((acc, yearData) => acc + Object.keys(yearData).length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all year levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Year Levels</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableYears.length}</div>
              <p className="text-xs text-muted-foreground">Available year levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Multiple</div>
              <p className="text-xs text-muted-foreground">Different learning levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Year Level Tabs */}
        <Tabs value={selectedYear} onValueChange={setSelectedYear} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-16">
            {availableYears.map(year => {
              const ageInfo = getAgeGroupInfo(parseInt(year));
              return (
                <TabsTrigger key={year} value={year} className="text-center h-14 py-2">
                  <div>
                    <div className="font-semibold">Year {year}</div>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {availableYears.map(year => (
            <TabsContent key={year} value={year} className={`space-y-6 ${year === '2' ? 'min-h-[800px]' : ''}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Year {year} Mathematics Curriculum</span>
                  </CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <span>{Object.keys(groupedData[parseInt(year)] || {}).length} topics covered</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    {Object.entries(groupedData[parseInt(year)] || {}).map(([topic, items]) => (
                      <AccordionItem key={topic} value={topic} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center space-x-3">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span className="font-medium text-left">{topic}</span>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                              {items.length} objectives
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            {items.map((item, index) => (
                              <Card key={item.id} className="border-l-4 border-l-primary/30">
                                <CardContent className="pt-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm mb-2">{item.subtopic}</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                          {item.example_question}
                                        </p>
                                      </div>
                                      <div className="flex flex-col space-y-2 ml-4">
                                        <Badge 
                                          variant="outline" 
                                          className={getDifficultyColor(item.difficulty)}
                                        >
                                          {item.difficulty}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {item.question_id}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {item.pedagogical_notes && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-sm font-medium text-blue-900 mb-1">Teaching Notes</p>
                                            <p className="text-sm text-blue-800">{item.pedagogical_notes}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Curriculum;