import { RadarDataPoint, OverallStrength } from './types';

export const getDefaultSkillsData = (): RadarDataPoint[] => {
  return [
    { skill: 'Number Operations', current: 80, target: 100, category: 'Arithmetic' },
    { skill: 'Algebraic Thinking', current: 50, target: 100, category: 'Algebra' },
    { skill: 'Geometric Reasoning', current: 60, target: 100, category: 'Geometry' },
    { skill: 'Data Analysis', current: 35, target: 100, category: 'Statistics' },
    { skill: 'Problem Solving', current: 40, target: 100, category: 'Application' },
    { skill: 'Fraction Skills', current: 33, target: 100, category: 'Number' },
    { skill: 'Measurement', current: 50, target: 100, category: 'Practical' },
    { skill: 'Pattern Recognition', current: 50, target: 100, category: 'Logic' }
  ];
};

export const mapDailyModeTopicsToSkills = (answers: any[]) => {
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

export const calculateOverallStrength = (data: RadarDataPoint[]): OverallStrength => {
  const avgProficiency = data.reduce((sum, skill) => sum + skill.current, 0) / data.length;
  
  if (avgProficiency >= 75) {
    return 'strong';
  } else if (avgProficiency >= 60) {
    return 'developing';
  } else {
    return 'needs_focus';
  }
};

export const getStrengthsAndWeaknesses = (skillsData: RadarDataPoint[]) => {
  const sortedSkills = [...skillsData].sort((a, b) => b.current - a.current);
  return {
    strengths: sortedSkills.slice(0, 3),
    weaknesses: sortedSkills.slice(-3).reverse()
  };
};