-- Add 11P prefix to question IDs for 11+ age group
-- Need to handle foreign key constraints properly

-- Temporarily disable foreign key constraint
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_question_id_fkey;

-- Update curriculum table question IDs for 11+ age group first
UPDATE curriculum 
SET question_id = '11P' || question_id 
WHERE age_group = '11+' 
  AND question_id NOT LIKE '11P%';

-- Update student_answers table to match the new question_id format
UPDATE student_answers 
SET question_id = '11P' || question_id 
WHERE question_id IN (
    -- Get the old question IDs that would have been updated in curriculum
    SELECT SUBSTRING(question_id FROM 4) 
    FROM curriculum 
    WHERE age_group = '11+' 
      AND question_id LIKE '11P%'
);

-- Re-add the foreign key constraint
ALTER TABLE student_answers 
ADD CONSTRAINT student_answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES curriculum(question_id);