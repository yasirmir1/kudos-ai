-- First, add missing enum values for cognitive_level
ALTER TYPE cognitive_level ADD VALUE IF NOT EXISTS 'knowledge';
ALTER TYPE cognitive_level ADD VALUE IF NOT EXISTS 'comprehension';
ALTER TYPE cognitive_level ADD VALUE IF NOT EXISTS 'evaluation';

-- Check and add missing difficulty values
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'foundation' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'difficulty')) THEN
        ALTER TYPE difficulty ADD VALUE 'foundation';
    END IF;
END $$;

-- Insert comprehensive bootcamp database content
-- First, insert questions with correct enum values
INSERT INTO bootcamp_questions (
    question_id, topic_id, question_category, difficulty, cognitive_level, question_type,
    question_text, correct_answer, explanation, prerequisite_skills, time_seconds, marks,
    option_a, option_b, option_c, option_d, module_id
) VALUES
-- Module 1: Numbers and Place Value (NPV)
('Q008', 'npv1', 'arithmetic', 'foundation', 'comprehension', 'multiple_choice',
 'What is the value of the digit 7 in 4,785,632?', 'D',
 'The digit 7 is in the thousands place, so its value is 7 × 1,000 = 7,000',
 ARRAY['place_value', 'number_recognition'], 30, 1,
 '7', '70', '700', '7,000', 'npv'),

('Q009', 'npv1', 'arithmetic', 'foundation', 'application', 'numeric_entry',
 'Write 2,045,367 in expanded form', '2,000,000 + 40,000 + 5,000 + 300 + 60 + 7',
 'Break down each digit by its place value: 2 millions + 0 hundred thousands + 4 ten thousands + 5 thousands + 3 hundreds + 6 tens + 7 ones',
 ARRAY['place_value', 'expanded_form'], 60, 2,
 NULL, NULL, NULL, NULL, 'npv'),

('Q010', 'npv1', 'arithmetic', 'intermediate', 'analysis', 'multiple_choice',
 'Which number has the same value as 3 million 4 thousand 50?', 'A',
 '3 million = 3,000,000, 4 thousand = 4,000, 50 = 50. Combined: 3,000,000 + 4,000 + 50 = 3,004,050',
 ARRAY['place_value', 'word_form'], 45, 1,
 '3,004,050', '3,040,050', '3,400,050', '3,004,500', 'npv'),

('Q011', 'npv2', 'arithmetic', 'foundation', 'application', 'multiple_choice',
 'Round 5,847 to the nearest hundred', 'A',
 'Look at the tens digit (4). Since 4 < 5, round down. 5,847 → 5,800',
 ARRAY['rounding', 'place_value'], 30, 1,
 '5,800', '5,850', '5,900', '6,000', 'npv'),

('Q012', 'npv2', 'problem_solving', 'intermediate', 'application', 'multiple_choice',
 'A stadium has 47,892 seats. Round this to the nearest thousand to estimate capacity', 'B',
 'Look at the hundreds digit (8). Since 8 ≥ 5, round up. 47,892 → 48,000',
 ARRAY['rounding', 'estimation', 'real_world_application'], 45, 1,
 '47,000', '48,000', '50,000', '47,900', 'npv'),

('Q013', 'npv3', 'arithmetic', 'foundation', 'analysis', 'multiple_choice',
 'Order these numbers from smallest to largest: 45,678; 45,687; 45,768', 'A',
 'Compare digit by digit from left to right. All start with 45,6__, so compare tens: 45,678 < 45,687 < 45,768',
 ARRAY['comparison', 'ordering'], 60, 1,
 '45,678; 45,687; 45,768', '45,687; 45,678; 45,768', '45,768; 45,687; 45,678', '45,678; 45,768; 45,687', 'npv'),

('Q014', 'npv4', 'arithmetic', 'intermediate', 'application', 'multiple_choice',
 'Convert 1,984 to Roman numerals', 'A',
 '1,984 = 1000 + 900 + 80 + 4 = M + CM + LXXX + IV = MCMLXXXIV',
 ARRAY['roman_numerals', 'conversion'], 90, 2,
 'MCMLXXXIV', 'MCMLXXXVI', 'MDCCCXIV', 'MCMLVIV', 'npv'),

