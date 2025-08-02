-- Insert Ratio and Proportion curriculum topics and content

-- Insert topics
INSERT INTO bootcamp_curriculum_topics (id, topic_name, topic_order, difficulty, estimated_duration_minutes, learning_objectives) VALUES
('rp1', 'Understanding Ratio', 1, 'foundation', 45, ARRAY['Understand ratio notation', 'Compare quantities using ratios', 'Identify part-to-part and part-to-whole ratios']),
('rp2', 'Simplifying Ratios', 2, 'foundation', 45, ARRAY['Simplify ratios to lowest terms', 'Find equivalent ratios', 'Work with ratios involving units']),
('rp3', 'Sharing in Ratios', 3, 'intermediate', 45, ARRAY['Divide quantities according to ratios', 'Calculate proportional shares', 'Solve ratio sharing problems']),
('rp4', 'Direct Proportion', 4, 'intermediate', 45, ARRAY['Understand direct proportion', 'Scale quantities proportionally', 'Solve proportion problems'])
ON CONFLICT (id) DO NOTHING;

-- Insert content for rp1 - Understanding Ratio
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('rp1', 'concept_introduction', 1, 'Introduction to Ratios', 'Learn what ratios represent', '{"introduction": "Ratios compare quantities showing how many parts of one thing relate to parts of another.", "key_concepts": ["Ratio notation", "Comparing quantities", "Part to part ratios", "Part to whole ratios"], "example": "A ratio of 2:3 means 2 parts of one thing for every 3 parts of another."}', 10),
('rp1', 'guided_practice', 1, 'Guided Ratio Practice', 'Practice writing and identifying ratios', '{"exercises": ["Write ratio for 4 apples to 6 oranges", "Identify part to part and part to whole ratios", "Find equivalent ratios for 1:2"], "instructions": "Work through ratio identification step by step"}', 15),
('rp1', 'independent_practice', 1, 'Independent Ratio Work', 'Apply ratio knowledge independently', '{"exercises": ["Write the ratio for 5 boys to 10 girls", "Find two equivalent ratios for 3:5", "Identify ratio parts in a picture"], "instructions": "Complete these ratio problems on your own"}', 15),
('rp1', 'assessment', 1, 'Ratio Understanding Assessment', 'Test your ratio knowledge', '{"instructions": "Answer these questions about ratios", "scoring": "Each question worth equal points"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for rp2 - Simplifying Ratios
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('rp2', 'concept_introduction', 1, 'Simplifying Ratios Explained', 'Learn how to simplify ratios', '{"introduction": "Simplifying ratios means making them easier by dividing both parts by the same number.", "key_concepts": ["Finding common factors", "Dividing both parts equally", "Equivalent ratios", "Working with units"], "example": "6:9 simplifies to 2:3 by dividing both by 3."}', 10),
('rp2', 'guided_practice', 1, 'Guided Ratio Simplification', 'Practice simplifying ratios', '{"exercises": ["Simplify 10:15", "Simplify 18:24", "Simplify ratios with units like 20cm:50cm"], "instructions": "Work through ratio simplification step by step"}', 15),
('rp2', 'independent_practice', 1, 'Independent Ratio Simplification', 'Apply simplification skills', '{"exercises": ["Simplify 14:21", "Simplify 35:50", "Simplify 45kg:60kg"], "instructions": "Complete these simplification problems"}', 15),
('rp2', 'assessment', 1, 'Ratio Simplification Assessment', 'Test simplification mastery', '{"instructions": "Simplify these ratios to lowest terms", "scoring": "Show your working"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for rp3 - Sharing in Ratios
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('rp3', 'concept_introduction', 1, 'Sharing in Ratios', 'Learn to divide quantities by ratios', '{"introduction": "Sharing in ratio means dividing a quantity into parts based on a ratio.", "key_concepts": ["Finding total parts", "Calculating proportional shares", "Dividing quantities", "Ratio sharing method"], "example": "Share 30 sweets in ratio 2:3 → parts are 2+3=5, so 2/5 × 30=12 sweets, 3/5 × 30=18 sweets."}', 10),
('rp3', 'guided_practice', 1, 'Guided Ratio Sharing', 'Practice sharing in ratios', '{"exercises": ["Share 40 apples in ratio 1:1", "Share 50 pounds in ratio 3:2", "Find parts when total is 45 and ratio is 4:5"], "instructions": "Work through ratio sharing step by step"}', 15),
('rp3', 'independent_practice', 1, 'Independent Ratio Sharing', 'Apply ratio sharing skills', '{"exercises": ["Share 60 books in ratio 2:4", "Divide 90cm in ratio 5:4", "Share 72 sweets in ratio 3:5"], "instructions": "Complete these sharing problems"}', 15),
('rp3', 'assessment', 1, 'Ratio Sharing Assessment', 'Test ratio sharing mastery', '{"instructions": "Solve these ratio sharing problems", "scoring": "Show calculation steps"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for rp4 - Direct Proportion
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('rp4', 'concept_introduction', 1, 'Direct Proportion', 'Understand proportional relationships', '{"introduction": "Direct proportion means when one quantity increases, the other increases at the same rate.", "key_concepts": ["Proportional relationships", "Scaling quantities", "Unit rates", "Proportion calculations"], "example": "If 2 pens cost £4, then 4 pens cost £8."}', 10),
('rp4', 'guided_practice', 1, 'Guided Proportion Practice', 'Practice with direct proportion', '{"exercises": ["Scale recipe for 2 servings to 6 servings", "Calculate distance if speed doubles", "Use map scale to find real distances"], "instructions": "Work through proportion problems step by step"}', 15),
('rp4', 'independent_practice', 1, 'Independent Proportion Work', 'Apply proportion skills', '{"exercises": ["If 3 apples cost £1.50, find cost for 7 apples", "Scale up a recipe from 4 to 10 people", "Calculate time if speed and distance are given"], "instructions": "Complete these proportion problems"}', 15),
('rp4', 'assessment', 1, 'Direct Proportion Assessment', 'Test proportion understanding', '{"instructions": "Solve these proportion problems", "scoring": "Show working and units"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert assessment questions for all topics
-- rp1 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is the ratio of 8 to 12 in simplest form?', 'multiple_choice', 1, '["2:3", "4:6", "3:4", "8:12"]'::jsonb, '2:3', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp1' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Write the ratio for 9 red balls and 6 blue balls.', 'written_answer', 2, '[]'::jsonb, '9:6 or 3:2', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp1' AND cc.stage_type = 'assessment';

-- rp2 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Simplify 16:24.', 'numeric_entry', 1, '[]'::jsonb, '2:3', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp2' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Simplify 30cm:45cm.', 'written_answer', 2, '[]'::jsonb, '2:3', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp2' AND cc.stage_type = 'assessment';

-- rp3 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Share 80 in ratio 3:1.', 'numeric_entry', 1, '[]'::jsonb, '60 and 20', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp3' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'If total is 36 and ratio is 2:3, what is each part?', 'written_answer', 2, '[]'::jsonb, '14.4 and 21.6', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp3' AND cc.stage_type = 'assessment';

-- rp4 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'If 5 pencils cost £3, what is cost of 8 pencils?', 'numeric_entry', 1, '[]'::jsonb, '4.80', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp4' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Map scale shows 1cm = 5km. Find distance for 7cm.', 'numeric_entry', 2, '[]'::jsonb, '35', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'rp4' AND cc.stage_type = 'assessment';