-- Add total_points column to bootcamp_students if it doesn't exist
ALTER TABLE bootcamp_students 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0 NOT NULL;

-- Create points history table to track all point transactions
CREATE TABLE bootcamp_student_points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    points_earned INTEGER NOT NULL,
    points_type VARCHAR(50) NOT NULL, -- 'correct_answer', 'streak_bonus', 'mock_test', 'achievement', etc.
    source_id TEXT, -- reference to question_id, session_id, achievement_id, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Foreign key constraint
    CONSTRAINT fk_points_student 
        FOREIGN KEY (student_id) 
        REFERENCES bootcamp_students(student_id) 
        ON DELETE CASCADE
);

-- Enable RLS on points history table
ALTER TABLE bootcamp_student_points_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for points history
CREATE POLICY "Users can view their own points history" 
ON bootcamp_student_points_history 
FOR SELECT 
USING (student_id IN (
    SELECT student_id 
    FROM bootcamp_students 
    WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their own points history" 
ON bootcamp_student_points_history 
FOR INSERT 
WITH CHECK (student_id IN (
    SELECT student_id 
    FROM bootcamp_students 
    WHERE user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_points_history_student_id ON bootcamp_student_points_history(student_id);
CREATE INDEX idx_points_history_created_at ON bootcamp_student_points_history(created_at);
CREATE INDEX idx_points_history_type ON bootcamp_student_points_history(points_type);

-- Function to award points and update total
CREATE OR REPLACE FUNCTION award_points(
    p_student_id UUID,
    p_points INTEGER,
    p_points_type VARCHAR(50),
    p_source_id TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert points transaction
    INSERT INTO bootcamp_student_points_history (
        student_id, 
        points_earned, 
        points_type, 
        source_id, 
        description
    ) VALUES (
        p_student_id, 
        p_points, 
        p_points_type, 
        p_source_id, 
        p_description
    );
    
    -- Update total points
    UPDATE bootcamp_students 
    SET total_points = total_points + p_points 
    WHERE student_id = p_student_id;
END;
$$;

-- Function to recalculate total points from history (useful for corrections)
CREATE OR REPLACE FUNCTION recalculate_student_points(p_student_id UUID) 
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calculated_total INTEGER;
BEGIN
    -- Calculate total from history
    SELECT COALESCE(SUM(points_earned), 0) 
    INTO calculated_total
    FROM bootcamp_student_points_history 
    WHERE student_id = p_student_id;
    
    -- Update student record
    UPDATE bootcamp_students 
    SET total_points = calculated_total 
    WHERE student_id = p_student_id;
    
    RETURN calculated_total;
END;
$$;

-- Trigger to automatically award points for correct answers
CREATE OR REPLACE FUNCTION award_answer_points() 
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    question_points INTEGER := 10; -- Default points per correct answer
BEGIN
    IF NEW.is_correct = true THEN
        -- Check if points already awarded for this response
        IF NOT EXISTS (
            SELECT 1 FROM bootcamp_student_points_history 
            WHERE student_id = NEW.student_id 
            AND source_id = NEW.response_id 
            AND points_type = 'correct_answer'
        ) THEN
            -- Award points for correct answer
            PERFORM award_points(
                NEW.student_id,
                question_points,
                'correct_answer',
                NEW.response_id,
                'Correct answer points'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for student responses
CREATE TRIGGER trigger_award_answer_points
    AFTER INSERT ON bootcamp_student_responses
    FOR EACH ROW
    EXECUTE FUNCTION award_answer_points();

-- Trigger for mock test answers
CREATE OR REPLACE FUNCTION award_mock_test_points() 
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    question_points INTEGER := 10; -- Points per correct mock test answer
BEGIN
    IF NEW.is_correct = true THEN
        -- Check if points already awarded for this answer
        IF NOT EXISTS (
            SELECT 1 FROM bootcamp_student_points_history 
            WHERE student_id IN (
                SELECT student_id FROM bootcamp_mock_test_sessions 
                WHERE session_id = NEW.session_id
            )
            AND source_id = NEW.assignment_id::text 
            AND points_type = 'mock_test_answer'
        ) THEN
            -- Award points for correct mock test answer
            PERFORM award_points(
                (SELECT student_id FROM bootcamp_mock_test_sessions WHERE session_id = NEW.session_id),
                question_points,
                'mock_test_answer',
                NEW.assignment_id::text,
                'Correct mock test answer'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for mock test answers
CREATE TRIGGER trigger_award_mock_test_points
    AFTER INSERT ON bootcamp_mock_test_answers
    FOR EACH ROW
    EXECUTE FUNCTION award_mock_test_points();