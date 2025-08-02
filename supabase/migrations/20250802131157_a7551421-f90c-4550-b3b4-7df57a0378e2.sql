-- Create mock test sessions table
CREATE TABLE public.bootcamp_mock_test_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    session_type VARCHAR(20) DEFAULT 'mock_test',
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    total_questions INTEGER DEFAULT 50,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    time_limit_seconds INTEGER DEFAULT 3600, -- 60 minutes
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    session_data JSONB DEFAULT '{}', -- Store question order, answers, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.bootcamp_mock_test_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for mock test sessions
CREATE POLICY "Users can view their own mock test sessions" 
ON public.bootcamp_mock_test_sessions 
FOR SELECT 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their own mock test sessions" 
ON public.bootcamp_mock_test_sessions 
FOR INSERT 
WITH CHECK (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own mock test sessions" 
ON public.bootcamp_mock_test_sessions 
FOR UPDATE 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

-- Create mock test question assignments table
CREATE TABLE public.bootcamp_mock_test_questions (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES bootcamp_mock_test_sessions(session_id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    student_answer TEXT,
    is_correct BOOLEAN,
    time_taken_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE,
    misconception_detected TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.bootcamp_mock_test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for mock test questions
CREATE POLICY "Users can view their own mock test questions" 
ON public.bootcamp_mock_test_questions 
FOR SELECT 
USING (session_id IN (
    SELECT session_id FROM bootcamp_mock_test_sessions 
    WHERE student_id IN (
        SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Users can insert their own mock test questions" 
ON public.bootcamp_mock_test_questions 
FOR INSERT 
WITH CHECK (session_id IN (
    SELECT session_id FROM bootcamp_mock_test_sessions 
    WHERE student_id IN (
        SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Users can update their own mock test questions" 
ON public.bootcamp_mock_test_questions 
FOR UPDATE 
USING (session_id IN (
    SELECT session_id FROM bootcamp_mock_test_sessions 
    WHERE student_id IN (
        SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
    )
));

-- Create comprehensive test analysis view
CREATE OR REPLACE VIEW public.student_test_analysis AS
SELECT 
    bs.student_id,
    bs.username,
    bs.email,
    'practice' as test_type,
    bls.session_id::text as session_reference,
    bls.session_start as started_at,
    bls.session_end as completed_at,
    bls.questions_attempted,
    bls.questions_correct,
    CASE 
        WHEN bls.questions_attempted > 0 
        THEN ROUND((bls.questions_correct::DECIMAL / bls.questions_attempted) * 100, 2)
        ELSE 0 
    END as accuracy_percentage,
    EXTRACT(EPOCH FROM (bls.session_end - bls.session_start))::INTEGER as time_spent_seconds,
    bls.topics_covered,
    NULL as question_breakdown
FROM bootcamp_students bs
JOIN bootcamp_learning_sessions bls ON bs.student_id = bls.student_id
WHERE bls.session_end IS NOT NULL

UNION ALL

SELECT 
    bs.student_id,
    bs.username,
    bs.email,
    'mock_test' as test_type,
    bmts.session_id::text as session_reference,
    bmts.started_at,
    bmts.completed_at,
    bmts.questions_attempted,
    bmts.questions_correct,
    CASE 
        WHEN bmts.questions_attempted > 0 
        THEN ROUND((bmts.questions_correct::DECIMAL / bmts.questions_attempted) * 100, 2)
        ELSE 0 
    END as accuracy_percentage,
    bmts.time_spent_seconds,
    ARRAY[]::text[] as topics_covered,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'question_id', bmtq.question_id,
                'question_order', bmtq.question_order,
                'is_correct', bmtq.is_correct,
                'time_taken', bmtq.time_taken_seconds,
                'misconception', bmtq.misconception_detected
            )
        )
        FROM bootcamp_mock_test_questions bmtq 
        WHERE bmtq.session_id = bmts.session_id
    ) as question_breakdown
FROM bootcamp_students bs
JOIN bootcamp_mock_test_sessions bmts ON bs.student_id = bmts.student_id
WHERE bmts.status = 'completed';

-- Enable RLS on the view
ALTER VIEW public.student_test_analysis SET (security_barrier = true, security_invoker = true);

-- Create policy for the view
CREATE POLICY "Users can view their own test analysis" 
ON public.student_test_analysis 
FOR SELECT 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

-- Create function to generate adaptive mock test questions
CREATE OR REPLACE FUNCTION public.generate_mock_test_questions(
    p_student_id UUID,
    p_question_count INTEGER DEFAULT 50
)
RETURNS TABLE(
    question_data JSONB,
    topic_category TEXT,
    difficulty_level TEXT,
    priority_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_weak_areas_count INTEGER;
    v_balanced_count INTEGER;
    v_advanced_count INTEGER;
    v_review_count INTEGER;
BEGIN
    -- Calculate question distribution for comprehensive coverage
    v_weak_areas_count := GREATEST(1, FLOOR(p_question_count * 0.35)); -- 35% weak areas
    v_balanced_count := GREATEST(1, FLOOR(p_question_count * 0.30));   -- 30% balanced practice
    v_review_count := GREATEST(1, FLOOR(p_question_count * 0.20));     -- 20% spaced review
    v_advanced_count := p_question_count - v_weak_areas_count - v_balanced_count - v_review_count; -- 15% advanced

    RETURN QUERY
    -- Weak areas based on student performance (35%)
    (SELECT 
        to_jsonb(bq.*) as question_data,
        bt.name as topic_category,
        bq.difficulty::text as difficulty_level,
        1 as priority_score
     FROM bootcamp_questions bq
     JOIN bootcamp_topics bt ON bq.topic_id = bt.id
     WHERE bq.topic_id IN (
         SELECT bsp.topic_id 
         FROM bootcamp_student_progress bsp
         WHERE bsp.student_id = p_student_id 
         AND bsp.accuracy_percentage < 70
         ORDER BY bsp.accuracy_percentage ASC
         LIMIT 5
     )
     ORDER BY RANDOM()
     LIMIT v_weak_areas_count)

    UNION ALL

    -- Balanced practice across all topics (30%)
    (SELECT 
        to_jsonb(bq.*) as question_data,
        bt.name as topic_category,
        bq.difficulty::text as difficulty_level,
        2 as priority_score
     FROM bootcamp_questions bq
     JOIN bootcamp_topics bt ON bq.topic_id = bt.id
     WHERE bq.difficulty IN ('foundation', 'intermediate')
     AND bq.question_id NOT IN (
         SELECT bsr.question_id 
         FROM bootcamp_student_responses bsr 
         WHERE bsr.student_id = p_student_id 
         AND bsr.responded_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
     )
     ORDER BY RANDOM()
     LIMIT v_balanced_count)

    UNION ALL

    -- Spaced review from previously mastered areas (20%)
    (SELECT 
        to_jsonb(bq.*) as question_data,
        bt.name as topic_category,
        bq.difficulty::text as difficulty_level,
        3 as priority_score
     FROM bootcamp_questions bq
     JOIN bootcamp_topics bt ON bq.topic_id = bt.id
     WHERE bq.topic_id IN (
         SELECT bsp.topic_id 
         FROM bootcamp_student_progress bsp
         WHERE bsp.student_id = p_student_id 
         AND bsp.accuracy_percentage >= 80
         AND bsp.last_activity < CURRENT_TIMESTAMP - INTERVAL '5 days'
     )
     ORDER BY RANDOM()
     LIMIT v_review_count)

    UNION ALL

    -- Advanced challenge questions (15%)
    (SELECT 
        to_jsonb(bq.*) as question_data,
        bt.name as topic_category,
        bq.difficulty::text as difficulty_level,
        4 as priority_score
     FROM bootcamp_questions bq
     JOIN bootcamp_topics bt ON bq.topic_id = bt.id
     WHERE bq.difficulty = 'advanced'
     AND bq.question_id NOT IN (
         SELECT bsr.question_id 
         FROM bootcamp_student_responses bsr 
         WHERE bsr.student_id = p_student_id
     )
     ORDER BY RANDOM()
     LIMIT v_advanced_count);
END;
$$;

-- Create function to analyze red herrings across test types
CREATE OR REPLACE FUNCTION public.analyze_student_misconceptions_comprehensive(
    p_student_id UUID
)
RETURNS TABLE(
    misconception_code TEXT,
    frequency INTEGER,
    test_types TEXT[],
    topics_affected TEXT[],
    recent_occurrences INTEGER,
    trend_direction TEXT,
    severity_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH misconception_data AS (
        -- From bootcamp student responses
        SELECT 
            bsr.misconception_detected as misconception,
            'practice' as test_type,
            bq.topic_id as topic,
            bsr.responded_at
        FROM bootcamp_student_responses bsr
        JOIN bootcamp_questions bq ON bsr.question_id = bq.question_id
        WHERE bsr.student_id = p_student_id 
        AND bsr.misconception_detected IS NOT NULL
        
        UNION ALL
        
        -- From mock test responses
        SELECT 
            bmtq.misconception_detected as misconception,
            'mock_test' as test_type,
            bq.topic_id as topic,
            bmtq.answered_at as responded_at
        FROM bootcamp_mock_test_questions bmtq
        JOIN bootcamp_questions bq ON bmtq.question_id = bq.question_id
        WHERE bmtq.session_id IN (
            SELECT session_id FROM bootcamp_mock_test_sessions 
            WHERE student_id = p_student_id
        )
        AND bmtq.misconception_detected IS NOT NULL
    ),
    misconception_summary AS (
        SELECT 
            misconception,
            COUNT(*)::INTEGER as total_frequency,
            ARRAY_AGG(DISTINCT test_type) as test_types,
            ARRAY_AGG(DISTINCT topic) as topics,
            COUNT(CASE WHEN responded_at > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 1 END)::INTEGER as recent_count,
            COUNT(CASE WHEN responded_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END)::INTEGER as very_recent_count,
            COUNT(CASE WHEN responded_at < CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 1 END)::INTEGER as older_count
        FROM misconception_data
        GROUP BY misconception
    )
    SELECT 
        ms.misconception as misconception_code,
        ms.total_frequency as frequency,
        ms.test_types,
        ms.topics as topics_affected,
        ms.recent_count as recent_occurrences,
        CASE 
            WHEN ms.very_recent_count > ms.older_count THEN 'increasing'
            WHEN ms.very_recent_count < ms.older_count THEN 'decreasing'
            ELSE 'stable'
        END as trend_direction,
        CASE 
            WHEN ms.recent_count > 5 THEN 5
            WHEN ms.recent_count > 3 THEN 4
            WHEN ms.recent_count > 1 THEN 3
            WHEN ms.total_frequency > 3 THEN 2
            ELSE 1
        END as severity_score
    FROM misconception_summary ms
    ORDER BY ms.total_frequency DESC, ms.recent_count DESC;
END;
$$;

-- Create trigger to update mock test sessions
CREATE OR REPLACE FUNCTION public.update_mock_test_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bootcamp_mock_test_sessions
    SET 
        questions_attempted = (
            SELECT COUNT(*) FROM bootcamp_mock_test_questions 
            WHERE session_id = NEW.session_id AND student_answer IS NOT NULL
        ),
        questions_correct = (
            SELECT COUNT(*) FROM bootcamp_mock_test_questions 
            WHERE session_id = NEW.session_id AND is_correct = true
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mock_test_stats
    AFTER INSERT OR UPDATE ON bootcamp_mock_test_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_mock_test_session_stats();

-- Create indexes for performance
CREATE INDEX idx_mock_test_sessions_student_id ON bootcamp_mock_test_sessions(student_id);
CREATE INDEX idx_mock_test_sessions_status ON bootcamp_mock_test_sessions(status);
CREATE INDEX idx_mock_test_questions_session_id ON bootcamp_mock_test_questions(session_id);
CREATE INDEX idx_mock_test_questions_question_order ON bootcamp_mock_test_questions(session_id, question_order);