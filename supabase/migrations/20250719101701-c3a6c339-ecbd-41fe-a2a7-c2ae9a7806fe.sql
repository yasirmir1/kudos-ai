-- Add red herring tracking to student_answers table
ALTER TABLE student_answers 
ADD COLUMN red_herring_triggered TEXT[],
ADD COLUMN difficulty_appropriate BOOLEAN DEFAULT NULL;

-- Create function to analyze student misconceptions
CREATE OR REPLACE FUNCTION public.get_student_misconceptions(p_student_id uuid)
RETURNS TABLE(
    red_herring TEXT,
    frequency BIGINT,
    topics TEXT[]
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(sa.red_herring_triggered) as red_herring,
        COUNT(*) as frequency,
        ARRAY_AGG(DISTINCT sa.topic) as topics
    FROM student_answers sa
    WHERE sa.student_id = p_student_id 
        AND sa.red_herring_triggered IS NOT NULL
        AND array_length(sa.red_herring_triggered, 1) > 0
    GROUP BY unnest(sa.red_herring_triggered)
    ORDER BY frequency DESC;
END;
$$;

-- Enhanced adaptive questions function with difficulty progression and red herring awareness
CREATE OR REPLACE FUNCTION public.get_adaptive_questions_enhanced(p_student_id uuid, p_count integer DEFAULT 20)
RETURNS TABLE(question jsonb) LANGUAGE plpgsql AS $$
DECLARE
    user_avg_accuracy NUMERIC;
    user_difficulty_mastery RECORD;
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    remedial_count INTEGER;
BEGIN
    -- Calculate user's overall accuracy and difficulty mastery
    SELECT AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) INTO user_avg_accuracy
    FROM student_answers WHERE student_id = p_student_id;
    
    -- Set default accuracy for new users
    user_avg_accuracy := COALESCE(user_avg_accuracy, 0.5);
    
    -- Calculate distribution based on performance
    weak_topics_count := GREATEST(0, FLOOR(p_count * 0.3)::INTEGER);
    review_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    remedial_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    new_count := GREATEST(0, p_count - weak_topics_count - review_count - remedial_count);
    
    RETURN QUERY
    WITH 
    -- Weak topics based on accuracy and red herring patterns
    weak_topics AS (
        SELECT sp.topic, sp.accuracy 
        FROM student_performance sp
        WHERE sp.student_id = p_student_id AND sp.accuracy < 0.7
        ORDER BY sp.accuracy ASC
        LIMIT 5
    ),
    -- Questions for weak topics with appropriate difficulty
    weak_topic_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN weak_topics wt ON c.topic = wt.topic
        WHERE c.question_id NOT IN (
            SELECT sa.question_id FROM student_answers sa
            WHERE sa.student_id = p_student_id 
                AND sa.answered_at > NOW() - INTERVAL '2 days'
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
    -- Remedial questions targeting specific misconceptions
    misconception_questions AS (
        SELECT DISTINCT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE EXISTS (
            SELECT 1 FROM student_answers sa
            WHERE sa.student_id = p_student_id
                AND sa.is_correct = false
                AND sa.red_herring_triggered IS NOT NULL
                AND c.red_herring_tag && sa.red_herring_triggered
        )
        AND c.difficulty = 'Easy'  -- Start with easier versions of misconception areas
        ORDER BY RANDOM()
        LIMIT remedial_count
    ),
    -- Spaced repetition with difficulty consideration
    review_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN student_answers sa ON c.question_id = sa.question_id
        WHERE sa.student_id = p_student_id
            AND sa.is_correct = true
            AND sa.answered_at BETWEEN NOW() - INTERVAL '7 days' AND NOW() - INTERVAL '3 days'
            -- Gradually increase difficulty for mastered topics
            AND (
                (user_avg_accuracy < 0.6 AND c.difficulty IN ('Easy', 'Medium')) OR
                (user_avg_accuracy >= 0.6 AND user_avg_accuracy < 0.8 AND c.difficulty IN ('Medium', 'Hard')) OR
                (user_avg_accuracy >= 0.8)
            )
        ORDER BY sa.answered_at ASC, RANDOM()
        LIMIT review_count
    ),
    -- New material with appropriate difficulty
    new_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.question_id NOT IN (
            SELECT sa.question_id FROM student_answers sa WHERE sa.student_id = p_student_id
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