-- First, create the exam_skills module
INSERT INTO bootcamp_modules (
    id, name, module_order, curriculum_id, weeks
) VALUES (
    'exam_skills', 'Exam Skills', 5, '11plus-maths-2024', ARRAY[49, 50, 51, 52]::integer[]
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    module_order = EXCLUDED.module_order,
    curriculum_id = EXCLUDED.curriculum_id,
    weeks = EXCLUDED.weeks;

-- Insert Exam Skills topics into bootcamp_curriculum_topics
INSERT INTO bootcamp_curriculum_topics (
    id, topic_name, module_id, topic_order, difficulty, 
    prerequisites, learning_objectives, estimated_duration_minutes
) VALUES 
('ex1', 'Time Management', 'exam_skills', 1, 'foundation', 
 ARRAY[]::text[], 
 ARRAY['Learn to allocate time effectively during exams', 'Develop strategies for pacing', 'Practice time-aware exam techniques']::text[], 
 30),
('ex2', 'Common Mistakes', 'exam_skills', 2, 'foundation', 
 ARRAY['ex1']::text[], 
 ARRAY['Identify typical exam errors', 'Develop checking strategies', 'Build careful calculation habits']::text[], 
 25),
('ex3', 'Mental Strategies', 'exam_skills', 3, 'intermediate', 
 ARRAY['ex1', 'ex2']::text[], 
 ARRAY['Master quick mental calculation techniques', 'Use estimation effectively', 'Apply number patterns and shortcuts']::text[], 
 35),
('ex4', 'Mock Exams', 'exam_skills', 4, 'advanced', 
 ARRAY['ex1', 'ex2', 'ex3']::text[], 
 ARRAY['Practice under exam conditions', 'Build exam stamina and confidence', 'Apply all learned techniques']::text[], 
 60)
ON CONFLICT (id) DO UPDATE SET
    topic_name = EXCLUDED.topic_name,
    module_id = EXCLUDED.module_id,
    topic_order = EXCLUDED.topic_order,
    difficulty = EXCLUDED.difficulty,
    prerequisites = EXCLUDED.prerequisites,
    learning_objectives = EXCLUDED.learning_objectives,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes;

-- Insert curriculum content for Time Management (ex1)
INSERT INTO bootcamp_curriculum_content (
    topic_id, title, description, stage_type, stage_order, content, estimated_time_minutes
) VALUES 
('ex1', 'Introduction to Time Management', 'Understanding time allocation in exams', 'concept_introduction', 1, 
 '{"text": "Time management helps you use your exam time wisely so you can answer as many questions as possible.", "example": "If you have 60 minutes and 30 questions, aim for about 2 minutes per question."}', 5),
('ex1', 'Guided Practice', 'Essential time management strategies', 'guided_practice', 2,
 '{"strategies": ["Prioritize easier questions first", "Keep track of time during the exam", "Move on if stuck on a question", "Leave time at the end for checking"]}', 8),
('ex1', 'Independent Practice', 'Self-directed time management exercises', 'independent_practice', 3,
 '{"activities": ["Practice timing yourself on sample papers", "Try different strategies for question order", "Set mini-timers for sections", "Reflect on what worked best"]}', 10),
('ex1', 'Assessment', 'Time management assessment questions', 'assessment', 4,
 '{"questions": [{"question": "If you have 90 minutes for 45 questions, how much time should you spend per question?", "type": "numeric_entry"}, {"question": "Which strategy helps save time during an exam?", "type": "multiple_choice", "options": ["Spend equal time on every question", "Answer easy questions first", "Skip all hard questions", "Write long answers for all questions"]}]}', 5)
ON CONFLICT (topic_id, stage_type, stage_order) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes;

-- Insert curriculum content for Common Mistakes (ex2)
INSERT INTO bootcamp_curriculum_content (
    topic_id, title, description, stage_type, stage_order, content, estimated_time_minutes
) VALUES 
('ex2', 'Understanding Common Mistakes', 'Learning about typical exam errors', 'concept_introduction', 1,
 '{"text": "Knowing common mistakes helps you avoid losing marks unnecessarily.", "example": "Check units and signs carefully to avoid errors."}', 4),
('ex2', 'Guided Practice', 'Error prevention strategies', 'guided_practice', 2,
 '{"strategies": ["Double-check calculations", "Read questions carefully", "Watch for common traps like unit conversions", "Review answers before submitting"]}', 8),
('ex2', 'Independent Practice', 'Error identification exercises', 'independent_practice', 3,
 '{"activities": ["Identify mistakes in sample questions", "Practice careful reading of problems", "Check units in answers", "Use checklists for common errors"]}', 10),
('ex2', 'Assessment', 'Common mistakes assessment questions', 'assessment', 4,
 '{"questions": [{"question": "What is a common mistake when adding decimals?", "type": "multiple_choice", "options": ["Adding digits in the wrong place", "Rounding too early", "Not lining up decimal points", "All of the above"]}, {"question": "Why is it important to check units in answers?", "type": "written_answer"}]}', 5)
ON CONFLICT (topic_id, stage_type, stage_order) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes;

-- Insert curriculum content for Mental Strategies (ex3)
INSERT INTO bootcamp_curriculum_content (
    topic_id, title, description, stage_type, stage_order, content, estimated_time_minutes
) VALUES 
('ex3', 'Introduction to Mental Strategies', 'Learning quick calculation techniques', 'concept_introduction', 1,
 '{"text": "Mental strategies help you calculate quickly without writing everything down.", "example": "Use number bonds to add numbers fast, like 7 + 3 = 10."}', 5),
('ex3', 'Guided Practice', 'Essential mental math strategies', 'guided_practice', 2,
 '{"strategies": ["Practice estimation", "Use number bonds and doubles", "Break down tricky problems", "Recognize patterns for shortcuts"]}', 10),
('ex3', 'Independent Practice', 'Mental calculation exercises', 'independent_practice', 3,
 '{"activities": ["Practice mental addition and subtraction", "Use estimation to check answers", "Try quick multiplication tricks", "Solve pattern-based questions mentally"]}', 12),
('ex3', 'Assessment', 'Mental strategies assessment questions', 'assessment', 4,
 '{"questions": [{"question": "Estimate 498 + 302 quickly.", "type": "numeric_entry"}, {"question": "Which strategy helps in quick calculation?", "type": "multiple_choice", "options": ["Writing all steps", "Using doubles", "Guessing", "Ignoring place value"]}]}', 5)
ON CONFLICT (topic_id, stage_type, stage_order) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes;

-- Insert curriculum content for Mock Exams (ex4)
INSERT INTO bootcamp_curriculum_content (
    topic_id, title, description, stage_type, stage_order, content, estimated_time_minutes
) VALUES 
('ex4', 'Introduction to Mock Exams', 'Understanding exam practice benefits', 'concept_introduction', 1,
 '{"text": "Mock exams help you practice exam skills, build stamina, and identify areas to improve.", "example": "Try a full GL style paper under timed conditions."}', 5),
('ex4', 'Guided Practice', 'Mock exam strategies', 'guided_practice', 2,
 '{"strategies": ["Simulate exam conditions at home", "Use past papers from different boards", "Review your answers and learn from mistakes", "Build exam confidence"]}', 15),
('ex4', 'Independent Practice', 'Practice exam activities', 'independent_practice', 3,
 '{"activities": ["Take a timed CEM practice paper", "Review ISEB style questions", "Mix question types from different boards", "Create your own exam timeline"]}', 25),
('ex4', 'Assessment', 'Mock exam readiness assessment', 'assessment', 4,
 '{"questions": [{"question": "What is the main benefit of taking mock exams?", "type": "multiple_choice", "options": ["Getting good grades", "Building stamina and confidence", "Finishing quickly", "Memorizing answers"]}, {"question": "How should you simulate exam conditions at home?", "type": "written_answer"}]}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes;