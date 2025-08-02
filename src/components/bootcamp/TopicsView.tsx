import React, { useState } from 'react';
import { ModuleCard } from './ModuleCard';

interface Topic {
  name: string;
  progress: number;
  topics: string[];
  color: 'primary' | 'success' | 'secondary' | 'warning';
}

interface TopicsViewProps {
  setCurrentView: (view: string) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({ setCurrentView }) => {
  const modules: Topic[] = [
    {
      name: 'Number & Place Value',
      progress: 75,
      topics: ['Large Numbers', 'Rounding', 'Roman Numerals', 'Negative Numbers'],
      color: 'primary'
    },
    {
      name: 'Arithmetic Operations',
      progress: 60,
      topics: ['Mental Methods', 'Written Methods', 'BODMAS', 'Checking Strategies'],
      color: 'success'
    },
    {
      name: 'Fractions, Decimals & Percentages',
      progress: 45,
      topics: ['Equivalent Fractions', 'Operations', 'Conversions', 'Percentages'],
      color: 'secondary'
    },
    {
      name: 'Ratio & Proportion',
      progress: 30,
      topics: ['Understanding Ratio', 'Simplifying', 'Sharing', 'Direct Proportion'],
      color: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Curriculum Topics</h1>
        <p className="text-muted-foreground">Master each module to prepare for your 11+ exam</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <ModuleCard key={index} module={module} setCurrentView={setCurrentView} />
        ))}
      </div>
    </div>
  );
};