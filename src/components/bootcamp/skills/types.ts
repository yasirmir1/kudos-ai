export interface SkillData {
  skill: string;
  proficiency: number;
  category: string;
  questions_attempted: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RadarDataPoint {
  skill: string;
  current: number;
  target: number;
  category: string;
}

export type OverallStrength = 'strong' | 'developing' | 'needs_focus';