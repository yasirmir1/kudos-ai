-- Stored Procedures for Common Bootcamp Operations

-- Update Student Skill Proficiency based on recent performance
CREATE OR REPLACE FUNCTION bootcamp_update_student_skill_proficiency(
    p_student_id UUID,
    p_skill_name VARCHAR(50)
) RETURNS VOID AS $$
DECLARE
    v_correct INTEGER;
    v_attempted INTEGER;
    v_proficiency DECIMAL(3,2);
    v_avg_time INTEGER;
BEGIN
    -- Calculate proficiency based on recent performance (last 30 days)
    SELECT 
        SUM(CASE WHEN sr.is_correct THEN 1 ELSE 0 END),
        COUNT(*),
        ROUND(AVG(sr.time_taken_seconds))
    INTO v_correct, v_attempted, v_avg_time
    FROM bootcamp_enhanced_student_responses sr
    JOIN bootcamp_enhanced_questions q ON sr.question_id = q.question_id
    WHERE sr.student_id = p_student_id
    AND p_skill_name = ANY(q.prerequisite_skills)
    AND sr.responded_at > CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    IF v_attempted > 0 THEN
        v_proficiency := v_correct::DECIMAL / v_attempted;
        
        INSERT INTO bootcamp_enhanced_student_skills (
            student_id, skill_name, proficiency_level, 
            questions_attempted, questions_correct, average_time_seconds, last_assessed
        )
        VALUES (p_student_id, p_skill_name, v_proficiency, v_attempted, v_correct, v_avg_time, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, skill_name) 
        DO UPDATE SET 
            proficiency_level = v_proficiency,
            questions_attempted = bootcamp_enhanced_student_skills.questions_attempted + v_attempted,
            questions_correct = bootcamp_enhanced_student_skills.questions_correct + v_correct,
            average_time_seconds = v_avg_time,
            last_assessed = CURRENT_TIMESTAMP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Generate Adaptive Practice Set for a student
CREATE OR REPLACE FUNCTION bootcamp_generate_adaptive_practice_set(
    p_student_id UUID,
    p_question_count INTEGER DEFAULT 20
) RETURNS TABLE(question_id VARCHAR(20), reason TEXT, priority INTEGER) AS $$
DECLARE
    v_weak_topics_count INTEGER;
    v_current_topics_count INTEGER;
    v_review_count INTEGER;
    v_challenge_count INTEGER;
BEGIN
    -- Calculate distribution based on student's performance
    v_weak_topics_count := GREATEST(1, FLOOR(p_question_count * 0.3));
    v_current_topics_count := GREATEST(1, FLOOR(p_question_count * 0.4));
    v_review_count := GREATEST(1, FLOOR(p_question_count * 0.2));
    v_challenge_count := p_question_count - v_weak_topics_count - v_current_topics_count - v_review_count;
    
    RETURN QUERY
    -- Weak topics based on low accuracy (30%)
    (SELECT q.question_id, 'Targets weak topic - low accuracy detected' as reason, 1 as priority
     FROM bootcamp_enhanced_questions q
     JOIN bootcamp_enhanced_student_progress sp ON q.topic_id = sp.topic_id
     WHERE sp.student_id = p_student_id
     AND sp.accuracy_percentage < 70
     AND q.question_id NOT IN (
         SELECT question_id FROM bootcamp_enhanced_student_responses 
         WHERE student_id = p_student_id 
         AND is_correct 
         AND responded_at > CURRENT_TIMESTAMP - INTERVAL '3 days'
     )
     ORDER BY sp.accuracy_percentage ASC, RANDOM()
     LIMIT v_weak_topics_count)
    
    UNION ALL
    
    -- Current learning topics (40%)
    (SELECT q.question_id, 'Current topic practice' as reason, 2 as priority
     FROM bootcamp_enhanced_questions q
     JOIN bootcamp_enhanced_student_progress sp ON q.topic_id = sp.topic_id
     WHERE sp.student_id = p_student_id
     AND sp.status = 'in_progress'
     AND q.difficulty = CASE 
         WHEN sp.accuracy_percentage < 60 THEN 'foundation'
         WHEN sp.accuracy_percentage < 80 THEN 'intermediate'
         ELSE 'advanced'
     END
     ORDER BY RANDOM()
     LIMIT v_current_topics_count)
    
    UNION ALL
    
    -- Spaced review from mastered topics (20%)
    (SELECT q.question_id, 'Spaced review - maintaining mastery' as reason, 3 as priority
     FROM bootcamp_enhanced_questions q
     JOIN bootcamp_enhanced_student_progress sp ON q.topic_id = sp.topic_id
     WHERE sp.student_id = p_student_id
     AND sp.status = 'mastered'
     AND sp.last_activity < CURRENT_TIMESTAMP - INTERVAL '5 days'
     ORDER BY sp.last_activity ASC, RANDOM()
     LIMIT v_review_count)
    
    UNION ALL
    
    -- Challenge questions (10%)
    (SELECT q.question_id, 'Challenge extension' as reason, 4 as priority
     FROM bootcamp_enhanced_questions q
     WHERE q.difficulty = 'advanced'
     AND q.question_id NOT IN (
         SELECT question_id FROM bootcamp_enhanced_student_responses 
         WHERE student_id = p_student_id
     )
     ORDER BY RANDOM()
     LIMIT v_challenge_count);
