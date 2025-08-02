-- Add missing columns to bootcamp_questions table for answer options and explanations
ALTER TABLE bootcamp_questions 
ADD COLUMN IF NOT EXISTS option_a TEXT,
ADD COLUMN IF NOT EXISTS option_b TEXT,
ADD COLUMN IF NOT EXISTS option_c TEXT,
ADD COLUMN IF NOT EXISTS option_d TEXT,
ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT 'A',
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Insert the provided question data with valid enum values
INSERT INTO bootcamp_questions (
  question_id, module_id, topic_id, difficulty, question_type, question_text,
  option_a, option_b, option_c, option_d, correct_answer, explanation,
  marks, time_seconds, prerequisite_skills, exam_boards, question_category, cognitive_level
) VALUES 
('Q001', 'mod1', 'npv1', 'foundation', 'multiple_choice', 'What is 3456829 rounded to the nearest thousand?',
 '3456000', '3457000', '3456800', '3457800', 'B', 
 'To round to the nearest thousand, look at the hundreds digit (8). Since 8 ≥ 5, round up. 3456829 → 3457000',
 1, 45, ARRAY['rounding', 'place_value'], ARRAY['GL', 'CEM'], 'arithmetic', 'application'),

('Q002', 'mod1', 'npv1', 'foundation', 'numeric_entry', 'Write 5604321 in words',
 NULL, NULL, NULL, NULL, 'Five million six hundred and four thousand three hundred and twenty-one',
 'Break down: 5 million + 604 thousand + 321',
 1, 60, ARRAY['number_recognition', 'place_value'], ARRAY['GL', 'CEM'], 'arithmetic', 'application'),

('Q003', 'mod1', 'npv2', 'foundation', 'multiple_choice', 'Round 78456 to the nearest ten',
 '78450', '78460', '78500', '78400', 'B',
 'Look at the ones digit (6). Since 6 ≥ 5, round up. 78456 → 78460',
 1, 30, ARRAY['rounding', 'place_value'], ARRAY['GL', 'CEM'], 'arithmetic', 'application'),

('Q004', 'mod1', 'npv3', 'intermediate', 'multiple_choice', 'Which symbol makes this true: 345678 ___ 345687',
 '<', '>', '=', '≤', 'A',
 'Compare digit by digit: 345678 vs 345687. The tens digit shows 7 < 8, so 345678 < 345687',
 1, 45, ARRAY['comparison', 'ordering'], ARRAY['GL', 'CEM'], 'arithmetic', 'analysis'),

('Q005', 'mod1', 'npv4', 'intermediate', 'multiple_choice', 'What is MDCCXLIV in standard form?',
 '1744', '1844', '1644', '1544', 'A',
 'M=1000, D=500, CC=200, XL=40, IV=4. Total: 1000+500+200+40+4=1744',
 1, 60, ARRAY['roman_numerals', 'conversion'], ARRAY['GL', 'ISEB'], 'arithmetic', 'application'),

('Q006', 'mod1', 'npv5', 'intermediate', 'numeric_entry', 'The temperature is -3°C. It rises by 8°C. What is the new temperature?',
 NULL, NULL, NULL, NULL, '5°C',
 '-3 + 8 = 5. When adding to a negative number, count up through zero',
 1, 45, ARRAY['negative_numbers', 'temperature'], ARRAY['CEM', 'ISEB'], 'arithmetic', 'application'),

('Q007', 'mod1', 'npv6', 'advanced', 'multiple_choice', 'What is the prime factorization of 84?',
 '2² × 3 × 7', '2 × 3² × 7', '2³ × 3 × 7', '2² × 21', 'A',
 '84 = 2 × 42 = 2 × 2 × 21 = 2 × 2 × 3 × 7 = 2² × 3 × 7',
 2, 90, ARRAY['prime_factorization', 'factors'], ARRAY['GL', 'CEM'], 'arithmetic', 'analysis')

ON CONFLICT (question_id) DO NOTHING;