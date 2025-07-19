-- First, let's see what we're working with
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE constraint_name LIKE '%question_id%' 
   OR table_name IN ('curriculum', 'student_answers');