// Types for structured learning content
export interface LearningStageContent {
  id: string;
  title: string;
  description: string;
  content: {
    concept?: ConceptContent;
    guided?: GuidedPracticeContent;
    independent?: IndependentPracticeContent;
    assessment?: AssessmentContent;
  };
}

export interface ConceptContent {
  introduction: string;
  keyPoints: string[];
  examples: Example[];
  visualAids?: VisualAid[];
  realWorldApplications: string[];
}

export interface GuidedPracticeContent {
  introduction: string;
  stepByStepExamples: StepByStepExample[];
  interactiveElements?: InteractiveElement[];
  checkpoints: Checkpoint[];
}

export interface IndependentPracticeContent {
  introduction: string;
  practiceProblems: PracticeProblem[];
  hints?: Hint[];
  selfCheckQuestions: string[];
}

export interface AssessmentContent {
  introduction: string;
  questions: AssessmentQuestion[];
  passingCriteria: {
    minimumScore: number;
    totalQuestions: number;
  };
  feedbackMessages: {
    excellent: string;
    good: string;
    needsImprovement: string;
  };
}

export interface Example {
  title: string;
  description: string;
  solution?: string;
  explanation: string;
}

export interface VisualAid {
  type: 'image' | 'diagram' | 'chart' | 'animation';
  url: string;
  alt: string;
  caption?: string;
}

export interface StepByStepExample {
  title: string;
  problem: string;
  steps: Step[];
  finalAnswer: string;
  explanation: string;
}

export interface Step {
  stepNumber: number;
  instruction: string;
  working: string;
  explanation: string;
}

export interface InteractiveElement {
  type: 'drag-drop' | 'fill-blank' | 'multiple-choice' | 'drawing';
  question: string;
  correctAnswer: string;
  feedback: string;
}

export interface Checkpoint {
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface PracticeProblem {
  id: string;
  question: string;
  type: 'multiple-choice' | 'fill-blank' | 'calculation' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Hint {
  problemId: string;
  hints: string[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'calculation';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

// Complete topic learning content structure
export interface TopicLearningContent {
  topicId: string;
  topicName: string;
  subtopics: SubtopicLearningContent[];
}

export interface SubtopicLearningContent {
  subtopicId: string;
  subtopicName: string;
  estimatedDuration: number; // in minutes
  stages: {
    concept: ConceptContent;
    guided: GuidedPracticeContent;
    independent: IndependentPracticeContent;
    assessment: AssessmentContent;
  };
  prerequisites?: string[];
  learningObjectives: string[];
}