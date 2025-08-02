-- Create enums for bootcamp diagnostic system
CREATE TYPE question_category AS ENUM ('arithmetic', 'reasoning', 'mixed');
CREATE TYPE cognitive_level AS ENUM ('recall', 'application', 'analysis', 'synthesis');
CREATE TYPE difficulty_level AS ENUM ('foundation', 'intermediate', 'advanced');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'numeric_entry', 'multi_step');
CREATE TYPE answer_option AS ENUM ('A', 'B', 'C', 'D');

-- Create bootcamp questions table
CREATE TABLE public.bootcamp_questions (
    id SERIAL PRIMARY KEY,
    question_id TEXT NOT NULL UNIQUE,
    module_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    subtopic_id TEXT,
    question_category question_category NOT NULL,
    cognitive_level cognitive_level NOT NULL,
    difficulty difficulty_level NOT NULL,
    question_type question_type NOT NULL,
    question_text TEXT NOT NULL,
    visual_aid TEXT,
    marks INTEGER NOT NULL DEFAULT 1,
    time_seconds INTEGER NOT NULL DEFAULT 60,
    prerequisite_skills TEXT[] DEFAULT '{}',
    exam_boards TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bootcamp answers table
CREATE TABLE public.bootcamp_answers (
    id SERIAL PRIMARY KEY,
    answer_id TEXT NOT NULL UNIQUE,
    question_id TEXT NOT NULL REFERENCES bootcamp_questions(question_id) ON DELETE CASCADE,
    answer_option answer_option,
    answer_value TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    misconception_type TEXT,
    error_category TEXT,
    diagnostic_feedback TEXT NOT NULL,
    remedial_topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create misconceptions catalog table
CREATE TABLE public.bootcamp_misconceptions_catalog (
    id SERIAL PRIMARY KEY,
    misconception_id TEXT NOT NULL UNIQUE,
    misconception_name TEXT NOT NULL,
    description TEXT NOT NULL,
    common_indicators TEXT[] DEFAULT '{}',
    remediation_strategy TEXT NOT NULL,
    related_topics TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student responses table
CREATE TABLE public.bootcamp_student_responses (
    id SERIAL PRIMARY KEY,
    response_id TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    student_id UUID NOT NULL,
    question_id TEXT NOT NULL REFERENCES bootcamp_questions(question_id),
    selected_answer TEXT NOT NULL,
    time_taken INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    misconception_detected TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student profile table
CREATE TABLE public.bootcamp_student_profiles (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL UNIQUE,
    skill_strengths JSONB DEFAULT '{}',
    skill_weaknesses JSONB DEFAULT '{}',
    common_misconceptions TEXT[] DEFAULT '{}',
    arithmetic_proficiency DECIMAL(5,2) DEFAULT 0.0,
    reasoning_proficiency DECIMAL(5,2) DEFAULT 0.0,
    speed_percentile INTEGER DEFAULT 50,
    accuracy_by_topic JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bootcamp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_misconceptions_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_student_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view bootcamp questions" ON public.bootcamp_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add bootcamp questions" ON public.bootcamp_questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view bootcamp answers" ON public.bootcamp_answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add bootcamp answers" ON public.bootcamp_answers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view misconceptions catalog" ON public.bootcamp_misconceptions_catalog FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add misconceptions" ON public.bootcamp_misconceptions_catalog FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own bootcamp responses" ON public.bootcamp_student_responses FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert their own bootcamp responses" ON public.bootcamp_student_responses FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own bootcamp profile" ON public.bootcamp_student_profiles FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert their own bootcamp profile" ON public.bootcamp_student_profiles FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own bootcamp profile" ON public.bootcamp_student_profiles FOR UPDATE USING (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX idx_bootcamp_questions_module_topic ON bootcamp_questions(module_id, topic_id);
CREATE INDEX idx_bootcamp_questions_difficulty ON bootcamp_questions(difficulty);
CREATE INDEX idx_bootcamp_answers_question_id ON bootcamp_answers(question_id);
CREATE INDEX idx_bootcamp_student_responses_student ON bootcamp_student_responses(student_id);
CREATE INDEX idx_bootcamp_student_responses_question ON bootcamp_student_responses(question_id);
CREATE INDEX idx_bootcamp_misconceptions_category ON bootcamp_misconceptions_catalog(category);

-- Create triggers for updated_at
CREATE TRIGGER update_bootcamp_questions_updated_at
    BEFORE UPDATE ON public.bootcamp_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bootcamp_misconceptions_updated_at
    BEFORE UPDATE ON public.bootcamp_misconceptions_catalog
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bootcamp_student_profiles_updated_at
    BEFORE UPDATE ON public.bootcamp_student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample misconceptions catalog data
INSERT INTO public.bootcamp_misconceptions_catalog (misconception_id, misconception_name, description, common_indicators, remediation_strategy, related_topics, category) VALUES
('PV1', 'Digit position confusion', 'Student confuses the position/place value of digits in numbers', ARRAY['mixing up tens and hundreds', 'incorrect rounding', 'place value errors'], 'Use place value charts and manipulatives to reinforce position understanding', ARRAY['place_value', 'rounding', 'large_numbers'], 'place_value'),
('PV2', 'Zero as placeholder ignored', 'Student ignores or misunderstands the role of zero as a placeholder', ARRAY['dropping zeros', 'incorrect calculations with zeros'], 'Emphasize zeros role in maintaining place value positions', ARRAY['place_value', 'multiplication', 'division'], 'place_value'),
('FR1', 'Denominator addition error', 'Student adds denominators when adding fractions instead of finding common denominator', ARRAY['adding 1/3 + 1/4 = 2/7', 'treating fractions like whole numbers'], 'Practice finding common denominators before adding fractions', ARRAY['fractions', 'addition', 'equivalent_fractions'], 'fractions'),
('FR2', 'Whole number bias', 'Student applies whole number reasoning to fraction problems inappropriately', ARRAY['thinking larger denominator means larger fraction', 'ignoring fractional parts'], 'Use visual models to show fraction relationships and comparisons', ARRAY['fractions', 'comparison', 'decimals'], 'fractions'),
('OP1', 'Inverse operation confusion', 'Student confuses inverse operations (addition/subtraction, multiplication/division)', ARRAY['using wrong operation', 'calculation errors in multi-step problems'], 'Practice identifying and using inverse operations in context', ARRAY['operations', 'problem_solving', 'equations'], 'operations'),
('ME1', 'Unit conversion error', 'Student makes errors when converting between different units of measurement', ARRAY['incorrect conversions', 'mixing up larger/smaller units'], 'Practice conversion using real-world examples and conversion charts', ARRAY['measurement', 'units', 'problem_solving'], 'measurement'),
('PA1', 'Additive instead of multiplicative patterns', 'Student looks for additive patterns when multiplicative patterns are present', ARRAY['adding constant instead of multiplying', 'missing exponential growth'], 'Show both pattern types side by side and practice identifying the correct type', ARRAY['patterns', 'sequences', 'algebra'], 'patterns');