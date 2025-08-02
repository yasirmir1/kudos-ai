-- Insert comprehensive bootcamp database content
-- First, insert questions
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
 '£8', '£9', '£12', '£15', 'ps');

-- Insert answer options for multiple choice questions
INSERT INTO bootcamp_answer_options (question_id, option_letter, answer_value, is_correct, misconception_code, diagnostic_feedback)
SELECT 
    q.question_id,
    'A' as option_letter,
    q.option_a as answer_value,
    CASE WHEN q.correct_answer = 'A' THEN true ELSE false END as is_correct,
    CASE 
        WHEN q.question_id = 'Q008' AND q.correct_answer != 'A' THEN 'NPV001'
        WHEN q.question_id = 'Q011' AND q.correct_answer != 'A' THEN 'NPV002'
        WHEN q.question_id = 'Q017' AND q.correct_answer != 'A' THEN 'AO001'
        WHEN q.question_id = 'Q020' AND q.correct_answer != 'A' THEN 'AO004'
        WHEN q.question_id = 'Q022' AND q.correct_answer != 'A' THEN 'FDP001'
        WHEN q.question_id = 'Q028' AND q.correct_answer != 'A' THEN 'ALG001'
        ELSE NULL
    END as misconception_code,
    CASE 
        WHEN q.question_id = 'Q008' AND q.correct_answer != 'A' THEN 'This is the face value, not the place value of the digit 7'
        WHEN q.question_id = 'Q011' AND q.correct_answer != 'A' THEN 'Check the rounding rule: look at the digit to the right'
        WHEN q.question_id = 'Q017' AND q.correct_answer != 'A' THEN 'Try breaking down the numbers: 47 + 30 + 5'
        WHEN q.question_id = 'Q020' AND q.correct_answer != 'A' THEN 'This is 6 × 9, not 7 × 8'
        WHEN q.question_id = 'Q022' AND q.correct_answer != 'A' THEN 'Count the total parts, not just unshaded parts'
        WHEN q.question_id = 'Q028' AND q.correct_answer != 'A' THEN 'Remember to substitute x = 5 into the expression'
        ELSE 'Review the concept and try again'
    END as diagnostic_feedback
FROM bootcamp_questions q
WHERE q.option_a IS NOT NULL;

-- Insert B, C, D options similarly
INSERT INTO bootcamp_answer_options (question_id, option_letter, answer_value, is_correct, misconception_code, diagnostic_feedback)
SELECT 
    q.question_id,
    'B' as option_letter,
    q.option_b as answer_value,
    CASE WHEN q.correct_answer = 'B' THEN true ELSE false END as is_correct,
    NULL as misconception_code,
    'Review the solution method if this was your choice' as diagnostic_feedback
FROM bootcamp_questions q
WHERE q.option_b IS NOT NULL;

INSERT INTO bootcamp_answer_options (question_id, option_letter, answer_value, is_correct, misconception_code, diagnostic_feedback)
SELECT 
    q.question_id,
    'C' as option_letter,
    q.option_c as answer_value,
    CASE WHEN q.correct_answer = 'C' THEN true ELSE false END as is_correct,
    NULL as misconception_code,
    'Review the solution method if this was your choice' as diagnostic_feedback
FROM bootcamp_questions q
WHERE q.option_c IS NOT NULL;

INSERT INTO bootcamp_answer_options (question_id, option_letter, answer_value, is_correct, misconception_code, diagnostic_feedback)
SELECT 
    q.question_id,
    'D' as option_letter,
    q.option_d as answer_value,
    CASE WHEN q.correct_answer = 'D' THEN true ELSE false END as is_correct,
    NULL as misconception_code,
    'Review the solution method if this was your choice' as diagnostic_feedback
FROM bootcamp_questions q
WHERE q.option_d IS NOT NULL;

-- Insert misconceptions catalog
INSERT INTO bootcamp_misconceptions_catalog (
    misconception_id, category, misconception_name, description, 
    common_indicators, remediation_strategy, related_topics
) VALUES
('NPV001', 'Numbers and Place Value', 'Face Value vs Place Value Confusion', 
 'Students think the digits face value is the same as its place value',
 ARRAY['Thinking the 7 in 4,785 has value 7 instead of 700', 'Confusing digit position with digit value'],
 'Use place value charts and base-10 blocks to show physical representation. Practice: "Whats the value, not just the digit?"',
 ARRAY['place_value', 'number_recognition']),

('NPV002', 'Numbers and Place Value', 'Rounding Direction Errors',
 'Always rounding up when the key digit is 5 or systematic rounding errors',
 ARRAY['Rounding 1,250 to nearest hundred as 1,300 without checking digit', 'Inconsistent rounding rules'],
 'Emphasize "5 or more, round up; less than 5, round down". Practice with borderline cases',
 ARRAY['rounding', 'place_value']),

('NPV003', 'Numbers and Place Value', 'Number Length Comparison Error',
 'Thinking longer numbers are always bigger',
 ARRAY['Believing 9,999 > 10,000 because it has more non-zero digits', 'Focusing on digit count not place value'],
 'Use number lines and place value comparison. Show examples where shorter numbers are larger',
 ARRAY['comparison', 'ordering', 'place_value']),

