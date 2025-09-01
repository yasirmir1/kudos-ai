import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SkillData {
  skill: string;
  proficiency: number;
  category: string;
  questions_attempted: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
}

interface RadarDataPoint {
  skill: string;
  current: number;
  target: number;
  category: string;
}

export const SkillRadarChart: React.FC = () => {
  const { user } = useAuth();
  const [skillsData, setSkillsData] = useState<RadarDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStrength, setOverallStrength] = useState<'strong' | 'developing' | 'needs_focus'>('developing');

  useEffect(() => {
    if (user) {
      fetchSkillsData();
    }
  }, [user]);

  const fetchSkillsData = async () => {
    try {
      setLoading(true);
      await calculateSkillsFromDailyModeData();
    } catch (error) {
      console.error('Error in fetchSkillsData:', error);
      setSkillsData(getDefaultSkillsData());
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillsFromDailyModeData = async () => {
    try {
      // Get student answers data from daily mode
      const { data: answersData, error } = await supabase
        .from('student_answers')
        .select('topic, subtopic, is_correct, answered_at')
        .eq('student_id', user?.id);

      if (error) {
        console.error('Error fetching student answers:', error);
        setSkillsData(getDefaultSkillsData());
        return;
      }

      const skillsMap = mapDailyModeTopicsToSkills(answersData || []);
      const radarData = Object.entries(skillsMap).map(([skill, data]) => ({
        skill: skill.replace(/_/g, ' '),
        current: Math.round(data.proficiency * 100),
        target: 85, // Target proficiency
        category: data.category
      }));

      setSkillsData(radarData);
      calculateOverallStrength(radarData);
    } catch (error) {
      console.error('Error calculating skills from daily mode data:', error);
      setSkillsData(getDefaultSkillsData());
    }
  };

  const mapDailyModeTopicsToSkills = (answers: any[]) => {
    const skillsMap: Record<string, { proficiency: number; category: string; attempts: number }> = {};

    // Initialize core mathematical skills
    const coreSkills = [
      { name: 'Number_Operations', category: 'Arithmetic' },
      { name: 'Algebraic_Thinking', category: 'Algebra' },
      { name: 'Geometric_Reasoning', category: 'Geometry' },
      { name: 'Data_Analysis', category: 'Statistics' },
      { name: 'Problem_Solving', category: 'Application' },
      { name: 'Fraction_Skills', category: 'Number' },
      { name: 'Measurement', category: 'Practical' },
      { name: 'Pattern_Recognition', category: 'Logic' }
    ];

    // Initialize with default values
    coreSkills.forEach(skill => {
      skillsMap[skill.name] = { proficiency: 0.5, category: skill.category, attempts: 0 };
    });

    // Group answers by topic and calculate accuracy
    const topicStats: Record<string, { correct: number; total: number }> = {};
    
    answers.forEach(answer => {
      const topic = answer.topic?.toLowerCase() || '';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;
      if (answer.is_correct) {
        topicStats[topic].correct += 1;
      }
    });

    // Map topics to skills based on accuracy
    Object.entries(topicStats).forEach(([topic, stats]) => {
      let targetSkill = '';
      const accuracy = stats.total > 0 ? stats.correct / stats.total : 0.5;

      if (topic.includes('number') && (topic.includes('addition') || topic.includes('subtraction') || topic.includes('multiplication') || topic.includes('division'))) {
        targetSkill = 'Number_Operations';
      } else if (topic.includes('algebra')) {
        targetSkill = 'Algebraic_Thinking';
      } else if (topic.includes('geometry')) {
        targetSkill = 'Geometric_Reasoning';
      } else if (topic.includes('fraction') || topic.includes('decimal') || topic.includes('percentage')) {
        targetSkill = 'Fraction_Skills';
      } else if (topic.includes('measurement')) {
        targetSkill = 'Measurement';
      } else if (topic.includes('ratio') || topic.includes('proportion')) {
        targetSkill = 'Data_Analysis';
      } else {
        targetSkill = 'Problem_Solving'; // Default for unmapped topics
      }

      if (skillsMap[targetSkill] && stats.total >= 3) { // Only update if enough attempts
        const currentData = skillsMap[targetSkill];
        const weightedAccuracy = (currentData.proficiency * currentData.attempts + accuracy * stats.total) / 
                                (currentData.attempts + stats.total);
        
        skillsMap[targetSkill] = {
          proficiency: weightedAccuracy,
          category: currentData.category,
          attempts: currentData.attempts + stats.total
        };
      }
    });

    return skillsMap;
  };

  const getDefaultSkillsData = (): RadarDataPoint[] => {
    return [
      { skill: 'Number Operations', current: 65, target: 85, category: 'Arithmetic' },
      { skill: 'Algebraic Thinking', current: 72, target: 85, category: 'Algebra' },
      { skill: 'Geometric Reasoning', current: 58, target: 85, category: 'Geometry' },
      { skill: 'Data Analysis', current: 70, target: 85, category: 'Statistics' },
      { skill: 'Problem Solving', current: 68, target: 85, category: 'Application' },
      { skill: 'Fraction Skills', current: 62, target: 85, category: 'Number' },
      { skill: 'Measurement', current: 75, target: 85, category: 'Practical' },
      { skill: 'Pattern Recognition', current: 69, target: 85, category: 'Logic' }
    ];
  };

  const calculateOverallStrength = (data: RadarDataPoint[]) => {
    const avgProficiency = data.reduce((sum, skill) => sum + skill.current, 0) / data.length;
    
    if (avgProficiency >= 75) {
      setOverallStrength('strong');
    } else if (avgProficiency >= 60) {
      setOverallStrength('developing');
    } else {
      setOverallStrength('needs_focus');
    }
  };

  const getStrengthsAndWeaknesses = () => {
    const sortedSkills = [...skillsData].sort((a, b) => b.current - a.current);
    return {
      strengths: sortedSkills.slice(0, 3),
      weaknesses: sortedSkills.slice(-3).reverse()
    };
  };

  const getOverallBadge = () => {
    switch (overallStrength) {
      case 'strong':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Strong Foundation</Badge>;
      case 'developing':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Developing Well</Badge>;
      case 'needs_focus':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Needs Focus</Badge>;
    }
  };

  const getTrendIcon = (current: number, target: number) => {
    const gap = target - current;
    if (gap <= 10) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (gap <= 25) return <Minus className="h-3 w-3 text-yellow-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const { strengths, weaknesses } = skillsData.length > 0 ? getStrengthsAndWeaknesses() : { strengths: [], weaknesses: [] };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skills Assessment
          </CardTitle>
          <CardDescription>Mathematical skills proficiency across key areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Summary - Left Side */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Brain className="h-5 w-5" />
                Skills Assessment
              </h3>
              <p className="text-sm text-muted-foreground">Mathematical skills proficiency across key areas</p>
            </div>
            
            {/* Top Strengths */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Top Strengths
              </h4>
              <div className="space-y-2">
                {strengths.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm font-bold text-green-600">{skill.current}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Focus Areas
              </h4>
              <div className="space-y-2">
                {weaknesses.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm font-bold text-orange-600">{skill.current}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radar Chart - Right Side */}
          <div className="lg:col-span-2">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData} margin={{ top: 60, right: 120, bottom: 60, left: 120 }}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ 
                      fontSize: 11, 
                      textAnchor: 'middle',
                      fill: 'hsl(var(--foreground))',
                      fontWeight: 600,
                      filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'
                    }}
                    className="text-xs"
                    tickFormatter={(value) => value}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                    tickCount={5}
                  />
                  <Radar
                    name="Current Level"
                    dataKey="current"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target Level"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    fill="transparent"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};