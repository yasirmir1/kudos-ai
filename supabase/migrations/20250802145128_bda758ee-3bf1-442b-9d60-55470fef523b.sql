-- Fix the RLS policy for bootcamp_student_responses to work with student_id from bootcamp_students table
DROP POLICY IF EXISTS "Users can insert their own bootcamp responses" ON bootcamp_student_responses;
DROP POLICY IF EXISTS "Users can view their own bootcamp responses" ON bootcamp_student_responses;

-- Create new policies that properly link through the bootcamp_students table
CREATE POLICY "Users can insert their own bootcamp responses" 
ON bootcamp_student_responses 
FOR INSERT 
WITH CHECK (
  student_id IN (
    SELECT student_id 
    FROM bootcamp_students 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own bootcamp responses" 
ON bootcamp_student_responses 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id 
    FROM bootcamp_students 
    WHERE user_id = auth.uid()
  )
);