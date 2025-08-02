import React, { useState, useEffect } from 'react';
import { Shield, Clock } from 'lucide-react';

interface ExamSection {
  id: number;
  name: string;
  questions: number;
  time: number;
}

export const MockExamInterface: React.FC = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(2700); // 45 minutes

  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining]);

  const examSections: ExamSection[] = [
    { id: 1, name: 'Arithmetic', questions: 20, time: 15 },
    { id: 2, name: 'Problem Solving', questions: 15, time: 20 },
    { id: 3, name: 'Reasoning', questions: 15, time: 10 }
  ];

  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-sm border p-8 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">11+ Mock Exam</h2>
          <p className="text-muted-foreground mb-6">
            This mock exam simulates real exam conditions. You'll have 45 minutes to complete 50 questions across 3 sections.
          </p>
          
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-foreground mb-3">Exam Structure:</h3>
            <div className="space-y-2">
              {examSections.map(section => (
                <div key={section.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{section.name}</span>
                  <span className="text-muted-foreground">{section.questions} questions • {section.time} mins</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-warning">
              <strong>Important:</strong> Once you start, you cannot pause the exam. Make sure you're ready and won't be interrupted.
            </p>
          </div>

          <button
            onClick={() => setExamStarted(true)}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-card rounded-xl shadow-sm border">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-foreground">
                Section {currentSection}: {examSections[currentSection - 1].name}
              </h3>
              <span className="text-sm text-muted-foreground">
                Question 1 of {examSections[currentSection - 1].questions}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                timeRemaining < 300 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">
                End Exam
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <p className="text-muted-foreground">Exam questions interface would be displayed here...</p>
        </div>

        <div className="border-t border-border p-4 flex justify-between">
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
            Previous
          </button>
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                className={`w-10 h-10 rounded ${
                  i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <span className="flex items-center px-2 text-muted-foreground">...</span>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};