('Q015', 'npv5', 'arithmetic', 'intermediate', 'application', 'multiple_choice',
 'What is -15 + 23?', 'B',
 'Starting at -15, move 23 places to the right on the number line: -15 + 23 = 8',
 ARRAY['negative_numbers', 'addition'], 45, 1,
 '-8', '8', '-38', '38', 'npv'),

('Q016', 'npv6', 'arithmetic', 'advanced', 'analysis', 'multiple_choice',
 'Which of these is a prime number?', 'C',
 'Check each: 51=3×17, 57=3×19, 59 has no factors other than 1 and 59, 63=7×9. Only 59 is prime.',
 ARRAY['prime_numbers', 'factors'], 90, 2,
 '51', '57', '59', '63', 'npv'),

-- Module 2: Arithmetic Operations (AO)
('Q017', 'ao1', 'arithmetic', 'foundation', 'application', 'multiple_choice',
 'Calculate 47 + 35 mentally', 'B',
 '47 + 35 = 47 + 30 + 5 = 77 + 5 = 82. Or: (47 + 3) + (35 - 3) = 50 + 32 = 82',
 ARRAY['mental_maths', 'addition'], 30, 1,
 '72', '82', '92', '75', 'ao'),

('Q018', 'ao1', 'arithmetic', 'foundation', 'application', 'multiple_choice',
 'Calculate 156 - 89 mentally', 'A',
 'Use compensation: 156 - 89 = 156 - 90 + 1 = 66 + 1 = 67',
 ARRAY['mental_maths', 'subtraction'], 45, 1,
 '67', '77', '57', '73', 'ao'),

('Q019', 'ao2', 'arithmetic', 'foundation', 'application', 'multiple_choice',
 'Calculate 2,847 + 1,596', 'B',
 'Line up place values: 7+6=13 (write 3, carry 1), 4+9+1=14 (write 4, carry 1), 8+5+1=14 (write 4, carry 1), 2+1+1=4. Result: 4,443',
 ARRAY['written_methods', 'addition', 'carrying'], 90, 2,
 '4,433', '4,443', '4,343', '3,443', 'ao'),

('Q020', 'ao4', 'arithmetic', 'foundation', 'knowledge', 'multiple_choice',
 'What is 7 × 8?', 'B',
 '7 × 8 = 56. This is a key multiplication fact from the 7 and 8 times tables.',
 ARRAY['multiplication_tables', 'number_facts'], 15, 1,
 '54', '56', '64', '58', 'ao'),

('Q021', 'ao8', 'arithmetic', 'advanced', 'application', 'multiple_choice',
 'Calculate 3 + 4 × 5 - 2', 'B',
 'Follow BIDMAS/PEMDAS: 3 + (4 × 5) - 2 = 3 + 20 - 2 = 21',
 ARRAY['order_operations', 'mental_maths'], 60, 2,
 '33', '21', '15', '35', 'ao'),

-- Module 3: Fractions, Decimals, Percentages (FDP)
('Q022', 'fdp1', 'arithmetic', 'foundation', 'comprehension', 'multiple_choice',
 'What fraction of this shape is shaded? [Visual shows 3 out of 8 equal parts shaded]', 'B',
 '3 parts are shaded out of 8 equal parts total, so the fraction is 3/8',
 ARRAY['fraction_concepts', 'visual_fractions'], 30, 1,
 '3/5', '3/8', '5/8', '3/11', 'fdp'),

('Q023', 'fdp2', 'arithmetic', 'foundation', 'application', 'multiple_choice',
 'Which fraction is equivalent to 2/3?', 'B',
 'Multiply both numerator and denominator by 3: 2/3 = (2×3)/(3×3) = 6/9',
 ARRAY['equivalent_fractions', 'multiplication'], 45, 1,
 '4/9', '6/9', '3/6', '4/8', 'fdp'),

('Q024', 'fdp6', 'arithmetic', 'foundation', 'comprehension', 'multiple_choice',
 'What is the value of the digit 7 in 15.376?', 'A',
 'The digit 7 is in the hundredths place, so its value is 7/100 or 0.07',
 ARRAY['decimal_place_value', 'place_value'], 30, 1,
 '7 hundredths', '7 tenths', '7 thousandths', '7 units', 'fdp'),

