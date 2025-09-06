import React, { useState } from 'react';
import { PlusCircle, Edit } from 'lucide-react';
import { CreateAssignmentModal } from './CreateAssignmentModal';

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  assigned: string;
  completion: number;
  avgScore: number;
}

export const AssignmentManager: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const assignments: Assignment[] = [
    {
      id: 1,
      title: 'Fractions Review',
      dueDate: '2024-01-15',
      assigned: '2024-01-08',
      completion: 65,
      avgScore: 72
    },
    {
      id: 2,
      title: 'Weekly Mixed Practice',
      dueDate: '2024-01-12',
      assigned: '2024-01-05',
      completion: 85,
      avgScore: 78
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Assignments</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-card border border-border rounded-lg p-4" style={{ 
            background: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))', 
            color: 'hsl(var(--card-foreground))',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            zIndex: 1
          }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">{assignment.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Assigned: {assignment.assigned} • Due: {assignment.dueDate}
                </p>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${assignment.completion}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{assignment.completion}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-lg font-medium text-foreground">{assignment.avgScore}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && <CreateAssignmentModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};