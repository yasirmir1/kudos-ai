import React, { useState } from 'react';
import { Users, Target, Activity, AlertTriangle, Download } from 'lucide-react';
import { ClassStatCard } from './ClassStatCard';
import { ClassOverview } from './ClassOverview';
import { StudentsList } from './StudentsList';
import { TopicAnalysis } from './TopicAnalysis';
import { AssignmentManager } from './AssignmentManager';

interface ClassData {
  students: number;
  avgAccuracy: number;
  completionRate: number;
  commonMisconceptions: string[];
  topPerformers: string[];
  needingSupport: string[];
}

export const TeacherDashboard: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('7A');
  const [viewMode, setViewMode] = useState('overview');
  
  const classData: Record<string, ClassData> = {
    '7A': {
      students: 28,
      avgAccuracy: 72,
      completionRate: 85,
      commonMisconceptions: ['FR1', 'PV1', 'OP1'],
      topPerformers: ['Sarah J.', 'Ahmed K.', 'Emma L.'],
      needingSupport: ['Jack M.', 'Priya S.', 'Tom B.']
    }
  };

  const currentClass = classData[selectedClass];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor and support your students' progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="7A">Class 7A</option>
              <option value="7B">Class 7B</option>
              <option value="8A">Class 8A</option>
            </select>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <ClassStatCard
            icon={Users}
            label="Total Students"
            value={currentClass.students}
            color="blue"
          />
          <ClassStatCard
            icon={Target}
            label="Class Average"
            value={`${currentClass.avgAccuracy}%`}
            color="green"
          />
          <ClassStatCard
            icon={Activity}
            label="Completion Rate"
            value={`${currentClass.completionRate}%`}
            color="purple"
          />
          <ClassStatCard
            icon={AlertTriangle}
            label="Need Support"
            value={currentClass.needingSupport.length}
            color="yellow"
          />
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'overview' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('students')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'students' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setViewMode('topics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'topics' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Topics
          </button>
          <button
            onClick={() => setViewMode('assignments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'assignments' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Assignments
          </button>
        </div>

        {viewMode === 'overview' && <ClassOverview classData={currentClass} />}
        {viewMode === 'students' && <StudentsList classData={currentClass} />}
        {viewMode === 'topics' && <TopicAnalysis />}
        {viewMode === 'assignments' && <AssignmentManager />}
      </div>
    </div>
  );
};