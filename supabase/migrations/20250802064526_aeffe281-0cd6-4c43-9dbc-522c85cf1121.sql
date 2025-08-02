-- Insert Arithmetic Operations curriculum topics and content

-- Insert topics
INSERT INTO bootcamp_curriculum_topics (id, topic_name, topic_order, difficulty, estimated_duration_minutes, learning_objectives) VALUES
('ao1', 'Mental Addition and Subtraction', 1, 'foundation', 45, ARRAY['Learn quick mental calculation strategies', 'Master adding multiples of 10, 100, 1000', 'Use near doubles and compensation techniques']),
('ao2', 'Column Addition', 2, 'foundation', 45, ARRAY['Understand column addition method', 'Add multi-digit numbers accurately', 'Add decimal numbers using column method']),
('ao3', 'Column Subtraction', 3, 'foundation', 45, ARRAY['Master column subtraction with borrowing', 'Subtract multi-digit numbers', 'Subtract decimal numbers accurately']),
('ao4', 'Multiplication Tables', 4, 'foundation', 45, ARRAY['Memorize multiplication tables 2-12', 'Understand square numbers', 'Know related division facts']),
('ao5', 'Short Multiplication', 5, 'intermediate', 45, ARRAY['Multiply using short multiplication', 'Multiply by 10, 100, 1000', 'Multiply decimal numbers']),
('ao6', 'Long Multiplication', 6, 'intermediate', 45, ARRAY['Use grid and column methods', 'Multiply multi-digit numbers', 'Apply different multiplication strategies']),
('ao7', 'Division Methods', 7, 'intermediate', 45, ARRAY['Learn short and long division', 'Handle division with remainders', 'Divide decimal numbers']),
('ao8', 'Order of Operations', 8, 'advanced', 45, ARRAY['Understand BODMAS rules', 'Calculate expressions correctly', 'Work with brackets and operations'])
ON CONFLICT (id) DO NOTHING;

