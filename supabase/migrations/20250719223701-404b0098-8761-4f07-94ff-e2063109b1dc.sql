-- Add a year_level column to track progression within age groups
ALTER TABLE curriculum 
ADD COLUMN year_level integer;

-- Update existing year 2-3 records based on question_id patterns
UPDATE curriculum 
SET year_level = CASE 
    WHEN question_id LIKE '%y2%' THEN 2
    WHEN question_id LIKE '%y3%' THEN 3
    ELSE 2 -- default to year 2 for safety
END
WHERE age_group = 'year 2-3';

-- For other age groups, set appropriate year levels
UPDATE curriculum 
SET year_level = CASE 
    WHEN age_group = 'year 4-5' THEN 4
    WHEN age_group = '11+' THEN 6
    ELSE 2
END
WHERE year_level IS NULL;

-- Add constraint to ensure valid year levels
ALTER TABLE curriculum 
ADD CONSTRAINT valid_year_level 
CHECK (year_level BETWEEN 1 AND 12);

-- Update the adaptive questions function to respect year progression
CREATE OR REPLACE FUNCTION public.get_adaptive_questions_enhanced(p_student_id uuid, p_count integer DEFAULT 20)
 RETURNS TABLE(question jsonb)
 LANGUAGE plpgsql
AS $function$
DECLARE
    user_avg_accuracy NUMERIC;
    user_age_group age_group;
    user_year_level INTEGER;
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    remedial_count INTEGER;
BEGIN
    -- Get user's age group
    SELECT sp.age_group INTO user_age_group
    FROM student_profiles sp
    WHERE sp.id = p_student_id;
    
    -- If no age group found, default to year 4-5
    user_age_group := COALESCE(user_age_group, 'year 4-5');
    
    -- Determine user's current year level based on performance
    SELECT 
        CASE 
            WHEN user_age_group = 'year 2-3' THEN
                CASE 
                    WHEN AVG(CASE WHEN sa.is_correct AND c.year_level = 2 THEN 1.0 ELSE 0.0 END) > 0.8 THEN 3
                    ELSE 2
                END
            WHEN user_age_group = 'year 4-5' THEN 4
            WHEN user_age_group = '11+' THEN 6
            ELSE 2
        END INTO user_year_level
    FROM student_answers sa
    JOIN curriculum c ON sa.question_id = c.question_id
    WHERE sa.student_id = p_student_id 
        AND sa.age_group = user_age_group
        AND c.age_group = user_age_group;
    
    -- Default year level if no history
    user_year_level := COALESCE(user_year_level, 
        CASE 
            WHEN user_age_group = 'year 2-3' THEN 2
            WHEN user_age_group = 'year 4-5' THEN 4  
            WHEN user_age_group = '11+' THEN 6
            ELSE 2
        END
    );
    
    -- Calculate user's overall accuracy for their age group and year level
    SELECT AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) INTO user_avg_accuracy
    FROM student_answers sa
    JOIN curriculum c ON sa.question_id = c.question_id
    WHERE sa.student_id = p_student_id 
        AND sa.age_group = user_age_group
        AND c.year_level <= user_year_level;
    
    -- Set default accuracy for new users
    user_avg_accuracy := COALESCE(user_avg_accuracy, 0.5);
    
    -- Calculate distribution based on performance
    weak_topics_count := GREATEST(0, FLOOR(p_count * 0.3)::INTEGER);
    review_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    remedial_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    new_count := GREATEST(0, p_count - weak_topics_count - review_count - remedial_count);
    
    RETURN QUERY
    WITH 
    -- Weak topics based on accuracy for current and previous year levels
    weak_topics AS (
        SELECT sp.topic, sp.accuracy 
        FROM student_performance sp
        WHERE sp.student_id = p_student_id AND sp.accuracy < 0.7
        ORDER BY sp.accuracy ASC
        LIMIT 5
    ),
    -- Questions for weak topics with appropriate year level progression
    weak_topic_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN weak_topics wt ON c.topic = wt.topic
        WHERE c.age_group = user_age_group
            AND c.year_level <= user_year_level
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa
                WHERE sa.student_id = p_student_id 
                    AND sa.answered_at > NOW() - INTERVAL '2 days'
                    AND sa.age_group = user_age_group
            )
        ORDER BY c.year_level ASC, RANDOM()
        LIMIT weak_topics_count
    ),
    -- Remedial questions targeting specific misconceptions
    misconception_questions AS (
        SELECT DISTINCT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.age_group = user_age_group
            AND c.year_level <= user_year_level
            AND EXISTS (
                SELECT 1 FROM student_answers sa
                WHERE sa.student_id = p_student_id
                    AND sa.is_correct = false
                    AND sa.red_herring_triggered IS NOT NULL
                    AND c.red_herring_tag && sa.red_herring_triggered
                    AND sa.age_group = user_age_group
            )
        ORDER BY c.year_level ASC, RANDOM()
        LIMIT remedial_count
    ),
    -- Spaced repetition with year level consideration
    review_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN student_answers sa ON c.question_id = sa.question_id
        WHERE sa.student_id = p_student_id
            AND sa.is_correct = true
            AND sa.answered_at BETWEEN NOW() - INTERVAL '7 days' AND NOW() - INTERVAL '3 days'
            AND sa.age_group = user_age_group
            AND c.age_group = user_age_group
            AND c.year_level <= user_year_level
        ORDER BY c.year_level ASC, sa.answered_at ASC, RANDOM()
        LIMIT review_count
    ),
    -- New material with appropriate year level progression
    new_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.age_group = user_age_group
            AND c.year_level <= user_year_level
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa 
                WHERE sa.student_id = p_student_id
                    AND sa.age_group = user_age_group
            )
        ORDER BY c.year_level ASC, RANDOM()
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
$function$;