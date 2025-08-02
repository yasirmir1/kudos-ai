import React from 'react';

interface Skill {
  name: string;
  score: number;
}

export const SkillRadarChart: React.FC = () => {
  const skills: Skill[] = [
    { name: 'Arithmetic', score: 85 },
    { name: 'Problem Solving', score: 72 },
    { name: 'Pattern Recognition', score: 78 },
    { name: 'Logical Reasoning', score: 65 },
    { name: 'Spatial Awareness', score: 70 },
    { name: 'Data Analysis', score: 82 }
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
    </div>
  );
};