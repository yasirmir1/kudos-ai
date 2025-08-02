import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface StudentProfile {
  accuracy: number;
  weakAreas: string[];
  misconceptions: string[];
  pace: string;
}

interface PracticeQuestion {
  topic: string;
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  targetMisconception: string | null;
  reason: string;
}

interface PracticeSet {
  id: string;
  questions: PracticeQuestion[];
  estimatedTime: number;
  targetAccuracy: number;
}

interface AdaptivePracticeGeneratorProps {
  studentProfile: StudentProfile;
}

export const AdaptivePracticeGenerator: React.FC<AdaptivePracticeGeneratorProps> = ({ studentProfile }) => {
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    questionCount: 20,
    focusArea: 'mixed',
    difficulty: 'adaptive',
    timeLimit: 'standard'
  });

  const generatePracticeSet = async () => {
    setIsGenerating(true);
    // Simulate API call to generate adaptive practice set
    setTimeout(() => {
      setPracticeSet({
        id: 'PS' + Date.now(),
        questions: [
          {
            topic: 'Fractions',
            difficulty: 'intermediate',
            targetMisconception: 'FR1',
            reason: 'Recent errors in denominator addition'
          },
          {
            topic: 'Place Value',
            difficulty: 'foundation',
            targetMisconception: null,
            reason: 'Reinforcement of fundamentals'
          },
          {
            topic: 'Algebra',
            difficulty: 'advanced',
            targetMisconception: null,
            reason: 'Challenge question for growth'
          }
        ],
        estimatedTime: 30,
        targetAccuracy: 75
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 border">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Adaptive Practice Generator</h2>
        <p className="text-muted-foreground">AI-powered practice sets tailored to student needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Current Student Profile</h3>
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Accuracy</span>
              <span className="font-medium">{studentProfile.accuracy}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weak Areas</span>
              <span className="font-medium text-yellow-600">{studentProfile.weakAreas.join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Misconceptions</span>
              <span className="font-medium text-red-600">{studentProfile.misconceptions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Learning Pace</span>
              <span className="font-medium">{studentProfile.pace}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Practice Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Number of Questions</label>
              <select
                value={customSettings.questionCount}
                onChange={(e) => setCustomSettings({...customSettings, questionCount: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="10">10 (Quick)</option>
                <option value="20">20 (Standard)</option>
                <option value="30">30 (Extended)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Focus Area</label>
              <select
                value={customSettings.focusArea}
                onChange={(e) => setCustomSettings({...customSettings, focusArea: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="mixed">Mixed Practice</option>
                <option value="weaknesses">Target Weaknesses</option>
                <option value="misconceptions">Address Misconceptions</option>
                <option value="challenge">Challenge Mode</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={generatePracticeSet}
        disabled={isGenerating}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Generate Adaptive Practice Set</span>
          </span>
        )}
      </button>

      {practiceSet && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="font-medium text-primary mb-3">Generated Practice Set</h4>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary/80">Estimated Time</span>
              <span className="font-medium text-primary">{practiceSet.estimatedTime} mins</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary/80">Target Accuracy</span>
              <span className="font-medium text-primary">{practiceSet.targetAccuracy}%</span>
            </div>
          </div>
          <div className="space-y-2">
            {practiceSet.questions.slice(0, 3).map((q, index) => (
              <div key={index} className="bg-card p-3 rounded border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{q.topic}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    q.difficulty === 'foundation' ? 'bg-green-100 text-green-700' :
                    q.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{q.reason}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Start Practice Session
          </button>
        </div>
      )}
    </div>
  );
};