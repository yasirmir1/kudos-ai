-- Add 11P prefix to question IDs for 11+ age group in both curriculum and student_answers tables

-- First, update student_answers table to use the new question_id format
UPDATE student_answers 
SET question_id = '11P' || question_id 
WHERE question_id IN (
    SELECT question_id 
    FROM curriculum 
    WHERE age_group = '11+' 
      AND question_id NOT LIKE '11P%'
);

-- Then, update curriculum table question IDs for 11+ age group
UPDATE curriculum 
SET question_id = '11P' || question_id 
WHERE age_group = '11+' 
  AND question_id NOT LIKE '11P%';