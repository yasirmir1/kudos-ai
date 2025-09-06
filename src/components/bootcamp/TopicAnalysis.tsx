import React from 'react';

interface Topic {
  name: string;
  avgScore: number;
  attempts: number;
  difficulty: 'low' | 'medium' | 'high';
}

export const TopicAnalysis: React.FC = () => {
  const topics: Topic[] = [
    { name: 'Fractions', avgScore: 68, attempts: 145, difficulty: 'high' },
    { name: 'Decimals', avgScore: 75, attempts: 132, difficulty: 'medium' },
    { name: 'Algebra', avgScore: 62, attempts: 98, difficulty: 'high' },
    { name: 'Geometry', avgScore: 80, attempts: 167, difficulty: 'low' },
    { name: 'Word Problems', avgScore: 70, attempts: 189, difficulty: 'medium' }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Topic Performance Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors" style={{ 
            background: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))', 
            color: 'hsl(var(--card-foreground))',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            zIndex: 1
          }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">{topic.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                topic.difficulty === 'high' ? 'bg-red-100 text-red-700' :
                topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {topic.difficulty} difficulty
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average Score</span>
                <span className={`font-medium ${
                  topic.avgScore >= 75 ? 'text-green-600' :
                  topic.avgScore >= 65 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {topic.avgScore}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    topic.avgScore >= 75 ? 'bg-green-500' :
                    topic.avgScore >= 65 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${topic.avgScore}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Attempts</span>
                <span className="text-foreground">{topic.attempts}</span>
              </div>
            </div>
            <button className="mt-3 w-full text-sm text-primary hover:text-primary/80 font-medium py-2 bg-primary/5 rounded hover:bg-primary/10 transition-colors">
              Assign Practice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};