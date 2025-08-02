-- Fix the adaptive questions function to work properly
DROP FUNCTION IF EXISTS public.get_adaptive_questions_enhanced(uuid, integer);

CREATE OR REPLACE FUNCTION public.get_adaptive_questions_enhanced(p_student_id uuid, p_count integer DEFAULT 20)
RETURNS TABLE(question jsonb)
LANGUAGE plpgsql
AS $function$
DECLARE
    user_avg_accuracy NUMERIC;
    user_age_group age_group;
    weak_topics_count INTEGER;
    review_count INTEGER;
    new_count INTEGER;
    mastery_count INTEGER;
BEGIN
    -- Get user's age group
    SELECT sp.age_group INTO user_age_group
    FROM student_profiles sp
    WHERE sp.id = p_student_id;
    
    -- If no age group found, default to year 4-5
    user_age_group := COALESCE(user_age_group, 'year 4-5');
    
    -- Calculate user's overall accuracy for their age group
    SELECT AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) INTO user_avg_accuracy
    FROM student_answers sa
    WHERE sa.student_id = p_student_id 
        AND sa.age_group = user_age_group;
    
    -- Set default accuracy for new users
    user_avg_accuracy := COALESCE(user_avg_accuracy, 0.5);
    
    -- Adaptive distribution based on performance
    IF user_avg_accuracy >= 0.8 THEN
        -- High performer: Focus on new challenges and mastery
        weak_topics_count := GREATEST(1, FLOOR(p_count * 0.15)::INTEGER);
        review_count := GREATEST(1, FLOOR(p_count * 0.25)::INTEGER);
        new_count := GREATEST(1, FLOOR(p_count * 0.35)::INTEGER);
        mastery_count := GREATEST(1, p_count - weak_topics_count - review_count - new_count);
    ELSIF user_avg_accuracy >= 0.6 THEN
        -- Average performer: Balanced approach
        weak_topics_count := GREATEST(1, FLOOR(p_count * 0.3)::INTEGER);
        review_count := GREATEST(1, FLOOR(p_count * 0.3)::INTEGER);
        new_count := GREATEST(1, FLOOR(p_count * 0.25)::INTEGER);
        mastery_count := GREATEST(1, p_count - weak_topics_count - review_count - new_count);
    ELSE
        -- Struggling performer: Focus on weak areas and review
        weak_topics_count := GREATEST(1, FLOOR(p_count * 0.4)::INTEGER);
        review_count := GREATEST(1, FLOOR(p_count * 0.3)::INTEGER);
        new_count := GREATEST(1, FLOOR(p_count * 0.2)::INTEGER);
        mastery_count := GREATEST(1, p_count - weak_topics_count - review_count - new_count);
    END IF;
    
    RETURN QUERY
    WITH 
    -- Weak topics based on accuracy for current age group
    weak_topics AS (
        SELECT sp.topic, sp.accuracy 
        FROM student_performance sp
        WHERE sp.student_id = p_student_id 
            AND sp.accuracy < 0.7
            AND sp.total_attempts >= 3
        ORDER BY sp.accuracy ASC
        LIMIT 10
    ),
    -- Questions for weak topics - prioritize different subtopics
    weak_topic_questions AS (
        SELECT DISTINCT ON (c.subtopic) to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN weak_topics wt ON c.topic = wt.topic
        WHERE c.age_group = user_age_group
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa
                WHERE sa.student_id = p_student_id 
                    AND sa.answered_at > NOW() - INTERVAL '2 days'
                    AND sa.age_group = user_age_group
            )
        ORDER BY c.subtopic, c.difficulty ASC, RANDOM()
        LIMIT weak_topics_count
    ),
    -- Spaced repetition - questions answered correctly 3-7 days ago
    review_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        INNER JOIN student_answers sa ON c.question_id = sa.question_id
        WHERE sa.student_id = p_student_id
            AND sa.is_correct = true
            AND sa.answered_at BETWEEN NOW() - INTERVAL '7 days' AND NOW() - INTERVAL '3 days'
            AND sa.age_group = user_age_group
            AND c.age_group = user_age_group
        ORDER BY sa.answered_at ASC, RANDOM()
        LIMIT review_count
    ),
    -- New material - prioritize different subtopics for comprehensive coverage
    new_questions AS (
        SELECT DISTINCT ON (c.subtopic) to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.age_group = user_age_group
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa 
                WHERE sa.student_id = p_student_id
                    AND sa.age_group = user_age_group
            )
        ORDER BY c.subtopic, c.difficulty ASC, RANDOM()
        LIMIT new_count
    ),
    -- Mastery challenges - harder questions from strong topics
    mastery_questions AS (
        SELECT to_jsonb(c.*) as question
        FROM curriculum c
        WHERE c.age_group = user_age_group
            AND c.difficulty IN ('Medium', 'Hard')
            AND c.topic IN (
                SELECT sp.topic FROM student_performance sp
                WHERE sp.student_id = p_student_id 
                    AND sp.accuracy >= 0.8
                    AND sp.total_attempts >= 3
            )
            AND c.question_id NOT IN (
                SELECT sa.question_id FROM student_answers sa 
                WHERE sa.student_id = p_student_id
                    AND sa.age_group = user_age_group
            )
        ORDER BY c.difficulty DESC, RANDOM()
        LIMIT mastery_count
    )
    -- Combine all question types
    SELECT question FROM weak_topic_questions
    UNION ALL
    SELECT question FROM review_questions
    UNION ALL
    SELECT question FROM new_questions
    UNION ALL
    SELECT question FROM mastery_questions;
END;
$function$;