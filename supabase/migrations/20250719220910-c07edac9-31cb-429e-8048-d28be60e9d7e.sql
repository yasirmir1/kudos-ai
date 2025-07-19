-- Add age_group support to the application

-- First, create an enum for age groups
CREATE TYPE public.age_group AS ENUM ('6-7', '8-9', '10-11');

-- Add age_group column to student_profiles table
ALTER TABLE public.student_profiles 
ADD COLUMN age_group age_group DEFAULT '10-11';

-- Update existing profiles to have the default age group
UPDATE public.student_profiles 
SET age_group = '10-11' 
WHERE age_group IS NULL;

-- Make age_group NOT NULL after setting defaults
ALTER TABLE public.student_profiles 
ALTER COLUMN age_group SET NOT NULL;

-- Add age_group to curriculum table to support age-specific questions
ALTER TABLE public.curriculum 
ADD COLUMN age_group age_group DEFAULT '10-11';

-- Update existing curriculum to be for 10-11 age group
UPDATE public.curriculum 
SET age_group = '10-11' 
WHERE age_group IS NULL;

-- Make age_group NOT NULL after setting defaults
ALTER TABLE public.curriculum 
ALTER COLUMN age_group SET NOT NULL;

-- Add age_group to student_answers for tracking
ALTER TABLE public.student_answers 
ADD COLUMN age_group age_group;

-- Update existing student answers with their profile's age group
UPDATE public.student_answers sa
SET age_group = sp.age_group
FROM student_profiles sp
WHERE sa.student_id = sp.id AND sa.age_group IS NULL;

-- Add age_group to practice_sessions for tracking
ALTER TABLE public.practice_sessions 
ADD COLUMN age_group age_group;

-- Update existing practice sessions with their profile's age group
UPDATE public.practice_sessions ps
SET age_group = sp.age_group
FROM student_profiles sp
WHERE ps.student_id = sp.id AND ps.age_group IS NULL;

