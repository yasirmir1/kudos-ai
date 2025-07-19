-- Fix the handle_new_user function to properly reference the age_group type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.student_profiles (id, email, age_group)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      CASE (NEW.raw_user_meta_data ->> 'age_group')
        WHEN '6-7' THEN 'year 2-3'::public.age_group
        WHEN 'year 2-3' THEN 'year 2-3'::public.age_group
        WHEN '8-9' THEN 'year 4-5'::public.age_group
        WHEN 'year 4-5' THEN 'year 4-5'::public.age_group
        WHEN '10-11' THEN '11+'::public.age_group
        WHEN '11+' THEN '11+'::public.age_group
        ELSE 'year 4-5'::public.age_group
      END,
      'year 4-5'::public.age_group
    )
  );
  RETURN NEW;
END;
$$;