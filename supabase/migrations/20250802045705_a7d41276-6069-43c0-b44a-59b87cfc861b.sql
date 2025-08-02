-- Create bootcamp_student_progress table
CREATE TABLE public.bootcamp_student_progress (
    progress_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES bootcamp_students(student_id) ON DELETE CASCADE,
    module_id text,
    topic_id text,
    status varchar(20) DEFAULT 'not_started',
    accuracy_percentage numeric(5,2),
    average_speed_seconds numeric(6,2),
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mastery_score numeric(3,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, topic_id)
);

-- Create bootcamp_learning_sessions table
CREATE TABLE public.bootcamp_learning_sessions (
    session_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES bootcamp_students(student_id) ON DELETE CASCADE,
    session_type varchar(50) DEFAULT 'practice',
    session_start timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    session_end timestamp without time zone,
    questions_attempted integer DEFAULT 0,
    questions_correct integer DEFAULT 0,
    performance_score numeric(5,2),
    topics_covered text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create bootcamp_student_skills table  
CREATE TABLE public.bootcamp_student_skills (
    skill_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES bootcamp_students(student_id) ON DELETE CASCADE,
    skill_name varchar(100),
    skill_category varchar(50),
    proficiency_level numeric(3,2) DEFAULT 0.0,
    questions_attempted integer DEFAULT 0,
    questions_correct integer DEFAULT 0,
    average_time_seconds integer,
    active_misconceptions text[],
    misconceptions_cleared text[],
    last_assessed timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_name)
);

-- Enable RLS on all tables
ALTER TABLE public.bootcamp_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_student_skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bootcamp_student_progress
CREATE POLICY "Users can view their own progress" 
ON public.bootcamp_student_progress 
FOR SELECT 
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own progress" 
ON public.bootcamp_student_progress 
FOR INSERT 
WITH CHECK (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own progress" 
ON public.bootcamp_student_progress 
FOR UPDATE 
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

-- Create RLS policies for bootcamp_learning_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.bootcamp_learning_sessions 
FOR SELECT 
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own sessions" 
ON public.bootcamp_learning_sessions 
FOR INSERT 
WITH CHECK (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own sessions" 
ON public.bootcamp_learning_sessions 
FOR UPDATE 
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

-- Create RLS policies for bootcamp_student_skills
CREATE POLICY "Users can view their own skills" 
ON public.bootcamp_student_skills 
FOR SELECT 
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own skills" 
ON public.bootcamp_student_skills 
FOR INSERT 
WITH CHECK (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own skills" 
ON public.bootcamp_student_skills 
FOR UPDATE 
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION update_bootcamp_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bootcamp_student_progress_updated_at 
BEFORE UPDATE ON public.bootcamp_student_progress 
FOR EACH ROW EXECUTE FUNCTION update_bootcamp_updated_at_column();

CREATE TRIGGER update_bootcamp_student_skills_updated_at 
BEFORE UPDATE ON public.bootcamp_student_skills 
FOR EACH ROW EXECUTE FUNCTION update_bootcamp_updated_at_column();