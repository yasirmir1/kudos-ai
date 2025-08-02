import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface ClassData {
  students: number;
  avgAccuracy: number;
  completionRate: number;
  commonMisconceptions: string[];
  topPerformers: string[];
  needingSupport: string[];
}

interface ClassOverviewProps {
  classData: ClassData;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({ classData }) => {
  const misconceptionMap = {
    'FR1': 'Fraction Addition Error',
    'PV1': 'Place Value Confusion',
    'OP1': 'Operation Selection'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-muted rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Common Misconceptions</h3>
        <div className="space-y-3">
          {classData.commonMisconceptions.map((code) => (
            <div key={code} className="bg-card rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{misconceptionMap[code as keyof typeof misconceptionMap]}</span>
                <span className="text-sm text-muted-foreground">18 students</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: '64%' }}
                />
              </div>
              <button className="mt-2 text-sm text-primary hover:text-primary/80 font-medium">
                Assign Remediation →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Student Spotlight</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              Top Performers
            </h4>
            <div className="space-y-2">
              {classData.topPerformers.map((student) => (
                <div key={student} className="flex items-center justify-between bg-card p-3 rounded border">
                  <span className="text-sm font-medium">{student}</span>
                  <span className="text-sm text-green-600">92%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              Needing Support
            </h4>
            <div className="space-y-2">
              {classData.needingSupport.map((student) => (
                <div key={student} className="flex items-center justify-between bg-card p-3 rounded border">
                  <span className="text-sm font-medium">{student}</span>
                  <button className="text-xs text-primary hover:text-primary/80 font-medium">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};