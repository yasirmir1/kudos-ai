-- Fix double 'YY' at the start of question IDs to single 'Y'

-- Temporarily drop the foreign key constraint
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_question_id_fkey;

-- Update curriculum table: replace 'YY' at start with single 'Y'
UPDATE curriculum 
SET question_id = 'Y' || SUBSTRING(question_id, 3)
WHERE question_id LIKE 'YY%';

-- Update student_answers table: replace 'YY' at start with single 'Y'
UPDATE student_answers 
SET question_id = 'Y' || SUBSTRING(question_id, 3)
WHERE question_id LIKE 'YY%'
  AND question_id IS NOT NULL;

-- Recreate the foreign key constraint
ALTER TABLE student_answers 
ADD CONSTRAINT student_answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES curriculum(question_id);