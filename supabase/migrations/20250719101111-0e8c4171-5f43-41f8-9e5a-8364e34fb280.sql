-- Fix the get_adaptive_questions function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.get_adaptive_questions(p_student_id uuid, p_count integer DEFAULT 10)
 RETURNS TABLE(question jsonb)
 LANGUAGE plpgsql
AS $function$
DECLARE
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    confidence_count INTEGER;
BEGIN
    -- Calculate distribution
    weak_topics_count := GREATEST(1, p_count * 0.4);
    review_count := GREATEST(1, p_count * 0.3);
    new_count := GREATEST(1, p_count * 0.2);
    confidence_count := p_count - weak_topics_count - review_count - new_count;
    
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
        LIMIT weak_topics_count
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
        LIMIT review_count
    ),
    -- New material (20%)
    new_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.question_id NOT IN (
            SELECT sa.question_id FROM student_answers sa WHERE sa.student_id = p_student_id
        )
        AND c.difficulty IN ('Easy', 'Medium')
        ORDER BY RANDOM()
        LIMIT new_count
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
        LIMIT confidence_count
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