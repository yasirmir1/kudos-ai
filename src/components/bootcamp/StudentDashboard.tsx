import React, { useState } from 'react';
import { Target, Brain, TrendingUp, Shield } from 'lucide-react';
import { StatCard } from './StatCard';
import { TopicStrengthsCard } from './TopicStrengthsCard';
import { MisconceptionTracker } from './MisconceptionTracker';
import { SkillRadarChart } from './SkillRadarChart';
import { LearningPathRecommendations } from './LearningPathRecommendations';

interface StudentData {
  overallAccuracy: number;
  weeklyImprovement: number;
  strongestTopics: string[];
  weakestTopics: string[];
  misconceptions: Array<{
    code: string;
    name: string;
    occurrences: number;
    status: 'active' | 'improving' | 'resolved';
  }>;
}

interface StudentDashboardProps {
  studentData: StudentData;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const performanceData = {
    overallAccuracy: 78,
    weeklyImprovement: 5,
    strongestTopics: ['Arithmetic Operations', 'Number & Place Value'],
    weakestTopics: ['Algebra', 'Geometry'],
    misconceptions: [
      { code: 'FR1', name: 'Denominator Addition', occurrences: 8, status: 'active' as const },
      { code: 'PV1', name: 'Place Value Confusion', occurrences: 5, status: 'improving' as const },
      { code: 'OP1', name: 'Operation Selection', occurrences: 3, status: 'resolved' as const }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Performance Dashboard</h1>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="term">This Term</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Target}
            label="Overall Accuracy"
            value={`${performanceData.overallAccuracy}%`}
            trend={performanceData.weeklyImprovement}
            color="success"
          />
          <StatCard
            icon={Brain}
            label="Questions Practiced"
            value="342"
            subtext="This week"
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Improvement Rate"
            value={`+${performanceData.weeklyImprovement}%`}
            subtext="vs last week"
            color="secondary"
          />
          <StatCard
            icon={Shield}
            label="Mastery Level"
            value="Intermediate"
            subtext="Next: Advanced"
            color="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopicStrengthsCard 
            strongTopics={performanceData.strongestTopics}
            weakTopics={performanceData.weakestTopics}
          />
          <MisconceptionTracker misconceptions={performanceData.misconceptions} />
        </div>
      </div>

      <SkillRadarChart />
      <LearningPathRecommendations />
    </div>
  );
};