-- Update the adaptive questions function to consider age group
CREATE OR REPLACE FUNCTION public.get_adaptive_questions_enhanced(
    p_student_id uuid, 
    p_count integer DEFAULT 20
)
RETURNS TABLE(question jsonb)
LANGUAGE plpgsql
AS $$
DECLARE
    user_avg_accuracy NUMERIC;
    user_age_group age_group;
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    remedial_count INTEGER;
BEGIN
    -- Get user's age group
    SELECT sp.age_group INTO user_age_group
    FROM student_profiles sp
    WHERE sp.id = p_student_id;
    
    -- If no age group found, default to 10-11
    user_age_group := COALESCE(user_age_group, '10-11');
    
    -- Calculate user's overall accuracy for their age group
    SELECT AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) INTO user_avg_accuracy
    FROM student_answers 
    WHERE student_id = p_student_id AND age_group = user_age_group;
    
    -- Set default accuracy for new users
    user_avg_accuracy := COALESCE(user_avg_accuracy, 0.5);
    
    -- Calculate distribution based on performance
    weak_topics_count := GREATEST(0, FLOOR(p_count * 0.3)::INTEGER);
    review_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    remedial_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    new_count := GREATEST(0, p_count - weak_topics_count - review_count - remedial_count);
    
    RETURN QUERY
    WITH 
    -- Weak topics based on accuracy and red herring patterns for specific age group
    weak_topics AS (
        SELECT sp.topic, sp.accuracy 
        FROM student_performance sp
        WHERE sp.student_id = p_student_id AND sp.accuracy < 0.7
        ORDER BY sp.accuracy ASC
        LIMIT 5
    ),
    -- Questions for weak topics with appropriate difficulty and age group
    weak_topic_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN weak_topics wt ON c.topic = wt.topic
        WHERE c.age_group = user_age_group
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa
                WHERE sa.student_id = p_student_id 
                    AND sa.answered_at > NOW() - INTERVAL '2 days'
                    AND sa.age_group = user_age_group
            )
        -- Difficulty progression: if struggling, give easier questions
        AND (
            (wt.accuracy < 0.4 AND c.difficulty = 'Easy') OR
            (wt.accuracy BETWEEN 0.4 AND 0.6 AND c.difficulty IN ('Easy', 'Medium')) OR
            (wt.accuracy > 0.6 AND c.difficulty IN ('Medium', 'Hard'))
        )
        ORDER BY 
            CASE c.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
            RANDOM()
        LIMIT weak_topics_count
    ),
    -- Remedial questions targeting specific misconceptions for age group
    misconception_questions AS (
        SELECT DISTINCT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.age_group = user_age_group
            AND EXISTS (
                SELECT 1 FROM student_answers sa
                WHERE sa.student_id = p_student_id
                    AND sa.is_correct = false
                    AND sa.red_herring_triggered IS NOT NULL
                    AND c.red_herring_tag && sa.red_herring_triggered
                    AND sa.age_group = user_age_group
            )
        AND c.difficulty = 'Easy'  -- Start with easier versions of misconception areas
        ORDER BY RANDOM()
        LIMIT remedial_count
    ),
    -- Spaced repetition with difficulty consideration for age group
    review_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN student_answers sa ON c.question_id = sa.question_id
        WHERE sa.student_id = p_student_id
            AND sa.is_correct = true
            AND sa.answered_at BETWEEN NOW() - INTERVAL '7 days' AND NOW() - INTERVAL '3 days'
            AND sa.age_group = user_age_group
            AND c.age_group = user_age_group
            -- Gradually increase difficulty for mastered topics
            AND (
                (user_avg_accuracy < 0.6 AND c.difficulty IN ('Easy', 'Medium')) OR
                (user_avg_accuracy >= 0.6 AND user_avg_accuracy < 0.8 AND c.difficulty IN ('Medium', 'Hard')) OR
                (user_avg_accuracy >= 0.8)
            )
        ORDER BY sa.answered_at ASC, RANDOM()
        LIMIT review_count
    ),
    -- New material with appropriate difficulty for age group
    new_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.age_group = user_age_group
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa 
                WHERE sa.student_id = p_student_id
                    AND sa.age_group = user_age_group
            )
        -- Difficulty progression based on overall performance
        AND (
            (user_avg_accuracy < 0.5 AND c.difficulty = 'Easy') OR
            (user_avg_accuracy BETWEEN 0.5 AND 0.7 AND c.difficulty IN ('Easy', 'Medium')) OR
            (user_avg_accuracy > 0.7 AND c.difficulty IN ('Medium', 'Hard'))
        )
        ORDER BY 
            CASE c.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
            RANDOM()
        LIMIT new_count
    )
    SELECT question FROM weak_topic_questions
    UNION ALL
    SELECT question FROM misconception_questions  
    UNION ALL
    SELECT question FROM review_questions
    UNION ALL
    SELECT question FROM new_questions;
END;
$$;

-- Update weak topics function to consider age group
CREATE OR REPLACE FUNCTION public.get_weak_topics(p_student_id uuid)
RETURNS TABLE(topic text, accuracy numeric, attempts bigint)
LANGUAGE plpgsql
AS $$
DECLARE
    user_age_group age_group;
BEGIN
    -- Get user's age group
    SELECT sp.age_group INTO user_age_group
    FROM student_profiles sp
    WHERE sp.id = p_student_id;
    
    -- If no age group found, default to 10-11
    user_age_group := COALESCE(user_age_group, '10-11');
    
    RETURN QUERY
    SELECT 
        sp.topic,
        sp.accuracy,
        sp.total_attempts as attempts
    FROM student_performance sp
    WHERE sp.student_id = p_student_id
        AND sp.accuracy < 0.7
        AND sp.total_attempts >= 3
    ORDER BY sp.accuracy ASC;
END;
$$;