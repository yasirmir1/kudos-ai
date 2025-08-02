-- Create mock test sessions table
CREATE TABLE public.bootcamp_mock_test_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    session_type VARCHAR(20) DEFAULT 'mock_test',
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    total_questions INTEGER DEFAULT 50,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    time_limit_seconds INTEGER DEFAULT 3600, -- 60 minutes
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    session_data JSONB DEFAULT '{}', -- Store question order, answers, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.bootcamp_mock_test_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for mock test sessions
CREATE POLICY "Users can view their own mock test sessions" 
ON public.bootcamp_mock_test_sessions 
FOR SELECT 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their own mock test sessions" 
ON public.bootcamp_mock_test_sessions 
FOR INSERT 
WITH CHECK (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own mock test sessions" 
ON public.bootcamp_mock_test_sessions 
FOR UPDATE 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

-- Create mock test question assignments table
CREATE TABLE public.bootcamp_mock_test_questions (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES bootcamp_mock_test_sessions(session_id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    student_answer TEXT,
    is_correct BOOLEAN,
    time_taken_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE,
    misconception_detected TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.bootcamp_mock_test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for mock test questions
CREATE POLICY "Users can view their own mock test questions" 
ON public.bootcamp_mock_test_questions 
FOR SELECT 
USING (session_id IN (
    SELECT session_id FROM bootcamp_mock_test_sessions 
    WHERE student_id IN (
        SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Users can insert their own mock test questions" 
ON public.bootcamp_mock_test_questions 
FOR INSERT 
WITH CHECK (session_id IN (
    SELECT session_id FROM bootcamp_mock_test_sessions 
    WHERE student_id IN (
        SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Users can update their own mock test questions" 
ON public.bootcamp_mock_test_questions 
FOR UPDATE 
USING (session_id IN (
    SELECT session_id FROM bootcamp_mock_test_sessions 
    WHERE student_id IN (
        SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
    )
));

-- Create indexes for performance
CREATE INDEX idx_mock_test_sessions_student_id ON bootcamp_mock_test_sessions(student_id);
CREATE INDEX idx_mock_test_sessions_status ON bootcamp_mock_test_sessions(status);
CREATE INDEX idx_mock_test_questions_session_id ON bootcamp_mock_test_questions(session_id);
CREATE INDEX idx_mock_test_questions_question_order ON bootcamp_mock_test_questions(session_id, question_order);