-- Insert content for ao1 - Mental Addition and Subtraction
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao1', 'concept_introduction', 1, 'Mental Addition and Subtraction Strategies', 'Learn quick mental calculation methods', '{"introduction": "Learn quick ways to add and subtract numbers mentally using strategies like adding multiples of 10, 100, or 1000, near doubles, and compensation.", "key_concepts": ["Adding multiples of 10, 100, 1000", "Near doubles strategy", "Compensation method", "Mental calculation shortcuts"], "example": "To add 47 + 50, think 47 + 40 + 10 = 97."}', 10),
('ao1', 'guided_practice', 1, 'Guided Mental Calculation', 'Practice with step-by-step guidance', '{"exercises": ["Add 60 + 30 mentally", "Subtract 90 - 40 mentally", "Use compensation to calculate 49 + 26"], "instructions": "Work through these mental calculations step by step"}', 15),
('ao1', 'independent_practice', 1, 'Independent Mental Practice', 'Apply mental strategies independently', '{"exercises": ["Add 120 + 300 mentally", "Subtract 500 - 270 mentally", "Try near doubles: 48 + 49"], "instructions": "Use mental strategies to solve these problems"}', 15),
('ao1', 'assessment', 1, 'Mental Calculation Assessment', 'Test your mental calculation skills', '{"instructions": "Solve these problems using mental strategies", "scoring": "Each question worth equal points"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao2 - Column Addition
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao2', 'concept_introduction', 1, 'Column Addition Method', 'Learn the formal column addition algorithm', '{"introduction": "Understand the written method of column addition for adding numbers of multiple digits, including decimals.", "key_concepts": ["Aligning digits by place value", "Carrying over", "Adding decimal numbers", "Multi-digit addition"], "example": "Add 345 + 478 using column addition by aligning digits by place value and carrying over."}', 10),
('ao2', 'guided_practice', 1, 'Guided Column Addition', 'Practice column addition with support', '{"exercises": ["Add 234 + 567 using column addition", "Add 1,234 + 4,567", "Add 12.5 + 4.8"], "instructions": "Work through column addition step by step"}', 15),
('ao2', 'independent_practice', 1, 'Independent Column Addition', 'Apply column addition independently', '{"exercises": ["Add 3,456 + 7,654", "Add 23.75 + 46.28", "Add 12,345 + 67,890"], "instructions": "Complete these column addition problems"}', 15),
('ao2', 'assessment', 1, 'Column Addition Assessment', 'Demonstrate column addition mastery', '{"instructions": "Solve using column addition method", "scoring": "Show your working"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao3 - Column Subtraction
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao3', 'concept_introduction', 1, 'Column Subtraction with Borrowing', 'Master subtraction with regrouping', '{"introduction": "Learn column subtraction with borrowing (regrouping) for subtracting multi-digit numbers and decimals.", "key_concepts": ["Borrowing/regrouping", "Column subtraction method", "Decimal subtraction", "Multi-digit subtraction"], "example": "Subtract 652 - 479 using column subtraction with borrowing."}', 10),
('ao3', 'guided_practice', 1, 'Guided Column Subtraction', 'Practice subtraction with support', '{"exercises": ["Subtract 843 - 576", "Subtract 2,340 - 1,789", "Subtract 12.5 - 7.8"], "instructions": "Work through borrowing step by step"}', 15),
('ao3', 'independent_practice', 1, 'Independent Column Subtraction', 'Apply subtraction skills independently', '{"exercises": ["Subtract 9,654 - 4,789", "Subtract 56.78 - 23.45", "Subtract 25,000 - 12,678"], "instructions": "Complete these subtraction problems"}', 15),
('ao3', 'assessment', 1, 'Column Subtraction Assessment', 'Test subtraction mastery', '{"instructions": "Solve using column subtraction", "scoring": "Show borrowing clearly"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao4 - Multiplication Tables
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao4', 'concept_introduction', 1, 'Multiplication Tables Mastery', 'Learn and memorize times tables', '{"introduction": "Memorize and recall multiplication tables from 2 to 12 quickly, understand square numbers from tables, and related division facts.", "key_concepts": ["Times tables 2-12", "Square numbers", "Related division facts", "Quick recall"], "example": "7 × 8 = 56, so 56 ÷ 8 = 7"}', 10),
('ao4', 'guided_practice', 1, 'Guided Times Tables Practice', 'Practice multiplication facts', '{"exercises": ["Recite 3 times table", "Write division facts for 4 times table", "Find square numbers from 1 to 12"], "instructions": "Practice recall and related facts"}', 15),
('ao4', 'independent_practice', 1, 'Independent Times Tables', 'Test your multiplication knowledge', '{"exercises": ["Write out 9 times table", "Quiz yourself on division facts from 6 times table", "Identify square numbers up to 144"], "instructions": "Complete without looking at answers"}', 15),
('ao4', 'assessment', 1, 'Multiplication Tables Assessment', 'Demonstrate times tables mastery', '{"instructions": "Answer quickly and accurately", "scoring": "Speed and accuracy both count"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao5 - Short Multiplication
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao5', 'concept_introduction', 1, 'Short Multiplication Method', 'Learn efficient multiplication techniques', '{"introduction": "Multiply numbers using short multiplication, including multiplying by 10, 100, 1000, and decimals.", "key_concepts": ["Short multiplication algorithm", "Multiplying by powers of 10", "Decimal multiplication", "Carrying in multiplication"], "example": "23 × 4 = 92 using short multiplication."}', 10),
('ao5', 'guided_practice', 1, 'Guided Short Multiplication', 'Practice with guidance', '{"exercises": ["Multiply 24 × 6", "Multiply 123 × 4", "Multiply 12.5 × 10"], "instructions": "Use short multiplication method"}', 15),
('ao5', 'independent_practice', 1, 'Independent Short Multiplication', 'Apply skills independently', '{"exercises": ["Multiply 35 × 7", "Multiply 456 × 8", "Multiply 4.6 × 100"], "instructions": "Complete these multiplication problems"}', 15),
('ao5', 'assessment', 1, 'Short Multiplication Assessment', 'Test multiplication skills', '{"instructions": "Use short multiplication method", "scoring": "Show your working clearly"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao6 - Long Multiplication
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao6', 'concept_introduction', 1, 'Long Multiplication Methods', 'Master complex multiplication', '{"introduction": "Use long multiplication methods like grid and column method to multiply multi-digit numbers.", "key_concepts": ["Grid method", "Column method", "Multi-digit multiplication", "Partial products"], "example": "Multiply 34 × 23 using the grid method."}', 10),
('ao6', 'guided_practice', 1, 'Guided Long Multiplication', 'Practice different methods', '{"exercises": ["Multiply 23 × 45 using grid method", "Multiply 134 × 27 using column method"], "instructions": "Try both grid and column methods"}', 15),
('ao6', 'independent_practice', 1, 'Independent Long Multiplication', 'Choose your preferred method', '{"exercises": ["Multiply 56 × 89", "Multiply 234 × 67"], "instructions": "Use your preferred long multiplication method"}', 15),
('ao6', 'assessment', 1, 'Long Multiplication Assessment', 'Demonstrate multiplication mastery', '{"instructions": "Use any long multiplication method", "scoring": "Method and accuracy both assessed"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao7 - Division Methods
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao7', 'concept_introduction', 1, 'Division Methods and Techniques', 'Master various division approaches', '{"introduction": "Learn short division, long division, division with remainders, and decimal division.", "key_concepts": ["Short division", "Long division", "Remainders", "Decimal division"], "example": "Divide 84 by 4 using short division."}', 10),
('ao7', 'guided_practice', 1, 'Guided Division Practice', 'Practice division methods', '{"exercises": ["Divide 96 ÷ 3", "Divide 256 ÷ 8 using long division", "Divide 25 ÷ 4 and write remainder"], "instructions": "Choose appropriate division method"}', 15),
('ao7', 'independent_practice', 1, 'Independent Division Practice', 'Apply division skills', '{"exercises": ["Divide 432 ÷ 6", "Divide 900 ÷ 9", "Divide 50 ÷ 8 with remainder"], "instructions": "Show remainders where applicable"}', 15),
('ao7', 'assessment', 1, 'Division Methods Assessment', 'Test division mastery', '{"instructions": "Use appropriate division method", "scoring": "Show working and handle remainders correctly"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for ao8 - Order of Operations
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('ao8', 'concept_introduction', 1, 'BODMAS Order of Operations', 'Master calculation order rules', '{"introduction": "Understand the order to perform calculations using BODMAS: Brackets, Orders (powers), Division, Multiplication, Addition, Subtraction.", "key_concepts": ["BODMAS rules", "Brackets first", "Order of operations", "Complex expressions"], "example": "Calculate 3 + (4 × 2) = 3 + 8 = 11"}', 10),
('ao8', 'guided_practice', 1, 'Guided BODMAS Practice', 'Practice order of operations', '{"exercises": ["Calculate 5 + 2 × 3", "Calculate (6 + 2) × 4", "Calculate 8 ÷ 2 + 6"], "instructions": "Follow BODMAS order carefully"}', 15),
('ao8', 'independent_practice', 1, 'Independent BODMAS Practice', 'Apply BODMAS independently', '{"exercises": ["Calculate 7 + 3 × (10 - 4)", "Calculate (5 + 5) × (6 - 2)", "Calculate 18 ÷ (3 + 3)"], "instructions": "Show each step of BODMAS"}', 15),
('ao8', 'assessment', 1, 'Order of Operations Assessment', 'Test BODMAS mastery', '{"instructions": "Follow BODMAS rules exactly", "scoring": "Correct order and final answer"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert assessment questions for all topics
-- ao1 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is 130 + 460?', 'numeric_entry', 1, '[]'::jsonb, '590', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao1' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Which strategy helps you add 99 + 45?', 'multiple_choice', 2, '["Near doubles", "Compensation", "Rounding", "Estimation"]'::jsonb, 'Compensation', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao1' AND cc.stage_type = 'assessment';

-- ao2 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 567 + 678 using column addition.', 'written_answer', 1, '[]'::jsonb, '1245', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao2' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Add 45.67 + 23.49', 'numeric_entry', 2, '[]'::jsonb, '69.16', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao2' AND cc.stage_type = 'assessment';

-- ao3 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 723 - 458 using column subtraction.', 'written_answer', 1, '[]'::jsonb, '265', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao3' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Subtract 45.67 - 23.49', 'numeric_entry', 2, '[]'::jsonb, '22.18', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao3' AND cc.stage_type = 'assessment';

-- ao4 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is 8 × 7?', 'numeric_entry', 1, '[]'::jsonb, '56', 1, 'easy'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao4' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Which of these is a square number? 35, 64, 72, 90', 'multiple_choice', 2, '["35", "64", "72", "90"]'::jsonb, '64', 1, 'easy'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao4' AND cc.stage_type = 'assessment';

-- ao5 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 37 × 5', 'numeric_entry', 1, '[]'::jsonb, '185', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao5' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Multiply 12.3 × 10', 'numeric_entry', 2, '[]'::jsonb, '123', 1, 'easy'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao5' AND cc.stage_type = 'assessment';

-- ao6 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 45 × 36 using any long multiplication method.', 'written_answer', 1, '[]'::jsonb, '1620', 1, 'hard'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao6' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Multiply 123 × 45', 'numeric_entry', 2, '[]'::jsonb, '5535', 1, 'hard'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao6' AND cc.stage_type = 'assessment';

-- ao7 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is 144 ÷ 12?', 'numeric_entry', 1, '[]'::jsonb, '12', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao7' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Divide 65 by 4 and write remainder', 'written_answer', 2, '[]'::jsonb, '16 remainder 1', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao7' AND cc.stage_type = 'assessment';

-- ao8 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 4 + 6 × 2', 'numeric_entry', 1, '[]'::jsonb, '16', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao8' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is (3 + 5) × 2?', 'numeric_entry', 2, '[]'::jsonb, '16', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'ao8' AND cc.stage_type = 'assessment';