('Q025', 'fdp8', 'arithmetic', 'advanced', 'application', 'multiple_choice',
 'What is 15% of 240?', 'A',
 '15% = 15/100 = 0.15. So 15% of 240 = 0.15 × 240 = 36',
 ARRAY['percentages', 'multiplication'], 60, 2,
 '36', '32', '40', '38', 'fdp'),

-- Module 4: Ratio and Proportion (RP)
('Q026', 'rp1', 'ratio_proportion', 'intermediate', 'comprehension', 'multiple_choice',
 'In a class of 30 students, 18 are girls. What is the ratio of girls to boys?', 'C',
 'Girls = 18, Boys = 30 - 18 = 12. Ratio = 18:12 = 3:2 (dividing both by 6)',
 ARRAY['ratio', 'simplifying'], 60, 2,
 '18:12', '18:30', '3:2', '2:3', 'rp'),

('Q027', 'rp3', 'ratio_proportion', 'advanced', 'application', 'multiple_choice',
 'Share £120 in the ratio 2:3:7. What is the largest share?', 'C',
 'Total ratio parts = 2+3+7 = 12. Each part = £120÷12 = £10. Largest share = 7×£10 = £70',
 ARRAY['ratio', 'division', 'problem_solving'], 90, 3,
 '£20', '£30', '£70', '£84', 'rp'),

-- Module 5: Algebra (ALG)
('Q028', 'alg1', 'algebra', 'intermediate', 'comprehension', 'multiple_choice',
 'If x = 5, what is the value of 3x + 7?', 'B',
 'Substitute x = 5: 3x + 7 = 3(5) + 7 = 15 + 7 = 22',
 ARRAY['substitution', 'algebra'], 45, 1,
 '15', '22', '37', '35', 'alg'),

('Q029', 'alg3', 'algebra', 'advanced', 'application', 'multiple_choice',
 'Solve: 2x + 5 = 17', 'A',
 '2x + 5 = 17, so 2x = 17 - 5 = 12, therefore x = 12 ÷ 2 = 6',
 ARRAY['equation_solving', 'algebra'], 60, 2,
 'x = 6', 'x = 11', 'x = 12', 'x = 22', 'alg'),

-- Module 6: Geometry (GEO)
('Q030', 'geo1', 'geometry', 'foundation', 'knowledge', 'multiple_choice',
 'How many sides does a hexagon have?', 'B',
 'A hexagon is a polygon with 6 sides and 6 angles',
 ARRAY['shape_properties', 'polygons'], 15, 1,
 '5', '6', '7', '8', 'geo'),

('Q031', 'geo3', 'geometry', 'intermediate', 'application', 'multiple_choice',
 'What is the area of a rectangle with length 8cm and width 5cm?', 'C',
 'Area of rectangle = length × width = 8cm × 5cm = 40cm²',
 ARRAY['area', 'rectangle'], 30, 1,
 '13 cm²', '26 cm²', '40 cm²', '20 cm²', 'geo'),

-- Module 7: Measurement (MEAS)
('Q032', 'meas1', 'measurement', 'foundation', 'knowledge', 'multiple_choice',
 'How many millimeters are in 1 meter?', 'C',
 '1 meter = 1,000 millimeters (milli = 1/1000)',
 ARRAY['metric_units', 'conversion'], 30, 1,
 '10', '100', '1,000', '10,000', 'meas'),

-- Module 8: Statistics (STAT)
('Q033', 'stat2', 'statistics', 'intermediate', 'application', 'multiple_choice',
 'Find the mean of: 12, 15, 18, 11, 14', 'B',
 'Mean = (12+15+18+11+14) ÷ 5 = 70 ÷ 5 = 14',
 ARRAY['mean', 'averages'], 60, 2,
 '13', '14', '15', '16', 'stat'),

-- Module 9: Problem Solving (PS)
('Q034', 'ps1', 'problem_solving', 'intermediate', 'analysis', 'multiple_choice',
 'Sarah has £45. She buys 3 books costing £12 each. How much money does she have left?', 'B',
 'Cost of books = 3 × £12 = £36. Money left = £45 - £36 = £9',
 ARRAY['problem_solving', 'multiplication', 'subtraction'], 75, 2,
 '£8', '£9', '£12', '£15', 'ps')

ON CONFLICT (question_id) DO NOTHING;