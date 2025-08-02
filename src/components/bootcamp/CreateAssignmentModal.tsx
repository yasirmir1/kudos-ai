import React, { useState } from 'react';

interface AssignmentData {
  title: string;
  topics: string[];
  questionCount: number;
  dueDate: string;
  difficulty: string;
}

interface CreateAssignmentModalProps {
  onClose: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ onClose }) => {
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: '',
    topics: [],
    questionCount: 20,
    dueDate: '',
    difficulty: 'mixed'
  });

  const topics = ['Fractions', 'Decimals', 'Percentages', 'Algebra', 'Geometry', 'Word Problems'];

  const handleTopicToggle = (topic: string) => {
    setAssignmentData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Create New Assignment</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              value={assignmentData.title}
              onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="e.g., Fractions and Decimals Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Topics to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              {topics.map(topic => (
                <label key={topic} className="flex items-center space-x-2 p-2 border border-border rounded hover:bg-muted">
                  <input
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-primary"
                    checked={assignmentData.topics.includes(topic)}
                    onChange={() => handleTopicToggle(topic)}
                  />
                  <span className="text-sm">{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Number of Questions
              </label>
              <select
                value={assignmentData.questionCount}
                onChange={(e) => setAssignmentData({...assignmentData, questionCount: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={assignmentData.dueDate}
                onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Difficulty Level
            </label>
            <select
              value={assignmentData.difficulty}
              onChange={(e) => setAssignmentData({...assignmentData, difficulty: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="foundation">Foundation</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="mixed">Mixed (Adaptive)</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Handle assignment creation
              onClose();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  );
};