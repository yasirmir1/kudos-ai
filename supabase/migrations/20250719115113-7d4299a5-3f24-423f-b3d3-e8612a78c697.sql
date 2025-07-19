-- Drop all existing policies on student_answers to clean up
DROP POLICY IF EXISTS "Users can view own answers" ON public.student_answers;
DROP POLICY IF EXISTS "Users can view only their own answers" ON public.student_answers;
DROP POLICY IF EXISTS "Users can insert only their own answers" ON public.student_answers;
DROP POLICY IF EXISTS "Prevent modifications to answers" ON public.student_answers;
DROP POLICY IF EXISTS "Prevent deletions" ON public.student_answers;

-- Create clean, simple RLS policies
CREATE POLICY "Users can view own answers" 
ON public.student_answers 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Users can insert own answers" 
ON public.student_answers 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

-- Prevent updates and deletes for data integrity
CREATE POLICY "No updates allowed" 
ON public.student_answers 
FOR UPDATE 
USING (false);

CREATE POLICY "No deletes allowed" 
ON public.student_answers 
FOR DELETE 
USING (false);