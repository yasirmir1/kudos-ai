-- Update question IDs for 11+ age group to add 11P prefix for consistency
UPDATE curriculum 
SET question_id = '11P' || question_id 
WHERE age_group = '11+' 
  AND question_id NOT LIKE '11P%';