-- 11+ Mathematics Ed Tech App Database Schema
-- Core Tables for Comprehensive Student Analytics and Adaptive Learning

-- Core Students table (enhanced from existing profile)
CREATE TABLE IF NOT EXISTS bootcamp_students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100),
    date_of_birth DATE,
    school_year INTEGER,
    target_exam_date DATE,
    exam_boards TEXT[], -- Array of target exam boards
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    subscription_tier VARCHAR(20) DEFAULT 'free'
);

-- Enhanced Modules table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_modules (
    module_id VARCHAR(10) PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL,
    module_order INTEGER,
    weeks_allocated INTEGER,
    description TEXT
);

-- Enhanced Topics table  
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_topics (
    topic_id VARCHAR(10) PRIMARY KEY,
    module_id VARCHAR(10) REFERENCES bootcamp_enhanced_modules(module_id),
    topic_name VARCHAR(100) NOT NULL,
    topic_order INTEGER,
    difficulty_level VARCHAR(20),
    estimated_questions INTEGER
);

-- Enhanced Subtopics table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_subtopics (
    subtopic_id VARCHAR(15) PRIMARY KEY,
    topic_id VARCHAR(10) REFERENCES bootcamp_enhanced_topics(topic_id),
    subtopic_name VARCHAR(100) NOT NULL,
    prerequisite_subtopics TEXT[],
    learning_objectives TEXT[]
);

-- Enhanced Questions table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_questions (
    question_id VARCHAR(20) PRIMARY KEY,
    module_id VARCHAR(10) REFERENCES bootcamp_enhanced_modules(module_id),
    topic_id VARCHAR(10) REFERENCES bootcamp_enhanced_topics(topic_id),
    subtopic_id VARCHAR(15) REFERENCES bootcamp_enhanced_subtopics(subtopic_id),
    question_category VARCHAR(20) CHECK (question_category IN ('arithmetic', 'reasoning', 'mixed')),
    cognitive_level VARCHAR(20) CHECK (cognitive_level IN ('recall', 'application', 'analysis', 'synthesis')),
    difficulty VARCHAR(20) CHECK (difficulty IN ('foundation', 'intermediate', 'advanced')),
    question_type VARCHAR(30),
    question_text TEXT NOT NULL,
    visual_aid_url TEXT,
    marks INTEGER DEFAULT 1,
    time_seconds INTEGER,
    prerequisite_skills TEXT[],
    exam_boards TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2)
);

-- Enhanced Answer Options table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_answer_options (
    answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id VARCHAR(20) REFERENCES bootcamp_enhanced_questions(question_id),
    option_letter CHAR(1) CHECK (option_letter IN ('A', 'B', 'C', 'D')),
    answer_value TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    misconception_code VARCHAR(10),
    error_category VARCHAR(10),
    diagnostic_feedback TEXT,
    remedial_topic VARCHAR(50),
    selection_count INTEGER DEFAULT 0,
    UNIQUE(question_id, option_letter)
);

-- Enhanced Misconceptions table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_misconceptions (
    misconception_code VARCHAR(10) PRIMARY KEY,
    misconception_type VARCHAR(50),
    description TEXT,
    diagnostic_indicators TEXT[],
    remediation_pathway_id VARCHAR(20)
);

-- Student Responses table (comprehensive tracking)
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_student_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES bootcamp_students(student_id),
    question_id VARCHAR(20) REFERENCES bootcamp_enhanced_questions(question_id),
    session_id UUID,
    selected_answer CHAR(1),
    is_correct BOOLEAN,
    time_taken_seconds INTEGER,
    misconception_detected VARCHAR(10),
    attempt_number INTEGER DEFAULT 1,
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence_rating INTEGER CHECK (confidence_rating BETWEEN 1 AND 5),
    required_hint BOOLEAN DEFAULT FALSE
);

-- Student Skills tracking table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_student_skills (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES bootcamp_students(student_id),
    skill_name VARCHAR(50),
    skill_category VARCHAR(30),
    proficiency_level DECIMAL(3,2) CHECK (proficiency_level BETWEEN 0 AND 1),
    last_assessed TIMESTAMP,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    average_time_seconds INTEGER,
    misconceptions_cleared TEXT[],
    active_misconceptions TEXT[],
    UNIQUE(student_id, skill_name)
);

-- Learning Sessions table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_learning_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES bootcamp_students(student_id),
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    topics_covered TEXT[],
    session_type VARCHAR(30), -- practice, test, review, tutorial
    performance_score DECIMAL(5,2)
);

-- Remediation Pathways table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_remediation_pathways (
    pathway_id VARCHAR(20) PRIMARY KEY,
    misconception_code VARCHAR(10) REFERENCES bootcamp_enhanced_misconceptions(misconception_code),
    pathway_name VARCHAR(100),
    stages JSONB, -- Stores the structured pathway with activities and criteria
    estimated_duration_days INTEGER,
    success_rate DECIMAL(5,2)
);

-- Student Progress tracking table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_student_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES bootcamp_students(student_id),
    module_id VARCHAR(10) REFERENCES bootcamp_enhanced_modules(module_id),
    topic_id VARCHAR(10) REFERENCES bootcamp_enhanced_topics(topic_id),
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    accuracy_percentage DECIMAL(5,2),
    average_speed_seconds DECIMAL(6,2),
    last_activity TIMESTAMP,
    mastery_score DECIMAL(3,2),
    UNIQUE(student_id, topic_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES bootcamp_students(student_id),
    achievement_type VARCHAR(50),
    achievement_name VARCHAR(100),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_awarded INTEGER,
    badge_url TEXT
);

-- Adaptive Recommendations table
CREATE TABLE IF NOT EXISTS bootcamp_enhanced_adaptive_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES bootcamp_students(student_id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recommendation_type VARCHAR(30), -- practice_set, intervention, challenge
    priority INTEGER,
    content JSONB, -- Stores question IDs, topics, and rationale
    expires_at TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_responses_student ON bootcamp_enhanced_student_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_responses_question ON bootcamp_enhanced_student_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_responses_time ON bootcamp_enhanced_student_responses(responded_at);
CREATE INDEX IF NOT EXISTS idx_bootcamp_questions_topic ON bootcamp_enhanced_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_questions_difficulty ON bootcamp_enhanced_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_progress_student ON bootcamp_enhanced_student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_progress_status ON bootcamp_enhanced_student_progress(status);