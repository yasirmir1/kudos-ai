import React from 'react';
import { Home, HelpCircle, BookOpen, LucideIcon } from 'lucide-react';

interface Suggestion {
  icon: LucideIcon;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const SupportSuggestions: React.FC = () => {
  const suggestions: Suggestion[] = [
    {
      icon: Home,
      title: 'Practice fractions with cooking',
      description: 'Use measuring cups to demonstrate 1/2, 1/3, 1/4',
      difficulty: 'Easy'
    },
    {
      icon: HelpCircle,
      title: 'Ask about their problem-solving process',
      description: '"How did you work that out?" encourages reflection',
      difficulty: 'Medium'
    },
    {
      icon: BookOpen,
      title: 'Review times tables together',
      description: 'Focus on 7, 8, and 9 times tables - 5 minutes daily',
      difficulty: 'Easy'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">How You Can Help</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center space-x-2 mb-3">
              <suggestion.icon className="h-5 w-5 text-primary" />
              <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                {suggestion.difficulty}
              </span>
            </div>
            <h4 className="font-medium text-foreground mb-2">{suggestion.title}</h4>
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};