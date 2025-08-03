-- Fix RLS policies to be consistent across all tables
-- All tables should use bootcamp_students table for student ID mapping

-- Update learning_results RLS policies to match the pattern
DROP POLICY IF EXISTS "Users can create their own learning results" ON learning_results;
DROP POLICY IF EXISTS "Users can view their own learning results" ON learning_results;

CREATE POLICY "Users can create their own learning results" 
ON learning_results 
FOR INSERT 
WITH CHECK (student_id IN ( 
  SELECT student_id FROM bootcamp_students 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own learning results" 
ON learning_results 
FOR SELECT 
USING (student_id IN ( 
  SELECT student_id FROM bootcamp_students 
  WHERE user_id = auth.uid()
));

-- Update bootcamp_student_responses RLS policies to use bootcamp_students mapping
DROP POLICY IF EXISTS "Users can insert their own bootcamp responses" ON bootcamp_student_responses;
DROP POLICY IF EXISTS "Users can view their own bootcamp responses" ON bootcamp_student_responses;

CREATE POLICY "Users can insert their own bootcamp responses" 
ON bootcamp_student_responses 
FOR INSERT 
WITH CHECK (student_id IN ( 
  SELECT student_id FROM bootcamp_students 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own bootcamp responses" 
ON bootcamp_student_responses 
FOR SELECT 
USING (student_id IN ( 
  SELECT student_id FROM bootcamp_students 
  WHERE user_id = auth.uid()
));