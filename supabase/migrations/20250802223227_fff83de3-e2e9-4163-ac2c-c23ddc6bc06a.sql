-- Fix the security definer function to have proper search path
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT student_id FROM public.bootcamp_students WHERE user_id = auth.uid();
$$;