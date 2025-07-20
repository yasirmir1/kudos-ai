-- Standardize question_type values to use consistent formatting
UPDATE curriculum 
SET question_type = 'Multiple Choice'
WHERE question_type = 'multiple_choice';