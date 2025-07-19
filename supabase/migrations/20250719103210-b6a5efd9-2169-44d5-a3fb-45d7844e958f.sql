-- Phase 1: Critical Database Security Fixes

-- Enable RLS on student_performance table
ALTER TABLE public.student_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_performance (user-specific access)
CREATE POLICY "Users can view own performance data" 
ON public.student_performance 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Users can insert own performance data" 
ON public.student_performance 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can update own performance data" 
ON public.student_performance 
FOR UPDATE 
USING (student_id = auth.uid());

-- Update database functions to use SECURITY DEFINER where appropriate
CREATE OR REPLACE FUNCTION public.get_weak_topics(p_student_id uuid)
 RETURNS TABLE(topic text, accuracy numeric, attempts bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Ensure user can only access their own data
    IF p_student_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only view own performance data';
    END IF;
    
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
$function$;

CREATE OR REPLACE FUNCTION public.get_student_misconceptions(p_student_id uuid)
 RETURNS TABLE(red_herring text, frequency bigint, topics text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Ensure user can only access their own data
    IF p_student_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only view own misconception data';
    END IF;
    
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
$function$;

CREATE OR REPLACE FUNCTION public.get_adaptive_questions(p_student_id uuid, p_count integer DEFAULT 10)
 RETURNS TABLE(question jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    confidence_count INTEGER;
BEGIN
    -- Ensure user can only access their own data
    IF p_student_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only generate questions for own account';
    END IF;
    
    -- Validate input parameters
    IF p_count <= 0 OR p_count > 50 THEN
        RAISE EXCEPTION 'Invalid question count: must be between 1 and 50';
    END IF;
    
    -- Calculate distribution with minimum values to prevent negative limits
    weak_topics_count := GREATEST(0, FLOOR(p_count * 0.4)::INTEGER);
    review_count := GREATEST(0, FLOOR(p_count * 0.3)::INTEGER);
    new_count := GREATEST(0, FLOOR(p_count * 0.2)::INTEGER);
    confidence_count := GREATEST(0, p_count - weak_topics_count - review_count - new_count);
    
    -- If a user has no history, prioritize new questions
    IF weak_topics_count = 0 AND review_count = 0 THEN
        new_count := p_count;
        confidence_count := 0;
    END IF;
    
    RETURN QUERY
    -- Weak topics questions (40%)
    WITH weak_topics AS (
        SELECT wt.topic FROM get_weak_topics(p_student_id) wt LIMIT 5
    ),
    weak_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.topic IN (SELECT topic FROM weak_topics)
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa
                WHERE sa.student_id = p_student_id 
                    AND sa.answered_at > NOW() - INTERVAL '1 day'
            )
        ORDER BY 
            CASE c.difficulty 
                WHEN 'Easy' THEN 1 
                WHEN 'Medium' THEN 2 
                ELSE 3 
            END,
            RANDOM()
        LIMIT CASE WHEN weak_topics_count > 0 THEN weak_topics_count ELSE 0 END
    ),
    -- Spaced repetition questions (30%)
    review_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.question_id IN (
            SELECT DISTINCT sa.question_id 
            FROM student_answers sa
            WHERE sa.student_id = p_student_id
                AND sa.is_correct = true
                AND sa.answered_at < NOW() - INTERVAL '3 days'
                AND sa.answered_at > NOW() - INTERVAL '7 days'
        )
        ORDER BY RANDOM()
        LIMIT CASE WHEN review_count > 0 THEN review_count ELSE 0 END
    ),
    -- New material (20% or more for new users)
    new_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.question_id NOT IN (
            SELECT sa.question_id FROM student_answers sa WHERE sa.student_id = p_student_id
        )
        AND c.difficulty IN ('Easy', 'Medium')
        ORDER BY RANDOM()
        LIMIT CASE WHEN new_count > 0 THEN new_count ELSE 0 END
    ),
    -- Confidence builders (10%)
    confidence_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.difficulty = 'Easy'
            AND c.topic IN (
                SELECT sp.topic FROM student_performance sp
                WHERE sp.student_id = p_student_id AND sp.accuracy > 0.8
            )
        ORDER BY RANDOM()
        LIMIT CASE WHEN confidence_count > 0 THEN confidence_count ELSE 0 END
    )
    SELECT wq.question FROM weak_questions wq
    UNION ALL
    SELECT rq.question FROM review_questions rq
    UNION ALL
    SELECT nq.question FROM new_questions nq
    UNION ALL
    SELECT cq.question FROM confidence_questions cq;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_adaptive_questions_enhanced(p_student_id uuid, p_count integer DEFAULT 20)
 RETURNS TABLE(question jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_avg_accuracy NUMERIC;
    user_difficulty_mastery RECORD;
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    remedial_count INTEGER;
BEGIN
    -- Ensure user can only access their own data
    IF p_student_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only generate questions for own account';
    END IF;
    
    -- Validate input parameters
    IF p_count <= 0 OR p_count > 50 THEN
        RAISE EXCEPTION 'Invalid question count: must be between 1 and 50';
    END IF;
    
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
$function$;