('AO001', 'Arithmetic Operations', 'Left-to-Right Mental Math Error',
 'Adding/subtracting from left to right like reading',
 ARRAY['47 + 35 calculated as 4+3=7, 7+5=12, giving 712', 'Treating numbers as separate digits'],
 'Teach compensation and partitioning strategies. Model correct mental strategies explicitly',
 ARRAY['mental_maths', 'addition', 'subtraction']),

('AO004', 'Arithmetic Operations', 'Multiplication-Addition Confusion',
 'Confusing multiplication with addition',
 ARRAY['7 × 8 = 15 (thinking 7 + 8)', 'Using addition instead of multiplication'],
 'Use arrays and repeated addition to show multiplication meaning. Emphasize "groups of"',
 ARRAY['multiplication_tables', 'number_facts']),

('AO008', 'Arithmetic Operations', 'Order of Operations Error',
 'Working strictly left to right ignoring BIDMAS/PEMDAS',
 ARRAY['3 + 4 × 5 = 35 instead of 23', 'Not prioritizing multiplication before addition'],
 'Teach BIDMAS/PEMDAS with memorable mnemonics. Use brackets to show correct order',
 ARRAY['order_operations', 'mental_maths']),

('FDP001', 'Fractions, Decimals, Percentages', 'Denominator Size Misconception',
 'Larger denominator means larger fraction',
 ARRAY['Thinking 1/8 > 1/4 because 8 > 4', 'Focusing on denominator size not fraction value'],
 'Use visual fraction models and pizza/cake analogies. Compare unit fractions with visual supports',
 ARRAY['fraction_concepts', 'visual_fractions']),

('FDP002', 'Fractions, Decimals, Percentages', 'Equivalent Fraction Addition Error',
 'Adding same number to numerator and denominator',
 ARRAY['2/3 = 3/4 (adding 1 to both)', 'Not understanding multiplicative relationship'],
 'Show multiplication/division of whole fraction by same number. Use fraction strips',
 ARRAY['equivalent_fractions', 'multiplication']),

('FDP006', 'Fractions, Decimals, Percentages', 'Decimal Place Confusion',
 'More decimal places means larger number',
 ARRAY['0.8 < 0.75 because 75 > 8', 'Treating decimals like whole numbers'],
 'Connect to money (80p vs 75p) and place value grids. Practice comparing decimals',
 ARRAY['decimal_place_value', 'place_value']),

('RP001', 'Ratio and Proportion', 'Ratio-Fraction Confusion',
 'Thinking ratio is the same as fraction',
 ARRAY['Expressing ratio 3:2 as 3/2 of the total', 'Not distinguishing parts vs whole'],
 'Emphasize ratio compares parts, fraction shows part of whole. Use concrete examples',
 ARRAY['ratio', 'simplifying']),

('ALG001', 'Algebra', 'Variable Multiplication Confusion',
 'Thinking x means multiplication',
 ARRAY['If x = 5, then 3x = 35 (thinking 3 × x = 3 × 10 + 5)', 'Confusing variable with operation'],
 'Clearly explain x as unknown value, not operation. Start with simple substitutions',
 ARRAY['substitution', 'algebra']),

('ALG003', 'Algebra', 'Equation Balance Error',
 'Not maintaining equation balance',
 ARRAY['In 2x + 5 = 17, subtracting 5 from only one side', 'Not understanding equality'],
 'Use balance/scales model for equations. Show "do the same to both sides" explicitly',
 ARRAY['equation_solving', 'algebra']),

('GEO001', 'Geometry', 'Orientation Shape Classification',
 'Thinking orientation affects shape classification',
 ARRAY['Not recognizing a tilted square as a square', 'Shape recognition dependent on position'],
 'Show shapes in multiple orientations. Sort shapes regardless of position or size',
 ARRAY['shape_properties', 'polygons']),

('GEO003', 'Geometry', 'Area-Perimeter Formula Confusion',
 'Confusing area and perimeter formulas',
 ARRAY['Finding "area" of rectangle as 2(l + w)', 'Using wrong formula for measurement type'],
 'Connect to real-world examples (carpet vs fence). Emphasize units (cm² vs cm)',
 ARRAY['area', 'rectangle']),

('MEAS001', 'Measurement', 'Unit Conversion Direction Error',
 'Confusing which direction to multiply/divide in conversions',
 ARRAY['Converting 2.5m to cm as 2.5 ÷ 100 = 0.025cm', 'Wrong operation for unit conversion'],
 'Use conversion factors and unit analysis. Always check if answer makes sense',
 ARRAY['metric_units', 'conversion']),

('STAT002', 'Statistics', 'Average Type Confusion',
 'Confusing mean, median, and mode',
 ARRAY['Giving mode when asked for mean', 'Not distinguishing between average types'],
 'Clear definitions and when to use each average. Calculate all three for same data set',
 ARRAY['mean', 'averages']),

('PS001', 'Problem Solving', 'Random Number Selection',
 'Picking numbers without understanding the problem',
 ARRAY['Seeing £45 and £12 and immediately doing 45 ÷ 12', 'Not reading problem carefully'],
 'Teach systematic problem-solving approach (understand, plan, solve, check)',
 ARRAY['problem_solving', 'multiplication', 'subtraction']);