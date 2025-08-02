import React, { useState } from 'react';
import { Search, Upload, PlusCircle, Edit, BarChart } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  type: 'multiple_choice' | 'numeric_entry' | 'written';
  usage: number;
  successRate: number;
}

interface Filters {
  topic: string;
  difficulty: string;
  type: string;
  search: string;
}

export const QuestionBankManager: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    topic: 'all',
    difficulty: 'all',
    type: 'all',
    search: ''
  });

  const questions: Question[] = [
    {
      id: 'Q001',
      text: 'Round 3,847 to the nearest hundred',
      topic: 'Place Value',
      difficulty: 'foundation',
      type: 'multiple_choice',
      usage: 145,
      successRate: 72
    },
    {
      id: 'Q002',
      text: 'Calculate: 1/3 + 1/4',
      topic: 'Fractions',
      difficulty: 'intermediate',
      type: 'multiple_choice',
      usage: 98,
      successRate: 65
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-card rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Question Bank Manager</h1>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <PlusCircle className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          </div>
          <select
            value={filters.topic}
            onChange={(e) => setFilters({...filters, topic: e.target.value})}
            className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="all">All Topics</option>
            <option value="fractions">Fractions</option>
            <option value="algebra">Algebra</option>
            <option value="geometry">Geometry</option>
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="all">All Difficulties</option>
            <option value="foundation">Foundation</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="all">All Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="numeric_entry">Numeric Entry</option>
            <option value="written">Written</option>
          </select>
        </div>

        <div className="bg-muted rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left p-4 font-medium text-foreground">Question</th>
                <th className="text-center p-4 font-medium text-foreground">Topic</th>
                <th className="text-center p-4 font-medium text-foreground">Difficulty</th>
                <th className="text-center p-4 font-medium text-foreground">Usage</th>
                <th className="text-center p-4 font-medium text-foreground">Success Rate</th>
                <th className="text-center p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="border-b border-border hover:bg-card transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground text-sm">{question.id}</p>
                      <p className="text-sm text-muted-foreground mt-1">{question.text}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm text-foreground">{question.topic}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      question.difficulty === 'foundation' ? 'bg-green-100 text-green-700' :
                      question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">{question.usage}</td>
                  <td className="p-4 text-center">
                    <span className={`font-medium ${
                      question.successRate >= 70 ? 'text-green-600' :
                      question.successRate >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {question.successRate}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-1 hover:bg-muted rounded">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded">
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};