-- Create mock_test_questions table for dedicated mock test question storage
CREATE TABLE public.mock_test_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id TEXT NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    topic TEXT NOT NULL,
    subtopic TEXT,
    marks INTEGER NOT NULL DEFAULT 1,
    time_seconds INTEGER NOT NULL DEFAULT 60,
    visual_aid_url TEXT,
    tags TEXT[] DEFAULT '{}',
    exam_board TEXT,
    year_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.mock_test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for mock test questions
CREATE POLICY "Anyone can view active mock test questions" 
ON public.mock_test_questions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create mock test questions" 
ON public.mock_test_questions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Users can update their own mock test questions" 
ON public.mock_test_questions 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_mock_test_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mock_test_questions_updated_at
    BEFORE UPDATE ON public.mock_test_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_mock_test_questions_updated_at();

-- Insert some sample mock test questions
INSERT INTO public.mock_test_questions (
    question_id, question_text, option_a, option_b, option_c, option_d, 
    correct_answer, explanation, difficulty, topic, subtopic, marks, time_seconds
) VALUES 
(
    'MOCK001',
    'What is 25% of 80?',
    '15',
    '20',
    '25',
    '30',
    'B',
    '25% = 0.25, so 0.25 × 80 = 20',
    'easy',
    'Percentages',
    'Calculating percentages',
    2,
    90
),
(
    'MOCK002',
    'Solve for x: 3x + 7 = 22',
    'x = 3',
    'x = 5',
    'x = 7',
    'x = 9',
    'B',
    '3x + 7 = 22, so 3x = 15, therefore x = 5',
    'medium',
    'Algebra',
    'Linear equations',
    3,
    120
),
(
    'MOCK003',
    'What is the area of a rectangle with length 8cm and width 5cm?',
    '30 cm²',
    '35 cm²',
    '40 cm²',
    '45 cm²',
    'C',
    'Area = length × width = 8 × 5 = 40 cm²',
    'easy',
    'Geometry',
    'Area calculations',
    2,
    60
);