-- Insert Fractions, Decimals, and Percentages curriculum topics and content

-- Insert topics
INSERT INTO bootcamp_curriculum_topics (id, topic_name, topic_order, difficulty, estimated_duration_minutes, learning_objectives) VALUES
('fdp1', 'Understanding Fractions', 1, 'foundation', 45, ARRAY['Understand fraction notation', 'Identify numerator and denominator', 'Represent fractions visually']),
('fdp2', 'Equivalent Fractions', 2, 'foundation', 45, ARRAY['Recognize equivalent fractions', 'Simplify fractions', 'Use fraction walls for comparison']),
('fdp3', 'Mixed Numbers', 3, 'intermediate', 45, ARRAY['Convert between mixed numbers and improper fractions', 'Compare mixed numbers', 'Understand mixed number notation']),
('fdp4', 'Adding and Subtracting Fractions', 4, 'intermediate', 45, ARRAY['Add fractions with same denominators', 'Subtract fractions with same denominators', 'Find common denominators']),
('fdp5', 'Multiplying and Dividing Fractions', 5, 'advanced', 45, ARRAY['Multiply fractions', 'Divide fractions using flip and multiply', 'Multiply fractions by whole numbers']),
('fdp6', 'Decimal Place Value', 6, 'foundation', 45, ARRAY['Understand decimal place value', 'Order decimal numbers', 'Read and write decimals']),
('fdp7', 'Converting FDP', 7, 'intermediate', 45, ARRAY['Convert fractions to decimals and percentages', 'Convert decimals to fractions and percentages', 'Convert percentages to fractions and decimals']),
('fdp8', 'Percentage Calculations', 8, 'advanced', 45, ARRAY['Calculate percentages of amounts', 'Find percentage increase and decrease', 'Solve reverse percentage problems'])
ON CONFLICT (id) DO NOTHING;

