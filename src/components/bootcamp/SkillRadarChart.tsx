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
      
      // Get current student ID
      const { data: studentData } = await supabase.rpc('get_current_student_id');
      
      if (!studentData) {
        // Fallback: calculate skills from performance data
        await calculateSkillsFromPerformance();
        return;
      }

      // Try to get skills data from bootcamp_student_skills
      const { data: skillsFromTable, error: skillsError } = await supabase
        .from('bootcamp_student_skills')
        .select('*')
        .eq('student_id', studentData);

      if (skillsError) {
        console.error('Error fetching skills:', skillsError);
        await calculateSkillsFromPerformance();
        return;
      }

      if (skillsFromTable && skillsFromTable.length > 0) {
        const processedSkills = processSkillsData(skillsFromTable);
        setSkillsData(processedSkills);
        calculateOverallStrength(processedSkills);
      } else {
        // Fallback to performance calculation
        await calculateSkillsFromPerformance();
      }
    } catch (error) {
      console.error('Error in fetchSkillsData:', error);
      await calculateSkillsFromPerformance();
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillsFromPerformance = async () => {
    try {
      // Get performance data and map to mathematical skills
      const { data: performanceData, error } = await supabase
        .from('student_performance')
        .select('topic, accuracy, total_attempts')
        .eq('student_id', user?.id);

      if (error) {
        console.error('Error fetching performance data:', error);
        setSkillsData(getDefaultSkillsData());
        return;
      }

      const skillsMap = mapTopicsToSkills(performanceData || []);
      const radarData = Object.entries(skillsMap).map(([skill, data]) => ({
        skill: skill.replace(/_/g, ' '),
        current: Math.round(data.proficiency * 100),
        target: 85, // Target proficiency
        category: data.category
      }));

      setSkillsData(radarData);
      calculateOverallStrength(radarData);
    } catch (error) {
      console.error('Error calculating skills from performance:', error);
      setSkillsData(getDefaultSkillsData());
    }
  };

  const processSkillsData = (skills: any[]): RadarDataPoint[] => {
    return skills.map(skill => ({
      skill: skill.skill_name?.replace(/_/g, ' ') || 'Unknown',
      current: Math.round((skill.proficiency_level || 0) * 100),
      target: 85,
      category: skill.skill_category || 'General'
    }));
  };

  const mapTopicsToSkills = (performance: any[]) => {
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

    // Map performance data to skills
    performance.forEach(perf => {
      const topic = perf.topic?.toLowerCase() || '';
      let targetSkill = '';

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

      if (skillsMap[targetSkill]) {
        const currentData = skillsMap[targetSkill];
        const weightedAccuracy = (currentData.proficiency * currentData.attempts + perf.accuracy * perf.total_attempts) / 
                                (currentData.attempts + perf.total_attempts);
        
        skillsMap[targetSkill] = {
          proficiency: weightedAccuracy,
          category: currentData.category,
          attempts: currentData.attempts + perf.total_attempts
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Skills Assessment
            </CardTitle>
            <CardDescription>Mathematical skills proficiency across key areas</CardDescription>
          </div>
          {getOverallBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fontSize: 10, textAnchor: 'middle' }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 8 }}
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

        {/* Skills Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Top Strengths
            </h4>
            <div className="space-y-1">
              {strengths.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{skill.skill}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">{skill.current}%</span>
                    {getTrendIcon(skill.current, skill.target)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Growth */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-700 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Focus Areas
            </h4>
            <div className="space-y-1">
              {weaknesses.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{skill.skill}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-600">{skill.current}%</span>
                    {getTrendIcon(skill.current, skill.target)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">All Skills Overview</h4>
          <div className="grid grid-cols-2 gap-2">
            {skillsData.map((skill) => (
              <div key={skill.skill} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                <span className="font-medium truncate" title={skill.skill}>
                  {skill.skill}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`font-bold ${
                    skill.current >= 75 ? 'text-green-600' : 
                    skill.current >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {skill.current}%
                  </span>
                  {getTrendIcon(skill.current, skill.target)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};