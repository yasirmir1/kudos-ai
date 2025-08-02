import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { WeeklySummary } from './WeeklySummary';
import { ProgressInsights } from './ProgressInsights';
import { SupportSuggestions } from './SupportSuggestions';

interface ChildData {
  name: string;
}

interface ParentDashboardProps {
  childData: ChildData;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ childData }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Parent Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track {childData.name}'s progress</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>

        <WeeklySummary childData={childData} />
        <ProgressInsights />
        <SupportSuggestions />
      </div>
    </div>
  );
};