-- First, let's add an admin role system for question creation
-- Add admin status to student profiles
ALTER TABLE public.student_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Update the curriculum INSERT policy to only allow admins
DROP POLICY IF EXISTS "Authenticated users can add curriculum" ON public.curriculum;

CREATE POLICY "Only admins can add curriculum" 
ON public.curriculum 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Grant admin access to the current user (replace with your actual user ID if needed)
-- You'll need to update this with your specific user ID after running the migration
-- UPDATE public.student_profiles SET is_admin = TRUE WHERE id = auth.uid();