-- Insert content for fdp1 - Understanding Fractions
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp1', 'concept_introduction', 1, 'Introduction to Fractions', 'Learn what fractions represent', '{"introduction": "Fractions show parts of a whole. We write them as numerator over denominator.", "key_concepts": ["Numerator and denominator", "Parts of a whole", "Fraction notation", "Visual representation"], "example": "If a pizza is cut into 4 slices and you have 1, that is 1/4."}', 10),
('fdp1', 'guided_practice', 1, 'Guided Fraction Practice', 'Practice identifying and representing fractions', '{"exercises": ["Identify numerator and denominator in 3/5", "Shade 2/6 of a shape", "Write fractions for parts of objects"], "instructions": "Work through fraction identification step by step"}', 15),
('fdp1', 'independent_practice', 1, 'Independent Fraction Work', 'Apply fraction knowledge independently', '{"exercises": ["Draw 1/3 of a rectangle", "Write fraction for 5 parts out of 8", "Compare 3/4 and 2/4"], "instructions": "Complete these fraction problems on your own"}', 15),
('fdp1', 'assessment', 1, 'Fraction Understanding Assessment', 'Test your fraction knowledge', '{"instructions": "Answer these questions about fractions", "scoring": "Each question worth equal points"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp2 - Equivalent Fractions
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp2', 'concept_introduction', 1, 'Equivalent Fractions Explained', 'Learn about equivalent fractions', '{"introduction": "Equivalent fractions are different fractions that represent the same part of a whole.", "key_concepts": ["Same value, different notation", "Simplifying fractions", "Finding equivalents", "Fraction walls"], "example": "1/2 = 2/4 = 4/8"}', 10),
('fdp2', 'guided_practice', 1, 'Guided Equivalent Fractions', 'Practice finding equivalent fractions', '{"exercises": ["Find equivalent fractions for 1/3", "Simplify 4/8", "Use fraction walls to compare"], "instructions": "Work through equivalent fraction problems"}', 15),
('fdp2', 'independent_practice', 1, 'Independent Equivalent Fractions', 'Apply equivalent fraction skills', '{"exercises": ["Write two equivalent fractions for 3/5", "Simplify 6/12", "Find common denominators for 1/2 and 1/4"], "instructions": "Complete these equivalent fraction exercises"}', 15),
('fdp2', 'assessment', 1, 'Equivalent Fractions Assessment', 'Test equivalent fraction mastery', '{"instructions": "Show your understanding of equivalent fractions", "scoring": "Show your working"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp3 - Mixed Numbers
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp3', 'concept_introduction', 1, 'Mixed Numbers Introduction', 'Learn about mixed numbers', '{"introduction": "Mixed numbers combine whole numbers and fractions.", "key_concepts": ["Whole and fractional parts", "Converting to improper fractions", "Converting from improper fractions", "Ordering mixed numbers"], "example": "1 1/2 means one whole and a half."}', 10),
('fdp3', 'guided_practice', 1, 'Guided Mixed Numbers Practice', 'Practice with mixed numbers', '{"exercises": ["Convert 3/2 to a mixed number", "Convert 2 3/4 to improper fraction", "Order mixed numbers"], "instructions": "Work through mixed number conversions"}', 15),
('fdp3', 'independent_practice', 1, 'Independent Mixed Numbers', 'Apply mixed number skills', '{"exercises": ["Convert 7/4 to mixed number", "Convert 3 2/5 to improper fraction", "Compare 2 1/3 and 2 2/5"], "instructions": "Complete these mixed number problems"}', 15),
('fdp3', 'assessment', 1, 'Mixed Numbers Assessment', 'Test mixed number understanding', '{"instructions": "Show conversions between mixed and improper", "scoring": "Show all working clearly"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp4 - Adding and Subtracting Fractions
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp4', 'concept_introduction', 1, 'Adding and Subtracting Fractions', 'Learn fraction arithmetic', '{"introduction": "Add or subtract fractions by making denominators the same.", "key_concepts": ["Same denominators", "Common denominators", "Adding numerators", "Subtracting numerators"], "example": "1/4 + 2/4 = 3/4"}', 10),
('fdp4', 'guided_practice', 1, 'Guided Fraction Addition/Subtraction', 'Practice fraction arithmetic', '{"exercises": ["Add 1/3 + 2/3", "Subtract 5/6 - 1/6", "Add 1/4 + 1/2"], "instructions": "Work through fraction addition and subtraction"}', 15),
('fdp4', 'independent_practice', 1, 'Independent Fraction Arithmetic', 'Apply fraction arithmetic skills', '{"exercises": ["Add 3/5 + 1/5", "Subtract 7/8 - 3/8", "Add 2/3 + 1/6"], "instructions": "Complete these fraction calculations"}', 15),
('fdp4', 'assessment', 1, 'Fraction Arithmetic Assessment', 'Test fraction addition and subtraction', '{"instructions": "Solve these fraction problems", "scoring": "Show your working"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp5 - Multiplying and Dividing Fractions
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp5', 'concept_introduction', 1, 'Multiplying and Dividing Fractions', 'Learn advanced fraction operations', '{"introduction": "Multiply fractions by multiplying numerators and denominators. Divide by flipping the second fraction.", "key_concepts": ["Multiply numerators and denominators", "Flip and multiply for division", "Multiplying by whole numbers", "Simplifying results"], "example": "1/2 × 3/4 = 3/8; 1/2 ÷ 3/4 = 1/2 × 4/3 = 4/6 = 2/3"}', 10),
('fdp5', 'guided_practice', 1, 'Guided Fraction Multiplication/Division', 'Practice advanced fraction operations', '{"exercises": ["Multiply 2/3 × 3/5", "Divide 3/4 ÷ 2/3", "Multiply 1/2 × 4"], "instructions": "Work through multiplication and division step by step"}', 15),
('fdp5', 'independent_practice', 1, 'Independent Advanced Fractions', 'Apply advanced fraction skills', '{"exercises": ["Multiply 5/6 × 2/3", "Divide 7/8 ÷ 1/4", "Multiply 3/5 × 10"], "instructions": "Complete these advanced fraction problems"}', 15),
('fdp5', 'assessment', 1, 'Advanced Fraction Operations Assessment', 'Test multiplication and division of fractions', '{"instructions": "Solve using correct methods", "scoring": "Show all steps clearly"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp6 - Decimal Place Value
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp6', 'concept_introduction', 1, 'Decimal Place Value System', 'Understand decimal notation', '{"introduction": "Decimals show parts of a whole using tenths, hundredths, thousandths.", "key_concepts": ["Tenths, hundredths, thousandths", "Place value positions", "Ordering decimals", "Reading decimals"], "example": "0.5 = 5 tenths; 0.25 = 25 hundredths"}', 10),
('fdp6', 'guided_practice', 1, 'Guided Decimal Practice', 'Practice with decimal place value', '{"exercises": ["Identify place values in 0.375", "Order decimals 0.4, 0.45, 0.405", "Write decimals from diagrams"], "instructions": "Work through decimal place value problems"}', 15),
('fdp6', 'independent_practice', 1, 'Independent Decimal Work', 'Apply decimal knowledge', '{"exercises": ["Write 7 tenths as decimal", "Order decimals 0.12, 0.2, 0.18", "Convert fractions to decimals"], "instructions": "Complete these decimal exercises"}', 15),
('fdp6', 'assessment', 1, 'Decimal Place Value Assessment', 'Test decimal understanding', '{"instructions": "Show understanding of decimal place value", "scoring": "Accuracy in place value identification"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp7 - Converting FDP
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp7', 'concept_introduction', 1, 'Converting Between FDP', 'Learn conversions between forms', '{"introduction": "Convert between fractions, decimals, and percentages.", "key_concepts": ["Fraction to decimal conversion", "Decimal to percentage", "Percentage to fraction", "Equivalent representations"], "example": "1/2 = 0.5 = 50%"}', 10),
('fdp7', 'guided_practice', 1, 'Guided FDP Conversions', 'Practice converting between forms', '{"exercises": ["Convert 1/4 to decimal and percentage", "Convert 0.75 to fraction and percentage", "Convert 60% to fraction and decimal"], "instructions": "Work through conversions step by step"}', 15),
('fdp7', 'independent_practice', 1, 'Independent FDP Conversions', 'Apply conversion skills', '{"exercises": ["Convert 3/5 to decimal and percentage", "Convert 0.4 to fraction and percentage", "Convert 25% to decimal and fraction"], "instructions": "Complete these conversion problems"}', 15),
('fdp7', 'assessment', 1, 'FDP Conversion Assessment', 'Test conversion mastery', '{"instructions": "Convert accurately between all forms", "scoring": "Show conversion methods"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert content for fdp8 - Percentage Calculations
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('fdp8', 'concept_introduction', 1, 'Percentage Calculations', 'Master percentage calculations', '{"introduction": "Calculate percentages, percentage increase/decrease, and reverse percentages.", "key_concepts": ["Finding percentages of amounts", "Percentage increase and decrease", "Reverse percentages", "Percentage calculations"], "example": "Find 20% of 50 = 0.20 × 50 = 10"}', 10),
('fdp8', 'guided_practice', 1, 'Guided Percentage Calculations', 'Practice percentage problems', '{"exercises": ["Calculate 15% of 200", "Find percentage increase from 50 to 60", "Calculate original price if discounted to 80"], "instructions": "Work through percentage calculations"}', 15),
('fdp8', 'independent_practice', 1, 'Independent Percentage Work', 'Apply percentage calculation skills', '{"exercises": ["Calculate 25% of 360", "Find percentage decrease from 90 to 72", "Calculate original value if 30% off price is 70"], "instructions": "Complete these percentage problems"}', 15),
('fdp8', 'assessment', 1, 'Percentage Calculations Assessment', 'Test percentage mastery', '{"instructions": "Solve various percentage problems", "scoring": "Show calculation methods clearly"}', 10)
ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert assessment questions for all topics
-- fdp1 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is the numerator in 7/10?', 'multiple_choice', 1, '["7", "10", "17", "3"]'::jsonb, '7', 1, 'easy'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp1' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Shade 3/8 of a rectangle', 'written_answer', 2, '[]'::jsonb, 'Rectangle divided into 8 parts with 3 shaded', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp1' AND cc.stage_type = 'assessment';

-- fdp2 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Which fraction is equivalent to 2/5?', 'multiple_choice', 1, '["4/10", "3/5", "2/6", "5/10"]'::jsonb, '4/10', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp2' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Simplify 8/12', 'numeric_entry', 2, '[]'::jsonb, '2/3', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp2' AND cc.stage_type = 'assessment';

-- fdp3 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Convert 9/4 to a mixed number.', 'numeric_entry', 1, '[]'::jsonb, '2 1/4', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp3' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Convert 1 3/5 to an improper fraction.', 'numeric_entry', 2, '[]'::jsonb, '8/5', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp3' AND cc.stage_type = 'assessment';

-- fdp4 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 2/5 + 3/5.', 'numeric_entry', 1, '[]'::jsonb, '1', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp4' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Subtract 3/4 - 1/4.', 'numeric_entry', 2, '[]'::jsonb, '1/2', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp4' AND cc.stage_type = 'assessment';

-- fdp5 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Calculate 3/5 × 2/7.', 'numeric_entry', 1, '[]'::jsonb, '6/35', 1, 'hard'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp5' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Divide 4/9 ÷ 2/3.', 'numeric_entry', 2, '[]'::jsonb, '2/3', 1, 'hard'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp5' AND cc.stage_type = 'assessment';

-- fdp6 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What place value is the 7 in 0.478?', 'multiple_choice', 1, '["Hundredths", "Tenths", "Thousandths", "Ones"]'::jsonb, 'Hundredths', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp6' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Order decimals: 0.6, 0.66, 0.606', 'written_answer', 2, '[]'::jsonb, '0.6, 0.606, 0.66', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp6' AND cc.stage_type = 'assessment';

-- fdp7 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Convert 2/5 to a percentage.', 'numeric_entry', 1, '[]'::jsonb, '40', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp7' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'Convert 0.6 to a fraction.', 'numeric_entry', 2, '[]'::jsonb, '3/5', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp7' AND cc.stage_type = 'assessment';

-- fdp8 questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'What is 10% of 250?', 'numeric_entry', 1, '[]'::jsonb, '25', 1, 'medium'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp8' AND cc.stage_type = 'assessment';

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT cc.id, 'If price increased from 40 to 50, what is the percentage increase?', 'numeric_entry', 2, '[]'::jsonb, '25', 1, 'hard'
FROM bootcamp_curriculum_content cc WHERE cc.topic_id = 'fdp8' AND cc.stage_type = 'assessment';