-- Add 'y' prefix to question IDs that don't already have it (excluding 11P entries)
UPDATE curriculum 
SET question_id = 'y' || question_id 
WHERE question_id NOT LIKE 'y%' 
  AND question_id NOT LIKE '11P%';