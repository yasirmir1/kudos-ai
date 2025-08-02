-- Create learning_results table to store quick practice test responses
CREATE TABLE public.learning_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    topic_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    time_taken_seconds INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'quick_practice',
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.learning_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own learning results" 
ON public.learning_results 
FOR SELECT 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students 
    WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create their own learning results" 
ON public.learning_results 
FOR INSERT 
WITH CHECK (student_id IN (
    SELECT student_id FROM bootcamp_students 
    WHERE user_id = auth.uid()
));

-- Create index for better performance
CREATE INDEX idx_learning_results_student_topic ON learning_results(student_id, topic_id);
CREATE INDEX idx_learning_results_session ON learning_results(student_id, session_type, responded_at);