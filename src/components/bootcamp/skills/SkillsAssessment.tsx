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
      setOverallStrength(calculateOverallStrength(radarData));
    } catch (error) {
      console.error('Error calculating skills from daily mode data:', error);
      setSkillsData(getDefaultSkillsData());
    }
  };

  const { strengths, weaknesses } = skillsData.length > 0 ? getStrengthsAndWeaknesses(skillsData) : { strengths: [], weaknesses: [] };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Brain className="h-4 w-4" />
              Skills Assessment
            </h3>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Compact Header */}
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Brain className="h-4 w-4" />
              Skills Assessment
            </h3>
          </div>
          
          {/* Three Column Layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Top Strengths */}
            <StrengthsList strengths={strengths} />

            {/* Focus Areas */}
            <FocusAreasList weaknesses={weaknesses} />

            {/* Radar Chart */}
            <SkillRadarChart data={skillsData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};