import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Target } from 'lucide-react';

interface SkillData {
  skill: string;
  accuracy: number;
}

interface SkillDevelopmentCardProps {
  skills: SkillData[];
}

export const SkillDevelopmentCard: React.FC<SkillDevelopmentCardProps> = ({ skills }) => {
  const getSkillIcon = (accuracy: number) => {
    if (accuracy >= 70) return <CheckCircle className="h-4 w-4 text-success" />;
    if (accuracy >= 50) return <Target className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-success';
    if (accuracy >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const getSkillStatus = (accuracy: number) => {
    if (accuracy >= 70) return 'Strong';
    if (accuracy >= 50) return 'Developing';
    if (accuracy > 0) return 'Needs Practice';
    return 'Not Started';
  };

  const getStatusColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-success';
    if (accuracy >= 50) return 'text-warning';
    if (accuracy > 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Skill Development</h2>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getSkillIcon(skill.accuracy)}
                <span className="font-medium text-foreground text-sm">{skill.skill}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${getStatusColor(skill.accuracy)}`}>
                  {getSkillStatus(skill.accuracy)}
                </span>
                <span className="text-sm font-bold text-foreground">{skill.accuracy}%</span>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={skill.accuracy} 
                className="h-2"
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(skill.accuracy)}`}
                style={{ width: `${skill.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};