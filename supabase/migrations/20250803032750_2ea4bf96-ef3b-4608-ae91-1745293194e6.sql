-- Create mock_test_questions table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS mock_test_questions (
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
    difficulty TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT,
    marks INTEGER NOT NULL DEFAULT 1,
    time_seconds INTEGER NOT NULL DEFAULT 60,
    visual_aid_url TEXT,
    tags TEXT[], 
    exam_board TEXT,
    year_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE mock_test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view mock test questions" 
ON mock_test_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add mock test questions" 
ON mock_test_questions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to import mock test questions from JSON
CREATE OR REPLACE FUNCTION import_mock_test_questions(questions_data JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    question_record JSONB;
    imported_count INTEGER := 0;
BEGIN
    FOR question_record IN SELECT * FROM jsonb_array_elements(questions_data)
    LOOP
        INSERT INTO mock_test_questions (
            question_id,
            question_text,
            question_type,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation,
            difficulty,
            topic,
            subtopic,
            marks,
            time_seconds,
            visual_aid_url,
            tags,
            exam_board,
            year_level,
            is_active
        ) VALUES (
            question_record->>'question_id',
            question_record->>'question_text',
            COALESCE(question_record->>'question_type', 'multiple_choice'),
            question_record->>'option_a',
            question_record->>'option_b',
            question_record->>'option_c',
            question_record->>'option_d',
            question_record->>'correct_answer',
            question_record->>'explanation',
            question_record->>'difficulty',
            question_record->>'topic',
            question_record->>'subtopic',
            COALESCE((question_record->>'marks')::INTEGER, 1),
            COALESCE((question_record->>'time_seconds')::INTEGER, 60),
            question_record->>'visual_aid_url',
            CASE 
                WHEN question_record->>'tags' IS NOT NULL 
                THEN string_to_array(trim(both '"' from question_record->>'tags'), ',')
                ELSE '{}'::TEXT[]
            END,
            question_record->>'exam_board',
            COALESCE((question_record->>'year_level')::INTEGER, 7),
            COALESCE((question_record->>'is_active')::BOOLEAN, true)
        ) ON CONFLICT (question_id) DO UPDATE SET
            question_text = EXCLUDED.question_text,
            question_type = EXCLUDED.question_type,
            option_a = EXCLUDED.option_a,
            option_b = EXCLUDED.option_b,
            option_c = EXCLUDED.option_c,
            option_d = EXCLUDED.option_d,
            correct_answer = EXCLUDED.correct_answer,
            explanation = EXCLUDED.explanation,
            difficulty = EXCLUDED.difficulty,
            topic = EXCLUDED.topic,
            subtopic = EXCLUDED.subtopic,
            marks = EXCLUDED.marks,
            time_seconds = EXCLUDED.time_seconds,
            visual_aid_url = EXCLUDED.visual_aid_url,
            tags = EXCLUDED.tags,
            exam_board = EXCLUDED.exam_board,
            year_level = EXCLUDED.year_level,
            is_active = EXCLUDED.is_active,
            updated_at = CURRENT_TIMESTAMP;
        
        imported_count := imported_count + 1;
    END LOOP;

    RETURN 'Successfully imported ' || imported_count || ' mock test questions';
END;
$$;