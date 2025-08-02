// Bootcamp components - Core infrastructure components
export { Dashboard } from './Dashboard';
export { Navigation } from './Navigation';
export { EnhancedPracticeSession } from './EnhancedPracticeSession';
export { MockTest } from './MockTest';
export { ProgressView } from './ProgressView';
export { TopicsView } from './TopicsView';
export { LearnView } from './LearnView';

// Analytics and Management
export { AnalyticsDashboard } from './AnalyticsDashboard';
export { StudentAnalytics } from './StudentAnalytics';
export { QuestionManager } from './QuestionManager';
export { QuestionBankManager } from './QuestionBankManager';

// Progress and Performance Tracking
export { ComprehensiveProgress } from './ComprehensiveProgress';
export { PerformanceChart } from './PerformanceChart';
export { ProgressInsights } from './ProgressInsights';
export { SkillRadarChart } from './SkillRadarChart';
export { WeeklyProgressChart } from './WeeklyProgressChart';
export { WeeklySummary } from './WeeklySummary';

// Question and Learning Interfaces
export { EnhancedQuestionInterface } from './EnhancedQuestionInterface';
export { DiagnosticQuestion } from './DiagnosticQuestion';
export { UniversalQuestion } from './UniversalQuestion';
export { LearningSessionModal } from './LearningSessionModal';
export { TopicLearningModal } from './TopicLearningModal';

// Learning Tools and Experiences
export { LearningExperience } from './LearningExperience';
export { LearningTools } from './LearningTools';
export { LearningPathRecommendations } from './LearningPathRecommendations';
// export { VisualMathTools } from './VisualMathTools'; // Export issue - check component

// UI Components and Cards
export { StatCard } from './StatCard';
export { ClassStatCard } from './ClassStatCard';
export { ModuleCard } from './ModuleCard';
export { TopicStrengthsCard } from './TopicStrengthsCard';
export { QuestionProgress } from './QuestionProgress';

// Achievement and Tracking
export { default as AchievementCenter } from './AchievementCenter';
export { AchievementBadges } from './AchievementBadges';
export { MisconceptionTracker } from './MisconceptionTracker';
export { RemediationSuggestion } from './RemediationSuggestion';

// Adaptive Learning
export { AdaptivePracticeGenerator } from './AdaptivePracticeGenerator';
export { SupportSuggestions } from './SupportSuggestions';
export { TopicAnalysis } from './TopicAnalysis';

// Assignment and Class Management
export { AssignmentManager } from './AssignmentManager';
export { CreateAssignmentModal } from './CreateAssignmentModal';
export { ClassOverview } from './ClassOverview';
export { StudentsList } from './StudentsList';

// Mock Tests and Practice
export { MockExamInterface } from './MockExamInterface';
// PracticeSession removed - use EnhancedPracticeSession instead

// Settings and Support
export { default as SettingsPage } from './SettingsPage';
export { default as HelpCenter } from './HelpCenter';
export { default as PracticeReport } from './PracticeReport';

// DEPRECATED - These components exist but are not integrated into active flow
// export { MathApp } from './MathApp'; // Replaced by Bootcamp.tsx
// export { StudentDashboard } from './StudentDashboard'; // Replaced by Dashboard.tsx
// export { EnhancedDashboard } from './EnhancedDashboard'; // Not used in routing
// export { TeacherDashboard } from './TeacherDashboard'; // Not used in routing  
// export { ParentDashboard } from './ParentDashboard'; // Not used in routing