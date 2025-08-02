-- Insert all assessment questions for all topics

-- Get content IDs and insert questions for each topic
WITH assessment_content AS (
  SELECT id, topic_id 
  FROM bootcamp_curriculum_content 
  WHERE stage_type = 'assessment'
)

-- NPV1 Questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT ac.id, 'What is the value of the 6 in 864,205?', 'numeric_entry', 1, '[]'::jsonb, '60000', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv1'
UNION ALL
SELECT ac.id, 'Circle the number that is written correctly in words:', 'multiple_choice', 2, 
'["Two hundred forty three thousand, ten", "Two hundred forty-three thousand and ten", "Two hundred and forty three thousand and ten"]'::jsonb, 
'Two hundred forty-three thousand and ten', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv1'

-- NPV2 Questions  
UNION ALL
SELECT ac.id, 'What is 3,684 rounded to the nearest hundred?', 'multiple_choice', 1, 
'["3,600", "3,700", "3,680", "3,800"]'::jsonb, '3,700', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv2'
UNION ALL
SELECT ac.id, 'Round 1,952 to the nearest thousand', 'numeric_entry', 2, '[]'::jsonb, '2000', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv2'

-- NPV3 Questions
UNION ALL
SELECT ac.id, 'Which is greater? 9,876 or 9,867?', 'multiple_choice', 1, 
'["9,876", "9,867"]'::jsonb, '9,876', 1, 'easy'
FROM assessment_content ac WHERE ac.topic_id = 'npv3'
UNION ALL
SELECT ac.id, 'Place the following numbers in ascending order: 7,650; 7,560; 7,605', 'written_answer', 2, '[]'::jsonb, '7,560; 7,605; 7,650', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv3'

-- NPV4 Questions
UNION ALL
SELECT ac.id, 'What number does the Roman numeral ''CD'' represent?', 'numeric_entry', 1, '[]'::jsonb, '400', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv4'
UNION ALL
SELECT ac.id, 'Write 78 as a Roman numeral.', 'written_answer', 2, '[]'::jsonb, 'LXXVIII', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv4'

-- NPV5 Questions
UNION ALL
SELECT ac.id, 'Which is greater: -2 or -5?', 'multiple_choice', 1, 
'["-2", "-5"]'::jsonb, '-2', 1, 'easy'
FROM assessment_content ac WHERE ac.topic_id = 'npv5'
UNION ALL
SELECT ac.id, 'Calculate: -3 + 7', 'numeric_entry', 2, '[]'::jsonb, '4', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv5'

-- NPV6 Questions
UNION ALL
SELECT ac.id, 'Is 29 a prime number?', 'multiple_choice', 1, 
'["Yes", "No"]'::jsonb, 'Yes', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv6'
UNION ALL
SELECT ac.id, 'List the factors of 20', 'written_answer', 2, '[]'::jsonb, '1, 2, 4, 5, 10, 20', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv6'

-- NPV7 Questions
UNION ALL
SELECT ac.id, 'What is 9²?', 'numeric_entry', 1, '[]'::jsonb, '81', 1, 'easy'
FROM assessment_content ac WHERE ac.topic_id = 'npv7'
UNION ALL
SELECT ac.id, 'Which of these is a cube number? 8, 15, 27, 30', 'multiple_choice', 2, 
'["8", "15", "27", "30"]'::jsonb, '27', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv7'

-- NPV8 Questions
UNION ALL
SELECT ac.id, 'Find the prime factors of 30', 'written_answer', 1, '[]'::jsonb, '2 × 3 × 5', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv8'
UNION ALL
SELECT ac.id, 'What is the HCF of 8 and 12?', 'numeric_entry', 2, '[]'::jsonb, '4', 1, 'medium'
FROM assessment_content ac WHERE ac.topic_id = 'npv8';