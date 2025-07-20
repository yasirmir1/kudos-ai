-- Fix lowercase 'y' to uppercase 'Y' in question IDs
-- Also remove any duplicate 'y' characters

-- Temporarily drop the foreign key constraint
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_question_id_fkey;

-- Update curriculum table: replace lowercase 'y' with uppercase 'Y' and remove duplicates
UPDATE curriculum 
SET question_id = 'Y' || REGEXP_REPLACE(question_id, '^y+', '', 'g')
WHERE question_id LIKE 'y%' 
  AND question_id NOT LIKE '11P%';

-- Update student_answers table: replace lowercase 'y' with uppercase 'Y' and remove duplicates  
UPDATE student_answers 
SET question_id = 'Y' || REGEXP_REPLACE(question_id, '^y+', '', 'g')
WHERE question_id LIKE 'y%' 
  AND question_id NOT LIKE '11P%'
  AND question_id IS NOT NULL;

-- Recreate the foreign key constraint
ALTER TABLE student_answers 
ADD CONSTRAINT student_answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES curriculum(question_id);