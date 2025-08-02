import React from 'react';
import { skillsHierarchy } from '@/lib/bootcamp-data';

interface Skill {
  name: string;
  score: number;
}

export const SkillRadarChart: React.FC = () => {
  const skills: Skill[] = [
    { name: 'Number Sense', score: 85 },
    { name: 'Calculation Fluency', score: 72 },
    { name: 'Conceptual Understanding', score: 78 },
    { name: 'Pattern Recognition', score: 65 },
    { name: 'Problem Decomposition', score: 70 },
    { name: 'Logical Thinking', score: 82 }
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Skill Profile</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <div key={index} className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(skill.score / 100) * 226.2} 226.2`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">{skill.score}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{skill.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Skills Framework</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-medium text-muted-foreground mb-1">Foundational Skills:</p>
            <ul className="space-y-1 text-muted-foreground">
              {Object.keys(skillsHierarchy.foundational_skills).map((skill, i) => (
                <li key={i} className="capitalize">{skill.replace('_', ' ')}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-muted-foreground mb-1">Topic Skills:</p>
            <ul className="space-y-1 text-muted-foreground">
              {Object.keys(skillsHierarchy.topic_specific_skills).map((skill, i) => (
                <li key={i} className="capitalize">{skill.replace('_', ' ')}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};