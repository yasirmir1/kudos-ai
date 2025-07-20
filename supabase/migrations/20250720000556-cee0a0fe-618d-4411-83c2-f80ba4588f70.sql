-- Update the curriculum table RLS policy to allow service role insertions
-- The service role should be able to bypass RLS, but let's also add a policy for edge functions

-- Drop the existing admin-only insert policy
DROP POLICY IF EXISTS "Only admins can add curriculum" ON public.curriculum;

-- Create a new policy that allows both admins and service role
CREATE POLICY "Admins and service can add curriculum" ON public.curriculum
FOR INSERT 
WITH CHECK (
  -- Allow if user is admin
  (EXISTS (
    SELECT 1 FROM student_profiles 
    WHERE id = auth.uid() AND is_admin = true
  ))
  OR
  -- Allow if using service role (auth.uid() is null for service role)
  (auth.uid() IS NULL)
);