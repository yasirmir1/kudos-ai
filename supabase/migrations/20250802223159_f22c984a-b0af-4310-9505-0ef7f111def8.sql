-- Review and unify student_id usage across bootcamp tables
-- This migration ensures all student-specific tables consistently use student_id

-- First, let's check if there are any inconsistencies and fix them

-- 1. Ensure bootcamp_student_profiles uses student_id consistently
-- Currently it seems to be using student_id as both foreign key and treating it as auth.uid()
-- Let's fix this to properly reference bootcamp_students.student_id
ALTER TABLE bootcamp_student_profiles 
DROP CONSTRAINT IF EXISTS bootcamp_student_profiles_student_id_fkey;

ALTER TABLE bootcamp_student_profiles 
ADD CONSTRAINT bootcamp_student_profiles_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- 2. Update RLS policies for bootcamp_student_profiles to use the correct relationship
DROP POLICY IF EXISTS "Users can view their own bootcamp profile" ON bootcamp_student_profiles;
DROP POLICY IF EXISTS "Users can update their own bootcamp profile" ON bootcamp_student_profiles;
DROP POLICY IF EXISTS "Users can insert their own bootcamp profile" ON bootcamp_student_profiles;

CREATE POLICY "Users can view their own bootcamp profile" 
ON bootcamp_student_profiles 
FOR SELECT 
USING (student_id IN (
  SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own bootcamp profile" 
ON bootcamp_student_profiles 
FOR UPDATE 
USING (student_id IN (
  SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their own bootcamp profile" 
ON bootcamp_student_profiles 
FOR INSERT 
WITH CHECK (student_id IN (
  SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()
));

-- 3. Ensure all student-related tables have proper foreign key constraints to bootcamp_students
-- Check and fix bootcamp_achievements
ALTER TABLE bootcamp_achievements 
DROP CONSTRAINT IF EXISTS bootcamp_achievements_student_id_fkey;

ALTER TABLE bootcamp_achievements 
ADD CONSTRAINT bootcamp_achievements_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix bootcamp_adaptive_recommendations  
ALTER TABLE bootcamp_adaptive_recommendations 
DROP CONSTRAINT IF EXISTS bootcamp_adaptive_recommendations_student_id_fkey;

ALTER TABLE bootcamp_adaptive_recommendations 
ADD CONSTRAINT bootcamp_adaptive_recommendations_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix bootcamp_learning_sessions
ALTER TABLE bootcamp_learning_sessions 
DROP CONSTRAINT IF EXISTS bootcamp_learning_sessions_student_id_fkey;

ALTER TABLE bootcamp_learning_sessions 
ADD CONSTRAINT bootcamp_learning_sessions_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix bootcamp_mock_test_sessions
ALTER TABLE bootcamp_mock_test_sessions 
DROP CONSTRAINT IF EXISTS bootcamp_mock_test_sessions_student_id_fkey;

ALTER TABLE bootcamp_mock_test_sessions 
ADD CONSTRAINT bootcamp_mock_test_sessions_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix bootcamp_student_progress
ALTER TABLE bootcamp_student_progress 
DROP CONSTRAINT IF EXISTS bootcamp_student_progress_student_id_fkey;

ALTER TABLE bootcamp_student_progress 
ADD CONSTRAINT bootcamp_student_progress_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix bootcamp_student_responses
ALTER TABLE bootcamp_student_responses 
DROP CONSTRAINT IF EXISTS bootcamp_student_responses_student_id_fkey;

ALTER TABLE bootcamp_student_responses 
ADD CONSTRAINT bootcamp_student_responses_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix bootcamp_student_skills
ALTER TABLE bootcamp_student_skills 
DROP CONSTRAINT IF EXISTS bootcamp_student_skills_student_id_fkey;

ALTER TABLE bootcamp_student_skills 
ADD CONSTRAINT bootcamp_student_skills_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- Check and fix learning_results
ALTER TABLE learning_results 
DROP CONSTRAINT IF EXISTS learning_results_student_id_fkey;

ALTER TABLE learning_results 
ADD CONSTRAINT learning_results_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES bootcamp_students(student_id) ON DELETE CASCADE;

-- 4. Create a helper function to get current student_id from auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid();
$$;

-- 5. Add indexes for better performance on student_id lookups
CREATE INDEX IF NOT EXISTS idx_bootcamp_achievements_student_id ON bootcamp_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_adaptive_recommendations_student_id ON bootcamp_adaptive_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_learning_sessions_student_id ON bootcamp_learning_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_mock_test_sessions_student_id ON bootcamp_mock_test_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_progress_student_id ON bootcamp_student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_responses_student_id ON bootcamp_student_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_skills_student_id ON bootcamp_student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_results_student_id ON learning_results(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_students_user_id ON bootcamp_students(user_id);

-- 6. Ensure bootcamp_students.user_id is unique and has proper constraint
ALTER TABLE bootcamp_students 
DROP CONSTRAINT IF EXISTS bootcamp_students_user_id_unique;

ALTER TABLE bootcamp_students 
ADD CONSTRAINT bootcamp_students_user_id_unique UNIQUE (user_id);

ALTER TABLE bootcamp_students 
DROP CONSTRAINT IF EXISTS bootcamp_students_user_id_fkey;

ALTER TABLE bootcamp_students 
ADD CONSTRAINT bootcamp_students_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;