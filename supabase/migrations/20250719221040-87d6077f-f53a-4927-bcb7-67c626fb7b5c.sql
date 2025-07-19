-- Update the trigger function to handle age_group from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.student_profiles (id, email, age_group)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE((NEW.raw_user_meta_data ->> 'age_group')::age_group, '10-11'::age_group)
  );
  RETURN NEW;
END;
$$;