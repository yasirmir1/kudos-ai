-- Analytics Views for Performance Tracking

-- Student Performance Summary View
CREATE OR REPLACE VIEW bootcamp_student_performance_summary AS
SELECT 
    s.student_id,
    s.username,
    s.email,
    COUNT(DISTINCT sr.question_id) as total_questions_attempted,
    SUM(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) as total_correct,
    ROUND(AVG(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) * 100, 2) as overall_accuracy,
    ROUND(AVG(sr.time_taken_seconds), 1) as avg_response_time,
    COUNT(DISTINCT sr.misconception_detected) as unique_misconceptions,
    COUNT(DISTINCT DATE(sr.responded_at)) as active_days,
    MAX(sr.responded_at) as last_active
FROM bootcamp_students s
LEFT JOIN bootcamp_enhanced_student_responses sr ON s.student_id = sr.student_id
GROUP BY s.student_id, s.username, s.email;

-- Topic Difficulty Analysis View
CREATE OR REPLACE VIEW bootcamp_topic_difficulty_analysis AS
SELECT 
    t.topic_id,
    t.topic_name,
    q.difficulty,
    COUNT(DISTINCT q.question_id) as question_count,
    ROUND(AVG(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) * 100, 2) as success_rate,
    ROUND(AVG(sr.time_taken_seconds), 1) as avg_time,
    COUNT(DISTINCT sr.student_id) as students_attempted
FROM bootcamp_enhanced_topics t
JOIN bootcamp_enhanced_questions q ON t.topic_id = q.topic_id
LEFT JOIN bootcamp_enhanced_student_responses sr ON q.question_id = sr.question_id
GROUP BY t.topic_id, t.topic_name, q.difficulty;

-- Misconception Frequency Analysis View
CREATE OR REPLACE VIEW bootcamp_misconception_frequency AS
SELECT 
    m.misconception_code,
    m.misconception_type,
    m.description,
    COUNT(DISTINCT sr.student_id) as affected_students,
    COUNT(sr.response_id) as total_occurrences,
    ROUND(AVG(CASE WHEN sr2.is_correct THEN 1 ELSE 0 END) * 100, 2) as remediation_success_rate
FROM bootcamp_enhanced_misconceptions m
JOIN bootcamp_enhanced_student_responses sr ON m.misconception_code = sr.misconception_detected
LEFT JOIN bootcamp_enhanced_student_responses sr2 ON sr.student_id = sr2.student_id 
    AND sr.question_id = sr2.question_id 
    AND sr2.attempt_number > sr.attempt_number
GROUP BY m.misconception_code, m.misconception_type, m.description
ORDER BY total_occurrences DESC;

-- Student Skills Proficiency View
CREATE OR REPLACE VIEW bootcamp_student_skills_proficiency AS
SELECT 
    s.student_id,
    s.username,
    sk.skill_name,
    sk.skill_category,
    sk.proficiency_level,
    sk.questions_attempted,
    sk.questions_correct,
    ROUND((sk.questions_correct::DECIMAL / NULLIF(sk.questions_attempted, 0)) * 100, 2) as accuracy_percentage,
    sk.average_time_seconds,
    sk.last_assessed,
    array_length(sk.active_misconceptions, 1) as active_misconception_count
FROM bootcamp_students s
JOIN bootcamp_enhanced_student_skills sk ON s.student_id = sk.student_id;

-- Daily Activity Summary View
CREATE OR REPLACE VIEW bootcamp_daily_activity_summary AS
SELECT 
    DATE(sr.responded_at) as activity_date,
    COUNT(DISTINCT sr.student_id) as active_students,
    COUNT(sr.response_id) as total_responses,
    SUM(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) as correct_responses,
    ROUND(AVG(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) * 100, 2) as daily_accuracy,
    ROUND(AVG(sr.time_taken_seconds), 1) as avg_response_time,
    COUNT(DISTINCT sr.question_id) as unique_questions_attempted
FROM bootcamp_enhanced_student_responses sr
WHERE sr.responded_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(sr.responded_at)
ORDER BY activity_date DESC;