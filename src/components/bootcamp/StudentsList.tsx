import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

interface Student {
  name: string;
  accuracy: number;
  questions: number;
  lastActive: string;
  trend: 'up' | 'down' | 'stable';
}

interface ClassData {
  students: number;
  avgAccuracy: number;
  completionRate: number;
  commonMisconceptions: string[];
  topPerformers: string[];
  needingSupport: string[];
}

interface StudentsListProps {
  classData: ClassData;
}

export const StudentsList: React.FC<StudentsListProps> = ({ classData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const students: Student[] = [
    { name: 'Sarah Johnson', accuracy: 85, questions: 342, lastActive: '2 hours ago', trend: 'up' },
    { name: 'Ahmed Khan', accuracy: 78, questions: 298, lastActive: '1 day ago', trend: 'stable' },
    { name: 'Emma Liu', accuracy: 92, questions: 456, lastActive: '3 hours ago', trend: 'up' },
    { name: 'Jack Miller', accuracy: 65, questions: 187, lastActive: '3 days ago', trend: 'down' },
    { name: 'Priya Sharma', accuracy: 70, questions: 234, lastActive: '1 day ago', trend: 'up' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        >
          <option value="name">Sort by Name</option>
          <option value="accuracy">Sort by Accuracy</option>
          <option value="activity">Sort by Activity</option>
        </select>
      </div>

      <div className="bg-muted rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left p-4 font-medium text-foreground">Student</th>
              <th className="text-center p-4 font-medium text-foreground">Accuracy</th>
              <th className="text-center p-4 font-medium text-foreground">Questions</th>
              <th className="text-center p-4 font-medium text-foreground">Last Active</th>
              <th className="text-center p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className="border-b border-border hover:bg-card transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{student.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`font-medium ${
                      student.accuracy >= 80 ? 'text-green-600' : 
                      student.accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {student.accuracy}%
                    </span>
                    {student.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {student.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                  </div>
                </td>
                <td className="p-4 text-center text-muted-foreground">{student.questions}</td>
                <td className="p-4 text-center text-muted-foreground text-sm">{student.lastActive}</td>
                <td className="p-4 text-center">
                  <button className="text-primary hover:text-primary/80 font-medium text-sm">
                    View Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};