END;
$$ LANGUAGE plpgsql;

-- Detect and Update Student Misconceptions
CREATE OR REPLACE FUNCTION bootcamp_update_student_misconceptions(
    p_student_id UUID,
    p_response_id UUID
) RETURNS VOID AS $$
DECLARE
    v_misconception_code VARCHAR(10);
    v_skill_name VARCHAR(50);
BEGIN
    -- Get the misconception from the latest response
    SELECT misconception_detected 
    INTO v_misconception_code
    FROM bootcamp_enhanced_student_responses
    WHERE response_id = p_response_id AND student_id = p_student_id;
    
    IF v_misconception_code IS NOT NULL THEN
        -- Update all relevant skills with this misconception
        FOR v_skill_name IN 
            SELECT DISTINCT unnest(prerequisite_skills) as skill
            FROM bootcamp_enhanced_questions q
            JOIN bootcamp_enhanced_student_responses sr ON q.question_id = sr.question_id
            WHERE sr.response_id = p_response_id
        LOOP
            -- Add misconception to active misconceptions if not already present
            UPDATE bootcamp_enhanced_student_skills
            SET active_misconceptions = 
                CASE 
                    WHEN v_misconception_code = ANY(active_misconceptions) THEN active_misconceptions
                    ELSE array_append(active_misconceptions, v_misconception_code)
                END,
                last_assessed = CURRENT_TIMESTAMP
            WHERE student_id = p_student_id AND skill_name = v_skill_name;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update Student Progress based on recent performance
CREATE OR REPLACE FUNCTION bootcamp_update_student_progress(
    p_student_id UUID,
    p_topic_id VARCHAR(10)
) RETURNS VOID AS $$
DECLARE
    v_correct INTEGER;
    v_attempted INTEGER;
    v_accuracy DECIMAL(5,2);
    v_avg_time DECIMAL(6,2);
    v_status VARCHAR(20);
BEGIN
    -- Calculate recent performance for this topic
    SELECT 
        SUM(CASE WHEN sr.is_correct THEN 1 ELSE 0 END),
        COUNT(*),
        ROUND(AVG(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) * 100, 2),
        ROUND(AVG(sr.time_taken_seconds), 2)
    INTO v_correct, v_attempted, v_accuracy, v_avg_time
    FROM bootcamp_enhanced_student_responses sr
    JOIN bootcamp_enhanced_questions q ON sr.question_id = q.question_id
    WHERE sr.student_id = p_student_id
    AND q.topic_id = p_topic_id
    AND sr.responded_at > CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    -- Determine status based on performance
    IF v_attempted = 0 THEN
        v_status := 'not_started';
    ELSIF v_accuracy >= 90 AND v_attempted >= 10 THEN
        v_status := 'mastered';
    ELSIF v_accuracy >= 70 THEN
        v_status := 'completed';
    ELSE
        v_status := 'in_progress';
    END IF;
    
    -- Update or insert progress record
    INSERT INTO bootcamp_enhanced_student_progress (
        student_id, topic_id, status, accuracy_percentage, 
        average_speed_seconds, last_activity, mastery_score
    )
    VALUES (
        p_student_id, p_topic_id, v_status, v_accuracy, 
        v_avg_time, CURRENT_TIMESTAMP, v_accuracy / 100.0
    )
    ON CONFLICT (student_id, topic_id)
    DO UPDATE SET
        status = v_status,
        accuracy_percentage = v_accuracy,
        average_speed_seconds = v_avg_time,
        last_activity = CURRENT_TIMESTAMP,
        mastery_score = v_accuracy / 100.0;
END;
$$ LANGUAGE plpgsql;