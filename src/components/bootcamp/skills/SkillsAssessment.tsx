import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StrengthsList } from './StrengthsList';
import { FocusAreasList } from './FocusAreasList';
import { SkillRadarChart } from './RadarChart';
import { RadarDataPoint, OverallStrength } from './types';
import { 
  getDefaultSkillsData, 
  mapDailyModeTopicsToSkills, 
  calculateOverallStrength, 
  getStrengthsAndWeaknesses 
} from './utils';

export const SkillsAssessment: React.FC = () => {
  const { user } = useAuth();
  const [skillsData, setSkillsData] = useState<RadarDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStrength, setOverallStrength] = useState<OverallStrength>('developing');

  useEffect(() => {
    if (user) {
      fetchSkillsData();
    }
  }, [user]);

  const fetchSkillsData = async () => {
    try {
      setLoading(true);
      await calculateSkillsFromDailyPracticeData();
    } catch (error) {
      console.error('Error in fetchSkillsData:', error);
      setSkillsData(getDefaultSkillsData());
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillsFromDailyPracticeData = async () => {
    try {
      // Get student answers data from daily practice
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
        target: 100, // Target proficiency set to 100 like in the design
        category: data.category
      }));

      setSkillsData(radarData);
      setOverallStrength(calculateOverallStrength(radarData));
    } catch (error) {
      console.error('Error calculating skills from daily practice data:', error);
      setSkillsData(getDefaultSkillsData());
    }
  };

  const { strengths, weaknesses } = skillsData.length > 0 ? getStrengthsAndWeaknesses(skillsData) : { strengths: [], weaknesses: [] };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Brain className="h-8 w-8 text-blue-800 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Skills Assessment</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <Brain className="h-8 w-8 text-blue-800 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Skills Assessment</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="space-y-8">
              <StrengthsList strengths={strengths} />
              <FocusAreasList weaknesses={weaknesses} />
            </div>
          </div>
          
          <div className="md:col-span-7">
            <SkillRadarChart data={skillsData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};