-- Temporarily drop the foreign key constraint to allow updates
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_question_id_fkey;

-- Update curriculum table - add 'y' prefix only if it doesn't already have it
UPDATE curriculum 
SET question_id = 'y' || question_id 
WHERE question_id NOT LIKE 'y%' 
  AND question_id NOT LIKE '11P%';

-- Update student_answers table - add 'y' prefix only if it doesn't already have it  
UPDATE student_answers 
SET question_id = 'y' || question_id 
WHERE question_id NOT LIKE 'y%' 
  AND question_id NOT LIKE '11P%'
  AND question_id IS NOT NULL;

-- Recreate the foreign key constraint
ALTER TABLE student_answers 
ADD CONSTRAINT student_answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES curriculum(question_id);