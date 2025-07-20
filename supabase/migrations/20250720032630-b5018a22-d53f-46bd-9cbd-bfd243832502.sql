-- Add 'y' prefix to question IDs that don't already have it (excluding 11P entries)
-- Update both curriculum and student_answers tables to maintain referential integrity

-- First update student_answers table
UPDATE student_answers 
SET question_id = 'y' || question_id 
WHERE question_id NOT LIKE 'y%' 
  AND question_id NOT LIKE '11P%'
  AND question_id IS NOT NULL;

-- Then update curriculum table
UPDATE curriculum 
SET question_id = 'y' || question_id 
WHERE question_id NOT LIKE 'y%' 
  AND question_id NOT LIKE '11P%';